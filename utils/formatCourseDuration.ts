/**
 * Human duration ("2 h 7 min") for a course. The API sends `total_duration_text` as a plain
 * number of seconds, so prefer `total_duration_seconds` and fall back to a numeric text.
 */
export function formatCourseDuration(course: { total_duration_seconds?: number, total_duration_text?: string }): string {
  const fromText = Number(course.total_duration_text)
  const seconds = course.total_duration_seconds || (Number.isFinite(fromText) && fromText > 0 ? fromText : 0)
  if (!seconds) {
    // Non-numeric text (already formatted): show as is.
    return Number.isNaN(fromText) ? (course.total_duration_text ?? '') : ''
  }
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  if (h === 0)
    return `${m} min`
  return m ? `${h} h ${m} min` : `${h} h`
}
