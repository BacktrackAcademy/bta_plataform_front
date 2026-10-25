<script setup lang="ts">
import type { ArticleStatus, ManagedArticleList } from '@/interfaces/article-management'
import { ARTICLE_STATUS_LABEL } from '@/interfaces/article-management'
import ArticleStatusBadge from '~/components/articles/ArticleStatusBadge.vue'
import PageHeader from '~/components/common/PageHeader.vue'
import StateCard from '~/components/common/StateCard.vue'

definePageMeta({ layout: 'custom', auth: true, middleware: ['admin'] })
useSeoMeta({ title: 'Revisar artículos', robots: 'noindex' })

const status = ref<ArticleStatus>('in_review')
const q = ref('')
const search = refDebounced(q, 300)
const page = ref(1)

const { data: list, status: loading, error } = useAPI<ManagedArticleList>('/admin/articles', {
  query: computed(() => ({ status: status.value, q: search.value.trim() || undefined, page: page.value, per_page: 20 })),
  server: false,
  lazy: true,
})

watch([status, search], () => (page.value = 1))

const order: ArticleStatus[] = ['in_review', 'changes_requested', 'draft', 'published']
const date = (d: string | null) => d ? new Date(d).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
</script>

<template>
  <div class="mx-auto w-full max-w-[1100px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <PageHeader title="Revisar artículos">
      Los artículos enviados por los autores esperan aquí. Solo tú puedes publicarlos.
    </PageHeader>

    <div class="mt-6 flex flex-wrap items-center gap-2">
      <div class="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
        <button v-for="s in order" :key="s" type="button" class="bt-chip" :aria-pressed="status === s" @click="status = s">
          {{ ARTICLE_STATUS_LABEL[s] }}
          <span v-if="list?.counts" class="ml-1 font-mono text-foreground-subtle">{{ list.counts[s] }}</span>
        </button>
      </div>
      <input v-model="q" type="search" class="bt-input ml-auto max-w-64" placeholder="Buscar por título" aria-label="Buscar por título">
    </div>

    <StateCard v-if="error" class="mt-6" variant="error" title="No pudimos cargar la lista" text="Inténtalo de nuevo en unos minutos." />
    <p v-else-if="loading === 'pending' && !list" class="t-small mt-8">
      Cargando…
    </p>
    <StateCard v-else-if="!list?.data.length" class="mt-6" :title="status === 'in_review' ? 'No hay artículos esperando revisión' : 'No hay artículos en este estado'" />

    <ul v-else class="mt-6 space-y-3">
      <li v-for="a in list.data" :key="a.id">
        <NuxtLink :to="`/admin/articulos/${a.id}`" class="bt-card bt-card-interactive flex items-center gap-4 p-3">
          <div class="aspect-[2/1] w-28 shrink-0 overflow-hidden rounded bg-surface-3">
            <img v-if="a.cover_thumb_url" :src="a.cover_thumb_url" alt="" class="size-full object-cover" loading="lazy">
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate font-oswald text-lg text-foreground">
              {{ a.title }}
            </p>
            <p class="t-small mt-1 truncate font-mono">
              {{ a.author?.name ?? 'Sin autor' }} · {{ a.category?.name ?? 'Sin categoría' }} · {{ a.status === 'published' ? `publicado ${date(a.published_at)}` : `enviado ${date(a.submitted_at ?? a.updated_at)}` }}
            </p>
          </div>
          <ArticleStatusBadge :status="a.status" class="shrink-0" />
        </NuxtLink>
      </li>
    </ul>

    <div v-if="list && list.total_pages > 1" class="mt-6 flex items-center justify-center gap-3">
      <button type="button" class="bt-btn-ghost" :disabled="page <= 1" @click="page--">
        Anterior
      </button>
      <span class="t-small font-mono">{{ page }} / {{ list.total_pages }}</span>
      <button type="button" class="bt-btn-ghost" :disabled="page >= list.total_pages" @click="page++">
        Siguiente
      </button>
    </div>
  </div>
</template>
