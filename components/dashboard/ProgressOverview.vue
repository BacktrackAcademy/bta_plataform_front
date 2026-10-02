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
  <section class="bt-surface flex flex-col p-6" aria-label="Progreso general">
    <p class="bt-eyebrow">
      Tu progreso
    </p>

    <template v-if="loading">
      <Skeleton class="mt-4 h-12 w-24" />
      <Skeleton class="mt-4 h-1.5 w-full rounded-full" />
      <Skeleton class="mt-8 h-10 w-full" />
    </template>

    <p v-else-if="!hasData" class="mt-4 text-sm leading-relaxed text-bta-text-2">
      Tu progreso aparecerá aquí cuando comiences un curso.
    </p>

    <template v-else>
      <p class="mt-3 font-oswald text-5xl font-semibold leading-none text-white">
        {{ percent }}<span class="text-2xl text-bta-pink">%</span>
      </p>
      <p class="mt-1.5 text-sm text-bta-text-2">
        Progreso general
      </p>
      <div class="mt-4">
        <ProgressBar :value="percent" label="Progreso general" />
      </div>

      <dl class="mt-6 grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-5">
        <div>
          <dt class="text-xs text-bta-text-2">
            Estudiadas
          </dt>
          <dd class="mt-1 font-oswald text-2xl font-medium text-white">
            {{ viewed }}<span class="text-sm text-bta-text-2"> / {{ total }} h</span>
          </dd>
        </div>
        <div>
          <dt class="text-xs text-bta-text-2">
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
