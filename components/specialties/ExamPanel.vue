<script setup lang="ts">
import type { ExamEntry } from '~/interfaces/specialties'

// Examen de una especialidad: estado, resultado y la acción que corresponde. Se rinde en /examen/:id.
const props = defineProps<{ exam: ExamEntry, title: string, vouchersLeft?: number }>()
const { viewOf, hrefOf } = useExamState()

const view = computed(() => viewOf(props.exam))
const href = computed(() => hrefOf(props.exam))
const detail = computed(() => {
  const { state, percent, passing_percent: pass, time_minutes: minutes } = props.exam
  if (state === 'approved' || state === 'finished')
    return percent != null ? `Tu resultado: ${Math.round(percent)} %. Necesitas ${pass} % para aprobar.` : ''
  if (state === 'ready')
    return `${minutes} min · se descuenta un voucher al iniciar${props.vouchersLeft != null ? ` (te quedan ${props.vouchersLeft})` : ''}.`
  if (state === 'no_opportunities')
    return 'El examen de una especialidad usa un voucher. Puedes conseguir más.'
  return ''
})
const toneIcon = { muted: 'text-foreground-subtle', primary: 'text-primary-text', success: 'text-success', warning: 'text-warning' } as const
</script>

<template>
  <section class="flex flex-col gap-3 rounded-lg border border-subtle bg-surface-1 p-4 sm:flex-row sm:items-center sm:justify-between" :aria-label="`Examen de ${title}`">
    <div class="flex min-w-0 items-start gap-3">
      <Icon :name="view.icon" class="mt-0.5 size-5 shrink-0" :class="toneIcon[view.tone]" aria-hidden="true" />
      <div class="min-w-0">
        <p class="font-oswald text-base text-foreground">
          Examen final · {{ view.label }}
        </p>
        <p v-if="detail" class="t-small mt-0.5">
          {{ detail }}
        </p>
      </div>
    </div>
    <NuxtLink
      v-if="href && view.action"
      :to="href"
      :class="exam.state === 'ready' || exam.state === 'in_progress' ? 'bt-btn-primary shrink-0' : 'bt-btn-secondary shrink-0'"
    >
      {{ view.action }}
    </NuxtLink>
  </section>
</template>
