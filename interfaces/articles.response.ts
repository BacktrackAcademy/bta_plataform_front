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
