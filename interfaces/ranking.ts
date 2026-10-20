// Contrato de GET /ranking (Api::V1::RankingController).
export interface RankingPerson {
  position: number
  username: string
  full_name: string
  headline: string | null
  avatar_url: string | null
  country_flag: string | null
  score: number
  is_me: boolean
}

export interface RankingResponse {
  data: RankingPerson[]
  current_page: number
  per_page: number
  total_pages: number
  total_items: number
  me: { score: number, qualifies: boolean, public_profile: boolean, position: number | null }
}
