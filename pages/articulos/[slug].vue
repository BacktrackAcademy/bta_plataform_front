<script setup lang="ts">
import type { Article } from '@/interfaces/articles.response'

// Obtener slug de la ruta
const route = useRoute('articulos-slug')
const { slug } = route.params

// Fetch del artículo
const { data: article, status, error } = useAPI<Article>(`/articles/${slug}`, {
  key: `article-${slug}`,
  server: true,
  lazy: false,
})

const imageProps = computed(() => ({
  width: 800,
  height: 400,
  format: 'webp',
  quality: 80,
  custom: true,
}))

useSeoMeta({
  title: () => article?.value?.title || 'Cargando artículo...',
  description: () => article?.value?.description || '',
  ogTitle: () => article?.value?.title || '',
  ogDescription: () => article?.value?.short || '',
  ogImage: () => article?.value?.image_thumb_service || '',
  ogUrl: () => `https://www.backtrackacademy.com/articulos/${slug}`,
  twitterTitle: () => article?.value?.title || '',
  twitterDescription: () => article?.value?.short || '',
  twitterImage: () => article?.value?.image_thumb_service || '',
  twitterCard: 'summary_large_image',
})

// Formateo de fecha
const formattedDate = computed(() => {
  if (!article?.value?.created_at)
    return ''
  return new Date(article.value.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const isoDate = computed(() => {
  if (!article?.value?.created_at)
    return ''
  return new Date(article.value.created_at).toISOString().split('T')[0]
})
</script>

<template>
  <section class="px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto py-16">
      <!-- Contenido principal -->
      <article v-if="status === 'success' && article" class="space-y-10 opacity-0 animate-fade-in">
        <header class="space-y-6">
          <figure class="relative aspect-[2/1] overflow-hidden rounded-lg border border-subtle">
            <NuxtImg
              :src="article.image_thumb_service"
              :alt="`Imagen principal de ${article.title}`"
              v-bind="imageProps"
              sizes="sm:100vw md:800px"
              loading="lazy"
              class="object-cover w-full h-full transition-opacity duration-500 ease-in-out"
            >
              <template #fallback>
                <div class="w-full h-full bg-surface-3 animate-pulse" />
              </template>
            </NuxtImg>
          </figure>

          <h1 class="t-h1 text-center !text-3xl md:!text-4xl lg:!text-5xl">
            {{ article.title }}
          </h1>

          <div class="flex items-center justify-center space-x-4 text-foreground-muted text-sm">
            <div class="flex items-center space-x-2">
              <span class="text-foreground-muted">Por</span>
              <span class="font-semibold text-foreground">{{ article.user.name || article.user.username }}</span>
            </div>
            <span class="text-foreground-subtle">•</span>
            <time :datetime="isoDate" class="font-mono text-foreground-muted">
              {{ formattedDate }}
            </time>
          </div>
        </header>

        <main class="prose prose-lg max-w-none dark:prose-invert">
          <div class="space-y-6" v-html="article.description" />
        </main>
      </article>

      <!-- Estado de carga -->
      <div v-else-if="status === 'pending'" class="min-h-[50vh] flex items-center justify-center opacity-0 animate-fade-in">
        <div class="text-foreground text-center space-y-6">
          <div class="mx-auto size-12 animate-spin rounded-full border-4 border-foreground/20 border-t-primary" />
          <p class="t-body">
            Cargando artículo...
          </p>
        </div>
      </div>

      <!-- Estado de error -->
      <div v-else-if="status === 'error'" class="min-h-[50vh] flex items-center justify-center">
        <div class="space-y-6 rounded-lg border border-danger/30 bg-danger/[0.06] p-8 text-center">
          <p class="font-oswald text-xl text-foreground">
            {{ error?.message || 'No se pudo cargar el artículo' }}
          </p>
          <NuxtLink
            to="/articulos"
            class="bt-btn-primary bt-btn-lg"
          >
            Volver a artículos
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Estilos para el contenido renderizado */
.prose :deep(img) {
  @apply h-auto max-w-full rounded-md border border-subtle;
}

.prose :deep(h2),
.prose :deep(h3),
.prose :deep(h4) {
  @apply font-oswald mt-10 mb-6 text-foreground;
}

.prose :deep(p) {
  @apply leading-relaxed text-foreground-secondary;
}

.prose :deep(blockquote) {
  @apply border-l-2 border-primary pl-4 italic text-foreground-secondary;
}

.prose :deep(ul),
.prose :deep(ol) {
  @apply pl-6 space-y-2;
}

.prose :deep(li) {
  @apply text-foreground-secondary;
}

/* Animación personalizada para fade-in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn var(--duration-slow) ease-out forwards;
}
</style>
