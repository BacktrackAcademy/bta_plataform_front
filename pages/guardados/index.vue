<script setup lang="ts">
import type { BookmarkItem, BookmarkKind, BookmarksResponse } from '~/interfaces/bookmarks'
import BookmarkRow from '~/components/bookmarks/BookmarkRow.vue'
import PageHeader from '~/components/common/PageHeader.vue'
import StateCard from '~/components/common/StateCard.vue'
import { Skeleton } from '~/components/ui/skeleton'

definePageMeta({
  layout: 'custom',
  auth: true,
  footer: 'compact',
})

useSeoMeta({
  title: 'Guardados',
  description: 'Contenido que guardaste para revisar más tarde en Backtrack Academy.',
  robots: 'noindex, nofollow',
})

type Filter = 'all' | BookmarkKind

const KINDS: { key: BookmarkKind, label: string }[] = [
  { key: 'course', label: 'Cursos' },
  { key: 'video', label: 'Lecciones' },
  { key: 'post', label: 'Artículos' },
  { key: 'discussion', label: 'Preguntas' },
]

const { $api } = useNuxtApp()

const { data, status, refresh } = useAsyncData<BookmarkItem[]>(
  'guardados',
  async () => (await $api<BookmarksResponse>('/bookmarks')).data ?? [],
  { lazy: true, default: () => [] },
)

const loading = computed(() => status.value === 'pending' || status.value === 'idle')
const failed = computed(() => status.value === 'error')
const items = computed(() => data.value ?? [])

const query = ref('')
const filter = ref<Filter>('all')

const counts = computed(() => {
  const c: Record<string, number> = { all: items.value.length }
  for (const i of items.value) c[i.kind] = (c[i.kind] ?? 0) + 1
  return c
})
// Solo se ofrecen filtros de tipos que el usuario realmente tiene.
const filters = computed(() => [
  { key: 'all' as Filter, label: 'Todos' },
  ...KINDS.filter(k => counts.value[k.key]),
])
watch(counts, (c) => {
  if (filter.value !== 'all' && !c[filter.value])
    filter.value = 'all'
})

const visible = computed(() => {
  const q = query.value.trim().toLowerCase()
  return items.value.filter(i =>
    (filter.value === 'all' || i.kind === filter.value)
    && (!q || [i.title, i.context, i.author, i.excerpt].some(v => v?.toLowerCase().includes(q))),
  )
})

function clearFilters() {
  query.value = ''
  filter.value = 'all'
}

// Aviso discreto (aria-live) al quitar.
const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout>
function notify(message: string) {
  toast.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 2800)
}
onBeforeUnmount(() => clearTimeout(toastTimer))

// Quitado optimista: sale de la lista al instante y vuelve a su posición si el servidor falla.
const removing = ref(new Set<string>())
const keyOf = (i: BookmarkItem) => `${i.kind}:${i.id}`

async function remove(item: BookmarkItem) {
  const key = keyOf(item)
  if (removing.value.has(key))
    return
  removing.value.add(key)
  const snapshot = [...items.value]
  data.value = snapshot.filter(i => keyOf(i) !== key)
  try {
    await $api(`/bookmarks/${item.kind}/${item.id}`, { method: 'DELETE' })
    notify('Eliminado de Guardados')
  }
  catch {
    data.value = snapshot
    notify('No pudimos quitarlo. Inténtalo de nuevo.')
  }
  finally {
    removing.value.delete(key)
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-[900px] space-y-6 px-5 py-6 sm:px-8 lg:py-8">
    <PageHeader title="Guardados">
      Contenido que guardaste para revisar más tarde.
      <span v-if="!loading && !failed && items.length" class="ml-2 border-l border-border pl-3 text-foreground-subtle">
        {{ items.length }} {{ items.length === 1 ? 'elemento guardado' : 'elementos guardados' }}
      </span>
    </PageHeader>

    <!-- Error -->
    <StateCard v-if="failed" variant="error" title="No pudimos cargar tus guardados" text="Revisa tu conexión e inténtalo de nuevo.">
      <button type="button" class="bt-btn-secondary" @click="refresh()">
        <Icon name="lucide:rotate-cw" class="size-4" />
        Reintentar
      </button>
    </StateCard>

    <!-- Loading -->
    <div v-else-if="loading" class="space-y-3" aria-busy="true">
      <Skeleton class="h-10 w-full max-w-sm" />
      <Skeleton v-for="n in 4" :key="n" class="h-20 w-full" />
    </div>

    <!-- Sin bookmarks -->
    <section v-else-if="!items.length" class="flex flex-col items-center rounded-lg border border-dashed border-border bg-surface-1 px-5 py-14 text-center">
      <Icon name="lucide:bookmark" class="size-7 text-foreground-subtle" aria-hidden="true" />
      <h2 class="t-h3 mt-4">
        Todavía no tienes contenido guardado
      </h2>
      <p class="t-small mt-2 max-w-md">
        Guarda cursos, lecciones, artículos o preguntas para encontrarlos rápidamente desde aquí.
      </p>
      <NuxtLink to="/cursos" class="bt-btn-secondary mt-5">
        Explorar contenido
      </NuxtLink>
    </section>

    <template v-else>
      <div class="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div class="relative w-full sm:max-w-xs sm:flex-1">
          <Icon name="lucide:search" class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" aria-hidden="true" />
          <label for="guardados-q" class="sr-only">Buscar en tus guardados</label>
          <input
            id="guardados-q"
            v-model="query"
            type="search"
            autocomplete="off"
            placeholder="Buscar en tus guardados..."
            class="bt-input pl-9"
          >
        </div>
        <div v-if="filters.length > 2" role="group" aria-label="Filtrar por tipo" class="-mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          <button
            v-for="f in filters"
            :key="f.key"
            type="button"
            :aria-pressed="filter === f.key"
            class="bt-chip h-9"
            @click="filter = f.key"
          >
            {{ f.label }}
            <span class="font-mono text-xs text-foreground-subtle">{{ counts[f.key] }}</span>
          </button>
        </div>
      </div>

      <!-- Sin resultados -->
      <div v-if="!visible.length" class="flex flex-col items-center rounded-lg border border-dashed border-border bg-surface-1 px-5 py-12 text-center" role="status">
        <p class="t-body">
          No encontramos guardados con ese criterio.
        </p>
        <button
          type="button"
          class="bt-btn-secondary mt-4"
          @click="clearFilters"
        >
          Limpiar filtros
        </button>
      </div>

      <ul v-else class="overflow-hidden rounded-lg border border-subtle bg-surface-1 [&>li:last-child]:border-b-0">
        <BookmarkRow
          v-for="item in visible"
          :key="keyOf(item)"
          :item="item"
          :removing="removing.has(keyOf(item))"
          @remove="remove"
        />
      </ul>
    </template>

    <p
      class="pointer-events-none fixed bottom-24 right-5 z-50 rounded-md border border-border bg-surface-3 px-4 py-2.5 text-sm text-foreground shadow-elev-2 transition-opacity duration-slow md:bottom-6"
      :class="toast ? 'opacity-100' : 'opacity-0'"
      role="status"
      aria-live="polite"
    >
      {{ toast }}
    </p>
  </div>
</template>
