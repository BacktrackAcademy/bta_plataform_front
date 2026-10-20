<script setup lang="ts">
import type { ExamPhase, ExamQuestionPayload, ExamResult, ExamSummary } from '@/interfaces/exam'
import PageHeader from '~/components/common/PageHeader.vue'

definePageMeta({ layout: 'custom', auth: true })
useSeoMeta({ title: 'Examen', robots: 'noindex' })

const route = useRoute()
const id = String(route.params.id)
const { $api } = useNuxtApp()

const summary = ref<ExamSummary | null>(null)
const current = ref<ExamQuestionPayload | null>(null)
const result = ref<ExamResult | null>(null)
const phase = ref<ExamPhase>('intro')
const loading = ref(true)
const busy = ref(false)
const fatal = ref('')
const error = ref('')
const selected = ref<number | null>(null)
const secondsLeft = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

const blockedText: Record<string, string> = {
  course_incomplete: 'Completa todas las clases del curso para habilitar el examen.',
  no_opportunities: 'No te quedan oportunidades para rendir exámenes. Puedes conseguir más con una suscripción.',
  approved: 'Ya aprobaste este examen.',
}

const clock = computed(() => {
  const s = Math.max(0, secondsLeft.value)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
})
const lowTime = computed(() => secondsLeft.value > 0 && secondsLeft.value <= 300)

function stopTimer() {
  if (timer)
    clearInterval(timer)
  timer = undefined
}

function startTimer(seconds: number) {
  stopTimer()
  secondsLeft.value = seconds
  timer = setInterval(() => {
    secondsLeft.value--
    if (secondsLeft.value <= 0) {
      stopTimer()
      showResult() // se acabó el tiempo: lo no respondido cuenta como incorrecto
    }
  }, 1000)
}

async function showResult() {
  stopTimer()
  try {
    result.value = await $api<ExamResult>(`/exam/${id}/result`)
    phase.value = 'result'
  }
  catch (e: any) {
    error.value = e?.data?.error ?? 'No pudimos cargar tu resultado.'
  }
}

function applyQuestion(payload: ExamQuestionPayload | { phase: ExamPhase }) {
  if (payload.phase === 'in_progress') {
    const q = payload as ExamQuestionPayload
    current.value = q
    selected.value = null
    phase.value = 'in_progress'
    // Sincroniza con el servidor sin reiniciar el reloj en cada pregunta.
    if (!timer || Math.abs(secondsLeft.value - q.seconds_left) > 5)
      startTimer(q.seconds_left)
  }
  else {
    showResult()
  }
}

async function load() {
  loading.value = true
  try {
    summary.value = await $api<ExamSummary>(`/exam/${id}`)
    if (summary.value.phase === 'in_progress')
      applyQuestion(await $api<ExamQuestionPayload>(`/exam/${id}/question`))
    else if (summary.value.phase === 'result')
      await showResult()
  }
  catch {
    fatal.value = 'No encontramos este examen o no está disponible.'
  }
  finally {
    loading.value = false
  }
}

async function start() {
  busy.value = true
  error.value = ''
  try {
    result.value = null
    summary.value = await $api<ExamSummary>(`/exam/${id}/start`, { method: 'POST' })
    applyQuestion(await $api<ExamQuestionPayload>(`/exam/${id}/question`))
  }
  catch (e: any) {
    error.value = e?.data?.error ?? 'No pudimos iniciar el examen.'
  }
  finally {
    busy.value = false
  }
}

async function submit() {
  if (selected.value == null || !current.value || busy.value)
    return
  busy.value = true
  error.value = ''
  try {
    applyQuestion(await $api(`/exam/${id}/answer`, { method: 'POST', body: { question_id: current.value.question.id, value: selected.value } }))
  }
  catch (e: any) {
    error.value = e?.data?.error ?? 'No pudimos guardar tu respuesta.'
  }
  finally {
    busy.value = false
  }
}

async function retry() {
  await start()
}

onMounted(load)
onBeforeUnmount(stopTimer)
</script>

