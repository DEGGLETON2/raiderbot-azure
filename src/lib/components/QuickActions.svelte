<script lang="ts">
  /**
   * Quick Actions Component
   * Displays clickable quick action buttons for common queries
   */
  
  interface QuickAction {
    label: string;
    prompt: string;
  }
  
  interface Props {
    actions: QuickAction[];
    onAction: (prompt: string) => void;
  }
  
  let { actions, onAction }: Props = $props();
</script>

<div class="quick-actions">
  <p class="quick-actions-label">Quick Actions</p>
  <div class="actions-grid">
    {#each actions as action}
      <button 
        class="action-button"
        onclick={() => onAction(action.prompt)}
        type="button"
      >
        {action.label}
      </button>
    {/each}
  </div>
</div>

<style>
  .quick-actions {
    width: 100%;
    max-width: 600px;
  }
  
  .quick-actions-label {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 500;
  }
  
  .actions-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }
  
  .action-button {
    padding: 0.625rem 1rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    font-size: 0.875rem;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }
  
  .action-button:hover {
    background: #f9fafb;
    border-color: var(--agent-color, #3b82f6);
    color: var(--agent-color, #3b82f6);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .action-button:active {
    transform: translateY(0);
  }
</style>
