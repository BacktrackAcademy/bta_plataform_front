export type DiscussionKind = 'question' | 'finding' | 'resource' | 'challenge' | 'bug'

export interface DiscussionResponse {
  data: Datum[]
  current_page: number
  per_page: number
  total_pages: number
  total_items: number
}

export interface Datum {
  id: number
  detail_id: number | null
  user_id: number
  title: string
  body: string
  body_html: string
  state: null
  visitors: number
  created_at: string
  updated_at: Date
  course_id: null
  answers_count: number
  slug: string
  last_comment_at: Date
  resolved_at: Date | null
  is_public: IsPublic
  kind: DiscussionKind
  category_id: number
  deleted_at: null
  likes_count: number
  user: User
}

export enum IsPublic {
  Rejected = 'rejected',
  Pending = 'pending',
  Published = 'published',
}

export interface User {
  id: number
  name: string
  username: string
  lastname: string
}

export interface DiscussionComment {
  id: number
  body: string
  body_html: string
  created_at: string
  mine: boolean
  user: User
}

export interface DiscussionDetail {
  id: number
  title: string
  body: string
  body_html: string
  slug: string
  visitors: number
  created_at: string
  resolved_at: string | null
  answers_count: number | null
  category_id: number
  is_public: IsPublic
  kind: DiscussionKind
  kind_label: string
  category: { id: number, name: string, slug: string } | null
  likes_count: number
  liked_by_me: boolean
  mine: boolean
  can_moderate: boolean
  user: User
  comments: DiscussionComment[]
}
