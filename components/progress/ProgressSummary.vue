<script setup lang="ts">
import ProgressBar from '~/components/dashboard/ProgressBar.vue'

// Telemetry strip: one global bar + compact stats. Only real values are passed in; null/undefined stats are omitted.
interface Stat { key: string, label: string, value: number | string | null | undefined, unit?: string }

const props = defineProps<{
  percent: number
  stats: Stat[]
  loading?: boolean
}>()

const visible = computed(() => props.stats.filter(s => s.value !== null && s.value !== undefined))
</script>

<template>
  <section class="bt-surface px-4 py-3.5 sm:px-5" aria-label="Resumen de progreso">
    <div v-if="loading" class="space-y-3">
      <Skeleton class="h-5 w-full" />
      <Skeleton class="h-8 w-full" />
    </div>

    <template v-else>
      <div class="flex items-center gap-4">
        <span class="shrink-0 font-inconsolata text-xs uppercase tracking-wider text-gray-muted">
          <span class="text-bta-pink/80">&gt;</span> Progreso general
        </span>
        <ProgressBar :value="percent" label="Progreso general" class="flex-1" />
        <span class="shrink-0 font-oswald text-xl font-semibold leading-none text-white">
          {{ percent }}<span class="text-sm text-bta-pink">%</span>
        </span>
      </div>

      <dl class="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-white/[0.06] pt-3 sm:grid-cols-5">
        <div v-for="s in visible" :key="s.key" class="flex items-baseline justify-between gap-2 sm:block">
          <dt class="font-inconsolata text-[11px] uppercase tracking-wider text-gray-muted">
            {{ s.label }}
          </dt>
          <dd class="font-oswald text-lg font-medium leading-tight text-white sm:mt-0.5">
            {{ s.value }}<span v-if="s.unit" class="ml-1 font-inconsolata text-xs text-gray-muted">{{ s.unit }}</span>
          </dd>
        </div>
      </dl>
    </template>
  </section>
</template>
