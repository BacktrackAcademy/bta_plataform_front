<script setup lang="ts">
import type { LatestCourse } from '~/interfaces/dashboard'
import CourseThumb from '~/components/dashboard/CourseThumb.vue'

const props = defineProps<{ course: LatestCourse }>()

const author = computed(() => [props.course.teacher?.name, props.course.teacher?.lastname].filter(Boolean).join(' '))
const price = computed(() => (props.course.price ? `$ ${props.course.price}` : 'Gratis'))
</script>

<template>
  <NuxtLink
    :to="`/curso/${course.slug}`"
    class="bt-surface bt-surface-hover bt-focus group flex h-full flex-col overflow-hidden"
  >
    <CourseThumb :src="course.image_thumb" :alt="course.titulo">
      <span
        v-if="course.level_name"
        class="absolute right-3 top-3 rounded-md border border-white/15 bg-bta-bg/75 px-2 py-0.5 text-xs font-medium text-white backdrop-blur"
      >
        {{ course.level_name }}
      </span>
    </CourseThumb>
    <div class="flex flex-1 flex-col p-4">
      <h3 class="line-clamp-2 min-h-[3.1rem] font-oswald text-lg font-medium leading-snug text-white">
        {{ course.titulo }}
      </h3>
      <p v-if="author" class="mt-1 truncate text-xs text-bta-text-2">
        {{ author }}
      </p>
      <div class="mt-auto flex items-center justify-between pt-4 text-xs">
        <span v-if="course.number_videos" class="inline-flex items-center gap-1.5 text-bta-text-2">
          <Icon name="lucide:play-circle" class="size-3.5" />
          {{ course.number_videos }} lecciones
        </span>
        <span v-else />
        <span class="rounded-md bg-bta-pink/10 px-2 py-0.5 text-sm font-semibold text-bta-pink">{{ price }}</span>
      </div>
    </div>
  </NuxtLink>
</template>
