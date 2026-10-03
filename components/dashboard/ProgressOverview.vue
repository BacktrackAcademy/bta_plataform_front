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
  <section class="bt-surface flex flex-col p-5" aria-label="Progreso general">
    <p class="t-eyebrow">
      Tu progreso
    </p>

    <template v-if="loading">
      <Skeleton class="mt-4 h-12 w-24" />
      <Skeleton class="mt-4 h-1.5 w-full rounded-full" />
      <Skeleton class="mt-8 h-10 w-full" />
    </template>

    <p v-else-if="!hasData" class="t-small mt-4 leading-relaxed">
      Tu progreso aparecerá aquí cuando comiences un curso.
    </p>

    <template v-else>
      <p class="mt-2 font-oswald text-4xl font-semibold leading-none text-foreground">
        {{ percent }}<span class="text-2xl text-primary-text">%</span>
      </p>
      <p class="t-small mt-1.5">
        Progreso general
      </p>
      <div class="mt-4">
        <ProgressBar :value="percent" label="Progreso general" />
      </div>

      <dl class="mt-4 grid grid-cols-2 gap-4 border-t border-subtle pt-4">
        <div>
          <dt class="t-eyebrow !text-[11px]">
            Estudiadas
          </dt>
          <dd class="mt-1 font-oswald text-2xl font-medium text-foreground">
            {{ viewed }}<span class="t-meta"> / {{ total }} h</span>
          </dd>
        </div>
        <div>
          <dt class="t-eyebrow !text-[11px]">
            Cursos
          </dt>
          <dd class="mt-1 font-oswald text-2xl font-medium text-foreground">
            {{ history?.number_courses }}
          </dd>
        </div>
      </dl>
    </template>
  </section>
</template>
