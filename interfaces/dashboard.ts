export interface CoursesHistory {
  courses: HistoryCourse[]
  number_courses: number
  progress_percentage: number
  total_length: string
  total_viewed: string
}

export interface HistoryCourse {
  id: number
  titulo: string
  slug: string
  image_thumb?: string | null
  level_name?: string
  degree_id?: number | null
  number_videos?: number
  total_duration_seconds?: number
  teacher?: { name: string, lastname: string }
}

export interface CourseProgress extends HistoryCourse {
  percent?: number
  count_video?: number
  total_user?: number
  last_video_viewed?: { titlevideo?: string } | null
}

export interface CoursesProgressResponse {
  courses: CourseProgress[]
}

export interface Degree {
  id: number
  name: string
  description: string
  level: string
  count_courses: string
  all_time: string
}

// History course enriched with real per-course progress (when available) and its learning path.
export interface DashboardCourse extends CourseProgress {
  path?: string
}

export interface LatestCourse {
  id: number
  titulo: string
  slug: string
  image_thumb?: string | null
  level_name?: string
  price?: number | null
  number_videos?: number
  teacher?: { name: string, lastname: string }
}

export interface LatestCoursesResponse {
  courses: LatestCourse[]
}

export interface LatestArticle {
  id: number
  title: string
  slug: string
  image_thumb_service?: string | null
  category?: { name: string } | null
  user?: { name: string, avatar_url?: string | null } | null
}

export interface LatestArticlesResponse {
  data: LatestArticle[]
}
