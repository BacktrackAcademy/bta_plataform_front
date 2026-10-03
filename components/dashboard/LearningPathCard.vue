<script setup lang="ts">
import type { Degree } from '~/interfaces/dashboard'

const props = defineProps<{ degree: Degree }>()

const code = computed(() =>
  props.degree.name.split(/\s+/).filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'BT',
)
</script>

<template>
  <div class="bt-card bt-card-interactive flex items-center gap-3.5 p-3.5">
    <span class="flex size-10 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 font-mono text-sm font-semibold text-primary-text" aria-hidden="true">
      {{ code }}
    </span>
    <div class="min-w-0">
      <p class="truncate font-oswald text-[15px] font-medium text-foreground">
        {{ degree.name }}
      </p>
      <p class="mt-0.5 truncate text-xs text-foreground-muted">
        {{ degree.count_courses }} cursos · {{ degree.level }}
      </p>
    </div>
  </div>
</template>
