<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'radix-vue'

// Interruptor accesible (role=switch) con título y descripción asociados.
defineProps<{ id: string, label: string, description: string, disabled?: boolean }>()
const model = defineModel<boolean>({ default: false })
</script>

<template>
  <div class="flex items-start justify-between gap-4" :class="disabled ? 'opacity-50' : ''">
    <div class="min-w-0">
      <label :id="`${id}-label`" :for="id" class="block font-sans text-[15px] font-medium text-foreground">{{ label }}</label>
      <p :id="`${id}-desc`" class="mt-1 font-sans text-sm leading-relaxed text-foreground-muted">
        {{ description }}
      </p>
    </div>
    <SwitchRoot
      :id="id"
      v-model:checked="model"
      :disabled="disabled"
      :aria-labelledby="`${id}-label`"
      :aria-describedby="`${id}-desc`"
      class="bt-focus relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-border bg-foreground/10 transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary disabled:cursor-not-allowed"
    >
      <SwitchThumb class="block size-4 translate-x-1 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-6" />
    </SwitchRoot>
  </div>
</template>
