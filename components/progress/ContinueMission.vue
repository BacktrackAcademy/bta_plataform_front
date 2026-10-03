<script setup lang="ts">
import type { CourseProgress } from '~/interfaces/dashboard'
import TeacherAvatar from '~/components/courses/TeacherAvatar.vue'
import ProgressBar from '~/components/dashboard/ProgressBar.vue'

const props = defineProps<{ course: CourseProgress }>()
const { percentOf } = useCourseProgress()
const { secondsToHM } = useFormatter()

const percent = computed(() => percentOf(props.course))
const author = computed(() => [props.course.teacher?.name, props.course.teacher?.lastname].filter(Boolean).join(' '))
const lastLesson = computed(() => props.course.last_video_viewed?.titlevideo)
const remaining = computed(() => {
  const total = props.course.total_duration_seconds
  const viewed = props.course.total_user
  return total && typeof viewed === 'number' && viewed < total ? secondsToHM(total - viewed) : null
})
</script>

<template>
  <section class="relative overflow-hidden rounded-lg border border-border border-l-2 border-l-primary bg-surface-2 p-5 shadow-elev-1 sm:p-6" aria-labelledby="continue-title">
    <div class="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-8">
      <div class="min-w-0 flex-1">
        <p class="t-eyebrow !text-primary-text">
          <span aria-hidden="true">&gt; </span>Continuar misión
        </p>
        <h2 id="continue-title" class="t-h1 mt-2 !text-2xl sm:!text-3xl">
          {{ course.titulo }}
        </h2>
        <p v-if="lastLesson" class="mt-1.5 text-sm text-primary-text">
          {{ lastLesson }}
        </p>

        <div class="mt-5 max-w-xl">
          <div class="mb-2 flex items-baseline justify-between gap-3">
            <span v-if="course.number_videos" class="t-meta">
              <span class="text-foreground">{{ course.count_video ?? 0 }}</span> / {{ course.number_videos }} lecciones
            </span>
            <span class="font-oswald text-xl font-semibold leading-none text-foreground">
              {{ percent }}<span class="text-sm text-primary-text">%</span>
            </span>
          </div>
          <ProgressBar :value="percent" size="md" :label="`Progreso en ${course.titulo}`" />
        </div>

        <div class="t-meta mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 !text-xs">
          <span class="inline-flex items-center gap-2">
            <TeacherAvatar v-if="author" :src="course.teacher?.avatar_url" :name="author" class="!size-5" />
            <span v-if="author" class="text-foreground-secondary">{{ author }}</span>
          </span>
          <span v-if="remaining"><span class="text-primary-text/80">restante:</span> ≈ {{ remaining }}</span>
        </div>
      </div>

      <NuxtLink :to="`/curso/${course.slug}`" class="bt-btn-primary bt-btn-lg group/cta shrink-0 font-oswald uppercase tracking-wider md:self-end">
        Continuar curso
        <Icon name="lucide:arrow-right" class="size-4 transition-transform duration-base group-hover/cta:translate-x-1 motion-reduce:transition-none" />
      </NuxtLink>
    </div>
  </section>
</template>
