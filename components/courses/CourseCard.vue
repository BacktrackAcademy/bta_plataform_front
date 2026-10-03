<script setup lang="ts">
import CourseThumb from '~/components/dashboard/CourseThumb.vue'
import TeacherAvatar from '~/components/courses/TeacherAvatar.vue'
import ProgressBar from '~/components/dashboard/ProgressBar.vue'

// Single course widget used across the platform (dashboard, catalog…). Optional fields are hidden when absent.
const props = defineProps<{
  course: {
    titulo: string
    slug: string
    image_thumb?: string | null
    level_name?: string
    shortdes?: string
    pageviews?: number
    number_videos?: number
    price?: number | null
    created_at?: string
    total_duration_text?: string
    total_duration_seconds?: number
    /** When set, shows the user's progress in the course. */
    percent?: number
    teacher?: { name?: string, lastname?: string, avatar_url?: string } | null
  }
}>()

const LEVELS = ['Básicos', 'Intermedios', 'Avanzados', 'Experto']
const NEW_WINDOW_MS = 30 * 24 * 60 * 60 * 1000

const author = computed(() => [props.course.teacher?.name, props.course.teacher?.lastname].filter(Boolean).join(' '))
// Undefined price = not applicable (e.g. courses the user already owns): hide the pill instead of showing "Gratis".
const price = computed(() => (props.course.price === undefined ? '' : props.course.price ? `$ ${props.course.price}` : 'Gratis'))
const views = computed(() => (typeof props.course.pageviews === 'number' ? props.course.pageviews.toLocaleString('es-CL') : ''))
const levelRank = computed(() => LEVELS.findIndex(l => l.toLowerCase() === props.course.level_name?.toLowerCase()) + 1)
const isNew = computed(() => {
  const t = props.course.created_at ? Date.parse(props.course.created_at) : Number.NaN
  return !Number.isNaN(t) && Date.now() - t < NEW_WINDOW_MS
})
const duration = computed(() => formatCourseDuration(props.course))
// Hide the bar at 0%: an empty track is just noise.
const hasProgress = computed(() => typeof props.course.percent === 'number' && props.course.percent > 0)
const percent = computed(() => Math.min(100, Math.max(0, Math.round(props.course.percent ?? 0))))
</script>

<template>
  <NuxtLink
    :to="`/curso/${course.slug}`"
    class="bt-card bt-card-interactive group flex h-full w-full flex-col"
  >
    <CourseThumb :src="course.image_thumb" :alt="course.titulo" brand>
      <span v-if="course.level_name" class="bt-overlay-chip absolute right-3 top-3 font-mono">
        <span v-if="levelRank" class="flex items-end gap-px" aria-hidden="true">
          <span
            v-for="n in 4"
            :key="n"
            class="w-[3px] rounded-[1px]"
            :class="n <= levelRank ? 'bg-primary' : 'bg-on-scrim/30'"
            :style="{ height: `${n * 3 + 3}px` }"
          />
        </span>
        {{ course.level_name }}
      </span>
      <span v-if="isNew" class="bt-overlay-chip absolute left-3 top-3 font-mono uppercase tracking-wider text-on-scrim-primary">
        Nuevo
      </span>
      <span v-if="duration" class="bt-overlay-chip absolute bottom-3 left-3 font-mono">
        <Icon name="lucide:clock" class="size-3" />
        {{ duration }}
      </span>
    </CourseThumb>

    <div class="flex flex-1 flex-col p-4">
      <h3 class="line-clamp-2 min-h-[3.1rem] font-oswald text-xl font-medium leading-[1.25] tracking-[0.01em] text-foreground">
        {{ course.titulo }}
      </h3>

      <div v-if="author" class="mt-3 flex items-center gap-2.5">
        <TeacherAvatar :src="course.teacher?.avatar_url" :name="author" />
        <span class="min-w-0 flex-1 truncate text-sm text-foreground-secondary">{{ author }}</span>
      </div>

      <p v-if="course.shortdes" class="t-small mt-3 line-clamp-3">
        {{ course.shortdes }}
      </p>

      <div v-if="hasProgress" class="mt-4 flex items-center gap-3">
        <ProgressBar :value="percent" :label="`Progreso en ${course.titulo}`" />
        <span class="t-meta tabular-nums text-foreground-secondary">{{ percent }}%</span>
      </div>

      <div class="h-4 shrink-0" />
      <div class="mt-auto flex items-center justify-between gap-3 border-t border-subtle pt-3.5">
        <span v-if="hasProgress && !price" class="inline-flex items-center gap-1.5 text-sm font-medium text-foreground-secondary transition-colors duration-fast group-hover:text-primary-text">
          Continuar
          <Icon name="lucide:arrow-right" class="size-3.5 transition-transform duration-base group-hover:translate-x-1" />
        </span>
        <div class="t-meta flex min-w-0 items-center gap-3">
          <span v-if="views" class="inline-flex items-center gap-1.5" title="Visitas">
            <Icon name="lucide:eye" class="size-3.5" />
            {{ views }}
          </span>
          <span v-if="course.number_videos" class="inline-flex items-center gap-1.5">
            <Icon name="lucide:play-circle" class="size-3.5" />
            {{ course.number_videos }} lecciones
          </span>
        </div>
        <span v-if="price" class="bt-badge-primary bt-badge shrink-0 font-mono text-[13px] font-semibold">{{ price }}</span>
      </div>
    </div>
  </NuxtLink>
</template>
