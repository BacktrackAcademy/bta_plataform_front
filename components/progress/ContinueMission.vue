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
  <section class="bt-surface relative overflow-hidden border-l-2 !border-l-bta-pink p-5 sm:p-6" aria-labelledby="continue-title">
    <div class="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-8">
      <div class="min-w-0 flex-1">
        <p class="font-inconsolata text-xs uppercase tracking-[0.18em] text-bta-pink">
          <span aria-hidden="true">&gt; </span>Continuar misión
        </p>
        <h2 id="continue-title" class="mt-2 font-oswald text-2xl font-semibold leading-tight text-white sm:text-3xl">
          {{ course.titulo }}
        </h2>
        <p v-if="lastLesson" class="mt-1.5 font-inconsolata text-sm text-bta-pink">
          {{ lastLesson }}
        </p>

        <div class="mt-5 max-w-xl">
          <div class="mb-2 flex items-baseline justify-between gap-3 font-inconsolata text-sm text-gray-muted">
            <span v-if="course.number_videos">
              <span class="text-white">{{ course.count_video ?? 0 }}</span> / {{ course.number_videos }} lecciones
            </span>
            <span class="font-oswald text-xl font-semibold leading-none text-white">
              {{ percent }}<span class="text-sm text-bta-pink">%</span>
            </span>
          </div>
          <ProgressBar :value="percent" size="md" :label="`Progreso en ${course.titulo}`" />
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-inconsolata text-xs text-gray-muted">
          <span class="inline-flex items-center gap-2">
            <TeacherAvatar v-if="author" :src="course.teacher?.avatar_url" :name="author" class="!size-5" />
            <span v-if="author" class="text-white/80">{{ author }}</span>
          </span>
          <span v-if="remaining"><span class="text-bta-pink/80">restante:</span> ≈ {{ remaining }}</span>
        </div>
      </div>

      <NuxtLink
        :to="`/curso/${course.slug}`"
        class="bt-focus group/cta inline-flex h-11 shrink-0 items-center justify-center gap-2.5 bg-bta-pink px-6 font-oswald text-base uppercase tracking-wider text-white transition-all duration-200 hover:bg-bta-pink/90 md:self-end"
      >
        Continuar curso
        <Icon name="lucide:arrow-right" class="size-4 transition-transform duration-200 group-hover/cta:translate-x-1 motion-reduce:transition-none" />
      </NuxtLink>
    </div>
  </section>
</template>
