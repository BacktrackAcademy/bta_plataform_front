// Respuesta de GET /api/v1/profile/:username (lista blanca del backend: sin email ni tokens).
export interface PublicProfile {
  username: string
  name: string | null
  lastname: string | null
  full_name: string
  headline: string | null
  aboutme: string | null
  avatar_url: string | null
  role_label: string | null
  verified: boolean | null
  member_since: string | null
  public: boolean
  indexable: boolean
  is_owner: boolean
  is_following: boolean | null
  stats: {
    ranking: number | null
    certificates: number
    articles: number
    questions: number
    courses_taught: number
    followers: number
    following: number
  }
  specialties: string[]
  links: { linkedin?: string, twitter?: string, facebook?: string }
  activity: {
    certificates: { title: string, slug: string | null, date: string | null }[]
    articles: { title: string, slug: string, category: string | null, published_at: string | null }[]
    questions: { title: string, slug: string, answers: number }[]
    courses: { title: string, slug: string }[]
  }
}

export interface ProfilePerson {
  username: string
  full_name: string
  headline: string | null
  avatar_url: string | null
  profile_public: boolean
  is_me: boolean
  is_following: boolean
}

export interface ProfilePeoplePage {
  data: ProfilePerson[]
  current_page: number
  total_pages: number
  total_items: number
}
