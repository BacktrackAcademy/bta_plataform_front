<script setup lang="ts">
import type { ExamEntry, ExamsOverview } from '~/interfaces/specialties'
import PageHeader from '~/components/common/PageHeader.vue'
import StateCard from '~/components/common/StateCard.vue'
import ProgressBar from '~/components/dashboard/ProgressBar.vue'
import { Skeleton } from '~/components/ui/skeleton'

definePageMeta({ layout: 'custom', auth: true })
useSeoMeta({
  title: 'Exámenes',
  description: 'Rinde el examen de tus cursos o de tus especialidades y obtén tu certificado.',
  robots: 'noindex, nofollow',
})

type Tab = 'courses' | 'specialties'

const { viewOf, hrefOf } = useExamState()
const { data, status, refresh } = useAPI<ExamsOverview>('/exams', { lazy: true })

const loading = computed(() => status.value === 'pending' || status.value === 'idle')
const failed = computed(() => status.value === 'error')

interface Row {
  key: string
  title: string
  subtitle: string
  to: string
  percent: number
  progressLabel: string
  exam: ExamEntry
}

const rows = computed<Record<Tab, Row[]>>(() => ({
  courses: (data.value?.courses ?? []).filter(c => c.exam).map(c => ({
    key: c.slug,
    title: c.title,
    subtitle: [c.level, `${c.progress.lessons_done} / ${c.progress.lessons_total || c.lessons_count} clases`].filter(Boolean).join(' · '),
    to: `/curso/${c.slug}`,
    percent: c.progress.percent,
    progressLabel: `Progreso en ${c.title}`,
    exam: c.exam!,
  })),
  specialties: (data.value?.specialties ?? []).filter(s => s.exam).map(s => ({
    key: s.slug,
    title: s.name,
    subtitle: `${s.progress.courses_completed} / ${s.progress.courses_total} cursos completados`,
    to: `/especialidad/${s.slug}`,
    percent: s.progress.percent,
    progressLabel: `Progreso en ${s.name}`,
    exam: s.exam!,
  })),
}))

const tab = ref<Tab>('courses')
const tabs = computed<{ key: Tab, label: string, hint: string }[]>(() => [
  { key: 'courses', label: 'Por curso', hint: 'Se habilita al completar todas las clases. Usa una oportunidad.' },
  { key: 'specialties', label: 'Por especialidad', hint: 'Certifica toda la ruta. Usa un voucher.' },
])
const pending = (list: Row[]) => list.filter(r => r.exam.state === 'ready' || r.exam.state === 'in_progress').length

// Entra por la pestaña que tiene algo para rendir.
const touched = ref(false)
watch(loading, (isLoading) => {
  if (!isLoading && !touched.value && !pending(rows.value.courses) && pending(rows.value.specialties))
    tab.value = 'specialties'
}, { immediate: true })

function setTab(key: Tab) {
  touched.value = true
  tab.value = key
}

const current = computed(() => rows.value[tab.value])
const emptyText: Record<Tab, string> = {
  courses: 'Aún no tienes exámenes de curso. Empieza un curso y complétalo para habilitar el suyo.',
  specialties: 'Aún no tienes exámenes de especialidad. Avanza en una especialidad para verlos aquí.',
}
</script>

