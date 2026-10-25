<script setup lang="ts">
import type { ManagedArticle } from '@/interfaces/article-management'
import PageHeader from '~/components/common/PageHeader.vue'

definePageMeta({ layout: 'custom', auth: true, middleware: ['author'] })
useSeoMeta({ title: 'Escribir artículo', robots: 'noindex' })

const TITLE_MIN = 10
const TITLE_MAX = 150

const { $api } = useNuxtApp()
const { data: categories } = useAPI<{ id: number, name: string }[]>('/category', { lazy: true, server: false })

const title = ref('')
const categoryId = ref<number | ''>('')
const sending = ref(false)
const error = ref('')

const valid = computed(() => title.value.trim().length >= TITLE_MIN && !!categoryId.value)

// Crea el borrador y sigue en el editor: así las imágenes ya tienen un artículo al que asociarse.
async function submit() {
  if (!valid.value || sending.value)
    return
  sending.value = true
  error.value = ''
  try {
    const created = await $api<ManagedArticle>('/my/articles', {
      method: 'POST',
      body: { title: title.value.trim(), category_id: categoryId.value },
    })
    await navigateTo(`/articulos/editar/${created.id}`)
  }
  catch (e: any) {
    error.value = e?.data?.error ?? 'No pudimos crear el borrador. Inténtalo de nuevo.'
  }
  finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-[900px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <PageHeader title="Escribir artículo">
      Empieza con un título y una categoría. Luego redactas con calma: se guarda solo como borrador.
    </PageHeader>

    <form class="mt-8 space-y-8" @submit.prevent="submit">
      <div>
        <label for="n-title" class="text-sm font-medium text-foreground">Título</label>
        <input id="n-title" v-model="title" class="bt-input mt-2" type="text" :maxlength="TITLE_MAX" placeholder="Un título claro y concreto" required>
        <p class="t-small mt-1 font-mono">
          {{ title.length }}/{{ TITLE_MAX }} · mínimo {{ TITLE_MIN }}
        </p>
      </div>

      <div>
        <label for="n-cat" class="text-sm font-medium text-foreground">Categoría</label>
        <select id="n-cat" v-model="categoryId" class="bt-input mt-2" required>
          <option value="" disabled>
            Elige una categoría
          </option>
          <option v-for="c in categories" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>
      </div>

      <aside class="bt-surface space-y-2 p-5">
        <h2 class="font-mono text-[13px] text-foreground-muted">
          <span class="text-primary-text">//</span> cómo funciona
        </h2>
        <ul class="t-small list-disc space-y-1 pl-5">
          <li>Tu artículo no se publica solo: cuando lo envíes, el equipo lo revisa.</li>
          <li>Si necesita ajustes, te lo devolvemos con comentarios para que lo corrijas.</li>
          <li>Necesitas una imagen destacada, una descripción corta y el contenido para enviarlo.</li>
        </ul>
      </aside>

      <div class="flex items-center justify-between gap-3">
        <p class="font-mono text-xs" :class="error ? 'text-danger' : 'text-foreground-subtle'" :role="error ? 'alert' : undefined">
          {{ error }}
        </p>
        <div class="flex gap-2">
          <NuxtLink to="/articulos/mis-articulos" class="bt-btn-ghost">
            Cancelar
          </NuxtLink>
          <button type="submit" class="bt-btn-primary" :disabled="!valid || sending" :aria-busy="sending">
            Crear borrador
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
