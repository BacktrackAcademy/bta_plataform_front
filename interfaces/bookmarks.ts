export type BookmarkKind = 'course' | 'video' | 'post' | 'discussion'

export interface BookmarkItem {
  kind: BookmarkKind
  id: number
  slug: string
  title: string
  saved_at: string
  context?: string | null
  author?: string | null
  excerpt?: string | null
  duration?: string | null
  progress?: number
  answers?: number
}

export interface BookmarksResponse {
  data: BookmarkItem[]
  total_items: number
}
