// Contrato de GET /me/activity (Api::V1::ActivityController).
export interface StudyDay { date: string, seconds: number }

export interface ActivityExamAttempt {
  exam_id: number
  title: string | null
  attempts: number
  percent: number | null
  passed: boolean
  updated_at: string
  certificate_url: string | null
}

export interface ActivityBadge {
  id: number
  name: string
  description: string | null
  kind: 'badge_course' | 'badge_degree'
  level: number
  tier: 'bronze' | 'silver' | 'gold' | null
  image_url: string | null
  target: { title: string, slug: string } | null
  earned_at: string
}

export interface ActivityResponse {
  study: { days: number, total_seconds: number, series: StudyDay[] }
  exams: {
    opportunities_total: number
    opportunities_used: number
    opportunities_left: number
    vouchers_left: number
    attempts: ActivityExamAttempt[]
  }
  badges: ActivityBadge[]
}
