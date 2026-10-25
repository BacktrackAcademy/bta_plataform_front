<script setup lang="ts">
import type { ArticleStatus, ManagedArticleList } from '@/interfaces/article-management'
import { ARTICLE_STATUS_LABEL } from '@/interfaces/article-management'
import ArticleStatusBadge from '~/components/articles/ArticleStatusBadge.vue'
import PageHeader from '~/components/common/PageHeader.vue'
import StateCard from '~/components/common/StateCard.vue'

definePageMeta({ layout: 'custom', auth: true, middleware: ['author'] })
useSeoMeta({ title: 'Mis artículos', robots: 'noindex' })

const status = ref<ArticleStatus | ''>('')
const { data: list, status: loading, error } = useAPI<ManagedArticleList>('/my/articles', {
  query: computed(() => ({ status: status.value || undefined, per_page: 50 })),
  server: false,
  lazy: true,
})

const filters: { value: ArticleStatus | '', label: string }[] = [
  { value: '', label: 'Todos' },
  ...(['draft', 'in_review', 'changes_requested', 'published'] as ArticleStatus[]).map(value => ({ value, label: ARTICLE_STATUS_LABEL[value] })),
]

// Publicado se lee en el sitio; el resto se abre en el editor (que explica por qué no se puede editar).
function target(a: { id: number, slug: string, status: ArticleStatus }) {
  return a.status === 'published' ? `/articulos/${a.slug}` : `/articulos/editar/${a.id}`
}

const date = (d: string) => new Date(d).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
</script>

<template>
  <div class="mx-auto w-full max-w-[1000px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <PageHeader title="Mis artículos">
      Lo que escribes pasa por revisión del equipo antes de publicarse.
      <template #actions>
        <NuxtLink to="/articulos/crear" class="bt-btn-primary">
          <Icon name="lucide:plus" /> Escribir artículo
        </NuxtLink>
      </template>
    </PageHeader>

    <div class="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
      <button v-for="f in filters" :key="f.value" type="button" class="bt-chip" :aria-pressed="status === f.value" @click="status = f.value">
        {{ f.label }}
      </button>
    </div>

    <StateCard v-if="error" class="mt-6" variant="error" title="No pudimos cargar tus artículos" text="Inténtalo de nuevo en unos minutos." />
    <p v-else-if="loading === 'pending'" class="t-small mt-8">
      Cargando…
    </p>
    <StateCard v-else-if="!list?.data.length" class="mt-6" title="Todavía no hay artículos aquí" text="Empieza uno nuevo: se guarda solo como borrador.">
      <NuxtLink to="/articulos/crear" class="bt-btn-secondary">
        Escribir artículo
      </NuxtLink>
    </StateCard>

    <ul v-else class="mt-6 space-y-3">
      <li v-for="a in list.data" :key="a.id">
        <NuxtLink :to="target(a)" class="bt-card bt-card-interactive flex items-center gap-4 p-3">
          <div class="aspect-[2/1] w-28 shrink-0 overflow-hidden rounded bg-surface-3">
            <img v-if="a.cover_thumb_url" :src="a.cover_thumb_url" alt="" class="size-full object-cover" loading="lazy">
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate font-oswald text-lg text-foreground">
              {{ a.title }}
            </p>
            <p class="t-small mt-1 truncate font-mono">
              {{ a.category?.name ?? 'Sin categoría' }} · actualizado {{ date(a.updated_at) }}
            </p>
            <p v-if="a.status === 'changes_requested' && a.review_note" class="t-small mt-1 line-clamp-1 text-warning">
              {{ a.review_note }}
            </p>
          </div>
          <ArticleStatusBadge :status="a.status" class="shrink-0" />
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
