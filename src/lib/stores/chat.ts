/**
 * Chat Store for RaiderBot Azure
 * Uses Svelte 5 runes for reactive state management
 */

import { writable, derived } from 'svelte/store';
import type { AgentType } from '$lib/agents';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agent?: AgentType;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  currentAgent: AgentType;
}

function createChatStore() {
  const { subscribe, set, update } = writable<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    currentAgent: 'raiderbot',
  });

  return {
    subscribe,
    
    setAgent: (agent: AgentType) => {
      update(state => ({
        ...state,
        currentAgent: agent,
        messages: [], // Clear messages when switching agents
        error: null,
      }));
    },
    
    addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => {
      update(state => ({
        ...state,
        messages: [
          ...state.messages,
          {
            ...message,
            id: crypto.randomUUID(),
            timestamp: new Date(),
          },
        ],
      }));
    },
    
    setLoading: (isLoading: boolean) => {
      update(state => ({ ...state, isLoading }));
    },
    
    setError: (error: string | null) => {
      update(state => ({ ...state, error }));
    },
    
    clearMessages: () => {
      update(state => ({ ...state, messages: [], error: null }));
    },
    
    reset: () => {
      set({
        messages: [],
        isLoading: false,
        error: null,
        currentAgent: 'raiderbot',
      });
    },
  };
}

export const chatStore = createChatStore();

// Derived store for message count
export const messageCount = derived(chatStore, $chat => $chat.messages.length);

// Derived store for last message
export const lastMessage = derived(chatStore, $chat => 
  $chat.messages.length > 0 ? $chat.messages[$chat.messages.length - 1] : null
);

/**
 * Send a message to the chat API
 */
export async function sendMessage(content: string): Promise<void> {
  const state = await new Promise<ChatState>(resolve => {
    chatStore.subscribe(s => resolve(s))();
  });
  
  if (state.isLoading) return;
  
  // Add user message
  chatStore.addMessage({
    role: 'user',
    content,
    agent: state.currentAgent,
  });
  
  chatStore.setLoading(true);
  chatStore.setError(null);
  
  try {
    // Prepare messages for API
    const messages = [...state.messages, { role: 'user' as const, content }].map(m => ({
      role: m.role,
      content: m.content,
    }));
    
    const response = await fetch('/svc/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        agent: state.currentAgent,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send message');
    }
    
    const data = await response.json();
    
    // Add assistant response
    chatStore.addMessage({
      role: 'assistant',
      content: data.content,
      agent: state.currentAgent,
    });
    
  } catch (error) {
    chatStore.setError(error instanceof Error ? error.message : 'An error occurred');
  } finally {
    chatStore.setLoading(false);
  }
}
