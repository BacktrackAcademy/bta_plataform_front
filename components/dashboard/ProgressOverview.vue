<script setup lang="ts">
import type { CoursesHistory } from '~/interfaces/dashboard'
import ProgressBar from '~/components/dashboard/ProgressBar.vue'

const props = defineProps<{ history: CoursesHistory | null | undefined, loading?: boolean }>()
const { clockToHours } = useFormatter()

const percent = computed(() => Math.round(props.history?.progress_percentage ?? 0))
const viewed = computed(() => clockToHours(props.history?.total_viewed))
const total = computed(() => clockToHours(props.history?.total_length))
const hasData = computed(() => (props.history?.number_courses ?? 0) > 0)
</script>

<template>
  <section class="bt-surface flex flex-col !rounded-2xl !border-transparent p-6 shadow-[0_10px_25px_-8px_rgba(0,0,0,0.7)]" aria-label="Progreso general">
    <p class="font-inconsolata text-sm uppercase tracking-wider text-gray-muted">
      Tu progreso
    </p>

    <template v-if="loading">
      <Skeleton class="mt-4 h-12 w-24" />
      <Skeleton class="mt-4 h-1.5 w-full rounded-full" />
      <Skeleton class="mt-8 h-10 w-full" />
    </template>

    <p v-else-if="!hasData" class="mt-4 font-inconsolata text-sm leading-relaxed text-gray-muted">
      Tu progreso aparecerá aquí cuando comiences un curso.
    </p>

    <template v-else>
      <p class="mt-3 font-oswald text-5xl font-semibold leading-none text-white">
        {{ percent }}<span class="text-2xl text-bta-pink">%</span>
      </p>
      <p class="mt-1.5 font-inconsolata text-sm text-gray-muted">
        Progreso general
      </p>
      <div class="mt-4">
        <ProgressBar :value="percent" label="Progreso general" />
      </div>

      <dl class="mt-6 grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-5">
        <div>
          <dt class="font-inconsolata text-xs uppercase tracking-wider text-gray-muted">
            Estudiadas
          </dt>
          <dd class="mt-1 font-oswald text-2xl font-medium text-white">
            {{ viewed }}<span class="font-inconsolata text-sm text-gray-muted"> / {{ total }} h</span>
          </dd>
        </div>
        <div>
          <dt class="font-inconsolata text-xs uppercase tracking-wider text-gray-muted">
            Cursos
          </dt>
          <dd class="mt-1 font-oswald text-2xl font-medium text-white">
            {{ history?.number_courses }}
          </dd>
        </div>
      </dl>
    </template>
  </section>
</template>
