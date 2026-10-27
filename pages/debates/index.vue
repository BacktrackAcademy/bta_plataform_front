<script setup lang="ts">
import type { DiscussionResponse } from '@/interfaces/discussion.response'
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
import FilterPanel from '~/components/common/FilterPanel.vue'
import PageHeader from '~/components/common/PageHeader.vue'
import MultiSelect from '~/components/MultiSelect.vue'

definePageMeta({
  layout: 'custom',
  auth: true,
})

const currentPage = ref(1)
const itemsPerPage = ref(4)

// Usar la paginación del servidor
// Filtros que soporta el modelo/API de debates: texto (título), categoría, tipo y estado (resuelto).
const searchQuery = ref('')
const debouncedQuery = refDebounced(searchQuery, 350)
const categorySelected = ref<string[]>([])
const kind = ref<string>('')
const resolved = ref<'' | 'true' | 'false'>('')
const activeFilterCount = computed(() => categorySelected.value.length + (kind.value ? 1 : 0) + (resolved.value ? 1 : 0) + (debouncedQuery.value ? 1 : 0))
const hasFilters = computed(() => activeFilterCount.value > 0)

const { data: filters } = useAPI<{ categories: { id: number, name: string }[] }>('/discussions/filters', { lazy: true, server: false })
const categoryOptions = computed(() => (filters.value?.categories ?? []).map(c => ({ value: String(c.id), label: c.name })))

const { data: discussions, status } = useAPI<DiscussionResponse>('/discussions', {
  params: computed(() => ({
    'page': currentPage.value,
    'per_page': itemsPerPage.value,
    'q': debouncedQuery.value || undefined,
    'kind': kind.value || undefined,
    'resolved': resolved.value || undefined,
    'category_ids[]': categorySelected.value,
  })),
})
watch([debouncedQuery, categorySelected, kind, resolved], () => {
  currentPage.value = 1
})
function clearFilters() {
  searchQuery.value = ''
  categorySelected.value = []
  kind.value = ''
  resolved.value = ''
}

// Obtener el total de páginas y elementos de la respuesta del servidor
const totalItems = computed(() => discussions.value?.total_items)

useSeoMeta({
  title: 'Debates',
  description: 'Preguntas y respuestas',
  ogTitle: 'Debates',
  ogDescription: 'Preguntas y respuestas',
  ogImage: '/og-image.png',
  ogUrl: 'https://backtrackacademy.com',
  twitterTitle: 'Debates',
  twitterDescription: 'Preguntas y respuestas',
  twitterImage: '/og-image.png',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div class="mx-auto w-full max-w-[1200px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <PageHeader title="Debates" class="mb-6">
      <span class="font-mono"><span class="text-primary-text">$</span> ls debates/</span>
      <span v-if="totalItems !== undefined" class="font-mono text-foreground-secondary"> → {{ totalItems }} {{ totalItems === 1 ? 'debate' : 'debates' }}{{ hasFilters ? ' encontrados' : '' }}</span>
      <template #actions>
        <NuxtLink to="/debates/crear" class="bt-btn-primary">
          <Icon name="lucide:plus" class="size-4" /> Crear debate
        </NuxtLink>
      </template>
    </PageHeader>

    <FilterPanel v-model="searchQuery" placeholder="Buscar debates…" :columns="2" :active-count="activeFilterCount" @clear="clearFilters">
      <template #selects>
        <MultiSelect
          class-name="!min-h-11"
          :options="categoryOptions"
          :selected="categorySelected"
          placeholder="Categorías"
          search-placeholder="Buscar categorías..."
          @change="categorySelected = $event"
        />
      </template>
      <template #chips>
        <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por tipo">
          <span class="t-eyebrow mr-1 !text-[11px]">Tipo</span>
          <button v-for="k in DISCUSSION_KINDS" :key="k.value" type="button" class="bt-chip bg-surface-2" :aria-pressed="kind === k.value" @click="kind = kind === k.value ? '' : k.value">
            {{ k.label }}
          </button>
        </div>
        <div class="flex flex-wrap items-center gap-2 sm:ml-4" role="group" aria-label="Filtrar por estado">
          <span class="t-eyebrow mr-1 !text-[11px]">Estado</span>
          <button type="button" class="bt-chip bg-surface-2" :aria-pressed="resolved === 'false'" @click="resolved = resolved === 'false' ? '' : 'false'">
            Sin resolver
          </button>
          <button type="button" class="bt-chip bg-surface-2" :aria-pressed="resolved === 'true'" @click="resolved = resolved === 'true' ? '' : 'true'">
            Resueltos
          </button>
        </div>
      </template>
    </FilterPanel>

    <div v-if="status === 'pending'" class="mt-8 grid gap-6 lg:grid-cols-2" aria-busy="true">
      <div v-for="n in 3" :key="n" class="bt-surface space-y-4 p-6">
        <div class="flex items-center gap-3">
          <Skeleton class="size-11 rounded-full" />
          <Skeleton class="h-4 w-48" />
        </div>
        <Skeleton class="h-6 w-3/4" />
        <Skeleton class="h-16 w-full" />
      </div>
    </div>

    <template v-else>
      <!-- Lista de debates -->
      <div class="mt-8 grid gap-6 lg:grid-cols-2">
        <CardDebate
          v-for="discussion in discussions?.data"
          :key="discussion.id"
          :discussion="discussion"
        />
      </div>

      <div v-if="!discussions?.data?.length" class="grid place-items-center py-16">
        <div class="max-w-md rounded-lg border border-subtle bg-surface-1 p-6 font-mono text-sm">
          <p class="text-foreground">
            <span class="text-primary-text">$</span> grep -ri "{{ debouncedQuery || 'filtros' }}" debates/
          </p>
          <p class="mt-2 text-foreground-muted">
            {{ hasFilters ? '0 resultados. Prueba con otros términos o quita algún filtro.' : 'Aún no hay debates aquí. ¡Empieza el primero!' }}
          </p>
          <button v-if="hasFilters" type="button" class="bt-focus mt-4 rounded-sm text-primary-text hover:underline" @click="clearFilters">
            &gt; limpiar filtros
          </button>
        </div>
      </div>

      <!-- Paginación -->
      <div class="mt-8 flex justify-center">
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
