<script lang="ts" module>
  function formatMessageWithCode(content: string): string {
    return content
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      .replace(/\n/g, '<br>');
  }
</script>

<script lang="ts">
  /**
   * Message Bubble Component
   * Displays individual chat messages with proper styling
   */
  import type { Message } from '$lib/stores/chat';
  
  interface Props {
    message: Message;
    agentIcon: string;
  }
  
  let { message, agentIcon }: Props = $props();
  
  const isUser = $derived(message.role === 'user');
  const formattedTime = $derived(
    message.timestamp.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  );
</script>

<div class="message-bubble" class:user={isUser} class:assistant={!isUser}>
  {#if !isUser}
    <div class="avatar">
      <span class="avatar-icon">{agentIcon}</span>
    </div>
  {/if}
  
  <div class="message-content">
    <div class="message-text">
      {#if message.content.includes('```')}
        {@html formatMessageWithCode(message.content)}
      {:else}
        {message.content}
      {/if}
    </div>
    <div class="message-time">{formattedTime}</div>
  </div>
  
  {#if isUser}
    <div class="avatar user-avatar">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    </div>
  {/if}
</div>

<style>
  .message-bubble {
    display: flex;
    gap: 0.75rem;
    max-width: 85%;
    animation: fadeIn 0.2s ease-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .message-bubble.user {
    margin-left: auto;
    flex-direction: row-reverse;
  }
  
  .message-bubble.assistant {
    margin-right: auto;
  }
  
  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: #f3f4f6;
  }
  
  .avatar-icon {
    font-size: 1.25rem;
  }
  
  .user-avatar {
    background: #3b82f6;
    color: white;
  }
  
  .user-avatar svg {
    width: 20px;
    height: 20px;
  }
  
  .message-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .message-text {
    padding: 0.75rem 1rem;
    border-radius: 16px;
    font-size: 0.9375rem;
    line-height: 1.5;
    word-wrap: break-word;
  }
  
  .user .message-text {
    background: #3b82f6;
    color: white;
    border-bottom-right-radius: 4px;
  }
  
  .assistant .message-text {
    background: white;
    color: #111827;
    border: 1px solid #e5e7eb;
    border-bottom-left-radius: 4px;
  }
  
  .message-time {
    font-size: 0.75rem;
    color: #9ca3af;
    padding: 0 0.5rem;
  }
  
  .user .message-time {
    text-align: right;
  }
  
  :global(.code-block) {
    background: #1f2937;
    color: #e5e7eb;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-family: 'Fira Code', 'Monaco', monospace;
    font-size: 0.875rem;
    margin: 0.5rem 0;
  }
  
  :global(.inline-code) {
    background: #f3f4f6;
    color: #dc2626;
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
    font-family: 'Fira Code', 'Monaco', monospace;
    font-size: 0.875em;
  }
  
  .user :global(.inline-code) {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }
</style>
