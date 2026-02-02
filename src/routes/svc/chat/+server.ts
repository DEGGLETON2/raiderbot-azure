/**
 * Chat API Endpoint for RaiderBot Azure
 * POST /api/chat
 * 
 * Receives chat messages and agent selection, calls Snowflake Cortex Agent,
 * and returns the assistant response.
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { runCortexAgentQuery } from '$lib/server/cortex-agent';
import { getSystemPrompt } from '$lib/server/system-prompts';
import { isValidAgent, type AgentType } from '$lib/agents';
import { env } from '$env/dynamic/private';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  agent: string;
}

export const POST: RequestHandler = async ({ request, locals }) => {
  // Check authentication (Azure AD via x-ms-client-principal header or session)
  // In Azure Static Web Apps, the user principal is passed via header
  const clientPrincipal = request.headers.get('x-ms-client-principal');
  
  // For local development, we'll allow requests without auth
  // In production, Azure Static Web Apps handles auth at the infrastructure level
  const isDevelopment = env.NODE_ENV === 'development';
  
  if (!isDevelopment && !clientPrincipal) {
    // Check if we have a session from @auth/sveltekit
    const session = await locals.auth?.();
    if (!session?.user) {
      throw error(401, 'Authentication required');
    }
  }
  
  // Parse request body
  let body: ChatRequest;
  try {
    body = await request.json();
  } catch {
    throw error(400, 'Invalid JSON body');
  }
  
  const { messages, agent } = body;
  
  // Validate agent
  if (!agent || !isValidAgent(agent)) {
    throw error(400, `Invalid agent: ${agent}. Must be one of the valid agent types.`);
  }
  
  // Validate messages
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw error(400, 'Messages array is required and must not be empty');
  }
  
  // Validate message format
  for (const msg of messages) {
    if (!msg.role || !['user', 'assistant'].includes(msg.role)) {
      throw error(400, 'Each message must have a valid role (user or assistant)');
    }
    if (typeof msg.content !== 'string') {
      throw error(400, 'Each message must have a string content');
    }
  }
  
  // Get the last user message
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  if (!lastUserMessage) {
    throw error(400, 'At least one user message is required');
  }
  
  // Get system prompt for the agent
  const systemPrompt = getSystemPrompt(agent as AgentType);
  
  // Build conversation history (exclude the last user message as it's passed separately)
  const conversationHistory = messages.slice(0, -1).map(m => ({
    role: m.role,
    content: m.content,
  }));
  
  try {
    // Call Cortex Agent
    const response = await runCortexAgentQuery(
      lastUserMessage.content,
      conversationHistory,
      systemPrompt
    );
    
    if (!response) {
      throw error(500, 'No response from Cortex Agent');
    }
    
    return json({
      role: 'assistant',
      content: response,
      agent,
    });
    
  } catch (err) {
    console.error('[Chat API] Error calling Cortex Agent:', err);
    
    // Return a user-friendly error
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    
    // Don't expose internal errors in production
    if (!isDevelopment && !errorMessage.includes('Authentication')) {
      throw error(500, 'Failed to process your request. Please try again.');
    }
    
    throw error(500, errorMessage);
  }
};
