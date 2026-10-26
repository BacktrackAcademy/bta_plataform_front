// Contrato de /specialties, /specialties/:slug y /exams (Api::V1::SpecialtiesController y ExamsController#index).
// Datos editoriales de PublicCatalogSerializer + avance y examen del alumno (SpecialtyProgress).
export type ExamState = 'locked' | 'ready' | 'in_progress' | 'finished' | 'approved' | 'no_opportunities'

export interface ExamEntry {
  id: number
  state: ExamState
  percent: number | null
  time_minutes: number
  passing_percent: number
}

export interface SpecialtyCourseProgress {
  percent: number
  lessons_done: number
  lessons_total: number
  started: boolean
  completed: boolean
}

export interface SpecialtyCourse {
  slug: string
  title: string
  summary: string | null
  level: string | null
  image_url: string | null
  image_thumb_url: string | null
  duration_seconds: number
  lessons_count: number
  is_free: boolean
  coming_soon: boolean
  progress: SpecialtyCourseProgress
  exam: ExamEntry | null
}

export type SpecialtyStatus = 'not_started' | 'in_progress' | 'completed' | 'certified'

export interface SpecialtyProgressInfo {
  percent: number
  courses_total: number
  courses_started: number
  courses_completed: number
  status: SpecialtyStatus
}

export interface SpecialtyCard {
  slug: string
  name: string
  summary: string | null
  level: string | null
  courses_count: number
  total_duration_seconds: number
  is_free: boolean
  image_url: string | null
  icon_url: string | null
  wallpaper_url: string | null
  progress: SpecialtyProgressInfo
  exam: ExamEntry | null
}

export interface SpecialtyDetail extends SpecialtyCard {
  description: string | null
  goals: string | null
  learn: string | null
  why: string | null
  work: string | null
  aptitude: string | null
  tools: string | null
  requirements: string | null
  area: string | null
  has_access: boolean
  courses: SpecialtyCourse[]
}

export interface ExamsOverview {
  opportunities_left: number
  vouchers_left: number
  courses: SpecialtyCourse[]
  specialties: SpecialtyCard[]
}
