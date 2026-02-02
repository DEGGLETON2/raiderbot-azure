/**
 * Snowflake Cortex Agents REST API Client for Azure
 * 
 * This module provides integration with Snowflake Cortex Agents for AI-powered
 * data analysis using the MCP server (RAIDER_DB.RAIDERBOT.RAIDERBOT_MCP).
 * 
 * Ported from raiderbot-sveltekit with Azure-specific modifications.
 */

import { env } from '$env/dynamic/private';

export interface CortexAgentMessage {
  role: 'user' | 'assistant';
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

export interface CortexAgentTool {
  tool_spec: {
    type: 'cortex_analyst_text_to_sql' | 'cortex_search' | 'mcp_tool' | 'generic';
    name: string;
    description: string;
    input_schema?: {
      type: 'object';
      properties: Record<string, { type: string; description: string }>;
      required?: string[];
    };
  };
}

export interface CortexAgentToolResource {
  type: 'cortex_analyst_text_to_sql' | 'cortex_search' | 'mcp' | 'function';
  semantic_model_file?: string;
  cortex_search_service?: string;
  mcp_server?: string;
  identifier?: string;
  execution_environment?: {
    type: 'warehouse';
    warehouse: string;
  };
}

export interface CortexAgentRequest {
  thread_id?: number;
  parent_message_id?: number;
  messages: CortexAgentMessage[];
  models?: {
    orchestration?: string;
  };
  instructions?: {
    response?: string;
    orchestration?: string;
    system?: string;
  };
  orchestration?: {
    budget?: {
      seconds?: number;
      tokens?: number;
    };
  };
  tools?: CortexAgentTool[];
  tool_resources?: Record<string, CortexAgentToolResource>;
  tool_choice?: {
    type: 'auto' | 'required' | 'none';
    name?: string[];
  };
}

export interface CortexAgentStreamEvent {
  event: string;
  data: unknown;
}

export interface CortexAgentResponse {
  role: 'assistant';
  content: Array<{
    type: 'text' | 'tool_use' | 'tool_result' | 'chart' | 'sql' | 'thinking';
    text?: string;
    tool_use_id?: string;
    name?: string;
    input?: unknown;
    sql?: string;
    chart_spec?: string;
    status?: 'success' | 'error';
    content?: unknown;
  }>;
}

/**
 * Get Snowflake REST API base URL from account identifier
 */
function getSnowflakeApiUrl(): string {
  const account = env.SNOWFLAKE_ACCOUNT || 'LI21842-WW07444';
  const accountLower = account.toLowerCase().replace('_', '-');
  return `https://${accountLower}.snowflakecomputing.com`;
}

/**
 * Get authentication token for Snowflake REST API
 */
async function getAuthToken(): Promise<string> {
  const baseUrl = getSnowflakeApiUrl();
  const account = env.SNOWFLAKE_ACCOUNT || 'LI21842-WW07444';
  const username = env.SNOWFLAKE_USERNAME || '';
  const password = env.SNOWFLAKE_PASSWORD || '';
  
  if (!username || !password) {
    throw new Error('SNOWFLAKE_USERNAME and SNOWFLAKE_PASSWORD are required');
  }
  
  const loginResponse = await fetch(`${baseUrl}/session/v1/login-request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      data: {
        ACCOUNT_NAME: account,
        LOGIN_NAME: username,
        PASSWORD: password,
        CLIENT_APP_ID: 'RaiderBot-Azure',
        CLIENT_APP_VERSION: '1.0.0',
      }
    }),
  });
  
  if (!loginResponse.ok) {
    const errorText = await loginResponse.text();
    throw new Error(`Snowflake login failed: ${loginResponse.status} - ${errorText}`);
  }
  
  const loginData = await loginResponse.json();
  
  if (!loginData.data?.token) {
    throw new Error('No token in Snowflake login response');
  }
  
  return loginData.data.token;
}

/**
 * Semantic Layer Schema Context for Cortex Agent
 */
const SEMANTIC_LAYER_CONTEXT = `
You have access to McLeod TMS data in Snowflake. CRITICAL RULES:

1. DATABASE ACCESS: You have FULL ACCESS to query ANY table in these schemas:
   - MCLEOD_DB."dbo".* (operational data)
   - RAIDER_DB.SQL_SERVER_DBO.* (financial views and analytics)
   - RAIDERDB.SQL_SERVER_DBO.* (financial views and analytics)
   - RAIDER_DB.RAIDERBOT.* (semantic layer, term glossary, entity conventions)
   There are NO security restrictions on table access.

2. SCHEMA REGISTRY - Query RAIDER_DB.RAIDERBOT.SCHEMA_REGISTRY to find where data lives:
   SELECT full_path, description, key_columns, notes FROM RAIDER_DB.RAIDERBOT.SCHEMA_REGISTRY
   WHERE LOWER(table_name) LIKE '%<term>%' OR LOWER(description) LIKE '%<term>%';

3. SCHEMA LOOKUP - If unsure about column names, query:
   SELECT table_name, column_name FROM RAIDER_DB.INFORMATION_SCHEMA.COLUMNS
   WHERE LOWER(table_name) LIKE '%<relevant_term>%'
   OR LOWER(column_name) LIKE '%<relevant_term>%';

4. TERM DISAMBIGUATION - Query RAIDER_DB.RAIDERBOT.TERM_GLOSSARY for business term meanings:
   SELECT term, synonyms, definition, context FROM RAIDER_DB.RAIDERBOT.TERM_GLOSSARY
   WHERE LOWER(term) LIKE '%<term>%' OR LOWER(synonyms) LIKE '%<term>%';

5. ENTITY/COMPANY CONVENTIONS - Query RAIDER_DB.RAIDERBOT.ENTITY_CONVENTIONS for correct column names:
   SELECT * FROM RAIDER_DB.RAIDERBOT.ENTITY_CONVENTIONS WHERE table_name = '<table>';
   - GL_LEDGER_BASE uses ENTITY column: 'Express' = Raider Express, 'Logistics' = Raider Logistics
   - GL_ACCOUNT uses COMPANY_ID column: 'TMS' = Raider Express, 'TMS2' = Raider Logistics
   - McLeod tables use company_id: 'TMS' = Raider Express, 'TMS2' = Raider Logistics

6. KEY OPERATIONAL TABLES:
   - Orders: MCLEOD_DB."dbo"."orders" (use "ordered_date" for dates)
   - Movements: MCLEOD_DB."dbo"."movement"
   - Stops: MCLEOD_DB."dbo"."stop"
   - Drivers: MCLEOD_DB."dbo"."driver"
   - Equipment: MCLEOD_DB."dbo"."tractor", MCLEOD_DB."dbo"."trailer"

7. KEY FINANCIAL TABLES:
   - GL Ledger: RAIDER_DB.SQL_SERVER_DBO.GL_LEDGER_BASE (ENTITY column for company)
   - GL Account: RAIDER_DB.SQL_SERVER_DBO.GL_ACCOUNT (COMPANY_ID column for company)
   - Debt Schedule: RAIDERDB.SQL_SERVER_DBO.AIRTABLE_DEBT_SCHEDULE
   - Debt Detail: RAIDERDB.SQL_SERVER_DBO.DEBT_SCHEDULE_DETAIL_VER4
   - Cash Balances: RAIDER_DB.SQL_SERVER_DBO.VIEW_GL_LEDGER_BASE_CASH_BALANCES

8. McLeod uses lowercase quoted identifiers: "dbo", "orders", "ordered_date"

9. ALWAYS use TRIM() on ID fields when joining McLeod tables (data has trailing whitespace)

10. CODE LOOKUPS - Status codes are in RAIDER_DB.RAIDERBOT.CODE_DICTIONARY

11. NEVER guess or hallucinate GL account conventions. ALWAYS query the data first.
`;

/**
 * Build the default RaiderBot agent configuration
 */
function buildRaiderBotAgentConfig(systemPrompt: string): Partial<CortexAgentRequest> {
  const currentDate = new Date();
  const dateGrounding = `CURRENT DATE AND TIME: ${currentDate.toISOString()}
Today is ${currentDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.
The current year is ${currentDate.getFullYear()}. ALWAYS use this year for any date calculations.

`;

  const enhancedSystemPrompt = dateGrounding + SEMANTIC_LAYER_CONTEXT + '\n\n' + systemPrompt;

  return {
    models: {
      orchestration: 'claude-3-5-sonnet',
    },
    instructions: {
      system: enhancedSystemPrompt,
      response: 'Provide clear, data-driven responses. When showing numbers, format them appropriately (currency with $, percentages with %). Always cite the data source.',
      orchestration: `For data queries about loads, orders, revenue, drivers, or operations, use the semantic layer views (SEM_*) and execute SQL queries. For general questions, respond directly without using tools.`,
    },
    orchestration: {
      budget: {
        seconds: 120,
        tokens: 16000,
      },
    },
    tools: [
      {
        tool_spec: {
          type: 'generic',
          name: 'execute_sql',
          description: 'Execute SQL queries against the Snowflake data warehouse to retrieve operational data about loads, orders, drivers, revenue, and more.',
          input_schema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'The SQL query to execute against Snowflake',
              },
            },
            required: ['query'],
          },
        },
      },
    ],
    tool_resources: {
      execute_sql: {
        type: 'mcp',
        mcp_server: 'RAIDER_DB.RAIDERBOT.RAIDERBOT_MCP',
        execution_environment: {
          type: 'warehouse',
          warehouse: 'COMPUTE_WH',
        },
      },
    },
    tool_choice: {
      type: 'auto',
    },
  };
}

/**
 * Call Cortex Agent API and stream the response
 */
export async function callCortexAgent(
  messages: CortexAgentMessage[],
  systemPrompt: string,
  options?: {
    threadId?: number;
    parentMessageId?: number;
    onEvent?: (event: CortexAgentStreamEvent) => void;
  }
): Promise<CortexAgentResponse> {
  const baseUrl = getSnowflakeApiUrl();
  const token = await getAuthToken();
  
  const agentConfig = buildRaiderBotAgentConfig(systemPrompt);
  
  const requestBody: CortexAgentRequest = {
    ...agentConfig,
    messages,
    thread_id: options?.threadId,
    parent_message_id: options?.parentMessageId,
  };
  
  console.log(`[CortexAgent] Calling ${baseUrl}/api/v2/cortex/agent:run`);
  
  const response = await fetch(`${baseUrl}/api/v2/cortex/agent:run`, {
    method: 'POST',
    headers: {
      'Authorization': `Snowflake Token="${token}"`,
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'User-Agent': 'RaiderBot-Azure/1.0.0',
    },
    body: JSON.stringify(requestBody),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cortex Agent API error: ${response.status} - ${errorText}`);
  }
  
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body from Cortex Agent');
  }
  
