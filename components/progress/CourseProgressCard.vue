<script setup lang="ts">
import type { CourseStatus } from '~/composables/useCourseProgress'
import type { CourseProgress } from '~/interfaces/dashboard'
import CourseThumb from '~/components/dashboard/CourseThumb.vue'
import ProgressBar from '~/components/dashboard/ProgressBar.vue'

const props = defineProps<{ course: CourseProgress }>()
const { percentOf, statusOf, certificateUrl, certificateId } = useCourseProgress()

const percent = computed(() => percentOf(props.course))
const status = computed<CourseStatus>(() => statusOf(props.course))
const certUrl = computed(() => certificateUrl(props.course))
const certId = computed(() => certificateId(props.course))

// One quiet label per state (text + icon). Magenta only where there is progress or an achievement.
const LABEL: Record<CourseStatus, { text: string, icon: string }> = {
  certified: { text: 'Certificado', icon: 'lucide:award' },
  completed: { text: 'Examen pendiente', icon: 'lucide:clock' },
  in_progress: { text: 'En curso', icon: 'lucide:circle-dot' },
  not_started: { text: 'No iniciado', icon: 'lucide:circle' },
}
const label = computed(() => LABEL[status.value])
</script>

<template>
  <article class="course-card group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-bta-surface">
    <CourseThumb :src="course.image_thumb" :alt="course.titulo" brand>
      <p
        class="absolute left-3 top-3 inline-flex items-center gap-1.5 bg-black/60 px-2 py-1 font-inconsolata text-[11px] uppercase tracking-wider backdrop-blur"
        :class="status === 'in_progress' || status === 'certified' ? 'text-bta-pink' : 'text-white/70'"
      >
        <Icon :name="label.icon" class="size-3" aria-hidden="true" />
        {{ label.text }}
      </p>
    </CourseThumb>

    <div class="flex flex-1 flex-col p-4">
      <h3 class="line-clamp-2 font-oswald text-lg font-semibold leading-snug text-white">
        <NuxtLink :to="`/curso/${course.slug}`" class="bt-focus rounded after:absolute after:inset-0">
          {{ course.titulo }}
        </NuxtLink>
      </h3>

      <div class="mt-auto pt-4">
        <div v-if="status === 'certified'" class="flex items-center justify-between gap-3 font-inconsolata text-xs text-gray-muted">
          <span class="truncate">{{ certId ?? `${course.number_videos} lecciones` }}</span>
          <a
            v-if="certUrl"
            :href="certUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="bt-focus relative z-10 inline-flex h-8 items-center gap-1.5 border border-bta-pink/60 px-3 text-white transition-colors hover:bg-bta-pink"
            :aria-label="`Descargar certificado de ${course.titulo}`"
          >
            <Icon name="lucide:download" class="size-3.5" aria-hidden="true" />
            Certificado
          </a>
        </div>
        <template v-else>
          <ProgressBar :value="percent" :label="`Progreso en ${course.titulo}`" />
          <p class="mt-2 flex items-center justify-between font-inconsolata text-xs text-gray-muted">
            <span v-if="course.number_videos">{{ course.count_video ?? 0 }} / {{ course.number_videos }} lecciones</span>
            <span class="text-white/80">{{ percent }}%</span>
          </p>
        </template>
      </div>
    </div>
  </article>
</template>

<style scoped>
.course-card {
  transition: transform 0.2s ease, border-color 0.2s ease;
}
.course-card:hover,
.course-card:focus-within {
  transform: translateY(-1px);
  border-color: rgba(236, 16, 117, 0.28);
}
@media (prefers-reduced-motion: reduce) {
  .course-card {
    transition: none;
  }
  .course-card:hover,
  .course-card:focus-within {
    transform: none;
  }
}
</style>
