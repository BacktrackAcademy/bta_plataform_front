<script setup lang="ts">
// Avatar de perfil: dimensiones fijas (nunca se deforma), object-cover, y fallback con iniciales
// cuando no hay foto o la imagen falla. Sin <img> roto ni texto alt desbordado.
const props = withDefaults(defineProps<{
  src?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg'
}>(), { size: 'md' })

const failed = ref(false)
watch(() => props.src, () => {
  failed.value = false
})

const initials = computed(() =>
  props.name.split(/\s+/).filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?',
)
const sizes = {
  sm: 'size-10 text-sm',
  md: 'size-24 text-3xl sm:size-28',
  lg: 'size-28 text-4xl sm:size-36',
} as const
</script>

<template>
  <span
    class="relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-surface-3 ring-[3px] ring-primary/70 ring-offset-4 ring-offset-surface-2"
    :class="sizes[size]"
    role="img"
    :aria-label="name"
  >
    <img
      v-if="src && !failed"
      :src="src"
      alt=""
      width="128"
      height="128"
      decoding="async"
      class="size-full object-cover"
      @error="failed = true"
    >
    <span v-else class="font-oswald tracking-wide text-primary-text" aria-hidden="true">{{ initials }}</span>
  </span>
</template>
