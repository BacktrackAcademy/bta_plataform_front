<script setup lang="ts">
import type { LessonProgressRow } from '~/interfaces/learning'
import { BarChart } from '@/components/ui/chart-bar'

// Tiempo estudiado vs. duración por clase (datos reales de `video_details_in_seconds`).
const props = defineProps<{ rows: LessonProgressRow[] }>()

const pad = (n: number) => String(n).padStart(2, '0')
const toMinutes = (seconds: number) => Math.round((seconds / 60) * 10) / 10

const data = computed(() => props.rows.map((r, i) => ({
  name: `${pad(i + 1)}. ${r.name ?? ''}`.trim(),
  Duración: toMinutes(r.total),
  Estudiado: toMinutes(r.predicted),
})))
</script>

<template>
  <section aria-labelledby="progress-chart-title">
    <h2 id="progress-chart-title" class="t-eyebrow">
      <span class="text-primary-text">//</span> tu avance
    </h2>
    <p class="t-caption mt-1">
      Minutos estudiados frente a la duración de cada clase.
    </p>
    <ClientOnly>
      <BarChart
        class="mt-3 h-[220px]"
        :data="data"
        index="name"
        :categories="['Duración', 'Estudiado']"
        :colors="['hsl(var(--border-strong))', 'hsl(var(--primary))']"
        :x-formatter="(v: number) => Number.isInteger(v) ? pad(v + 1) : ''"
        :y-formatter="(v: number) => `${Math.round(v)} min`"
      />
      <template #fallback>
        <div class="mt-3 h-[220px]" />
      </template>
    </ClientOnly>
  </section>
</template>
