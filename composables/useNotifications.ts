import type { NotificationFilter, NotificationsResponse } from '~/interfaces/notifications'

// Estado y acciones compartidos por el dropdown del header y /perfil/notifications.
// Una sola fuente: /api/v1/notifications. `unreadCount` es el total de no leídas (el badge).
export function useNotifications() {
  const { $api } = useNuxtApp()
  const unreadCount = useState<number>('notifications:unread', () => 0)

  function list(params: { filter?: NotificationFilter, page?: number, per_page?: number } = {}) {
    return $api<NotificationsResponse>('/notifications', {
      query: { filter: params.filter ?? 'all', page: params.page ?? 1, per_page: params.per_page ?? 20 },
    }).then((res) => {
      unreadCount.value = res.meta.unread_count
      return res
    })
  }

  async function refreshCount() {
    try {
      unreadCount.value = (await $api<{ unread_count: number }>('/notifications/unread_count')).unread_count
    }
    catch {
      // El badge es informativo: si falla, conserva el último valor.
    }
  }

  async function markRead(id: number) {
    const res = await $api<{ unread_count: number }>(`/notifications/${id}/read`, { method: 'POST' })
    unreadCount.value = res.unread_count
  }

  async function markAllRead(filter: NotificationFilter = 'all') {
    const res = await $api<{ unread_count: number }>('/notifications/read_all', {
      method: 'POST',
      query: { filter: filter === 'unread' ? 'all' : filter },
    })
    unreadCount.value = res.unread_count
  }

  return { unreadCount, list, refreshCount, markRead, markAllRead }
}

// "0" → oculto, 1–99 → número, 100+ → "99+"
export function formatBadge(count: number): string {
  return count > 99 ? '99+' : String(count)
}
