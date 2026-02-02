// Agent configurations for RaiderBot Azure
// Ported from raiderbot-sveltekit

export type AgentType = 'raiderbot' | 'ohana' | 'vinkat' | 'elmercado' | 'opsbot' | 'bigdebbie' | 'commscommander' | 'eltractor' | 'elfrio' | 'elcamino' | 'sharter';

export interface AgentConfig {
  id: AgentType;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  placeholder: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  quickActions: { label: string; prompt: string }[];
}

export const AGENTS: Record<AgentType, AgentConfig> = {
  raiderbot: {
    id: 'raiderbot',
    name: 'RaiderBot',
    subtitle: 'Dispatch & Operations',
    icon: '🚛',
    color: '#C41E3A',
    placeholder: 'Ask about loads, detention, drivers...',
    welcomeTitle: 'Welcome to RaiderBot',
    welcomeSubtitle: 'Ask me about loads, detention, drivers, or any trucking operations question.',
    quickActions: [
      { label: 'Walmart loads this week?', prompt: 'How many loads do we have going to Walmart this week?' },
      { label: 'Tyson detention costs?', prompt: "What's detention looking like for Tyson?" },
      { label: "Today's revenue", prompt: "Show me today's revenue" },
      { label: 'Active load count', prompt: 'How many active loads right now?' },
    ],
  },
  ohana: {
    id: 'ohana',
    name: 'Ohana',
    subtitle: 'Recruiting Assistant',
    icon: '🌺',
    color: '#2563EB',
    placeholder: 'Ask about candidates, CDL school, recruiting...',
    welcomeTitle: "Aloha! I'm Ohana",
    welcomeSubtitle: 'Your recruiting assistant. I help with candidate pre-screening, CDL school info, and recruiting metrics.',
    quickActions: [
      { label: 'Pre-screen a candidate', prompt: 'I need to pre-screen a new CDL school applicant' },
      { label: 'CDL school details', prompt: 'What are the CDL school program details?' },
      { label: 'Recruiting metrics', prompt: "Show me this week's recruiting funnel metrics" },
      { label: 'DQ criteria', prompt: 'What are the disqualification criteria for candidates?' },
    ],
  },
  vinkat: {
    id: 'vinkat',
    name: 'VinKat',
    subtitle: 'Financial Intelligence',
    icon: '💼',
    color: '#059669',
    placeholder: 'Ask about cash position, operating ratio, revenue...',
    welcomeTitle: 'VinKat - Financial Intelligence',
    welcomeSubtitle: 'Your Chief Financial Intelligence Officer. I connect operational metrics with financial performance.',
    quickActions: [
      { label: 'Daily Financial Health Check', prompt: 'Give me a daily financial health check' },
      { label: 'Cash Position', prompt: 'What is our current cash position?' },
      { label: 'Operating Ratio', prompt: 'What is our operating ratio this month vs last month?' },
      { label: 'AR Aging Report', prompt: 'Show me the AR aging report' },
      { label: 'Revenue by Customer', prompt: 'Break down revenue by top customers' },
      { label: 'Expense Breakdown', prompt: 'Show me expense breakdown by category' },
    ],
  },
  elmercado: {
    id: 'elmercado',
    name: 'El Mercado',
    subtitle: 'DAT Freight Analytics',
    icon: '📊',
    color: '#059669',
    placeholder: 'Ask about freight rates, lane capacity, market conditions...',
    welcomeTitle: 'El Mercado - DAT Freight Analytics',
    welcomeSubtitle: 'Your market intelligence expert. I analyze freight rates, lane capacity, and market conditions for strategic pricing.',
    quickActions: [
      { label: 'Top Origin Markets', prompt: 'What are our top 10 origin markets by volume?' },
      { label: 'Tightest Capacity Lanes', prompt: 'Which customer lanes have the tightest capacity?' },
      { label: 'Headhaul vs Backhaul', prompt: 'What is our headhaul vs backhaul ratio?' },
      { label: 'Rate Sensitive Lanes', prompt: 'Which lanes are we most rate-sensitive on?' },
      { label: 'Market Conditions', prompt: 'What are current market conditions for reefer freight?' },
      { label: 'Bid Cycle Status', prompt: 'When is our next major bid cycle?' },
    ],
  },
  opsbot: {
    id: 'opsbot',
    name: 'OpsBot',
    subtitle: 'Operations Intelligence',
    icon: '📊',
    color: '#7C3AED',
    placeholder: 'Ask about trucks, loads, drivers, capacity...',
    welcomeTitle: 'OpsBot - Operations Intelligence',
    welcomeSubtitle: 'Your operational brain for fleet management. I help Mike and Nick track trucks, loads, and driver performance.',
    quickActions: [
      { label: 'Truck Status', prompt: 'Show me current truck utilization status' },
      { label: 'Load Pipeline', prompt: 'What does our load pipeline look like for the next 48 hours?' },
      { label: 'Driver Performance', prompt: 'Show me driver performance metrics this week' },
      { label: 'Capacity Check', prompt: 'Are we over or under committed by region?' },
      { label: 'Empty Trailers', prompt: 'Where are our empty trailers sitting?' },
      { label: 'Repower Options', prompt: 'I need repower options for loads running out of hours' },
    ],
  },
  bigdebbie: {
    id: 'bigdebbie',
    name: 'BigDebbie',
    subtitle: 'Personal Assistant',
    icon: '🎀',
    color: '#EC4899',
    placeholder: 'Ask me to send messages, manage tasks...',
    welcomeTitle: 'BigDebbie - Personal Assistant',
    welcomeSubtitle: "Dan's personal AI assistant. I handle communications, scheduling, and life admin so you can focus on running the company.",
    quickActions: [
      { label: 'Send a Text', prompt: 'I need to send a text message' },
      { label: 'Make a Call', prompt: 'I need to make a phone call' },
      { label: 'Check Messages', prompt: 'Show me recent SMS messages' },
      { label: 'Draft Email', prompt: 'Help me draft an email' },
    ],
  },
  commscommander: {
    id: 'commscommander',
    name: 'CommsCommander',
    subtitle: 'Communications Gateway',
    icon: '📡',
    color: '#F59E0B',
    placeholder: 'Manage SMS, calls, and communication queues...',
    welcomeTitle: 'CommsCommander - Communications Gateway',
    welcomeSubtitle: 'Centralized communications hub. All SMS and voice calls flow through me for compliance, safety, and audit logging.',
    quickActions: [
      { label: 'Message Queue', prompt: 'Show me the current message queue' },
      { label: 'Comms History', prompt: 'Show recent communications history' },
      { label: 'Send SMS', prompt: 'I need to send an SMS message' },
      { label: 'Safety Status', prompt: 'What are the current driver safety rules?' },
    ],
  },
  eltractor: {
    id: 'eltractor',
    name: 'El Tractor',
    subtitle: 'Tractor Maintenance (Manny Toledo)',
    icon: '🚜',
    color: '#DC2626',
    placeholder: 'Pregunta sobre tractores, códigos de falla, reparaciones...',
    welcomeTitle: 'El Tractor - Manny Toledo',
    welcomeSubtitle: 'Especialista senior en mantenimiento de tractores. Volvo VNL, Freightliner Cascadia, códigos de falla, historial de reparaciones.',
    quickActions: [
      { label: 'Historial de Reparaciones', prompt: 'Muéstrame el historial de reparaciones del tractor T1234' },
      { label: 'Códigos de Falla Activos', prompt: '¿Cuáles son los códigos de falla activos en la flota?' },
      { label: 'Tractores Problemáticos', prompt: '¿Qué tractores tienen problemas recurrentes?' },
      { label: 'Costo de Reparaciones', prompt: '¿Cuánto hemos gastado en reparaciones este mes?' },
    ],
  },
  elfrio: {
    id: 'elfrio',
    name: 'El Frío',
    subtitle: 'Trailer & Reefer Maintenance (Tony Toledo)',
    icon: '❄️',
    color: '#0EA5E9',
    placeholder: 'Pregunta sobre reefers, temperatura, alertas de Bluetree...',
    welcomeTitle: 'El Frío - Tony Toledo',
    welcomeSubtitle: 'Experto en trailers y unidades refrigeradas. Carrier, Thermo King, monitoreo de temperatura, cadena de frío.',
    quickActions: [
      { label: 'Alertas de Temperatura', prompt: '¿Hay alertas de temperatura activas?' },
      { label: 'Reefers con Problemas', prompt: '¿Qué reefers tienen problemas de compresor?' },
      { label: 'Historial de Trailer', prompt: 'Muéstrame el historial del trailer R5678' },
      { label: 'Alertas Bluetree', prompt: '¿Cuáles son las últimas alertas de Bluetree?' },
    ],
  },
  elcamino: {
    id: 'elcamino',
    name: 'El Camino',
    subtitle: 'OTR Breakdown Specialist (Neil Roberts)',
    icon: '🛣️',
    color: '#F97316',
    placeholder: 'Ask about breakdowns, fault monitoring, road calls...',
    welcomeTitle: 'El Camino - Neil Roberts',
    welcomeSubtitle: 'OTR Breakdown & Fault Monitoring Specialist. Real-time fault monitoring, breakdown triage, vendor coordination.',
    quickActions: [
      { label: 'Active Faults', prompt: 'Show me all active critical faults across the fleet' },
      { label: 'Breakdown Status', prompt: 'What breakdowns are we currently handling?' },
      { label: 'Nearest Vendor', prompt: 'Find nearest repair vendor for a breakdown in Dallas' },
      { label: 'Service Failures', prompt: 'Show recent service failure history' },
    ],
  },
  sharter: {
    id: 'sharter',
    name: 'Sharter',
    subtitle: 'NYC Travel Concierge',
    icon: '🗽',
    color: '#4CAF50',
    placeholder: 'Ask about NYC attractions, restaurants, directions...',
    welcomeTitle: "Hey! I'm Sharter!",
    welcomeSubtitle: "Your personal NYC travel concierge! I'm like Donkey from Shrek - energetic, helpful, and I NEVER stop talking! Let me help you navigate the Big Apple!",
    quickActions: [
      { label: 'Plan an Itinerary', prompt: 'Help me plan our day in NYC' },
      { label: 'Restaurant Suggestions', prompt: 'Find a good restaurant near us' },
      { label: 'What to Do Now?', prompt: 'We have some free time, what should we do?' },
      { label: 'Get Directions', prompt: 'How do we get to our next destination?' },
      { label: 'Book Something', prompt: 'I need to make a reservation' },
      { label: 'Share My Location', prompt: 'Here is my current location' },
    ],
  },
};

// Get agent by ID with type safety
export function getAgent(id: string): AgentConfig | undefined {
  return AGENTS[id as AgentType];
}

// Get all agents as array
export function getAllAgents(): AgentConfig[] {
  return Object.values(AGENTS);
}

// Validate agent ID
export function isValidAgent(id: string): id is AgentType {
  return id in AGENTS;
}
