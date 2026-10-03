<script setup lang="ts">
import Player from '@vimeo/player'
import { useOnline } from '@vueuse/core'

// Reproductor 16:9 (Vimeo) con estados de carga y error integrados al sistema de diseño.
const props = defineProps<{ videoId?: string | null, title: string }>()
const emit = defineEmits<{ progress: [percent: number], ended: [] }>()

const LOAD_TIMEOUT_MS = 20000
const iframe = ref<HTMLIFrameElement | null>(null)
const status = ref<'loading' | 'ready' | 'error'>(props.videoId ? 'loading' : 'error')
const attempt = ref(0)
const online = useOnline()
let player: Player | null = null
let timer: ReturnType<typeof setTimeout> | undefined

// El parámetro `h` es el hash de privacidad del dominio configurado en Vimeo (se mantiene tal cual).
const src = computed(() => props.videoId ? `https://player.vimeo.com/video/${props.videoId}?h=0eb117b38a&title=0&byline=0&portrait=0&badge=0` : '')

function fail() {
  clearTimeout(timer)
  if (status.value !== 'ready')
    status.value = 'error'
}

function teardown() {
  clearTimeout(timer)
  player?.destroy().catch(() => {})
  player = null
}

function setup() {
  teardown()
  if (!iframe.value || !props.videoId) {
    status.value = 'error'
    return
  }
  status.value = 'loading'
  timer = setTimeout(fail, LOAD_TIMEOUT_MS)
  player = new Player(iframe.value)
  player.ready().then(() => {
    clearTimeout(timer)
    status.value = 'ready'
  }).catch(fail)
  // Un error de reproducción posterior lo muestra el propio reproductor; aquí sólo cubrimos la carga.
  player.on('error', fail)
  player.on('progress', (data: { percent: number }) => emit('progress', data.percent))
  player.on('ended', () => emit('ended'))
}

function retry() {
  attempt.value++
  status.value = props.videoId ? 'loading' : 'error'
  nextTick(setup)
}

onMounted(setup)
onBeforeUnmount(teardown)
</script>

<template>
  <div class="relative aspect-video w-full overflow-hidden bg-black">
    <iframe
      v-if="src"
      :key="attempt"
      ref="iframe"
      :src="src"
      :title="title"
      class="absolute inset-0 size-full border-0"
      allow="autoplay; fullscreen; picture-in-picture"
      allowfullscreen
    />

    <div v-if="status === 'loading'" class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black" aria-live="polite">
      <p class="flex items-center gap-2 font-mono text-sm text-on-scrim/70">
        <Icon name="lucide:loader-circle" class="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        cargando reproductor…
      </p>
    </div>

    <div v-else-if="status === 'error'" class="bt-tech-grid absolute inset-0 flex items-center justify-center bg-surface-1 p-6" role="alert">
      <div class="max-w-md text-center">
        <Icon name="lucide:video-off" class="mx-auto size-8 text-danger" aria-hidden="true" />
        <p class="mt-3 font-oswald text-xl text-foreground">
          No pudimos reproducir este video
        </p>
        <p class="t-small mt-1.5">
          <template v-if="!online">
            Parece que no tienes conexión. Revisa tu red e inténtalo de nuevo.
          </template>
          <template v-else-if="!videoId">
            Esta clase todavía no tiene un video asociado.
          </template>
          <template v-else>
            El reproductor no respondió a tiempo. Puede ser una conexión inestable o una extensión que bloquea el contenido embebido.
          </template>
        </p>
        <div class="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button v-if="videoId" type="button" class="bt-btn-primary" @click="retry">
            <Icon name="lucide:rotate-cw" class="size-4" aria-hidden="true" />
            Reintentar
          </button>
          <a href="mailto:contacto@backtrackacademy.com?subject=Problema%20al%20reproducir%20un%20video" class="bt-btn-ghost">Reportar problema</a>
        </div>
        <p v-if="videoId" class="mt-4 font-mono text-xs text-foreground-subtle">
          <span class="text-primary-text">$</span> vimeo_id={{ videoId }}
        </p>
      </div>
    </div>
  </div>
</template>
