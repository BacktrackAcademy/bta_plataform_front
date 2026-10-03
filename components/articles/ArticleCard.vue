<script setup lang="ts">
import CourseThumb from '~/components/dashboard/CourseThumb.vue'
import TeacherAvatar from '~/components/courses/TeacherAvatar.vue'

// Single article widget (dashboard + /articulos). Same visual language as CourseCard; optional fields are hidden when absent.
const props = defineProps<{
  article: {
    title: string
    slug: string
    image_thumb_service?: string | null
    short?: string
    published_at?: string | Date
    likes_count?: number
    category?: { name: string } | null
    user?: { name?: string, avatar_url?: string | null } | null
  }
}>()

const NEW_WINDOW_MS = 14 * 24 * 60 * 60 * 1000
const { onPointerMove } = useSpotlight()

const published = computed(() => {
  const t = props.article.published_at ? new Date(props.article.published_at) : null
  return t && !Number.isNaN(t.getTime()) ? t : null
})
const isNew = computed(() => !!published.value && Date.now() - published.value.getTime() < NEW_WINDOW_MS)
const dateLabel = computed(() => published.value?.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '') ?? '')
</script>

<template>
  <NuxtLink
    :to="`/articulos/${article.slug}`"
    class="bt-surface bt-focus group relative flex h-full w-full flex-col overflow-hidden !rounded-2xl !border-transparent shadow-[0_10px_25px_-8px_rgba(0,0,0,0.7)] ring-1 ring-inset ring-transparent transition-all duration-300 ease-out hover:bg-bta-elevated hover:shadow-[0_18px_40px_-22px_rgba(236,16,117,0.3)] hover:ring-white/[0.08] motion-safe:hover:-translate-y-0.5"
    @pointermove="onPointerMove"
  >
    <span
      class="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      style="background: radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(236, 16, 117, 0.09), transparent 70%)"
      aria-hidden="true"
    />
    <CourseThumb :src="article.image_thumb_service" :alt="article.title" :code="article.category?.name?.slice(0, 2).toUpperCase()" brand>
      <span
        v-if="article.category?.name"
        class="absolute left-3 top-3 max-w-[70%] truncate bg-bta-pink px-3 py-1.5 font-inconsolata text-sm text-white"
      >
        {{ article.category.name }}
      </span>
      <span
        v-if="isNew"
        class="absolute right-3 top-3 border border-bta-pink/60 bg-black/60 px-2 py-1 font-inconsolata text-xs uppercase tracking-wider text-bta-pink backdrop-blur"
      >
        Nuevo
      </span>
    </CourseThumb>

    <div class="flex flex-1 flex-col p-4">
      <h3 class="line-clamp-2 min-h-[3.4rem] font-oswald text-2xl font-semibold leading-[1.15] text-white">
        {{ article.title }}
      </h3>

      <div v-if="article.user?.name" class="mt-3 flex items-center gap-2.5">
        <TeacherAvatar :src="article.user.avatar_url" :name="article.user.name" />
        <span class="min-w-0 flex-1 truncate font-inconsolata text-sm text-white">{{ article.user.name }}</span>
      </div>

      <div class="mt-3 h-0.5 w-8 bg-bta-pink transition-all duration-300 group-hover:w-12" />

      <p v-if="article.short" class="mt-3 line-clamp-3 font-inconsolata text-sm leading-relaxed text-[#6B6F9A]">
        {{ article.short }}
      </p>

      <div class="h-5 shrink-0" />
      <div class="mt-auto flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4 font-inconsolata text-sm">
        <div class="flex min-w-0 items-center gap-3 text-gray-muted">
          <span v-if="dateLabel" class="inline-flex items-center gap-1.5">
            <Icon name="lucide:calendar" class="size-3.5" />
            {{ dateLabel }}
          </span>
          <span v-if="article.likes_count" class="inline-flex items-center gap-1.5" title="Me gusta">
            <Icon name="lucide:heart" class="size-3.5" />
            {{ article.likes_count }}
          </span>
        </div>
        <span class="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-bta-pink/50 px-2.5 py-0.5 font-semibold text-bta-pink transition-colors duration-300 group-hover:border-bta-pink/80 group-hover:bg-bta-pink/10">
          Leer
          <Icon name="lucide:arrow-right" class="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
