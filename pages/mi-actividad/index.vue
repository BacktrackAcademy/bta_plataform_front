<script setup lang="ts">
import type { ActivityResponse } from '@/interfaces/activity'
import PageHeader from '~/components/common/PageHeader.vue'

definePageMeta({ layout: 'custom', auth: true })
useSeoMeta({ title: 'Mi actividad', robots: 'noindex' })

const { secondsToHM } = useFormatter()
const days = ref<7 | 30>(7)
const { data, status, error, refresh } = useAPI<ActivityResponse>('/me/activity', {
  query: computed(() => ({ days: days.value })),
  lazy: true,
  server: false,
})

const max = computed(() => Math.max(1, ...(data.value?.study.series.map(d => d.seconds) ?? [0])))
const dayLabel = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('es', { weekday: 'short', day: 'numeric' })
const tierClass = { bronze: 'text-amber-600', silver: 'text-slate-300', gold: 'text-yellow-400' } as const
const tierLabel = { bronze: 'Bronce', silver: 'Plata', gold: 'Oro' } as const
const dateLabel = (iso: string) => new Date(iso).toLocaleDateString('es', { year: 'numeric', month: 'short', day: 'numeric' })
</script>

<template>
  <div class="mx-auto w-full max-w-[900px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <PageHeader title="Mi actividad">
      Tu tiempo de estudio, tus exámenes y las medallas que has conseguido.
    </PageHeader>

    <p v-if="status === 'pending' && !data" class="t-small mt-8">
      Cargando tu actividad…
    </p>
    <div v-else-if="error" class="mt-8 flex items-center gap-3">
      <p class="t-small">
        No pudimos cargar tu actividad.
      </p>
      <button type="button" class="bt-btn-ghost !h-8 !px-2.5" @click="refresh()">
        Reintentar
      </button>
    </div>

    <template v-else-if="data">
      <!-- Estudio -->
      <section class="mt-8" aria-labelledby="study-title">
        <div class="flex items-center justify-between gap-3">
          <h2 id="study-title" class="font-mono text-[13px] text-foreground-muted">
            <span class="text-primary-text">//</span> tiempo de estudio
          </h2>
          <div class="flex gap-2" role="group" aria-label="Período">
            <button type="button" class="bt-chip" :aria-pressed="days === 7" @click="days = 7">
              7 días
            </button>
            <button type="button" class="bt-chip" :aria-pressed="days === 30" @click="days = 30">
              30 días
            </button>
          </div>
        </div>
        <p class="t-body mt-2">
          Total: <strong>{{ secondsToHM(data.study.total_seconds) }}</strong>
        </p>
        <div class="bt-surface mt-3 p-4">
          <ul class="flex h-40 items-end gap-1" :class="days === 30 ? 'gap-0.5' : 'gap-2'">
            <li
              v-for="d in data.study.series"
              :key="d.date"
              class="flex h-full min-w-0 flex-1 flex-col justify-end"
              :title="`${dayLabel(d.date)}: ${secondsToHM(d.seconds)}`"
            >
              <span class="block w-full rounded-t-sm bg-primary/80" :style="{ height: d.seconds ? `${Math.max(4, (d.seconds / max) * 100)}%` : '2px', opacity: d.seconds ? 1 : 0.3 }" />
              <span class="sr-only">{{ dayLabel(d.date) }}: {{ secondsToHM(d.seconds) }}</span>
            </li>
          </ul>
          <div v-if="days === 7" class="mt-2 flex gap-2 font-mono text-[11px] text-foreground-subtle">
            <span v-for="d in data.study.series" :key="d.date" class="min-w-0 flex-1 truncate text-center">{{ dayLabel(d.date) }}</span>
          </div>
        </div>
      </section>

      <!-- Exámenes -->
      <section class="mt-10" aria-labelledby="exams-title">
        <h2 id="exams-title" class="font-mono text-[13px] text-foreground-muted">
          <span class="text-primary-text">//</span> exámenes
        </h2>
        <dl class="mt-3 grid gap-3 sm:grid-cols-3">
          <div class="bt-surface p-4">
            <dt class="t-small">
              Oportunidades totales
            </dt>
            <dd class="font-oswald text-2xl">
              {{ data.exams.opportunities_total }}
            </dd>
          </div>
          <div class="bt-surface p-4">
            <dt class="t-small">
              Intentos usados
            </dt>
            <dd class="font-oswald text-2xl">
              {{ data.exams.opportunities_used }}
            </dd>
          </div>
          <div class="bt-surface p-4">
            <dt class="t-small">
              Disponibles
            </dt>
            <dd class="font-oswald text-2xl text-primary-text">
              {{ data.exams.opportunities_left }}
            </dd>
          </div>
        </dl>

        <p v-if="!data.exams.attempts.length" class="t-small mt-4">
          Aún no has rendido exámenes. Completa un curso para habilitar el suyo.
        </p>
        <div v-else class="mt-4 overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="font-mono text-xs text-foreground-muted">
              <tr>
                <th class="py-2 pr-4 font-normal">
                  Examen
                </th>
                <th class="hidden py-2 pr-4 font-normal sm:table-cell">
                  Intentos
                </th>
                <th class="py-2 pr-4 font-normal">
                  Resultado
                </th>
                <th class="py-2 font-normal">
                  <span class="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle border-t border-subtle">
              <tr v-for="a in data.exams.attempts" :key="a.exam_id">
                <td class="py-3 pr-4 text-foreground">
                  {{ a.title }}
                </td>
                <td class="hidden py-3 pr-4 sm:table-cell">
                  {{ a.attempts }}
                </td>
                <td class="py-3 pr-4" :class="a.passed ? 'text-success' : 'text-foreground-secondary'">
                  {{ a.percent ?? '—' }}<template v-if="a.percent != null">
                    %
                  </template>
                </td>
                <td class="py-3 text-right">
                  <a v-if="a.certificate_url" :href="a.certificate_url" target="_blank" rel="noopener" class="text-primary-text underline">Certificado</a>
                  <NuxtLink v-else :to="`/examen/${a.exam_id}`" class="text-primary-text underline">
                    Ver
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Medallas -->
      <section class="mt-10" aria-labelledby="badges-title">
        <h2 id="badges-title" class="font-mono text-[13px] text-foreground-muted">
          <span class="text-primary-text">//</span> medallas<template v-if="data.badges.length">
            ({{ data.badges.length }})
          </template>
        </h2>
        <p v-if="!data.badges.length" class="t-small mt-4">
          Aprueba el examen de un curso para ganar tu primera medalla. Mientras más alto tu puntaje, mejor la medalla.
        </p>
        <ul v-else class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="b in data.badges" :key="b.id" class="bt-surface flex items-center gap-3 p-4">
            <img v-if="b.image_url" :src="b.image_url" :alt="b.name" class="size-14 shrink-0 object-contain">
            <Icon v-else name="lucide:medal" class="size-14 shrink-0 text-primary-text" />
            <div class="min-w-0">
              <p class="truncate font-oswald text-base text-foreground">
                {{ b.name }}
              </p>
              <p v-if="b.target" class="t-small truncate">
                {{ b.target.title }}
              </p>
              <p class="font-mono text-xs" :class="b.tier ? tierClass[b.tier] : 'text-foreground-muted'">
                {{ b.tier ? tierLabel[b.tier] : '' }} · {{ dateLabel(b.earned_at) }}
              </p>
            </div>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
