<script setup lang="ts">
// 16:9 thumbnail: skeleton while loading, branded fallback when the image is missing or fails.
const props = defineProps<{
  src?: string | null
  alt: string
  code?: string
  /** Unifies mismatched cover art: partial greyscale + brand tint that eases off on hover. */
  brand?: boolean
}>()

const status = ref<'loading' | 'loaded' | 'error'>(props.src ? 'loading' : 'error')
const img = ref<HTMLImageElement | null>(null)

watch(() => props.src, (src) => {
  status.value = src ? 'loading' : 'error'
})

onMounted(() => {
  // The image may have finished (or failed) before hydration attached the listeners.
  const el = img.value
  if (el?.complete)
    status.value = el.naturalWidth > 0 ? 'loaded' : 'error'
})

const code = computed(() => {
  if (props.code)
    return props.code
  const words = props.alt.split(/\s+/).filter(w => w.length > 2)
  return (words.slice(0, 2).map(w => w[0]).join('') || 'BT').toUpperCase()
})
</script>

<template>
  <div class="relative isolate aspect-video w-full overflow-hidden bg-surface-3">
    <img
      v-if="src && status !== 'error'"
      ref="img"
      :src="src"
      alt=""
      width="320"
      height="180"
      loading="lazy"
      decoding="async"
      class="absolute inset-0 size-full object-cover transition-[opacity,transform] duration-slow ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      :class="[status === 'loaded' ? 'opacity-100' : 'opacity-0', brand && 'brand-img']"
      @load="status = 'loaded'"
      @error="status = 'error'"
    >
    <div v-if="status === 'loading'" class="absolute inset-0 animate-pulse bg-foreground/[0.04]" />
    <div
      v-if="status === 'error'"
      class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-3 via-surface-2 to-surface-1"
      role="img"
      :aria-label="alt"
    >
      <div class="bt-tech-grid absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_80%)]" />
      <div class="absolute -right-8 -top-8 size-32 rounded-full bg-primary/10 blur-2xl" />
      <span class="relative font-oswald text-3xl font-semibold tracking-widest text-foreground-secondary">
        {{ code }}<span class="text-primary-text">_</span>
      </span>
    </div>
    <template v-if="brand && status === 'loaded'">
      <div class="brand-tint pointer-events-none absolute inset-0" aria-hidden="true" />
      <div class="pointer-events-none absolute inset-x-0 bottom-0 hidden h-1/2 bg-gradient-to-t from-surface-2 to-transparent dark:block" aria-hidden="true" />
    </template>
    <!-- Dark: la imagen se funde con la card. Light: velo suave abajo (para los chips) y borde fino; nunca se difumina a blanco -->
    <div
      v-if="status === 'loaded'"
      class="pointer-events-none absolute inset-0 bg-gradient-to-t from-scrim/35 via-transparent to-scrim/10 ring-1 ring-inset ring-foreground/[0.07] dark:from-surface-2/80 dark:to-scrim/30"
      aria-hidden="true"
    />
    <slot />
  </div>
</template>

<style>
/* Tratamiento de portada: greyscale parcial + tinte de marca que cede al hacer hover */
.brand-img {
  filter: grayscale(0.55) contrast(1.06) brightness(0.88);
  transition: opacity var(--duration-slow) ease-out, transform 400ms var(--ease-out), filter var(--duration-slow) ease-out;
}
.brand-tint {
  background: linear-gradient(135deg, hsl(var(--brand-violet)) 0%, hsl(var(--primary)) 100%);
  mix-blend-mode: color;
  opacity: 0.4;
  transition: opacity var(--duration-slow) ease-out;
}
.group:hover .brand-img {
  filter: grayscale(0.2) contrast(1.04) brightness(1);
}
.group:hover .brand-tint {
  opacity: 0.18;
}
</style>
