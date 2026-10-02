<script setup lang="ts">
import type { DashboardCourse } from '~/interfaces/dashboard'
import CourseThumb from '~/components/dashboard/CourseThumb.vue'
import ProgressBar from '~/components/dashboard/ProgressBar.vue'

const props = defineProps<{ course: DashboardCourse }>()

const hasProgress = computed(() => typeof props.course.percent === 'number')
const percent = computed(() => Math.min(100, Math.max(0, Math.round(props.course.percent ?? 0))))
const author = computed(() => [props.course.teacher?.name, props.course.teacher?.lastname].filter(Boolean).join(' '))
</script>

<template>
  <NuxtLink
    :to="`/curso/${course.slug}`"
    class="bt-surface bt-surface-hover bt-focus group flex h-full flex-col overflow-hidden"
  >
    <CourseThumb :src="course.image_thumb" :alt="course.titulo" />
    <div class="flex flex-1 flex-col p-4">
      <p v-if="course.path || course.level_name" class="bt-eyebrow truncate !text-xs">
        {{ course.path || course.level_name }}
      </p>
      <h3 class="mt-1.5 line-clamp-2 min-h-[3.1rem] font-oswald text-lg font-medium leading-snug text-white">
        {{ course.titulo }}
      </h3>
      <p v-if="author" class="mt-1 truncate text-xs text-bta-text-2">
        {{ author }}
      </p>

      <div v-if="hasProgress" class="mt-4 flex items-center gap-3">
        <ProgressBar :value="percent" :label="`Progreso en ${course.titulo}`" />
        <span class="text-xs tabular-nums text-white/80">{{ percent }}%</span>
      </div>

      <span class="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-medium text-white/80 transition-colors group-hover:text-bta-pink">
        Continuar
        <Icon name="lucide:arrow-right" class="size-3.5 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
      </span>
    </div>
  </NuxtLink>
</template>
