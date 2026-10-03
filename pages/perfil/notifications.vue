<script setup lang="ts">
import type { NotificationItem as Item, NotificationFilter, NotificationsResponse } from '~/interfaces/notifications'
import PageHeader from '~/components/common/PageHeader.vue'
import StateCard from '~/components/common/StateCard.vue'
import NotificationRow from '~/components/notifications/NotificationItem.vue'
import { Skeleton } from '~/components/ui/skeleton'

definePageMeta({
  layout: 'custom',
  auth: true,
  footer: 'compact',
})

useSeoMeta({
  title: 'Notificaciones',
  description: 'Tu actividad en Backtrack Academy: cursos, artículos y comunidad.',
  robots: 'noindex, nofollow',
})

const PER_PAGE = 20
const CATEGORY_LABELS = { courses: 'Cursos', articles: 'Artículos', community: 'Comunidad', system: 'Sistema' } as const
const VALID: NotificationFilter[] = ['all', 'unread', 'courses', 'articles', 'community']

const route = useRoute()
const router = useRouter()
const { unreadCount, list, markRead, markAllRead } = useNotifications()

const filter = computed<NotificationFilter>(() => {
  const f = String(route.query.filter ?? 'all') as NotificationFilter
  return VALID.includes(f) ? f : 'all'
})
const page = computed(() => Math.max(1, Number.parseInt(String(route.query.page ?? '1')) || 1))

const { data, status, refresh } = useAsyncData<NotificationsResponse>(
  'notifications-center',
  () => list({ filter: filter.value, page: page.value, per_page: PER_PAGE }),
  { watch: [filter, page], lazy: true },
)

const loading = computed(() => status.value === 'pending' || status.value === 'idle')
const failed = computed(() => status.value === 'error')
const items = computed<Item[]>(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)
const totalPages = computed(() => meta.value?.total_pages ?? 1)

// Solo se ofrecen categorías en las que el usuario realmente tiene notificaciones.
const filters = computed(() => {
  const counts = meta.value?.counts ?? {}
  return [
    { key: 'all' as NotificationFilter, label: 'Todas' },
    { key: 'unread' as NotificationFilter, label: 'No leídas', count: unreadCount.value },
    ...(['courses', 'articles', 'community'] as const)
      .filter(k => counts[k])
      .map(k => ({ key: k as NotificationFilter, label: CATEGORY_LABELS[k] })),
  ]
})

function go(query: { filter?: NotificationFilter, page?: number }) {
  const next: Record<string, string> = {}
  const f = query.filter ?? filter.value
  const p = query.page ?? 1
  if (f !== 'all')
    next.filter = f
  if (p > 1)
    next.page = String(p)
  router.push({ query: next })
}

// Si la página pedida ya no existe (p. ej. tras marcar todo en "No leídas"), vuelve a la última válida.
watch(meta, (m) => {
  if (m && page.value > Math.max(1, m.total_pages))
    go({ page: Math.max(1, m.total_pages) })
})

const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout>
function notify(message: string) {
  toast.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 2800)
}
onBeforeUnmount(() => clearTimeout(toastTimer))

// Optimista: se marca al instante y se revierte si el servidor falla.
async function onRead(item: Item) {
  if (item.read)
    return
  item.read = true
  try {
    await markRead(item.id)
  }
  catch {
    item.read = false
    notify('No pudimos marcarla como leída. Inténtalo de nuevo.')
  }
}

const marking = ref(false)
async function onReadAll() {
  if (marking.value)
    return
  marking.value = true
  try {
    await markAllRead(filter.value)
    notify('Todo marcado como leído')
    await refresh()
  }
  catch {
    notify('No pudimos marcar las notificaciones. Inténtalo de nuevo.')
  }
  finally {
    marking.value = false
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-[760px] space-y-6 px-5 py-6 sm:px-8 lg:py-8">
    <PageHeader title="Notificaciones">
      Mantente al día con tu actividad.
      <template #actions>
        <button
          type="button"
          class="bt-btn-secondary"
          :disabled="unreadCount === 0 || marking"
          :aria-busy="marking"
          @click="onReadAll"
        >
          <Icon name="lucide:check-check" class="size-4" />
          Marcar todas como leídas
        </button>
      </template>
    </PageHeader>

    <div role="group" aria-label="Filtrar notificaciones" class="-mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <button
        v-for="f in filters"
        :key="f.key"
        type="button"
        :aria-pressed="filter === f.key"
        class="bt-chip h-9"
        @click="go({ filter: f.key })"
      >
        {{ f.label }}
        <span v-if="f.count" class="font-mono text-xs text-primary-text">{{ f.count > 99 ? '99+' : f.count }}</span>
      </button>
    </div>

    <StateCard v-if="failed" variant="error" title="No pudimos cargar tus notificaciones" text="Revisa tu conexión e inténtalo de nuevo.">
      <button type="button" class="bt-btn-secondary" @click="refresh()">
        <Icon name="lucide:rotate-cw" class="size-4" />
        Reintentar
      </button>
    </StateCard>

    <div v-else-if="loading && !items.length" class="space-y-3" aria-busy="true">
      <Skeleton v-for="n in 6" :key="n" class="h-16 w-full" />
    </div>

    <section
      v-else-if="!items.length"
      class="flex flex-col items-center rounded-lg border border-dashed border-border bg-surface-1 px-5 py-14 text-center"
      role="status"
    >
      <Icon name="lucide:bell" class="size-7 text-foreground-subtle" aria-hidden="true" />
      <template v-if="filter === 'all'">
        <h2 class="t-h3 mt-4">
          No tienes notificaciones
        </h2>
        <p class="t-small mt-2 max-w-md">
          Cuando haya nueva actividad relacionada con tus cursos, artículos o comunidad aparecerá aquí.
        </p>
      </template>
      <template v-else>
        <h2 class="t-h3 mt-4">
          {{ filter === 'unread' ? 'Estás al día' : 'Nada por aquí' }}
        </h2>
        <p class="t-small mt-2 max-w-md">
          {{ filter === 'unread' ? 'No tienes notificaciones sin leer.' : 'No hay notificaciones de este tipo.' }}
        </p>
        <button type="button" class="bt-btn-secondary mt-5" @click="go({ filter: 'all' })">
          Ver todas
        </button>
      </template>
    </section>

    <template v-else>
      <ul class="overflow-hidden rounded-lg border border-subtle bg-surface-1" :aria-busy="loading" :class="{ 'opacity-60': loading }">
        <NotificationRow v-for="item in items" :key="item.id" :item="item" @read="onRead" />
      </ul>

      <nav v-if="totalPages > 1" class="flex items-center justify-between gap-3" aria-label="Paginación de notificaciones">
        <button type="button" class="bt-btn-ghost" :disabled="page <= 1" @click="go({ page: page - 1 })">
          <span aria-hidden="true">←</span> Anterior
        </button>
        <p class="t-meta" aria-live="polite">
          Página {{ page }} de {{ totalPages }}
        </p>
        <button type="button" class="bt-btn-ghost" :disabled="page >= totalPages" @click="go({ page: page + 1 })">
          Siguiente <span aria-hidden="true">→</span>
        </button>
      </nav>
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
