<script setup lang="ts">
import type { ArticlesResponse } from '@/interfaces/articles.response'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationEllipsis,
  PaginationFirst,
  PaginationLast,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
} from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { refDebounced } from '@vueuse/core'
import ArticleCard from '~/components/articles/ArticleCard.vue'
import FilterPanel from '~/components/common/FilterPanel.vue'
import PageHeader from '~/components/common/PageHeader.vue'
import MultiSelect from '~/components/MultiSelect.vue'

definePageMeta({
  layout: 'custom',
  auth: true,
})

// Gestión visible solo para admin y autores (blogger / content).
const { data: me } = useAPI<{ role: string }>('/user/info', { lazy: true, server: false })
const canManage = computed(() => ['admin', 'blogger', 'content'].includes(me.value?.role ?? ''))

const currentPage = ref(1)
const itemsPerPage = ref(6)

// Usar la paginación del servidor
// Filtros que soporta el modelo/API de artículos: texto (título y resumen), categoría y autor.
const searchQuery = ref('')
const debouncedQuery = refDebounced(searchQuery, 350)
const categorySelected = ref<string[]>([])
const authorSelected = ref<string[]>([])
const activeFilterCount = computed(() => categorySelected.value.length + authorSelected.value.length + (debouncedQuery.value ? 1 : 0))
const hasFilters = computed(() => activeFilterCount.value > 0)

// Solo se ofrecen categorías y autores que tienen artículos publicados.
const { data: filters } = useAPI<{ categories: { id: number, name: string }[], authors: { id: number, name: string }[] }>('/articles/filters', { lazy: true, server: false })
const categoryOptions = computed(() => (filters.value?.categories ?? []).map(c => ({ value: String(c.id), label: c.name })))
const authorOptions = computed(() => (filters.value?.authors ?? []).map(a => ({ value: String(a.id), label: a.name })))

const { data: articles, status } = useAPI<ArticlesResponse>('/articles', {
  params: computed(() => ({
    'page': currentPage.value,
    'per_page': itemsPerPage.value,
    'q': debouncedQuery.value || undefined,
    'category_ids[]': categorySelected.value,
    'user_ids[]': authorSelected.value,
  })),
  lazy: true,
})

watch([debouncedQuery, categorySelected, authorSelected], () => {
  currentPage.value = 1
})
function clearFilters() {
  searchQuery.value = ''
  categorySelected.value = []
  authorSelected.value = []
}

// Obtener el total de páginas y elementos de la respuesta del servidor
const totalItems = computed(() => articles.value?.total_items)

useSeoMeta({
  title: 'Noticias sobre seguridad',
  description: 'Noticias sobre seguridad, actualizaciones, novedades y tips de seguridad',
  ogTitle: 'Noticias sobre seguridad',
  ogDescription: 'Noticias sobre seguridad, actualizaciones, novedades y tips de seguridad',
  ogImage: 'og-image.png',
  ogUrl: 'https://www.bactrackacademy.com.ar/articulos',
  twitterTitle: 'Noticias sobre seguridad',
  twitterDescription: 'Noticias sobre seguridad, actualizaciones, novedades y tips de seguridad',
  twitterImage: 'og-image.png',
  twitterCard: 'summary',
})
</script>

<template>
  <div class="mx-auto w-full max-w-[1200px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <PageHeader title="Noticias sobre seguridad" class="mb-6">
      <span class="font-mono"><span class="text-primary-text">$</span> ls articulos/</span>
      <span v-if="totalItems !== undefined" class="font-mono text-foreground-secondary"> → {{ totalItems }} {{ totalItems === 1 ? 'artículo' : 'artículos' }}{{ hasFilters ? ' encontrados' : '' }}</span>
      <template v-if="canManage" #actions>
        <div class="flex gap-2">
          <NuxtLink to="/articulos/administrar" class="bt-btn-secondary">
            <Icon name="lucide:settings-2" class="size-4" />
            Administrar
          </NuxtLink>
          <NuxtLink to="/articulos/crear" class="bt-btn-primary">
            <Icon name="lucide:plus" class="size-4" />
            Nuevo artículo
          </NuxtLink>
        </div>
      </template>
    </PageHeader>

    <FilterPanel v-model="searchQuery" placeholder="Buscar artículos…" :active-count="activeFilterCount" @clear="clearFilters">
      <template #selects>
        <MultiSelect
          class-name="!min-h-11"
          :options="categoryOptions"
          :selected="categorySelected"
          placeholder="Categorías"
          search-placeholder="Buscar categorías..."
          @change="categorySelected = $event"
        />
        <MultiSelect
          class-name="!min-h-11"
          :options="authorOptions"
          :selected="authorSelected"
          placeholder="Autores"
          search-placeholder="Buscar autores..."
          @change="authorSelected = $event"
        />
      </template>
    </FilterPanel>

    <div v-if="status === 'pending'" class="grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 6" :key="i" class="bt-surface overflow-hidden">
        <Skeleton class="aspect-video w-full rounded-none" />
        <div class="space-y-3 p-4">
          <Skeleton class="h-6 w-4/5" />
          <Skeleton class="h-4 w-1/2" />
          <Skeleton class="h-10 w-full" />
        </div>
      </div>
    </div>

    <template v-else>
      <div v-if="!articles?.data?.length" class="grid place-items-center py-16">
        <div class="max-w-md rounded-lg border border-subtle bg-surface-1 p-6 font-mono text-sm">
          <p class="text-foreground">
            <span class="text-primary-text">$</span> grep -ri "{{ debouncedQuery || 'filtros' }}" articulos/
          </p>
          <p class="mt-2 text-foreground-muted">
            0 resultados. Prueba con otros términos o quita algún filtro.
          </p>
          <button v-if="hasFilters" type="button" class="bt-focus mt-4 rounded-sm text-primary-text hover:underline" @click="clearFilters">
            &gt; limpiar filtros
          </button>
        </div>
      </div>
      <div v-else class="grid gap-6 pb-8 sm:grid-cols-2 lg:grid-cols-3">
        <ArticleCard v-for="article in articles?.data" :key="article.id" :article="article" />
      </div>
      <!-- Paginación -->
      <div class="mt-4 flex justify-center">
        <Pagination
          v-slot="{ page }"
          :total="totalItems"
          :per-page="itemsPerPage"
          :sibling-count="1"
          show-edges
          :page="currentPage"
          @update:page="currentPage = $event"
        >
          <PaginationList v-slot="{ items }" class="flex items-center gap-1">
            <PaginationFirst />
            <PaginationPrev />

            <template v-for="(item, index) in items">
              <PaginationListItem
                v-if="item.type === 'page'"
                :key="index"
                :value="item.value"
                as-child
              >
                <Button
                  class="size-10 p-0 font-mono"
                  :variant="item.value === page ? 'default' : 'outline'"
                >
                  {{ item.value }}
                </Button>
              </PaginationListItem>
              <PaginationEllipsis
                v-else
                :key="item.type"
                :index="index"
              />
            </template>

            <PaginationNext />
            <PaginationLast />
          </PaginationList>
        </Pagination>
      </div>
    </template>
  </div>
</template>
