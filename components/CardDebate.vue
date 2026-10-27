<script setup lang="ts">
import type { Datum } from '@/interfaces/discussion.response'

const props = defineProps<{ discussion: Datum }>()
const { timeAgo } = useFormatter()

const initials = computed(() => {
  const { name, lastname, username } = props.discussion.user
  return `${name?.[0] ?? ''}${lastname?.[0] ?? ''}` || username?.[0] || '?'
})
</script>

<template>
  <article class="bt-card bt-card-interactive flex h-full flex-col p-6 sm:p-8">
    <header class="mb-4 flex items-center">
      <span
        class="mr-3 flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-sm font-semibold uppercase text-primary-text ring-1 ring-primary/40"
        aria-hidden="true"
      >
        {{ initials }}
      </span>
      <div class="flex min-w-0 flex-col">
        <p class="text-[15px] text-foreground">
          {{ discussion.user.name }} {{ discussion.user.lastname }}
          <span class="ml-1 text-sm text-foreground-muted">· {{ kindMeta(discussion.kind).label.toLowerCase() }}</span>
        </p>
        <time class="t-meta mt-0.5" :datetime="discussion.created_at">
          {{ timeAgo(discussion.created_at) }}
        </time>
      </div>
      <span v-if="discussion.resolved_at" class="ml-auto inline-flex items-center gap-1 font-mono text-xs text-success">
        <Icon name="lucide:check-circle-2" class="size-4" /> resuelto
      </span>
    </header>
    <h2 class="t-h2 mb-4 !text-[1.65rem]">
      <NuxtLink class="bt-focus rounded-sm transition-colors duration-fast hover:text-primary-text" :to="`/debates/${discussion.slug}`">
        {{ discussion.title }}
      </NuxtLink>
    </h2>
    <div class="t-body prose-sm mb-6 line-clamp-4 max-w-none" v-html="discussion.body_html" />
    <footer class="mt-auto flex items-center justify-between gap-4 border-t border-subtle pt-4">
      <NuxtLink
        class="bt-focus inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-foreground-secondary transition-colors duration-fast hover:text-primary-text"
        :to="`/debates/${discussion.slug}`"
      >
        <span>Ver debate</span>
        <Icon name="lucide:chevron-right" class="size-4" />
      </NuxtLink>
      <p class="flex items-center gap-4 font-mono text-xs text-foreground-muted">
        <span class="inline-flex items-center gap-1"><Icon name="lucide:message-square" class="size-4" />{{ discussion.answers_count || 0 }}</span>
        <span class="inline-flex items-center gap-1"><Icon name="lucide:thumbs-up" class="size-4" />{{ discussion.likes_count || 0 }}</span>
      </p>
    </footer>
  </article>
</template>