<template>
  <div class="mx-auto w-full max-w-[760px] px-5 py-6 sm:px-8 lg:py-8">
    <p v-if="loading" class="t-small">
      Cargando examen…
    </p>
    <p v-else-if="fatal" class="t-body" role="alert">
      {{ fatal }}
    </p>

    <template v-else-if="summary">
      <!-- Intro -->
      <section v-if="phase === 'intro'">
        <PageHeader :title="summary.title">
          <template v-if="summary.target">
            {{ summary.target.title }}
          </template>
        </PageHeader>
        <p v-if="summary.description" class="t-body mt-6">
          {{ summary.description }}
        </p>
        <dl class="mt-6 grid gap-3 sm:grid-cols-3">
          <div class="bt-surface p-4">
            <dt class="t-small">
              Preguntas
            </dt>
            <dd class="font-oswald text-2xl text-foreground">
              {{ summary.total_questions }}
            </dd>
          </div>
          <div class="bt-surface p-4">
            <dt class="t-small">
              Tiempo
            </dt>
            <dd class="font-oswald text-2xl text-foreground">
              {{ summary.time_minutes }} min
            </dd>
          </div>
          <div class="bt-surface p-4">
            <dt class="t-small">
              Para aprobar
            </dt>
            <dd class="font-oswald text-2xl text-foreground">
              {{ summary.passing_percent }} %
            </dd>
          </div>
        </dl>
        <ul class="t-small mt-6 list-disc space-y-1 pl-5">
          <li>Al iniciar se descuenta una oportunidad. Te quedan {{ summary.opportunities_left }}.</li>
          <li>Si recargas la página, retomas donde quedaste y el reloj sigue corriendo.</li>
          <li>Las preguntas sin responder al terminar el tiempo cuentan como incorrectas.</li>
          <li>Al aprobar obtienes tu certificado y tu medalla.</li>
        </ul>
        <p v-if="summary.blocked_reason" class="bt-surface mt-6 p-4 text-sm" role="status">
          {{ blockedText[summary.blocked_reason] }}
          <NuxtLink v-if="summary.blocked_reason === 'no_opportunities'" to="/suscripciones" class="ml-1 text-primary-text underline">
            Ver planes
          </NuxtLink>
          <NuxtLink v-else-if="summary.blocked_reason === 'course_incomplete' && summary.target" :to="`/curso/${summary.target.slug}`" class="ml-1 text-primary-text underline">
            Ir al curso
          </NuxtLink>
        </p>
        <div class="mt-8 flex items-center justify-between gap-3">
          <p class="font-mono text-xs text-danger" role="alert">
            {{ error }}
          </p>
          <button type="button" class="bt-btn-primary" :disabled="!summary.can_start || busy" :aria-busy="busy" @click="start">
            Iniciar examen
          </button>
        </div>
      </section>

      <!-- Rindiendo -->
      <section v-else-if="phase === 'in_progress' && current" aria-live="polite">
        <div class="flex items-center justify-between gap-3">
          <p class="font-mono text-[13px] text-foreground-muted">
            <span class="text-primary-text">//</span> pregunta {{ current.answered + 1 }} de {{ current.total }}
          </p>
          <p class="font-mono text-sm" :class="lowTime ? 'text-danger' : 'text-foreground-secondary'" role="timer">
            {{ clock }}
          </p>
        </div>
        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3" role="progressbar" :aria-valuenow="current.answered" :aria-valuemax="current.total">
          <div class="h-full bg-primary transition-all duration-base" :style="{ width: `${(current.answered / current.total) * 100}%` }" />
        </div>
        <p v-if="lowTime" class="t-small mt-3 text-danger">
          Te queda poco tiempo para terminar.
        </p>

        <h2 class="t-h2 mt-8">
          {{ current.question.name }}
        </h2>
        <p v-if="current.question.description" class="t-body mt-2">
          {{ current.question.description }}
        </p>
        <img v-if="current.question.image_url" :src="current.question.image_url" alt="" class="mt-4 max-h-80 rounded-md border border-subtle">

        <form class="mt-6 space-y-3" @submit.prevent="submit">
          <label
            v-for="o in current.question.options"
            :key="o.value"
            class="bt-card flex cursor-pointer items-start gap-3 p-4 transition-colors duration-fast"
            :class="selected === o.value ? 'border-primary/60 bg-primary/10' : 'hover:border-border'"
          >
            <input v-model="selected" type="radio" name="option" :value="o.value" class="mt-1">
            <span class="t-body">{{ o.text }}</span>
          </label>
          <div class="flex items-center justify-between gap-3 pt-2">
            <p class="font-mono text-xs text-danger" role="alert">
              {{ error }}
            </p>
            <button type="submit" class="bt-btn-primary" :disabled="selected == null || busy" :aria-busy="busy">
              Responder
            </button>
          </div>
        </form>
      </section>

      <!-- Resultado -->
      <section v-else-if="phase === 'result' && result" class="text-center">
        <p class="font-mono text-[13px] text-foreground-muted">
          <span class="text-primary-text">//</span> resultado · {{ result.title }}
        </p>
        <img v-if="result.badge?.image_url" :src="result.badge.image_url" :alt="result.badge.name" class="mx-auto mt-6 size-28">
        <p class="mt-4 font-oswald text-6xl" :class="result.passed ? 'text-success' : 'text-foreground'">
          {{ result.percent }} %
        </p>
        <p class="t-body mt-2">
          Respondiste correctamente {{ result.corrects }} de {{ result.total }}.
        </p>
        <h2 class="t-h2 mt-4">
          {{ result.passed ? '¡Felicitaciones, aprobaste!' : 'No alcanzaste el puntaje mínimo' }}
        </h2>
        <p v-if="!result.passed" class="t-small mt-1">
          Necesitas {{ result.passing_percent }} % para aprobar.
        </p>

        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a v-if="result.certificate_url" :href="result.certificate_url" target="_blank" rel="noopener" class="bt-btn-primary">
            <Icon name="lucide:award" class="size-4" /> Descargar certificado
          </a>
          <button v-if="!result.passed && result.can_start" type="button" class="bt-btn-primary" :disabled="busy" @click="retry">
            Rendir nuevamente
          </button>
          <NuxtLink v-else-if="!result.passed && result.blocked_reason === 'no_opportunities'" to="/suscripciones" class="bt-btn-secondary">
            Conseguir más oportunidades
          </NuxtLink>
          <NuxtLink v-if="result.target" :to="`/curso/${result.target.slug}`" class="bt-btn-ghost">
            Volver al curso
          </NuxtLink>
        </div>
        <p class="mt-4 font-mono text-xs text-danger" role="alert">
          {{ error }}
        </p>
      </section>
    </template>
  </div>
</template>
