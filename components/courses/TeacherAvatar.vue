<script setup lang="ts">
// Instructor photo normalised to one look (greyscale + magenta/violet tint),
// so mismatched source photos never break the layout. Plays one short glitch when an ancestor `.group` is hovered.
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
  <span class="avatar relative isolate inline-block size-7 shrink-0 overflow-hidden rounded-full bg-bta-dark-blue ring-1 ring-bta-pink/40">
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
    <span v-else class="flex size-full items-center justify-center font-oswald text-[0.6em] text-bta-pink" aria-hidden="true">{{ initials }}</span>
    <span class="avatar__tint pointer-events-none absolute inset-0" aria-hidden="true" />
  </span>
</template>

<style>
.avatar__img {
  filter: grayscale(1) contrast(1.25) brightness(0.9);
}
.avatar__tint {
  background: linear-gradient(135deg, #ec1075 0%, #3b1d8f 100%);
  mix-blend-mode: color;
  opacity: 0.85;
}
.group:hover .avatar__img {
  animation: avatar-glitch 0.5s steps(1) 1;
}
@keyframes avatar-glitch {
  0%, 100% { transform: translate(0); filter: grayscale(1) contrast(1.25) brightness(0.9); }
  15% { transform: translate(-1px, 0); filter: grayscale(1) contrast(1.4) drop-shadow(2px 0 #ff00c1) drop-shadow(-2px 0 #00fff9); }
  30% { transform: translate(1px, 1px); }
  45% { transform: translate(0); filter: grayscale(1) contrast(1.25) brightness(0.9); }
  70% { transform: translate(2px, 0); filter: grayscale(1) contrast(1.4) drop-shadow(-2px 0 #ff00c1) drop-shadow(2px 0 #00fff9); }
  85% { transform: translate(0, -1px); }
}
@media (prefers-reduced-motion: reduce) {
  .group:hover .avatar__img { animation: none; }
}
</style>
