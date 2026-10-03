<script setup lang="ts">
import type { NotificationItem as Item } from '~/interfaces/notifications'
import NotificationRow from '~/components/notifications/NotificationItem.vue'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Skeleton } from '~/components/ui/skeleton'

// Campana del topbar: contador de no leídas + las últimas notificaciones. Misma API y misma fila que /perfil/notifications.
const PREVIEW = 6
const POLL_MS = 60_000

const { unreadCount, list, refreshCount, markRead, markAllRead } = useNotifications()

const open = ref(false)
const items = ref<Item[]>([])
const loading = ref(false)
const failed = ref(false)

const badge = computed(() => formatBadge(unreadCount.value))
const label = computed(() => unreadCount.value > 0
  ? `Notificaciones, ${unreadCount.value} sin leer`
  : 'Notificaciones')

async function load() {
  loading.value = true
  failed.value = false
  try {
    items.value = (await list({ per_page: PREVIEW })).data
  }
  catch {
    failed.value = true
  }
  finally {
    loading.value = false
  }
}

watch(open, (isOpen) => {
  if (isOpen)
    load()
})

async function onRead(item: Item) {
  item.read = true
  try {
    await markRead(item.id)
  }
  catch {
    item.read = false
  }
}

async function onReadAll() {
  const snapshot = items.value.map(i => i.read)
  items.value.forEach(i => (i.read = true))
  try {
    await markAllRead()
  }
  catch {
    items.value.forEach((i, idx) => (i.read = snapshot[idx]))
  }
}

let timer: ReturnType<typeof setInterval> | undefined
function tick() {
  if (document.visibilityState === 'visible')
    refreshCount()
}
onMounted(() => {
  refreshCount()
  timer = setInterval(tick, POLL_MS)
  document.addEventListener('visibilitychange', tick)
})
onBeforeUnmount(() => {
  clearInterval(timer)
  document.removeEventListener('visibilitychange', tick)
})
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <button
        type="button"
        class="bt-icon-btn relative"
        :aria-label="label"
        aria-haspopup="dialog"
        :aria-expanded="open"
      >
        <Icon name="lucide:bell" class="size-5" />
        <span
          v-if="unreadCount > 0"
          class="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-semibold leading-none text-primary-foreground"
          aria-hidden="true"
        >{{ badge }}</span>
      </button>
    </PopoverTrigger>

    <PopoverContent
      align="end"
      :side-offset="8"
      :collision-padding="12"
      class="w-[400px] max-w-[calc(100vw-1.5rem)] overflow-hidden p-0"
      aria-label="Notificaciones"
    >
      <header class="flex items-center justify-between gap-3 border-b border-subtle px-4 py-3">
        <h2 class="font-oswald text-base font-semibold uppercase tracking-wide text-foreground">
          Notificaciones
        </h2>
        <button
          type="button"
          class="bt-focus rounded-sm text-sm text-primary-text hover:underline disabled:pointer-events-none disabled:opacity-45"
          :disabled="unreadCount === 0"
          @click="onReadAll"
        >
          Marcar leídas
        </button>
      </header>

      <div class="max-h-[min(70vh,28rem)] overflow-y-auto" :aria-busy="loading">
        <div v-if="loading && !items.length" class="space-y-3 p-4">
          <Skeleton v-for="n in 4" :key="n" class="h-12 w-full" />
        </div>
        <div v-else-if="failed" class="p-6 text-center" role="alert">
          <p class="t-small">
            No pudimos cargar tus notificaciones.
          </p>
          <button type="button" class="bt-btn-secondary mt-3" @click="load">
            Reintentar
          </button>
        </div>
        <p v-else-if="!items.length" class="px-4 py-10 text-center text-sm text-foreground-muted" role="status">
          No tienes notificaciones.
        </p>
        <ul v-else>
          <NotificationRow
            v-for="item in items"
            :key="item.id"
            :item="item"
            compact
            @read="onRead"
            @navigate="open = false"
          />
        </ul>
      </div>

      <footer class="border-t border-subtle">
        <NuxtLink
          to="/perfil/notifications"
          class="bt-focus flex items-center justify-center gap-1.5 px-4 py-3 text-sm text-foreground-secondary transition-colors duration-fast hover:bg-surface-3 hover:text-foreground"
          @click="open = false"
        >
          Ver todas las notificaciones
          <span class="text-primary-text" aria-hidden="true">→</span>
        </NuxtLink>
      </footer>
    </PopoverContent>
  </Popover>
</template>
