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
  <article class="bt-card bt-card-interactive group flex flex-col">
    <CourseThumb :src="course.image_thumb" :alt="course.titulo" brand>
      <p
        class="bt-overlay-chip absolute left-3 top-3 font-mono uppercase tracking-wider"
        :class="status === 'in_progress' || status === 'certified' ? 'text-primary-text' : 'text-foreground-muted'"
      >
        <Icon :name="label.icon" class="size-3" aria-hidden="true" />
        {{ label.text }}
      </p>
    </CourseThumb>

    <div class="flex flex-1 flex-col p-4">
      <h3 class="line-clamp-2 font-oswald text-lg font-medium leading-snug text-foreground">
        <NuxtLink :to="`/curso/${course.slug}`" class="bt-focus rounded-sm after:absolute after:inset-0">
          {{ course.titulo }}
        </NuxtLink>
      </h3>

      <div class="mt-auto pt-4">
        <div v-if="status === 'certified'" class="t-meta flex items-center justify-between gap-3 !text-xs">
          <span class="truncate">{{ certId ?? `${course.number_videos} lecciones` }}</span>
          <a
            v-if="certUrl"
            :href="certUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="bt-btn-secondary relative z-10 h-8 px-3 text-xs"
            :aria-label="`Descargar certificado de ${course.titulo}`"
          >
            <Icon name="lucide:download" class="size-3.5" aria-hidden="true" />
            Certificado
          </a>
        </div>
        <template v-else>
          <ProgressBar :value="percent" :label="`Progreso en ${course.titulo}`" />
          <p class="t-meta mt-2 flex items-center justify-between !text-xs">
            <span v-if="course.number_videos">{{ course.count_video ?? 0 }} / {{ course.number_videos }} lecciones</span>
            <span class="text-foreground-secondary">{{ percent }}%</span>
          </p>
        </template>
      </div>
    </div>
  </article>
</template>
