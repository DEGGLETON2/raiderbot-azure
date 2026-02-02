<script lang="ts">
  /**
   * Agent Selector Component
   * Allows switching between different RaiderBot agents
   */
  import { chatStore } from '$lib/stores/chat';
  import { AGENTS, getAllAgents, type AgentType } from '$lib/agents';
  import { fly } from 'svelte/transition';
  
  let isOpen = $state(false);
  let currentAgent = $derived($chatStore.currentAgent);
  let agentConfig = $derived(AGENTS[currentAgent]);
  
  const agents = getAllAgents();
  
  function selectAgent(agentId: AgentType) {
    chatStore.setAgent(agentId);
    isOpen = false;
  }
  
  function toggleDropdown() {
    isOpen = !isOpen;
  }
  
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.agent-selector')) {
      isOpen = false;
    }
  }
</script>

<svelte:window onclick={handleClickOutside} />

<div class="agent-selector">
  <button 
    class="selector-trigger"
    onclick={toggleDropdown}
    aria-expanded={isOpen}
    aria-haspopup="listbox"
    style="--agent-color: {agentConfig.color}"
  >
    <span class="current-agent-icon">{agentConfig.icon}</span>
    <span class="current-agent-name">{agentConfig.name}</span>
    <svg 
      class="chevron" 
      class:open={isOpen}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  </button>
  
  {#if isOpen}
    <div 
      class="dropdown"
      role="listbox"
      transition:fly={{ y: -10, duration: 200 }}
    >
      {#each agents as agent (agent.id)}
        <button
          class="agent-option"
          class:selected={agent.id === currentAgent}
          onclick={() => selectAgent(agent.id)}
          role="option"
          aria-selected={agent.id === currentAgent}
          style="--agent-color: {agent.color}"
        >
          <span class="agent-icon">{agent.icon}</span>
          <div class="agent-info">
            <span class="agent-name">{agent.name}</span>
            <span class="agent-subtitle">{agent.subtitle}</span>
          </div>
          {#if agent.id === currentAgent}
            <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .agent-selector {
    position: relative;
  }
  
  .selector-trigger {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    cursor: pointer;
    font-size: 0.9375rem;
    transition: all 0.2s;
  }
  
  .selector-trigger:hover {
    border-color: var(--agent-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  
  .current-agent-icon {
    font-size: 1.25rem;
  }
  
  .current-agent-name {
    font-weight: 600;
    color: #111827;
  }
  
  .chevron {
    width: 16px;
    height: 16px;
    color: #6b7280;
    transition: transform 0.2s;
  }
  
  .chevron.open {
    transform: rotate(180deg);
  }
  
  .dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    width: 280px;
    max-height: 400px;
    overflow-y: auto;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    z-index: 100;
    padding: 0.5rem;
  }
  
  .agent-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem;
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s;
  }
  
  .agent-option:hover {
    background: #f3f4f6;
  }
  
  .agent-option.selected {
    background: color-mix(in srgb, var(--agent-color) 10%, transparent);
  }
  
  .agent-icon {
    font-size: 1.5rem;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f3f4f6;
    border-radius: 10px;
    flex-shrink: 0;
  }
  
  .agent-option.selected .agent-icon {
    background: color-mix(in srgb, var(--agent-color) 20%, transparent);
  }
  
  .agent-info {
    flex: 1;
    min-width: 0;
  }
  
  .agent-name {
    display: block;
    font-weight: 600;
    color: #111827;
    font-size: 0.9375rem;
  }
  
  .agent-subtitle {
    display: block;
    font-size: 0.75rem;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .check-icon {
    width: 20px;
    height: 20px;
    color: var(--agent-color);
    flex-shrink: 0;
  }
</style>
