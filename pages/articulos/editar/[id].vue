<script setup lang="ts">
import type { ManagedArticle } from '@/interfaces/articles.response'
import { Skeleton } from '@/components/ui/skeleton'
import ArticleForm from '~/components/articles/ArticleForm.vue'
import PageHeader from '~/components/common/PageHeader.vue'

definePageMeta({ layout: 'custom', auth: true })
useSeoMeta({ title: 'Editar artículo', robots: 'noindex' })

const route = useRoute()
const { data: me } = useAPI<{ role: string }>('/user/info', { lazy: true, server: false })
const isAdmin = computed(() => me.value?.role === 'admin')
const { data: article, status, error } = useAPI<ManagedArticle & { description: string }>(
  `/admin/articles/${route.params.id}`,
  { lazy: true, server: false },
)
</script>

<template>
  <div class="mx-auto w-full max-w-[1200px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <PageHeader title="Editar artículo">
      Los cambios en un borrador no son visibles para la comunidad hasta que se publique.
    </PageHeader>
    <div v-if="status === 'pending' || !me" class="mt-8 space-y-4">
      <Skeleton class="h-10 w-full" />
      <Skeleton class="h-24 w-full" />
      <Skeleton class="h-64 w-full" />
    </div>
    <p v-else-if="error" class="bt-surface mt-8 p-4 text-sm text-danger" role="alert">
      {{ error.data?.error ?? 'No pudimos cargar el artículo.' }}
    </p>
    <ArticleForm v-else-if="article" :article="article" :is-admin="isAdmin" />
  </div>
</template>
