import type { SkillDifficulty, SkillResourceType, SkillStatus, SkillTool } from '~/interfaces/skills'

export const SKILL_TYPE_LABELS: Record<SkillResourceType, string> = {
  ai_skill: 'AI Skill',
  prompt: 'Prompt',
  workflow: 'Workflow',
  automation: 'Automation',
  agent_configuration: 'Agent Configuration',
}

export const SKILL_TOOL_LABELS: Record<SkillTool, string> = {
  claude: 'Claude',
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  cursor: 'Cursor',
  codex: 'OpenAI Codex',
  universal: 'Universal',
}

export const SKILL_DIFFICULTY_LABELS: Record<SkillDifficulty, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
}

export const SKILL_STATUS_LABELS: Record<SkillStatus, string> = {
  draft: 'Borrador',
  pending_review: 'Pendiente de revisión',
  published: 'Publicada',
  rejected: 'Rechazada',
  archived: 'Archivada',
  suspended: 'Suspendida',
}

export const SKILL_LICENSE_LABELS: Record<string, string> = {
  'mit': 'MIT',
  'apache-2.0': 'Apache 2.0',
  'gpl-3.0': 'GPL 3.0',
  'cc-by-4.0': 'CC BY 4.0',
  'cc0-1.0': 'CC0 1.0',
  'all-rights-reserved': 'Todos los derechos reservados',
}

export const SKILL_LANGUAGE_LABELS: Record<string, string> = { es: 'Español', en: 'English', pt: 'Português' }

/** Clase del badge según estado (tokens del design system, sin colores sueltos). */
export function skillStatusClass(status: SkillStatus): string {
  return ({
    published: 'bt-badge-success',
    pending_review: 'bt-badge-warning',
    rejected: 'bt-badge-danger',
    suspended: 'bt-badge-danger',
    draft: '',
    archived: '',
  } as Record<SkillStatus, string>)[status]
}

export function formatBytes(n: number): string {
  if (n < 1024)
    return `${n} B`
  return n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`
}

export function formatSkillDate(d?: string | null): string {
  return d ? new Date(d).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '') : '—'
}

export const SKILL_REPORT_REASONS: Record<string, string> = {
  spam: 'Spam o publicidad',
  malicious: 'Contenido malicioso o peligroso',
  copyright: 'Infringe derechos de autor',
  inappropriate: 'Contenido inapropiado',
  other: 'Otro motivo',
}

export const SKILL_SORT_LABELS: Record<string, string> = {
  recent: 'Más recientes',
  popular: 'Más populares',
  rated: 'Mejor valoradas',
  downloads: 'Más descargadas',
  saved: 'Más guardadas',
}

/** Formato compacto de contadores: 1 250 → "1,2 mil". */
export function compactNumber(n: number): string {
  return new Intl.NumberFormat('es', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}
