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
  <article class="bt-surface group relative overflow-hidden !rounded-2xl !border-transparent shadow-[0_10px_25px_-8px_rgba(0,0,0,0.7)]">
    <div class="flex flex-col md:flex-row">
      <!-- Cover: fills the whole column on desktop (absolute) instead of relying on a percentage height -->
      <div class="relative aspect-video md:aspect-auto md:min-h-[260px] md:w-[44%] md:shrink-0">
        <CourseThumb :src="course.image_thumb" :alt="course.titulo" brand class="absolute inset-0 !aspect-auto size-full" />
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-bta-surface/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-bta-surface" />
        <p class="absolute left-4 top-4 inline-flex items-center gap-2 border border-bta-pink/60 bg-black/60 px-2.5 py-1 font-inconsolata text-xs uppercase tracking-wider text-bta-pink backdrop-blur">
          <span class="size-1.5 rounded-full bg-bta-pink motion-safe:animate-pulse" aria-hidden="true" />
          En curso
        </p>
      </div>

      <div class="flex flex-1 flex-col p-6 sm:p-8">
        <p v-if="course.path || course.level_name" class="font-inconsolata text-sm uppercase tracking-wider text-bta-pink">
          {{ course.path || course.level_name }}
        </p>
        <h2 class="mt-2 font-oswald text-3xl font-semibold leading-[1.1] text-white sm:text-4xl">
          {{ course.titulo }}
        </h2>

        <div v-if="author" class="mt-4 flex items-center gap-2.5">
          <TeacherAvatar :src="course.teacher?.avatar_url" :name="author" />
          <span class="truncate font-inconsolata text-sm text-white">{{ author }}</span>
        </div>

        <div class="mt-4 h-0.5 w-8 bg-bta-pink transition-all duration-300 group-hover:w-12" />

        <div v-if="hasProgress" class="mt-6">
          <div class="mb-2.5 flex items-baseline justify-between gap-3">
            <span class="font-oswald text-3xl font-semibold leading-none text-white">
              {{ percent }}<span class="text-lg text-bta-pink">%</span>
            </span>
            <span class="font-inconsolata text-sm text-gray-muted">
              <template v-if="course.number_videos">
                {{ course.count_video ?? 0 }} / {{ course.number_videos }} lecciones
              </template>
            </span>
          </div>
          <ProgressBar :value="percent" size="md" label="Progreso del curso actual" />
          <p class="mt-3 font-inconsolata text-sm text-gray-muted">
            <template v-if="course.last_video_viewed?.titlevideo">
              Última lección: <span class="text-white/85">{{ course.last_video_viewed.titlevideo }}</span>
            </template>
            <template v-if="remaining">
              <span v-if="course.last_video_viewed?.titlevideo" class="mx-1.5 text-white/20">·</span>
              <span>≈ {{ remaining }} restantes</span>
            </template>
          </p>
        </div>

        <div class="mt-auto pt-7">
          <NuxtLink
            :to="`/curso/${course.slug}`"
            class="bt-focus group/cta inline-flex h-12 items-center gap-2.5 bg-bta-pink px-6 font-oswald text-lg uppercase tracking-wider text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-10px_rgba(236,16,117,0.9)]"
          >
            {{ done ? 'Repasar curso' : 'Continuar curso' }}
            <Icon name="lucide:arrow-right" class="size-4 transition-transform duration-200 group-hover/cta:translate-x-1 motion-reduce:transition-none" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </article>
</template>