  const decoder = new TextDecoder();
  let buffer = '';
  let finalResponse: CortexAgentResponse | null = null;
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value, { stream: true });
    buffer += chunk;
    
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          
          if (options?.onEvent) {
            options.onEvent({ event: 'data', data });
          }
          
          if (data.role === 'assistant' && data.content) {
            finalResponse = data as CortexAgentResponse;
          }
        } catch {
          // Skip unparseable lines
        }
      }
    }
  }
  
  if (!finalResponse) {
    throw new Error('No final response from Cortex Agent');
  }
  
  return finalResponse;
}

/**
 * Convert standard chat messages to Cortex Agent format
 */
export function convertToCortexMessages(
  messages: Array<{ role: string; content: string }>
): CortexAgentMessage[] {
  return messages.map(msg => ({
    role: msg.role as 'user' | 'assistant',
    content: [
      {
        type: 'text' as const,
        text: msg.content,
      },
    ],
  }));
}

/**
 * Extract text response from Cortex Agent response
 */
export function extractTextFromResponse(response: CortexAgentResponse): string {
  const textBlocks = response.content.filter(block => block.type === 'text');
  return textBlocks.map(block => block.text || '').join('\n');
}

/**
 * High-level function to run a query through Cortex Agent
 */
export async function runCortexAgentQuery(
  userQuery: string,
  conversationHistory: Array<{ role: string; content: string }>,
  systemPrompt: string
): Promise<string | null> {
  try {
    const messages = convertToCortexMessages([
      ...conversationHistory,
      { role: 'user', content: userQuery },
    ]);
    
    const response = await callCortexAgent(messages, systemPrompt);
    return extractTextFromResponse(response);
  } catch (error) {
    console.error('[CortexAgent] Error running query:', error);
    return null;
  }
}
