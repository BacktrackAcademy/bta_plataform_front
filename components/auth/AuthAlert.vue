<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'error' | 'success', code?: string | null, message: string }>(), { variant: 'error', code: null })
</script>

<template>
  <div
    :role="variant === 'error' ? 'alert' : 'status'"
    class="auth-alert border-l-2 px-4 py-3 font-mono text-[13px] leading-6"
    :class="variant === 'error' ? 'border-danger bg-danger/[0.07]' : 'border-primary bg-primary/[0.07]'"
  >
    <p :class="variant === 'error' ? 'text-danger' : 'text-primary-text'">
      <span>{{ variant === 'error' ? '[!]' : '[+]' }}</span> {{ code || (variant === 'error' ? 'ERROR' : 'OK') }}<span class="auth-alert-cursor" :class="variant === 'error' ? 'bg-danger' : 'bg-primary'" aria-hidden="true" />
    </p>
    <p class="text-foreground-muted">
      {{ message }}
    </p>
  </div>
</template>

<style scoped>
.auth-alert { animation: alert-in var(--duration-slow) ease-out both; }
.auth-alert-cursor {
  display: inline-block;
  width: 0.5em;
  height: 1em;
  margin-left: 4px;
  vertical-align: text-bottom;
}
@keyframes alert-in { from { opacity: 0; transform: translateX(-6px); } }
@media (prefers-reduced-motion: reduce) {
  .auth-alert { animation: none; }
}
</style>
