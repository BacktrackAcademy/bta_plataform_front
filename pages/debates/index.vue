<script setup lang="ts">
import type { DiscussionResponse } from '@/interfaces/discussion.response'
import { Button } from '@/components/ui/button'
import PageHeader from '~/components/common/PageHeader.vue'
import { Skeleton } from '@/components/ui/skeleton'
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

definePageMeta({
  layout: 'custom',
  auth: true,
})

const currentPage = ref(1)
const itemsPerPage = ref(4)

// Usar la paginación del servidor
const { data: discussions, status } = useAPI<DiscussionResponse>('/discussions', {
  query: computed(() => ({
    page: currentPage.value,
    per_page: itemsPerPage.value,
  })),
})

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
  <div class="mx-auto w-full max-w-[900px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <PageHeader title="Debates">
      Explora y participa en las discusiones de la comunidad.
    </PageHeader>

    <div v-if="status === 'pending'" class="mt-8 space-y-4" aria-busy="true">
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
      <div class="mt-8 space-y-4">
        <CardDebate
          v-for="discussion in discussions?.data"
          :key="discussion.id"
          :discussion="discussion"
        />
      </div>

      <!-- Paginación -->
      <div class="mt-8 flex justify-center">
        <Pagination
          v-slot="{ page }"
          :total="totalItems"
          :per-page="itemsPerPage"
          :sibling-count="1"
          show-edges
          :default-page="currentPage"
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
