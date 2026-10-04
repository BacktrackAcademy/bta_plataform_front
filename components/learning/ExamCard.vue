<script setup lang="ts">
import type { LessonExam } from '~/interfaces/learning'

// Estado del examen del curso. Iniciar/continuar/ver resultados ocurre en el flujo web actual (Rails, con sesión propia).
const props = defineProps<{ exam: LessonExam, courseSlug: string }>()

const config = useRuntimeConfig()
const legacyOrigin = computed(() => {
  try {
    return new URL(String(config.public.apiBaseUrl)).origin
  }
  catch {
    return 'https://backtrackacademy.com'
  }
})

interface View { icon: string, title: string, text: string, label?: string, href?: string, external?: boolean, disabled?: boolean }
const view = computed<View>(() => {
  const base = legacyOrigin.value
  switch (props.exam.state) {
    case 'ready':
      return { icon: 'lucide:file-check-2', title: 'Ya puedes rendir el examen', text: 'Es un examen por curso. Se inicia desde la plataforma de exámenes.', label: 'Iniciar examen', href: `${base}/curso/${props.courseSlug}`, external: true }
    case 'in_progress':
      return { icon: 'lucide:timer', title: 'Tienes un examen en curso', text: 'Retómalo donde lo dejaste.', label: 'Continuar examen', href: `${base}/exams/${props.exam.id}`, external: true }
    case 'finished':
      return { icon: 'lucide:file-text', title: 'Examen rendido', text: props.exam.percent != null ? `Tu resultado: ${Math.round(props.exam.percent)} %. Necesitas 70 % para aprobar.` : 'Revisa tu resultado.', label: 'Ver resultados', href: `${base}/examen/result/${props.exam.id}`, external: true }
    case 'approved':
      return { icon: 'lucide:badge-check', title: 'Examen aprobado', text: props.exam.percent != null ? `Resultado: ${Math.round(props.exam.percent)} %.` : 'Completaste el examen del curso.', label: 'Ver resultados', href: `${base}/examen/result/${props.exam.id}`, external: true }
    case 'no_opportunities':
      return { icon: 'lucide:ticket-x', title: 'Te quedaste sin oportunidades', text: 'Puedes conseguir más con una suscripción.', label: 'Ver planes', href: '/suscripciones' }
    default:
      return { icon: 'lucide:lock', title: 'Examen del curso', text: 'Completa todas las clases para habilitarlo. Es un examen por curso.', disabled: true }
  }
})
</script>

<template>
  <section aria-labelledby="exam-title">
    <h2 id="exam-title" class="font-mono text-[13px] text-foreground-muted">
      <span class="text-primary-text">//</span> certifícate
    </h2>
    <div class="mt-3 flex flex-col gap-3 rounded-lg border border-subtle bg-surface-1 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex min-w-0 items-start gap-3">
        <Icon :name="view.icon" class="mt-0.5 size-5 shrink-0" :class="exam.state === 'approved' ? 'text-success' : view.disabled ? 'text-foreground-subtle' : 'text-primary-text'" aria-hidden="true" />
        <div class="min-w-0">
          <p class="font-oswald text-base text-foreground">
            {{ view.title }}
          </p>
          <p class="t-small mt-0.5">
            {{ view.text }}
          </p>
        </div>
      </div>
      <a v-if="view.href && view.external" :href="view.href" target="_blank" rel="noopener" class="bt-btn-primary shrink-0">
        {{ view.label }}
        <Icon name="lucide:external-link" class="size-4" aria-hidden="true" />
      </a>
      <NuxtLink v-else-if="view.href" :to="view.href" class="bt-btn-secondary shrink-0">
        {{ view.label }}
      </NuxtLink>
    </div>
  </section>
</template>
