<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'

// Bottom sheet del temario para pantallas sin columna lateral (< lg).
defineProps<{ label: string }>()
const open = defineModel<boolean>({ required: true })

onKeyStroke('Escape', () => {
  open.value = false
})

// Bloquea el scroll del documento mientras está abierto (y lo restaura al cerrar o desmontar).
watch(open, (isOpen) => {
  if (import.meta.client)
    document.documentElement.style.overflow = isOpen ? 'hidden' : ''
})
onBeforeUnmount(() => {
  if (import.meta.client)
    document.documentElement.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-base ease-out"
      leave-active-class="transition-opacity duration-base ease-out"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-50 lg:hidden">
        <div class="absolute inset-0 bg-scrim/70" aria-hidden="true" @click="open = false" />
        <section
          role="dialog"
          aria-modal="true"
          :aria-label="label"
          class="absolute inset-x-0 bottom-0 flex h-[80dvh] flex-col overflow-hidden rounded-t-lg border-t border-border bg-surface-1 shadow-elev-3 md:inset-x-auto md:right-0 md:top-0 md:h-full md:w-[380px] md:rounded-none md:border-l md:border-t-0"
        >
          <div class="flex shrink-0 items-center justify-between border-b border-subtle px-4 py-2">
            <p class="font-mono text-sm text-foreground-secondary">
              <span class="text-primary-text">$</span> {{ label }}
            </p>
            <button type="button" class="bt-icon-btn !size-8" aria-label="Cerrar temario" @click="open = false">
              <Icon name="lucide:x" class="size-4" />
            </button>
          </div>
          <div class="min-h-0 flex-1" @click="($event.target as HTMLElement).closest('a') && (open = false)">
            <slot />
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
