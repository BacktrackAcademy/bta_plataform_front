// Artículos en el flujo editorial: borrador → en revisión → publicado (o devuelto con comentarios).
export type ArticleStatus = 'draft' | 'in_review' | 'changes_requested' | 'published'

export interface ManagedArticleSummary {
  id: number
  slug: string
  title: string
  short: string | null
  status: ArticleStatus
  review_note: string | null
  category: { id: number, name: string, slug: string } | null
  author: { id: number, name: string, username: string } | null
  cover_thumb_url: string | null
  submitted_at: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface ManagedArticle extends ManagedArticleSummary {
  description: string
  metatag: string | null
  cover_url: string | null
  editable: boolean
}

export interface ManagedArticleList {
  data: ManagedArticleSummary[]
  counts?: Record<ArticleStatus, number>
  current_page: number
  total_pages: number
  total_items: number
}

export const ARTICLE_STATUS_LABEL: Record<ArticleStatus, string> = {
  draft: 'Borrador',
  in_review: 'En revisión',
  changes_requested: 'Cambios solicitados',
  published: 'Publicado',
}

export const ARTICLE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const ARTICLE_IMAGE_MAX_BYTES = 5 * 1024 * 1024
