<script setup lang="ts">
// Magenta = progreso logrado, surface-4 = pendiente. Se rellena al montar (sin transición con reduced-motion).
const props = withDefaults(defineProps<{
  value: number
  size?: 'sm' | 'md'
  label?: string
}>(), { size: 'sm', label: 'Progreso' })

const clamped = computed(() => Math.min(100, Math.max(0, Number.isFinite(props.value) ? props.value : 0)))
const shown = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    shown.value = true
  })
})
</script>

<template>
  <div
    role="progressbar"
    :aria-label="label"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="Math.round(clamped)"
    class="w-full overflow-hidden rounded-full bg-surface-4"
    :class="size === 'md' ? 'h-2' : 'h-1.5'"
  >
    <div
      class="h-full rounded-full bg-primary transition-[width] duration-700 ease-out motion-reduce:transition-none"
      :style="{ width: `${shown ? clamped : 0}%` }"
    />
  </div>
</template>
