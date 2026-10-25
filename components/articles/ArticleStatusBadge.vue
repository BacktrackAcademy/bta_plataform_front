<script setup lang="ts">
import type { ArticleStatus } from '@/interfaces/article-management'
import { ARTICLE_STATUS_LABEL } from '@/interfaces/article-management'

const props = defineProps<{ status: ArticleStatus }>()

const variant: Record<ArticleStatus, string> = {
  draft: 'bt-badge',
  in_review: 'bt-badge-warning',
  changes_requested: 'bt-badge-danger',
  published: 'bt-badge-success',
}
</script>

<template>
  <span :class="variant[props.status]">{{ ARTICLE_STATUS_LABEL[props.status] }}</span>
</template>
