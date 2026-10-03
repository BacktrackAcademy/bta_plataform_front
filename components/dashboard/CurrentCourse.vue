<script setup lang="ts">
import type { DashboardCourse } from '~/interfaces/dashboard'
import CourseThumb from '~/components/dashboard/CourseThumb.vue'
import TeacherAvatar from '~/components/courses/TeacherAvatar.vue'
import ProgressBar from '~/components/dashboard/ProgressBar.vue'

const props = defineProps<{ course: DashboardCourse }>()
const { secondsToHM } = useFormatter()

const author = computed(() => [props.course.teacher?.name, props.course.teacher?.lastname].filter(Boolean).join(' '))
const hasProgress = computed(() => typeof props.course.percent === 'number')
const percent = computed(() => Math.min(100, Math.max(0, Math.round(props.course.percent ?? 0))))
const done = computed(() => percent.value >= 100)

const remaining = computed(() => {
  const total = props.course.total_duration_seconds
  const viewed = props.course.total_user
  if (!total || typeof viewed !== 'number' || viewed >= total)
    return null
  return secondsToHM(total - viewed)
})
</script>

<template>
  <!-- Elemento dominante del dashboard: único con elevación y borde reforzado -->
  <article class="group relative overflow-hidden rounded-lg border border-border bg-surface-2 shadow-elev-2">
    <div class="flex flex-col md:flex-row">
      <!-- Cover: fills the whole column on desktop (absolute) instead of relying on a percentage height -->
      <div class="relative aspect-video md:aspect-auto md:min-h-[260px] md:w-[44%] md:shrink-0">
        <CourseThumb :src="course.image_thumb" :alt="course.titulo" brand class="absolute inset-0 !aspect-auto size-full" />
        <div class="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-surface-2/60 via-transparent to-transparent dark:block md:dark:bg-gradient-to-r md:dark:from-transparent md:dark:via-transparent md:dark:to-surface-2" />
        <p class="bt-overlay-chip absolute left-4 top-4 font-mono uppercase tracking-wider text-on-scrim-primary">
          <span class="size-1.5 rounded-full bg-primary" aria-hidden="true" />
          En curso
        </p>
      </div>

      <div class="flex flex-1 flex-col p-6 sm:p-8">
        <p v-if="course.path || course.level_name" class="font-mono text-sm uppercase tracking-wider text-primary-text">
          {{ course.path || course.level_name }}
        </p>
        <h2 class="t-h1 mt-2 !text-3xl sm:!text-4xl">
          {{ course.titulo }}
        </h2>

        <div v-if="author" class="mt-4 flex items-center gap-2.5">
          <TeacherAvatar :src="course.teacher?.avatar_url" :name="author" />
          <span class="truncate text-sm text-foreground-secondary">{{ author }}</span>
        </div>

        <div v-if="hasProgress" class="mt-6">
          <div class="mb-2.5 flex items-baseline justify-between gap-3">
            <span class="font-oswald text-3xl font-semibold leading-none text-foreground">
              {{ percent }}<span class="text-lg text-primary-text">%</span>
            </span>
            <span class="t-meta">
              <template v-if="course.number_videos">
                {{ course.count_video ?? 0 }} / {{ course.number_videos }} lecciones
              </template>
            </span>
          </div>
          <ProgressBar :value="percent" size="md" label="Progreso del curso actual" />
          <p class="t-small mt-3">
            <template v-if="course.last_video_viewed?.titlevideo">
              Última lección: <span class="text-foreground-secondary">{{ course.last_video_viewed.titlevideo }}</span>
            </template>
            <template v-if="remaining">
              <span v-if="course.last_video_viewed?.titlevideo" class="mx-1.5 text-foreground/20">·</span>
              <span class="font-mono">≈ {{ remaining }} restantes</span>
            </template>
          </p>
        </div>

        <div class="mt-auto pt-7">
          <NuxtLink :to="`/curso/${course.slug}`" class="bt-btn-primary bt-btn-lg group/cta font-oswald text-lg uppercase tracking-wider">
            {{ done ? 'Repasar curso' : 'Continuar curso' }}
            <Icon name="lucide:arrow-right" class="size-4 transition-transform duration-base group-hover/cta:translate-x-1 motion-reduce:transition-none" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </article>
</template>
