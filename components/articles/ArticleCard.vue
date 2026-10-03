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
    class="bt-card bt-card-interactive group flex h-full w-full flex-col"
  >
    <CourseThumb :src="article.image_thumb_service" :alt="article.title" :code="article.category?.name?.slice(0, 2).toUpperCase()" brand>
      <span v-if="article.category?.name" class="bt-overlay-chip absolute left-3 top-3 max-w-[70%] truncate font-mono">
        {{ article.category.name }}
      </span>
      <span v-if="isNew" class="bt-overlay-chip absolute right-3 top-3 font-mono uppercase tracking-wider text-primary-text">
        Nuevo
      </span>
    </CourseThumb>

    <div class="flex flex-1 flex-col p-4">
      <h3 class="line-clamp-2 min-h-[3.1rem] font-oswald text-xl font-medium leading-[1.25] text-foreground">
        {{ article.title }}
      </h3>

      <div v-if="article.user?.name" class="mt-3 flex items-center gap-2.5">
        <TeacherAvatar :src="article.user.avatar_url" :name="article.user.name" />
        <span class="min-w-0 flex-1 truncate text-sm text-foreground-secondary">{{ article.user.name }}</span>
      </div>

      <p v-if="article.short" class="t-small mt-3 line-clamp-3">
        {{ article.short }}
      </p>

      <div class="h-4 shrink-0" />
      <div class="mt-auto flex items-center justify-between gap-3 border-t border-subtle pt-3.5">
        <div class="t-meta flex min-w-0 items-center gap-3">
          <span v-if="dateLabel" class="inline-flex items-center gap-1.5">
            <Icon name="lucide:calendar" class="size-3.5" />
            {{ dateLabel }}
          </span>
          <span v-if="article.likes_count" class="inline-flex items-center gap-1.5" title="Me gusta">
            <Icon name="lucide:heart" class="size-3.5" />
            {{ article.likes_count }}
          </span>
        </div>
        <span class="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-foreground-secondary transition-colors duration-fast group-hover:text-primary-text">
          Leer
          <Icon name="lucide:arrow-right" class="size-3.5 transition-transform duration-base group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
