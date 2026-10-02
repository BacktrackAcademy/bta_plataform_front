<script setup lang="ts">
import type { DashboardCourse } from '~/interfaces/dashboard'
import CourseThumb from '~/components/dashboard/CourseThumb.vue'
import ProgressBar from '~/components/dashboard/ProgressBar.vue'

const props = defineProps<{ course: DashboardCourse }>()
const { secondsToHM } = useFormatter()

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
  <article class="bt-surface group relative overflow-hidden">
    <div class="flex flex-col md:flex-row">
      <div class="relative md:w-[44%] md:shrink-0">
        <CourseThumb :src="course.image_thumb" :alt="course.titulo" class="md:h-full md:!aspect-auto md:min-h-[220px]" />
        <div class="absolute inset-0 bg-gradient-to-t from-bta-surface/70 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-bta-surface/60" />
        <p class="absolute left-4 top-4 flex items-center gap-2 rounded-md border border-white/10 bg-bta-bg/80 px-2.5 py-1 text-xs font-medium text-white/85 backdrop-blur">
          <span class="size-1.5 rounded-full bg-bta-pink" aria-hidden="true" />
          En curso
        </p>
      </div>

      <div class="flex flex-1 flex-col p-6 sm:p-7">
        <p v-if="course.path || course.level_name" class="bt-eyebrow !text-bta-pink">
          {{ course.path || course.level_name }}
        </p>
        <h2 class="mt-2 font-oswald text-2xl font-semibold leading-tight text-white sm:text-[28px]">
          {{ course.titulo }}
        </h2>

        <div v-if="hasProgress" class="mt-6">
          <div class="mb-2.5 flex items-baseline justify-between gap-3">
            <span class="font-oswald text-3xl font-semibold leading-none text-white">
              {{ percent }}<span class="text-lg text-bta-pink">%</span>
            </span>
            <span class="text-sm text-bta-text-2">
              <template v-if="course.number_videos">
                {{ course.count_video ?? 0 }} / {{ course.number_videos }} lecciones
              </template>
            </span>
          </div>
          <ProgressBar :value="percent" size="md" label="Progreso del curso actual" />
          <p class="mt-3 text-sm text-bta-text-2">
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
            class="bt-focus group/cta inline-flex h-12 items-center gap-2.5 rounded-md bg-bta-pink px-6 text-[15px] font-semibold text-white transition-[filter,box-shadow] duration-200 hover:brightness-110 hover:shadow-[0_12px_32px_-12px_rgba(236,16,117,0.8)]"
          >
            {{ done ? 'Repasar curso' : 'Continuar curso' }}
            <Icon name="lucide:arrow-right" class="size-4 transition-transform duration-200 group-hover/cta:translate-x-1 motion-reduce:transition-none" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </article>
</template>
