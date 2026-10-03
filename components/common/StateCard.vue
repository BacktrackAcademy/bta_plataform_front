<script setup lang="ts">
// Estados vacíos y de error con una sola apariencia: tarjeta sobria + acción opcional (slot).
withDefaults(defineProps<{
  title: string
  text?: string
  variant?: 'error' | 'empty'
  icon?: string
}>(), { variant: 'empty' })
</script>

<template>
  <section
    class="flex flex-col items-start gap-4 rounded-lg border p-6 sm:flex-row sm:items-center sm:justify-between"
    :class="variant === 'error' ? 'border-danger/30 bg-danger/[0.06]' : 'border-dashed border-border bg-surface-1'"
    :role="variant === 'error' ? 'alert' : 'status'"
  >
    <div class="flex items-start gap-3">
      <Icon
        v-if="variant === 'error' || icon"
        :name="icon ?? 'lucide:triangle-alert'"
        class="mt-0.5 size-5 shrink-0"
        :class="variant === 'error' ? 'text-danger' : 'text-foreground-muted'"
        aria-hidden="true"
      />
      <div>
        <p class="font-oswald text-lg text-foreground">
          {{ title }}
        </p>
        <p v-if="text" class="t-small mt-1">
          {{ text }}
        </p>
      </div>
    </div>
    <div v-if="$slots.default" class="shrink-0">
      <slot />
    </div>
  </section>
</template>
