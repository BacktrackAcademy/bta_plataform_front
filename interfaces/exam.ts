// Contrato de /exam/:id (Api::V1::ExamsController). Nunca incluye la respuesta correcta.
export type ExamPhase = 'intro' | 'in_progress' | 'result'
export type ExamBlockedReason = 'course_incomplete' | 'no_opportunities' | 'approved' | null

export interface ExamSummary {
  id: number
  title: string
  description: string | null
  kind: 'exam_course' | 'exam_degree'
  time_minutes: number
  total_questions: number
  passing_percent: number
  target: { title: string, slug: string } | null
  phase: ExamPhase
  can_start: boolean
  blocked_reason: ExamBlockedReason
  opportunities_left: number
  percent: number | null
}

export interface ExamQuestionPayload {
  phase: 'in_progress'
  seconds_left: number
  answered: number
  total: number
  question: {
    id: number
    name: string
    description: string | null
    image_url: string | null
    options: { value: number, text: string }[]
  }
}

export interface ExamResult extends ExamSummary {
  corrects: number
  total: number
  verdict: string | null
  passed: boolean
  certificate_url: string | null
  badge: { name: string, image_url: string | null } | null
}
