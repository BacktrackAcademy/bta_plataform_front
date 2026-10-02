<script setup lang="ts">
import type { LatestArticle } from '~/interfaces/dashboard'
import CourseThumb from '~/components/dashboard/CourseThumb.vue'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'

defineProps<{ article: LatestArticle }>()
</script>

<template>
  <NuxtLink
    :to="`/articulos/${article.slug}`"
    class="bt-surface bt-surface-hover bt-focus group flex h-full flex-col overflow-hidden"
  >
    <CourseThumb :src="article.image_thumb_service" :alt="article.title" :code="article.category?.name?.slice(0, 2).toUpperCase()">
      <span
        v-if="article.category?.name"
        class="absolute left-3 top-3 rounded-md border border-white/15 bg-bta-bg/75 px-2 py-0.5 text-xs font-medium text-white backdrop-blur"
      >
        {{ article.category.name }}
      </span>
    </CourseThumb>
    <div class="flex flex-1 flex-col p-4">
      <h3 class="line-clamp-3 font-oswald text-lg font-medium leading-snug text-white">
        {{ article.title }}
      </h3>
      <div class="mt-auto flex items-center justify-between gap-3 pt-4">
        <span v-if="article.user" class="flex min-w-0 items-center gap-2 text-xs text-bta-text-2">
          <Avatar class="size-5">
            <AvatarImage v-if="article.user.avatar_url" :src="article.user.avatar_url" alt="" />
            <AvatarFallback class="bg-bta-elevated text-[10px] text-white">
              {{ article.user.name?.[0]?.toUpperCase() }}
            </AvatarFallback>
          </Avatar>
          <span class="truncate">{{ article.user.name }}</span>
        </span>
        <span v-else />
        <span class="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-white/80 transition-colors group-hover:text-bta-pink">
          Leer
          <Icon name="lucide:arrow-right" class="size-3.5 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
