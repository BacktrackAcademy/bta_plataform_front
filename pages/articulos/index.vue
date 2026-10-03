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
import ArticleCard from '~/components/articles/ArticleCard.vue'

definePageMeta({
  layout: 'custom',
  auth: true,
})

const currentPage = ref(1)
const itemsPerPage = ref(6)

// Usar la paginación del servidor
const { data: articles, status } = useAPI<ArticlesResponse>('/articles', {
  query: computed(() => ({
    page: currentPage.value,
    per_page: itemsPerPage.value,
  })),
  lazy: true,
})

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
  <div class="w-full py-8 px-16">
    <div class="lg:h-full">
      <h1 class="text-white text-3xl font-oswald mb-5 uppercase font-semibold">
        Noticias sobre seguridad
      </h1>
      <div v-if="status === 'pending'" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 py-5">
        <Skeleton v-for="i in 6" :key="i" class="h-[390px] w-full bg-bta-dark-blue" />
      </div>

      <template v-else>
        <div class="flex">
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 py-5">
            <ArticleCard v-for="article in articles?.data" :key="article.id" :article="article" />
          </div>
          <div class="h-[200px]" />
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
                    class="w-10 h-10 p-0"
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
  </div>
</template>
