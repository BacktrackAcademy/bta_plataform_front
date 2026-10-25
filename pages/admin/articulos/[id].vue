<script setup lang="ts">
import type { ManagedArticle } from '@/interfaces/article-management'
import ArticleEditor from '~/components/articles/ArticleEditor.vue'
import ArticleStatusBadge from '~/components/articles/ArticleStatusBadge.vue'
import PageHeader from '~/components/common/PageHeader.vue'
import StateCard from '~/components/common/StateCard.vue'

definePageMeta({ layout: 'custom', auth: true, middleware: ['admin'] })
useSeoMeta({ title: 'Revisar artículo', robots: 'noindex' })

const { $api } = useNuxtApp()
const id = useRoute().params.id as string

const { data: article, error: loadError } = useAPI<ManagedArticle>(`/admin/articles/${id}`, { server: false, key: `admin-article-${id}` })

const editor = ref<InstanceType<typeof ArticleEditor>>()
const tab = ref<'edit' | 'preview'>('edit')
const busy = ref(false)
const error = ref('')
const note = ref('')
const returning = ref(false)

// Guarda lo pendiente y recarga el artículo tal como quedó en el servidor.
async function sync() {
  if (!(await editor.value?.flush())) {
    error.value = 'No pudimos guardar los últimos cambios.'
    return false
  }
  article.value = await $api<ManagedArticle>(`/admin/articles/${id}`)
  return true
}

async function showPreview() {
  error.value = ''
  if (await sync())
    tab.value = 'preview'
}

async function act(path: string, body?: object) {
  busy.value = true
  error.value = ''
  try {
    if (!(await editor.value?.flush()) && tab.value === 'edit') {
      error.value = 'No pudimos guardar los últimos cambios.'
      return
    }
    article.value = await $api<ManagedArticle>(`/admin/articles/${id}${path}`, { method: 'POST', body })
    returning.value = false
    note.value = ''
    tab.value = 'edit'
  }
  catch (e: any) {
    error.value = e?.data?.error ?? 'No pudimos completar la acción. Inténtalo de nuevo.'
  }
  finally {
    busy.value = false
  }
}

// Publicar y despublicar piden una confirmación en línea antes de actuar.
const confirming = ref<'publish' | 'unpublish' | null>(null)

async function confirmed() {
  const path = confirming.value === 'publish' ? '/publish' : '/unpublish'
  confirming.value = null
  await act(path)
}

const date = (d: string | null) => d ? new Date(d).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
</script>

<template>
  <div class="mx-auto w-full max-w-[900px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <StateCard v-if="loadError" variant="error" title="No encontramos este artículo">
      <NuxtLink to="/admin/articulos" class="bt-btn-secondary">
        Volver a la cola
      </NuxtLink>
    </StateCard>

    <template v-else-if="article">
      <PageHeader title="Revisar artículo">
        <ArticleStatusBadge :status="article.status" class="mr-2" />
        Por {{ article.author?.name ?? 'autor desconocido' }}<template v-if="article.submitted_at">
          · enviado {{ date(article.submitted_at) }}
        </template>
        ·
        <NuxtLink to="/admin/articulos" class="underline underline-offset-2">
          Volver a la cola
        </NuxtLink>
      </PageHeader>

      <section v-if="article.review_note && article.status === 'changes_requested'" class="mt-6 rounded-lg border border-warning/40 bg-warning/[0.06] p-5">
        <h2 class="font-oswald text-lg text-foreground">
          Comentarios enviados al autor
        </h2>
        <p class="t-body mt-2 whitespace-pre-line">
          {{ article.review_note }}
        </p>
      </section>

      <div class="mt-6 flex gap-2" role="tablist" aria-label="Modo">
        <button type="button" role="tab" class="bt-chip" :aria-selected="tab === 'edit'" :aria-pressed="tab === 'edit'" @click="tab = 'edit'">
          Editar
        </button>
        <button type="button" role="tab" class="bt-chip" :aria-selected="tab === 'preview'" :aria-pressed="tab === 'preview'" @click="showPreview">
          Vista previa
        </button>
      </div>

      <div v-show="tab === 'edit'" class="mt-6">
        <ArticleEditor ref="editor" :article="article" base="/admin/articles" />
      </div>

      <!-- Así lo verá el lector. -->
      <article v-if="tab === 'preview'" class="mt-6 space-y-6">
        <figure v-if="article.cover_url" class="aspect-[2/1] overflow-hidden rounded-lg border border-subtle">
          <img :src="article.cover_url" :alt="`Imagen principal de ${article.title}`" class="size-full object-cover">
        </figure>
        <h2 class="t-h1 text-center !text-3xl md:!text-4xl">
          {{ article.title }}
        </h2>
        <p class="t-body text-center">
          {{ article.short }}
        </p>
        <div class="prose prose-lg max-w-none dark:prose-invert" v-html="article.description" />
      </article>

      <section class="mt-10 space-y-4 border-t border-subtle pt-6">
        <div v-if="returning" class="space-y-3">
          <label for="r-note" class="text-sm font-medium text-foreground">¿Qué debe corregir el autor?</label>
          <textarea id="r-note" v-model="note" class="bt-input min-h-28" maxlength="2000" placeholder="Sé específico: qué cambiar y por qué." />
          <div class="flex gap-2">
            <button type="button" class="bt-btn-primary" :disabled="busy || !note.trim()" @click="act('/request_changes', { note })">
              Devolver al autor
            </button>
            <button type="button" class="bt-btn-ghost" @click="returning = false">
              Cancelar
            </button>
          </div>
        </div>

        <div v-else class="flex flex-wrap items-center justify-between gap-3">
          <p class="font-mono text-xs" :class="error ? 'text-danger' : 'text-foreground-subtle'" :role="error ? 'alert' : undefined">
            {{ error }}
          </p>
          <div class="flex flex-wrap gap-2">
            <template v-if="confirming">
              <span class="t-small self-center">
                {{ confirming === 'publish' ? 'Será visible para toda la comunidad y se avisará a los usuarios.' : 'Dejará de ser público y volverá a borrador.' }}
              </span>
              <button type="button" class="bt-btn-ghost" @click="confirming = null">
                Cancelar
              </button>
              <button type="button" class="bt-btn-primary" :disabled="busy" @click="confirmed">
                {{ confirming === 'publish' ? 'Sí, publicar' : 'Sí, despublicar' }}
              </button>
            </template>
            <template v-else-if="article.status === 'published'">
              <NuxtLink :to="`/articulos/${article.slug}`" class="bt-btn-secondary">
                Ver publicado
              </NuxtLink>
              <button type="button" class="bt-btn-ghost" :disabled="busy" @click="confirming = 'unpublish'">
                Despublicar
              </button>
            </template>
            <template v-else>
              <button type="button" class="bt-btn-secondary" :disabled="busy" @click="returning = true">
                Devolver con comentarios
              </button>
              <button type="button" class="bt-btn-primary" :disabled="busy" :aria-busy="busy" @click="confirming = 'publish'">
                Publicar
              </button>
            </template>
          </div>
        </div>
      </section>
    </template>

    <p v-else class="t-small py-10">
      Cargando…
    </p>
  </div>
</template>
