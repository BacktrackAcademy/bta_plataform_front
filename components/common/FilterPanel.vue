<script setup lang="ts">
import { Input } from '@/components/ui/input'

// Barra de filtros compartida (misma que /cursos): búsqueda + selectores múltiples (slot `selects`) +
// fila de chips opcional (slot `chips`) y "Limpiar filtros". Cada página decide qué filtros ofrece
// según lo que realmente soporta su modelo/API.
withDefaults(defineProps<{ modelValue: string, placeholder: string, activeCount: number, columns?: 2 | 3 }>(), { columns: 3 })
defineEmits<{ 'update:modelValue': [value: string], 'clear': [] }>()
</script>

<template>
  <section class="bt-panel mb-8 space-y-4 p-4 sm:p-5" aria-label="Filtros">
    <div class="grid gap-3" :class="columns === 2 ? 'md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]' : 'md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]'">
      <label class="relative block">
        <span class="sr-only">{{ placeholder }}</span>
        <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-primary-text" aria-hidden="true">&gt;</span>
        <Input
          :model-value="modelValue"
          class="h-11 bg-surface-2 pl-8"
          :placeholder="placeholder"
          @update:model-value="$emit('update:modelValue', String($event ?? ''))"
        />
      </label>
      <slot name="selects" />
    </div>

    <div v-if="$slots.chips || activeCount" class="flex flex-wrap items-center gap-2">
      <slot name="chips" />
      <button
        v-if="activeCount"
        type="button"
        class="bt-focus ml-auto inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-primary-text transition-opacity duration-fast hover:opacity-80"
        @click="$emit('clear')"
      >
        <Icon name="lucide:x" class="size-3.5" />
        Limpiar filtros ({{ activeCount }})
      </button>
    </div>
  </section>
</template>
