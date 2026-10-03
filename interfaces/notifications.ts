export type NotificationCategory = 'courses' | 'articles' | 'community' | 'system'
export type NotificationFilter = 'all' | 'unread' | 'courses' | 'articles' | 'community'

// A dónde lleva la notificación. `null` en notificaciones antiguas cuyo recurso ya no existe.
export type NotificationTarget =
  | { kind: 'course' | 'post' | 'video' | 'discussion', slug: string }
  | { kind: 'user', username: string }
  | { kind: 'url', url: string }

export interface NotificationItem {
  id: number
  type_id: number
  category: NotificationCategory
  read: boolean
  created_at: string
  /** Texto principal. Con `actor` se lee como "<actor> <lead>". */
  lead: string
  actor: { name: string, avatar_url: string | null } | null
  subject: string | null
  image: string | null
  target: NotificationTarget | null
}

export interface NotificationsResponse {
  data: NotificationItem[]
  meta: {
    page: number
    per_page: number
    total_pages: number
    total_entries: number
    unread_count: number
    counts: Partial<Record<NotificationCategory, number>>
  }
}
