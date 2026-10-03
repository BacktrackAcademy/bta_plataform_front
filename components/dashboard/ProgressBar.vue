<script setup lang="ts">
// Magenta = progress so far, dark gray = pending. Fills in on mount (skipped for reduced motion via CSS).
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
    class="w-full overflow-hidden rounded-full bg-white/[0.07]"
    :class="size === 'md' ? 'h-2' : 'h-1.5'"
  >
    <div
      class="h-full rounded-full bg-bta-pink shadow-[0_0_12px_rgba(236,16,117,0.55)] transition-[width] duration-1000 ease-out motion-reduce:transition-none"
      :style="{ width: `${shown ? clamped : 0}%` }"
    />
  </div>
</template>
