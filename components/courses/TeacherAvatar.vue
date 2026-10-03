<script setup lang="ts">
// Instructor photo normalised to one look (greyscale + magenta/violet tint),
// so mismatched source photos never break the layout.
const props = defineProps<{
  src?: string | null
  name: string
}>()

const failed = ref(false)
watch(() => props.src, () => {
  failed.value = false
})

const initials = computed(() => props.name.split(/\s+/).filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase())
</script>

<template>
  <span class="avatar relative isolate inline-block size-7 shrink-0 overflow-hidden rounded-full bg-surface-3 ring-1 ring-primary/30">
    <img
      v-if="src && !failed"
      :src="src"
      :alt="name"
      width="64"
      height="64"
      loading="lazy"
      class="avatar__img size-full object-cover"
      @error="failed = true"
    >
    <span v-else class="flex size-full items-center justify-center font-oswald text-[0.6em] text-primary-text" aria-hidden="true">{{ initials }}</span>
    <span class="avatar__tint pointer-events-none absolute inset-0" aria-hidden="true" />
  </span>
</template>

<style>
.avatar__img {
  filter: grayscale(1) contrast(1.2) brightness(0.9);
}
.avatar__tint {
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--brand-violet)) 100%);
  mix-blend-mode: color;
  opacity: 0.8;
}
</style>
