<script setup lang="ts">
import type { Datum } from '@/interfaces/discussion.response'

defineProps<{ discussion: Datum }>()
const { timeAgo } = useFormatter()
</script>

<template>
  <article class="bt-card bt-card-interactive max-w-3xl p-6 sm:p-8">
    <!-- Header -->
    <header class="mb-4 flex items-center">
      <picture class="mr-3 size-11 shrink-0 overflow-hidden rounded-full ring-1 ring-primary/40">
        <img
          class="size-full object-cover"
          src="https://djo7sloxtuec0.cloudfront.net/assets/avatar-50-0786e8de7062852709e518d8a1d88272d584f121d70a493ea2a4857c60914f31.png"
          alt="user image"
        >
      </picture>
      <div class="flex flex-col">
        <p class="text-[15px] text-foreground">
          {{ discussion.user.name }} {{ discussion.user.lastname }}
          <span class="ml-1 text-sm text-foreground-muted">realizó una pregunta</span>
        </p>
        <time class="t-meta mt-0.5" :datetime="discussion.created_at">
          {{ timeAgo(discussion.created_at) }}
        </time>
      </div>
    </header>
    <!-- body -->
    <h2 class="t-h2 mb-4 !text-[1.65rem]">
      <NuxtLink class="bt-focus rounded-sm transition-colors duration-fast hover:text-primary-text" :to="`/debates/${discussion.slug}`">
        {{ discussion.title }}
      </NuxtLink>
    </h2>
    <div class="t-body prose-sm max-w-none" v-html="discussion.body" />
    <!-- footer -->
    <footer class="mt-6 border-t border-subtle pt-4">
      <NuxtLink
        class="bt-focus inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-foreground-secondary transition-colors duration-fast hover:text-primary-text"
        :to="`/debates/${discussion.slug}`"
      >
        <span>Ver todos los comentarios</span>
        <Icon name="lucide:chevron-right" class="size-4" />
      </NuxtLink>
    </footer>
  </article>
</template>
