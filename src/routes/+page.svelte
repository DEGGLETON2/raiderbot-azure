<script lang="ts">
  /**
   * Main Page - RaiderBot Azure
   * Chat interface with agent selection
   */
  import AgentSelector from '$lib/components/AgentSelector.svelte';
  import ChatInterface from '$lib/components/ChatInterface.svelte';
  import { chatStore } from '$lib/stores/chat';
  import { AGENTS } from '$lib/agents';
  
  const currentAgent = $derived($chatStore.currentAgent);
  const agentConfig = $derived(AGENTS[currentAgent]);
</script>

<svelte:head>
  <title>{agentConfig.name} - RaiderBot</title>
  <meta name="description" content="RaiderBot AI Assistant for Raider Express" />
</svelte:head>

<div class="app-container">
  <header class="app-header" style="--agent-color: {agentConfig.color}">
    <div class="header-content">
      <div class="logo-section">
        <img src="/raider-logo.svg" alt="Raider Express" class="logo" />
        <span class="app-title">RaiderBot</span>
      </div>
      
      <AgentSelector />
      
      <div class="header-actions">
        <button class="new-chat-btn" onclick={() => chatStore.clearMessages()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Chat
        </button>
      </div>
    </div>
  </header>
  
  <main class="app-main">
    <ChatInterface />
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: #f9fafb;
  }
  
  :global(*) {
    box-sizing: border-box;
  }
  
  .app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }
  
  .app-header {
    background: white;
    border-bottom: 1px solid #e5e7eb;
    padding: 0.75rem 1.5rem;
    flex-shrink: 0;
  }
  
  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1400px;
    margin: 0 auto;
    gap: 1rem;
  }
  
  .logo-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .logo {
    height: 32px;
    width: auto;
  }
  
  .app-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #111827;
  }
  
  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .new-chat-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: transparent;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.875rem;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .new-chat-btn:hover {
    background: #f3f4f6;
    border-color: var(--agent-color);
    color: var(--agent-color);
  }
  
  .new-chat-btn svg {
    width: 16px;
    height: 16px;
  }
  
  .app-main {
    flex: 1;
    overflow: hidden;
  }
  
  @media (max-width: 768px) {
    .app-header {
      padding: 0.5rem 1rem;
    }
    
    .app-title {
      display: none;
    }
    
    .new-chat-btn span {
      display: none;
    }
    
    .new-chat-btn {
      padding: 0.5rem;
    }
  }
</style>
