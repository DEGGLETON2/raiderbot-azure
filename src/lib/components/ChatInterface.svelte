<script lang="ts">
  /**
   * Chat Interface Component
   * Main chat UI with message list, input, and quick actions
   */
  import { chatStore, sendMessage } from '$lib/stores/chat';
  import { AGENTS } from '$lib/agents';
  import MessageBubble from './MessageBubble.svelte';
  import QuickActions from './QuickActions.svelte';
  import { tick } from 'svelte';
  
  let inputValue = $state('');
  let messagesContainer: HTMLDivElement | null = $state(null);
  let inputElement: HTMLTextAreaElement | null = $state(null);
  
  const messages = $derived($chatStore.messages);
  const isLoading = $derived($chatStore.isLoading);
  const error = $derived($chatStore.error);
  const currentAgent = $derived($chatStore.currentAgent);
  const agentConfig = $derived(AGENTS[currentAgent]);
  
  const showWelcome = $derived(messages.length === 0 && !isLoading);
  
  async function handleSubmit(event?: Event) {
    event?.preventDefault();
    
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || isLoading) return;
    
    inputValue = '';
    await sendMessage(trimmedValue);
    
    // Scroll to bottom after message is added
    await tick();
    scrollToBottom();
  }
  
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }
  
  function handleQuickAction(prompt: string) {
    inputValue = prompt;
    handleSubmit();
  }
  
  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
  
  // Auto-scroll when new messages arrive
  $effect(() => {
    if (messages.length > 0) {
      tick().then(scrollToBottom);
    }
  });
  
  // Auto-resize textarea
  function autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  }
</script>

<div class="chat-interface" style="--agent-color: {agentConfig.color}">
  <div class="messages-area" bind:this={messagesContainer}>
    {#if showWelcome}
      <div class="welcome-screen">
        <div class="welcome-icon">{agentConfig.icon}</div>
        <h1 class="welcome-title">{agentConfig.welcomeTitle}</h1>
        <p class="welcome-subtitle">{agentConfig.welcomeSubtitle}</p>
        
        <QuickActions 
          actions={agentConfig.quickActions} 
          onAction={handleQuickAction}
        />
      </div>
    {:else}
      <div class="messages-list">
        {#each messages as message (message.id)}
          <MessageBubble {message} agentIcon={agentConfig.icon} />
        {/each}
        
        {#if isLoading}
          <div class="loading-indicator">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span class="loading-text">{agentConfig.name} is thinking...</span>
          </div>
        {/if}
        
        {#if error}
          <div class="error-message">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span>{error}</span>
          </div>
        {/if}
      </div>
    {/if}
  </div>
  
  <div class="input-area">
    <form class="input-form" onsubmit={handleSubmit}>
      <textarea
        bind:this={inputElement}
        bind:value={inputValue}
        onkeydown={handleKeyDown}
        oninput={autoResize}
        placeholder={agentConfig.placeholder}
        rows="1"
        disabled={isLoading}
        class="message-input"
      ></textarea>
      
      <button 
        type="submit" 
        class="send-button"
        disabled={!inputValue.trim() || isLoading}
        aria-label="Send message"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      </button>
    </form>
    
    <p class="disclaimer">
      RaiderBot can make mistakes. Verify important information.
    </p>
  </div>
</div>

<style>
  .chat-interface {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #f9fafb;
  }
  
  .messages-area {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
  }
  
  .welcome-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    padding: 2rem;
  }
  
  .welcome-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  
  .welcome-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #111827;
    margin: 0 0 0.5rem;
  }
  
  .welcome-subtitle {
    font-size: 1rem;
    color: #6b7280;
    margin: 0 0 2rem;
    max-width: 400px;
  }
  
  .messages-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .loading-indicator {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    width: fit-content;
  }
  
  .typing-dots {
    display: flex;
    gap: 4px;
  }
  
  .typing-dots span {
    width: 8px;
    height: 8px;
    background: var(--agent-color);
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
  }
  
  .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
  .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
  
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
  
  .loading-text {
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  .error-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    color: #dc2626;
    font-size: 0.875rem;
  }
  
  .error-message svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
  
  .input-area {
    padding: 1rem 1.5rem 1.5rem;
    background: white;
    border-top: 1px solid #e5e7eb;
  }
  
  .input-form {
    display: flex;
    gap: 0.75rem;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .message-input {
    flex: 1;
    padding: 0.875rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    font-size: 0.9375rem;
    resize: none;
    min-height: 48px;
    max-height: 200px;
    font-family: inherit;
    line-height: 1.5;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  
  .message-input:focus {
    outline: none;
    border-color: var(--agent-color);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--agent-color) 20%, transparent);
  }
  
  .message-input:disabled {
    background: #f9fafb;
    cursor: not-allowed;
  }
  
  .message-input::placeholder {
    color: #9ca3af;
  }
  
  .send-button {
    width: 48px;
    height: 48px;
    border: none;
    border-radius: 12px;
    background: var(--agent-color);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s, transform 0.2s;
    flex-shrink: 0;
  }
  
  .send-button:hover:not(:disabled) {
    opacity: 0.9;
    transform: scale(1.02);
  }
  
  .send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .send-button svg {
    width: 20px;
    height: 20px;
  }
  
  .disclaimer {
    text-align: center;
    font-size: 0.75rem;
    color: #9ca3af;
    margin: 0.75rem 0 0;
  }
</style>
