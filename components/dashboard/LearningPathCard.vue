<script setup lang="ts">
import type { Degree } from '~/interfaces/dashboard'

const props = defineProps<{ degree: Degree }>()

const code = computed(() =>
  props.degree.name.split(/\s+/).filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'BT',
)
</script>

<template>
  <div class="bt-surface flex items-center gap-3.5 p-3.5 transition-colors duration-200 hover:border-white/15">
    <span class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-bta-pink/40 bg-bta-pink/[0.08] text-xs font-semibold text-bta-pink" aria-hidden="true">
      {{ code }}
    </span>
    <div class="min-w-0">
      <p class="truncate font-oswald text-[15px] font-medium text-white">
        {{ degree.name }}
      </p>
      <p class="mt-0.5 truncate text-xs text-bta-text-2">
        {{ degree.count_courses }} cursos · {{ degree.level }}
      </p>
    </div>
  </div>
</template>
