<script setup lang="ts">
import type { ManagedArticle, ManagedArticlesResponse } from '@/interfaces/articles.response'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '~/components/common/PageHeader.vue'

definePageMeta({ layout: 'custom', auth: true })
useSeoMeta({ title: 'Administrar artículos', robots: 'noindex' })

const { $api } = useNuxtApp()
const { data: me } = useAPI<{ role: string }>('/user/info', { lazy: true, server: false })
const isAdmin = computed(() => me.value?.role === 'admin')

type Status = 'all' | 'published' | 'draft'
const status = ref<Status>('all')
const search = ref('')
const query = ref('')
const page = ref(1)
const busyId = ref<number | null>(null)
const error = ref('')

const { data, status: loading, refresh } = useAPI<ManagedArticlesResponse>('/admin/articles', {
  query: computed(() => ({
    page: page.value,
    per_page: 15,
    q: query.value || undefined,
    status: status.value === 'all' ? undefined : status.value,
  })),
  lazy: true,
  server: false,
})

let timer: ReturnType<typeof setTimeout>
watch(search, (v) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    query.value = v.trim()
    page.value = 1
  }, 300)
})
watch(status, () => (page.value = 1))

const tabs = computed(() => [
  { value: 'all' as Status, label: 'Todos', count: (data.value?.counts.published ?? 0) + (data.value?.counts.draft ?? 0) },
  { value: 'published' as Status, label: 'Publicados', count: data.value?.counts.published ?? 0 },
  { value: 'draft' as Status, label: 'Borradores', count: data.value?.counts.draft ?? 0 },
])

const fmt = (d?: string | null) => d ? new Date(d).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '') : '—'

async function toggle(a: ManagedArticle) {
  const publishing = !a.is_public
  // eslint-disable-next-line no-alert
  if (!confirm(publishing
    ? `¿Publicar "${a.title}"? Será visible para todos y se notificará a la comunidad.`
    : `¿Despublicar "${a.title}"? Dejará de ser visible para la comunidad.`)) {
    return
  }
  busyId.value = a.id
  error.value = ''
  try {
    await $api(`/articles/${a.id}/${publishing ? 'publish' : 'unpublish'}`, { method: 'PATCH' })
    await refresh()
  }
  catch (e: any) {
    error.value = e?.data?.error ?? 'No pudimos cambiar el estado del artículo.'
  }
  finally {
    busyId.value = null
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-[1200px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <PageHeader title="Administrar artículos">
      {{ isAdmin ? 'Todos los artículos: revisa borradores, edita y publica.' : 'Tus artículos y su estado de revisión.' }}
      <template #actions>
        <NuxtLink to="/articulos/crear" class="bt-btn-primary">
          <Icon name="lucide:plus" class="size-4" />
          Nuevo artículo
        </NuxtLink>
      </template>
    </PageHeader>

    <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-wrap gap-2" role="tablist">
        <button
          v-for="t in tabs"
          :key="t.value"
          type="button"
          role="tab"
          class="bt-chip"
          :aria-selected="status === t.value"
          :aria-pressed="status === t.value"
          @click="status = t.value"
        >
          {{ t.label }} <span class="font-mono text-foreground-subtle">{{ t.count }}</span>
        </button>
      </div>
      <input v-model="search" type="search" class="bt-input sm:max-w-xs" placeholder="Buscar por título…" aria-label="Buscar artículos">
    </div>

    <p v-if="error" class="mt-4 font-mono text-xs text-danger" role="alert">
      {{ error }}
    </p>

    <div v-if="loading === 'pending' && !data" class="mt-6 space-y-2">
      <Skeleton v-for="i in 6" :key="i" class="h-16 w-full" />
    </div>

    <div v-else-if="!data?.data.length" class="bt-surface mt-6 p-8 text-center text-sm text-foreground-secondary">
      No hay artículos con este filtro.
    </div>

    <div v-else class="bt-surface mt-6 overflow-x-auto">
      <table class="w-full min-w-[760px] text-left text-sm">
        <thead class="border-b border-subtle font-mono text-xs text-foreground-muted">
          <tr>
            <th class="px-4 py-3 font-normal">
              Artículo
            </th>
            <th class="px-4 py-3 font-normal">
              Autor
            </th>
            <th class="px-4 py-3 font-normal">
              Estado
            </th>
            <th class="px-4 py-3 font-normal">
              Fecha
            </th>
            <th class="px-4 py-3 text-right font-normal">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-subtle">
          <tr v-for="a in data.data" :key="a.id" :class="busyId === a.id && 'opacity-60'">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <img v-if="a.image_thumb_service" :src="a.image_thumb_service" alt="" class="h-10 w-20 shrink-0 rounded border border-subtle object-cover">
                <div class="min-w-0">
                  <p class="line-clamp-1 font-medium text-foreground">
                    {{ a.title }}
                  </p>
                  <p class="t-small">
                    {{ a.category?.name }}
                  </p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-foreground-secondary">
              {{ a.user?.name || a.user?.username }}
            </td>
            <td class="px-4 py-3">
              <span class="bt-chip !h-6 font-mono" :class="a.is_public ? 'text-success' : 'text-foreground-muted'">
                {{ a.is_public ? 'Publicado' : 'Borrador' }}
              </span>
            </td>
            <td class="px-4 py-3 font-mono text-xs text-foreground-muted">
              {{ fmt(a.is_public ? a.published_at : a.created_at) }}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-1.5">
                <NuxtLink v-if="a.is_public" :to="`/articulos/${a.slug}`" class="bt-btn-ghost" title="Ver artículo">
                  Ver
                </NuxtLink>
                <NuxtLink v-if="isAdmin || !a.is_public" :to="`/articulos/editar/${a.id}`" class="bt-btn-ghost">
                  Editar
                </NuxtLink>
                <button v-if="isAdmin" type="button" :class="a.is_public ? 'bt-btn-secondary' : 'bt-btn-primary'" :disabled="busyId === a.id" @click="toggle(a)">
                  {{ a.is_public ? 'Despublicar' : 'Publicar' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="data && data.total_pages > 1" class="mt-6 flex items-center justify-center gap-3">
      <Button variant="outline" :disabled="page <= 1" @click="page--">
        Anterior
      </Button>
      <span class="font-mono text-sm text-foreground-muted">{{ page }} / {{ data.total_pages }}</span>
      <Button variant="outline" :disabled="page >= data.total_pages" @click="page++">
        Siguiente
      </Button>
    </div>
  </div>
</template>
