<script setup lang="ts">
import type { LessonProgressRow } from '~/interfaces/learning'

// Avance por clase en formato terminal: una fila por clase con barra segmentada (tiempo estudiado vs. duración).
const props = defineProps<{ rows: LessonProgressRow[], currentId?: number }>()

const { secondsToHM } = useFormatter()
const pad = (n: number) => String(n).padStart(2, '0')

const items = computed(() => props.rows.map((r, i) => {
  const pct = r.total > 0 ? Math.min(100, Math.round((r.predicted / r.total) * 100)) : 0
  return {
    id: r.id,
    n: pad(i + 1),
    name: lessonTitle(r.name),
    pct,
    done: r.is_finish === true || pct >= 100,
    started: r.predicted > 0,
    time: `${secondsToHM(Math.min(r.predicted, r.total))} / ${secondsToHM(r.total)}`,
  }
}))
const totalStudied = computed(() => secondsToHM(props.rows.reduce((sum, r) => sum + r.predicted, 0)))
</script>

<template>
  <section aria-labelledby="progress-chart-title">
    <h2 id="progress-chart-title" class="font-mono text-[13px] text-foreground-muted">
      <span class="text-primary-text">//</span> tu avance
    </h2>

    <div class="mt-3 overflow-hidden rounded-lg border border-subtle bg-surface-1">
      <p class="flex items-center justify-between gap-3 border-b border-subtle px-4 py-2 font-mono text-xs text-foreground-subtle">
        <span><span class="text-primary-text">$</span> avance --por-clase</span>
        <span class="shrink-0">total <span class="text-foreground-muted">{{ totalStudied }}</span></span>
      </p>

      <ol class="max-h-[22rem] overflow-y-auto px-4 py-2 font-mono text-[13px]">
        <li
          v-for="row in items"
          :key="row.id"
          class="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 py-1.5 sm:grid-cols-[1.5rem_minmax(0,14rem)_minmax(0,1fr)_3rem_8.5rem]"
          :aria-current="row.id === currentId ? 'step' : undefined"
        >
          <span :class="row.id === currentId ? 'text-primary-text' : 'text-foreground-subtle'">{{ row.n }}</span>
          <span class="truncate" :class="row.id === currentId ? 'text-foreground' : row.started ? 'text-foreground-secondary' : 'text-foreground-subtle'" :title="row.name">
            <span v-if="row.id === currentId" class="mr-1 text-primary-text" aria-hidden="true">&gt;</span>{{ row.name }}
          </span>
          <!-- bloques de 6px con 2px de separación; el mismo patrón recorta pista y relleno -->
          <span
            class="segments col-span-2 col-start-2 h-2 sm:col-span-1 sm:col-start-auto"
            role="progressbar"
            :aria-valuenow="row.pct"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="`Clase ${row.n}`"
          >
            <span class="block h-full" :class="row.done ? 'bg-success' : 'bg-primary'" :style="{ width: `${row.pct}%` }" />
          </span>
          <span class="text-right" :class="row.done ? 'text-success' : row.started ? 'text-foreground-muted' : 'text-foreground-subtle'">{{ row.pct }}%</span>
          <span class="hidden text-right text-xs text-foreground-subtle sm:block">{{ row.time }}</span>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.segments {
  display: block;
  background: hsl(var(--foreground) / 0.1);
  -webkit-mask-image: repeating-linear-gradient(90deg, #000 0 6px, transparent 6px 8px);
  mask-image: repeating-linear-gradient(90deg, #000 0 6px, transparent 6px 8px);
}
</style>
