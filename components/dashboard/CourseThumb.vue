<script setup lang="ts">
// 16:9 thumbnail: skeleton while loading, branded fallback when the image is missing or fails.
const props = defineProps<{
  src?: string | null
  alt: string
  code?: string
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
  <div class="relative aspect-video w-full overflow-hidden bg-bta-elevated">
    <img
      v-if="src && status !== 'error'"
      ref="img"
      :src="src"
      alt=""
      width="320"
      height="180"
      loading="lazy"
      decoding="async"
      class="absolute inset-0 size-full object-cover transition-[opacity,transform] duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      :class="status === 'loaded' ? 'opacity-100' : 'opacity-0'"
      @load="status = 'loaded'"
      @error="status = 'error'"
    >
    <div v-if="status === 'loading'" class="absolute inset-0 animate-pulse bg-white/[0.04]" />
    <div
      v-if="status === 'error'"
      class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#12162A] via-bta-surface to-bta-bg"
      role="img"
      :aria-label="alt"
    >
      <div class="bt-tech-grid absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_80%)]" />
      <div class="absolute -right-8 -top-8 size-32 rounded-full bg-bta-pink/15 blur-2xl" />
      <span class="relative font-oswald text-3xl font-semibold tracking-widest text-white/80">
        {{ code }}<span class="text-bta-pink">_</span>
      </span>
    </div>
    <!-- Blend: darkens bright/white images, grounds the image in the card and adds a crisp inner edge -->
    <div
      v-if="status === 'loaded'"
      class="pointer-events-none absolute inset-0 bg-gradient-to-t from-bta-surface/80 via-transparent to-bta-bg/30 ring-1 ring-inset ring-white/[0.07]"
      aria-hidden="true"
    />
    <slot />
  </div>
</template>