<template>
  <div class="mx-auto w-full max-w-[1200px] space-y-6 px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <PageHeader title="Exámenes" class="animate-rise-in">
      Certifícate por curso o por especialidad. Necesitas 70 % para aprobar.
      <template #actions>
        <NuxtLink to="/suscripciones/extras" class="bt-btn-secondary">
          <Icon name="lucide:ticket" class="size-4" aria-hidden="true" />
          Conseguir más
        </NuxtLink>
      </template>
    </PageHeader>

    <StateCard v-if="failed" variant="error" title="No pudimos cargar tus exámenes" text="Revisa tu conexión e inténtalo de nuevo.">
      <button type="button" class="bt-btn-secondary" @click="refresh()">
        <Icon name="lucide:rotate-cw" class="size-4" />
        Reintentar
      </button>
    </StateCard>

    <template v-else>
      <dl class="grid gap-3 sm:grid-cols-2">
        <div class="bt-surface p-4">
          <dt class="t-small">
            Oportunidades (examen por curso)
          </dt>
          <dd class="font-oswald text-2xl text-foreground">
            <Skeleton v-if="loading" class="h-8 w-12" />
            <template v-else>
              {{ data?.opportunities_left ?? 0 }}
            </template>
          </dd>
        </div>
        <div class="bt-surface p-4">
          <dt class="t-small">
            Vouchers (examen por especialidad)
          </dt>
          <dd class="font-oswald text-2xl text-foreground">
            <Skeleton v-if="loading" class="h-8 w-12" />
            <template v-else>
              {{ data?.vouchers_left ?? 0 }}
            </template>
          </dd>
        </div>
      </dl>

      <div role="tablist" aria-label="Tipo de examen" class="flex flex-wrap gap-1.5">
        <button
          v-for="t in tabs"
          :id="`tab-${t.key}`"
          :key="t.key"
          type="button"
          role="tab"
          :aria-selected="tab === t.key"
          :aria-controls="`panel-${t.key}`"
          class="bt-chip aria-selected:border-primary/50 aria-selected:bg-primary/10 aria-selected:text-foreground"
          @click="setTab(t.key)"
        >
          {{ t.label }}
          <span v-if="!loading" class="font-mono text-xs text-foreground-subtle" :class="{ '!text-primary-text': tab === t.key }">{{ rows[t.key].length }}</span>
        </button>
      </div>

      <section :id="`panel-${tab}`" role="tabpanel" :aria-labelledby="`tab-${tab}`">
        <p class="t-small mb-4">
          {{ tabs.find(t => t.key === tab)?.hint }}
        </p>

        <div v-if="loading" class="space-y-3" aria-busy="true">
          <Skeleton v-for="n in 3" :key="n" class="h-24" />
        </div>
        <StateCard v-else-if="!current.length" :title="emptyText[tab]" icon="lucide:inbox">
          <NuxtLink :to="tab === 'courses' ? '/cursos' : '/especialidades'" class="bt-btn-secondary">
            {{ tab === 'courses' ? 'Explorar cursos' : 'Ver especialidades' }}
          </NuxtLink>
        </StateCard>
        <ul v-else class="space-y-3">
          <li v-for="r in current" :key="r.key" class="bt-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="min-w-0 flex-1">
              <NuxtLink :to="r.to" class="bt-focus rounded-sm font-oswald text-lg text-foreground transition-colors hover:text-primary-text">
                {{ r.title }}
              </NuxtLink>
              <p class="t-meta mt-0.5 !text-xs">
                {{ r.subtitle }}
              </p>
              <ProgressBar class="mt-3 max-w-[420px]" :value="r.percent" :label="r.progressLabel" />
            </div>
            <div class="flex shrink-0 flex-col gap-2 sm:items-end">
              <p class="t-small inline-flex items-center gap-1.5">
                <Icon :name="viewOf(r.exam).icon" class="size-4" :class="r.exam.state === 'approved' ? 'text-success' : 'text-foreground-muted'" aria-hidden="true" />
                {{ viewOf(r.exam).label }}
                <template v-if="r.exam.percent != null">
                  · {{ Math.round(r.exam.percent) }} %
                </template>
              </p>
              <NuxtLink
                v-if="hrefOf(r.exam) && viewOf(r.exam).action"
                :to="hrefOf(r.exam)!"
                :class="r.exam.state === 'ready' || r.exam.state === 'in_progress' ? 'bt-btn-primary' : 'bt-btn-secondary'"
              >
                {{ viewOf(r.exam).action }}
              </NuxtLink>
              <NuxtLink v-else-if="r.exam.state === 'locked'" :to="r.to" class="bt-btn-secondary">
                Ir al curso
              </NuxtLink>
            </div>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
