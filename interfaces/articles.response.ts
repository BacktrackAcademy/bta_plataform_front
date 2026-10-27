export interface ArticlesResponse {
  data: Article[]
  current_page: number
  per_page: number
  total_pages: number
  total_items: number
}

export interface Article {
  id: number
  title: string
  description: string
  user_id: number
  created_at: Date
  updated_at: Date
  short: string
  category_id: number
  is_public: boolean
  slug: string
  published_at: Date
  answers_count: number | null
  image_thumb_service: string
  likes_count: number
  bookmarked?: boolean
  liked_by_me?: boolean
  image_thumb_variant_310: string
  icon_thumb: string
  user: User
  category: Category
}

export interface Category {
  id: number
  name: string
  slug: string
}

export interface User {
  id: number
  name: string
  username: string
  avatar_url: string
}

// Vista de gestión (admin / autores): incluye borradores.
export interface ManagedArticle {
  id: number
  slug: string
  title: string
  short: string | null
  category_id: number
  user_id: number
  is_public: boolean | null
  published_at: string | null
  created_at: string
  updated_at: string
  image_thumb_service: string
  user: User
  category: Category
}

export interface ManagedArticlesResponse {
  data: ManagedArticle[]
  current_page: number
  per_page: number
  total_pages: number
  total_items: number
  counts: { published: number, draft: number }
}
