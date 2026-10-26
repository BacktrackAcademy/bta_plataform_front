<script setup lang="ts">
import ArticleForm from '~/components/articles/ArticleForm.vue'
import PageHeader from '~/components/common/PageHeader.vue'

definePageMeta({ layout: 'custom', auth: true })
useSeoMeta({ title: 'Nuevo artículo', robots: 'noindex' })

const { data: me } = useAPI<{ role: string }>('/user/info', { lazy: true, server: false })
const isAdmin = computed(() => me.value?.role === 'admin')
</script>

<template>
  <div class="mx-auto w-full max-w-[1200px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <PageHeader title="Nuevo artículo">
      Comparte noticias, novedades y tips de ciberseguridad con la comunidad.
    </PageHeader>
    <ArticleForm :is-admin="isAdmin" />
  </div>
</template>
