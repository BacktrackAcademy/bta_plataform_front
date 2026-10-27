<script setup lang="ts">
import CourseThumb from '~/components/dashboard/CourseThumb.vue'

// Anuncio del próximo lanzamiento: cuenta regresiva hasta `timer`. Se descarta por curso.
const props = defineProps<{
  course: {
    id: number
    titulo: string
    slug: string
    shortdes?: string
    image_thumb?: string | null
    level_name?: string
    timer?: string | null
  }
}>()

const storageKey = computed(() => `bt:dismissed-course:${props.course.id}`)
const dismissed = ref(true) // oculto hasta leer el storage: evita parpadeo en SSR
const now = ref(Date.now())
let interval: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  try {
    dismissed.value = localStorage.getItem(storageKey.value) === '1'
  }
  catch {
    dismissed.value = false
  }
  interval = setInterval(() => (now.value = Date.now()), 1000)
})
onBeforeUnmount(() => clearInterval(interval))

function dismiss() {
  dismissed.value = true
  try {
    localStorage.setItem(storageKey.value, '1')
  }
  catch {}
}

const remaining = computed(() => {
  const t = props.course.timer ? Date.parse(props.course.timer) : Number.NaN
  return Number.isNaN(t) ? null : Math.max(0, t - now.value)
})
const units = computed(() => {
  const ms = remaining.value
  if (ms === null || ms <= 0)
    return []
  const s = Math.floor(ms / 1000)
  return [
    { label: 'días', value: Math.floor(s / 86400) },
    { label: 'horas', value: Math.floor((s % 86400) / 3600) },
    { label: 'min', value: Math.floor((s % 3600) / 60) },
    { label: 'seg', value: s % 60 },
  ]
})
const pad = (n: number) => String(n).padStart(2, '0')
</script>

<template>
  <section
    v-if="!dismissed"
    aria-label="Próximo lanzamiento"
    class="relative overflow-hidden rounded-lg border border-primary/40 bg-surface-2 shadow-[0_8px_30px_-12px_hsl(var(--primary)/0.45)]"
  >
    <div class="pointer-events-none absolute -left-10 -top-16 size-56 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
    <div class="relative flex flex-col md:flex-row">
      <!-- Portada a todo el alto, igual que «En curso» -->
      <div class="relative aspect-video md:aspect-auto md:min-h-[200px] md:w-[38%] md:shrink-0">
        <CourseThumb :src="course.image_thumb" :alt="course.titulo" brand class="absolute inset-0 !aspect-auto size-full" />
        <div class="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-surface-2/60 via-transparent to-transparent dark:block md:dark:bg-gradient-to-r md:dark:from-transparent md:dark:via-transparent md:dark:to-surface-2" />
        <p class="bt-overlay-chip absolute left-4 top-4 font-mono uppercase tracking-wider text-on-scrim-primary">
          <span class="relative flex size-2" aria-hidden="true">
            <span class="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75 motion-reduce:animate-none" />
            <span class="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          Próximamente
        </p>
      </div>

      <div class="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
        <p v-if="course.level_name" class="font-mono text-sm uppercase tracking-wider text-primary-text">
          {{ course.level_name }}
        </p>
        <h2 class="t-h1 mt-1.5 line-clamp-2 !text-2xl sm:!text-[1.75rem]">
          {{ course.titulo }}
        </h2>
        <p v-if="course.shortdes" class="t-small mt-2 line-clamp-2">
          {{ course.shortdes }}
        </p>
        <div class="mt-auto pt-5">
          <div v-if="units.length" class="flex items-stretch gap-2" role="timer" :aria-label="`Faltan ${units[0].value} días, ${units[1].value} horas y ${units[2].value} minutos`">
            <div v-for="u in units" :key="u.label" class="min-w-[58px] rounded-md border border-subtle bg-surface-1 px-2.5 py-1.5 text-center">
              <span class="block font-mono text-2xl font-semibold leading-none tabular-nums text-foreground">{{ pad(u.value) }}</span>
              <span class="mt-1 block font-mono text-[10px] uppercase tracking-wider text-foreground-muted">{{ u.label }}</span>
            </div>
          </div>
          <span v-else class="inline-flex items-center gap-1.5 font-mono text-sm font-medium text-primary-text">
            <Icon name="lucide:clock" class="size-4" />
            Disponible muy pronto
          </span>
        </div>
      </div>
    </div>
    <button
      type="button"
      class="bt-focus absolute right-3 top-3 rounded-sm p-1 text-foreground-muted transition-colors hover:text-foreground"
      aria-label="Ocultar anuncio"
      @click="dismiss"
    >
      <Icon name="lucide:x" class="size-4" />
    </button>
  </section>
</template>
