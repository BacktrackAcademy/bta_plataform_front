<script setup lang="ts">
import type { SpecialtyCard, SpecialtyStatus } from '~/interfaces/specialties'
import CourseThumb from '~/components/dashboard/CourseThumb.vue'
import ProgressBar from '~/components/dashboard/ProgressBar.vue'

const props = defineProps<{ specialty: SpecialtyCard }>()

const LABEL: Record<SpecialtyStatus, { text: string, icon: string }> = {
  certified: { text: 'Certificada', icon: 'lucide:award' },
  completed: { text: 'Examen pendiente', icon: 'lucide:clock' },
  in_progress: { text: 'En curso', icon: 'lucide:circle-dot' },
  not_started: { text: 'No iniciada', icon: 'lucide:circle' },
}

const progress = computed(() => props.specialty.progress)
const label = computed(() => LABEL[progress.value.status])
const duration = computed(() => formatCourseDuration({ total_duration_seconds: props.specialty.total_duration_seconds }))
const highlighted = computed(() => progress.value.status === 'in_progress' || progress.value.status === 'certified')
</script>

<template>
  <article class="bt-card bt-card-interactive group flex flex-col">
    <CourseThumb :src="specialty.image_url ?? specialty.wallpaper_url" :alt="specialty.name" brand>
      <p
        class="bt-overlay-chip absolute left-3 top-3 font-mono uppercase tracking-wider"
        :class="highlighted ? 'text-on-scrim-primary' : 'text-on-scrim/70'"
      >
        <Icon :name="label.icon" class="size-3" aria-hidden="true" />
        {{ label.text }}
      </p>
    </CourseThumb>

    <div class="flex flex-1 flex-col p-4">
      <p v-if="specialty.level" class="t-meta !text-xs">
        {{ specialty.level }}
      </p>
      <h3 class="mt-1 line-clamp-2 font-oswald text-lg font-medium leading-snug text-foreground">
        <NuxtLink :to="`/especialidad/${specialty.slug}`" class="bt-focus rounded-sm after:absolute after:inset-0">
          {{ specialty.name }}
        </NuxtLink>
      </h3>
      <p v-if="specialty.summary" class="t-small mt-1 line-clamp-2">
        {{ specialty.summary }}
      </p>

      <div class="mt-auto pt-4">
        <ProgressBar :value="progress.percent" :label="`Progreso en ${specialty.name}`" />
        <p class="t-meta mt-2 flex items-center justify-between !text-xs">
          <span>{{ progress.courses_completed }} / {{ progress.courses_total }} cursos<template v-if="duration"> · {{ duration }}</template></span>
          <span class="text-foreground-secondary">{{ progress.percent }}%</span>
        </p>
      </div>
    </div>
  </article>
</template>
