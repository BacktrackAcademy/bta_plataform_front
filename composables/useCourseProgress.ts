import type { CourseProgress } from '~/interfaces/dashboard'

export type CourseStatus = 'certified' | 'completed' | 'in_progress' | 'not_started'

const CERTIFICATE_HOST = 'https://backtrackacademy.com'
const DEFAULT_EXAM_MINUTES = 59

export function useCourseProgress() {
  // Lessons finished / total is the reliable signal: the backend `percent` (seconds-based, integer division) often reads 0.
  function percentOf(course: CourseProgress): number {
    if (course.approved_exam)
      return 100
    const total = course.number_videos ?? 0
    const value = total > 0 ? ((course.count_video ?? 0) / total) * 100 : Number(course.percent)
    return Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : 0
  }

  function statusOf(course: CourseProgress): CourseStatus {
    if (course.approved_exam)
      return 'certified'
    if (percentOf(course) >= 100)
      return 'completed'
    if (percentOf(course) > 0 || (course.count_video ?? 0) > 0)
      return 'in_progress'
    return 'not_started'
  }

  // Backend sends no certificate_url today; rebuild it from the exam id + certification key (pdf_certificate route).
  function certificateUrl(course: CourseProgress): string | null {
    if (course.certificate_url)
      return course.certificate_url.startsWith('http') ? course.certificate_url : `${CERTIFICATE_HOST}${course.certificate_url}`
    const key = course.user_exam?.certification_key
    if (!course.approved_exam || !key || !course.exam?.id)
      return null
    return `${CERTIFICATE_HOST}/examen/${course.exam.id}/certificate.pdf?key=${encodeURIComponent(key)}`
  }

  // Short, real identifier (first block of the certification key); null when the backend has none.
  function certificateId(course: CourseProgress): string | null {
    const key = course.user_exam?.certification_key
    return key ? `BT-${key.replace(/-/g, '').slice(0, 8).toUpperCase()}` : null
  }

  function examMinutes(course: CourseProgress): number {
    const minutes = Number.parseInt(course.exam?.time ?? '')
    return Number.isFinite(minutes) && minutes > 0 ? minutes : DEFAULT_EXAM_MINUTES
  }

  return { percentOf, statusOf, certificateUrl, certificateId, examMinutes }
}
