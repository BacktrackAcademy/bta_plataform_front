// Contrato de GET /video/:slug (Api::V1::DetailsController#show) y modelos derivados para el Learning Workspace.

export interface LessonTeacher {
  name?: string
  lastname?: string
  avatar_url?: string
}

export interface LessonVideo {
  id: number
  slug: string
  titlevideo: string
  /** "MM:SS" (el backend interpreta el primer bloque como minutos) */
  total?: string | null
  description?: string | null
  is_free?: boolean | null
}

export interface LessonUnit {
  id?: number
  titulo: string
  videos: LessonVideo[]
}

export interface LessonProgressRow {
  id: number
  total: number
  predicted: number
  is_finish?: boolean
}

export interface LessonResponse extends LessonVideo {
  url: string
  course: {
    titulo: string
    slug: string
    descripcion?: string
    shortdes?: string
    students?: number
    total_duration_seconds?: number
    teacher?: LessonTeacher
    syllabus: LessonUnit[]
  }
  next?: LessonVideo | null
  prev?: LessonVideo | null
  videos_finish?: number
  number_videos?: number
  time_studied_text?: string
  video_details_in_seconds?: LessonProgressRow[]
  video_percent?: number
  course_advance?: number
  /** Acceso real al curso completo (campo nuevo; puede faltar en backends anteriores). */
  course_access?: boolean
}

export type LessonState = 'completed' | 'current' | 'available' | 'locked'

export interface WorkspaceLesson extends LessonVideo {
  /** Posición global dentro del curso, empezando en 1 */
  number: number
  finished: boolean
  locked: boolean
  state: LessonState
}

export interface WorkspaceUnit {
  titulo: string
  lessons: WorkspaceLesson[]
}
