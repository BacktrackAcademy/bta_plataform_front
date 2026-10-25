<script setup lang="ts">
import type { ManagedArticle } from '@/interfaces/article-management'
import ArticleEditor from '~/components/articles/ArticleEditor.vue'
import ArticleStatusBadge from '~/components/articles/ArticleStatusBadge.vue'
import PageHeader from '~/components/common/PageHeader.vue'
import StateCard from '~/components/common/StateCard.vue'

definePageMeta({ layout: 'custom', auth: true, middleware: ['author'] })
useSeoMeta({ title: 'Editar artículo', robots: 'noindex' })

const route = useRoute()
const { $api } = useNuxtApp()
const id = route.params.id as string

const { data: article, error: loadError } = useAPI<ManagedArticle>(`/my/articles/${id}`, { server: false, key: `my-article-${id}` })

const editor = ref<InstanceType<typeof ArticleEditor>>()
const busy = ref(false)
const actionError = ref('')

async function act(path: string) {
  busy.value = true
  actionError.value = ''
  try {
    if (path === '/submit' && !(await editor.value?.flush())) {
      actionError.value = 'No pudimos guardar los últimos cambios. Revisa tu conexión e inténtalo de nuevo.'
      return
    }
    article.value = await $api<ManagedArticle>(`/my/articles/${id}${path}`, { method: 'POST' })
  }
  catch (e: any) {
    actionError.value = e?.data?.error ?? 'No pudimos completar la acción. Inténtalo de nuevo.'
  }
  finally {
    busy.value = false
  }
}

const confirming = ref(false)

async function send() {
  confirming.value = false
  await act('/submit')
}
</script>

<template>
  <div class="mx-auto w-full max-w-[900px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <StateCard v-if="loadError" variant="error" title="No encontramos este artículo" text="Puede que no sea tuyo o que ya no exista.">
      <NuxtLink to="/articulos/mis-articulos" class="bt-btn-secondary">
        Mis artículos
      </NuxtLink>
    </StateCard>

    <template v-else-if="article">
      <PageHeader title="Editar artículo">
        <ArticleStatusBadge :status="article.status" class="mr-2" />
        <NuxtLink to="/articulos/mis-articulos" class="underline underline-offset-2">
          Volver a mis artículos
        </NuxtLink>
      </PageHeader>

      <section v-if="article.status === 'changes_requested' && article.review_note" class="mt-6 rounded-lg border border-warning/40 bg-warning/[0.06] p-5" role="status">
        <h2 class="font-oswald text-lg text-foreground">
          El equipo pidió cambios
        </h2>
        <p class="t-body mt-2 whitespace-pre-line">
          {{ article.review_note }}
        </p>
      </section>

      <section v-else-if="article.status === 'in_review'" class="mt-6 rounded-lg border border-subtle bg-surface-1 p-5" role="status">
        <p class="t-body">
          Tu artículo está en revisión y no se puede editar. Si quieres cambiar algo, retíralo de revisión.
        </p>
        <button type="button" class="bt-btn-secondary mt-3" :disabled="busy" @click="act('/withdraw')">
          Retirar de revisión
        </button>
      </section>

      <section v-else-if="article.status === 'published'" class="mt-6 rounded-lg border border-subtle bg-surface-1 p-5" role="status">
        <p class="t-body">
          Este artículo ya está publicado.
        </p>
        <NuxtLink :to="`/articulos/${article.slug}`" class="bt-btn-secondary mt-3">
          Ver artículo
        </NuxtLink>
      </section>

      <div class="mt-8">
        <ArticleEditor :key="`${article.id}-${article.status}`" ref="editor" :article="article" base="/my/articles" />
      </div>

      <div v-if="article.editable" class="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-subtle pt-6">
        <p class="font-mono text-xs" :class="actionError ? 'text-danger' : 'text-foreground-subtle'" :role="actionError ? 'alert' : undefined">
          {{ actionError || 'Necesitas título, categoría, descripción corta, imagen destacada y contenido.' }}
        </p>
        <div v-if="confirming" class="flex flex-wrap items-center gap-2">
          <span class="t-small">No podrás editarlo hasta que el equipo responda.</span>
          <button type="button" class="bt-btn-ghost" @click="confirming = false">
            Cancelar
          </button>
          <button type="button" class="bt-btn-primary" :disabled="busy" :aria-busy="busy" @click="send">
            Sí, enviar
          </button>
        </div>
        <button v-else type="button" class="bt-btn-primary" :disabled="busy" @click="confirming = true">
          Enviar a revisión
        </button>
      </div>
      <p v-else-if="actionError" class="mt-6 font-mono text-xs text-danger" role="alert">
        {{ actionError }}
      </p>
    </template>

    <p v-else class="t-small py-10">
      Cargando…
    </p>
  </div>
</template>
