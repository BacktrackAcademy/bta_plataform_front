// Backtrack Skills en la app autenticada. Contrato: bta_plataform/docs/skills.md

export type SkillStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'archived' | 'suspended'
export type SkillResourceType = 'ai_skill' | 'prompt' | 'workflow' | 'automation' | 'agent_configuration'
export type SkillTool = 'claude' | 'chatgpt' | 'gemini' | 'cursor' | 'codex' | 'universal'
export type SkillDifficulty = 'beginner' | 'intermediate' | 'advanced'

export interface SkillExample {
  id?: number
  title: string
  use_case: string | null
  instructions: string | null
  input_example: string | null
  output_example: string | null
}

export interface SkillFile { id: number, filename: string, content_type: string, byte_size: number }

export interface SkillRow {
  id: number
  slug: string
  title: string
  status: SkillStatus
  category: { id: number, name: string, slug: string }
  resource_type: SkillResourceType
  version: string
  views_count: number
  downloads_count: number
  favorites_count: number
  rating: { average: number | null, count: number }
  featured: boolean
  rejection_reason: string | null
  created_at: string
  updated_at: string
  published_at: string | null
  author?: { id: number, username: string, name: string, public_profile: boolean }
}

export interface SkillManaged extends SkillRow {
  summary: string
  description: string | null
  requirements: string | null
  content: string
  license: string
  language: string
  difficulty: SkillDifficulty
  github_url: string | null
  tools: SkillTool[]
  tags: { name: string, slug: string }[]
  examples: SkillExample[]
  files: SkillFile[]
  scan: { type: string, label: string, blocking: boolean }[]
  allowed_transitions: SkillStatus[]
  scripts?: string[]
  duplicates?: (SkillDuplicate & { id: number, author: string })[]
  logs?: { id: number, action: string, note: string | null, actor: string, created_at: string }[]
}

export interface SkillCardItem {
  id: number
  slug: string
  title: string
  summary: string
  category: { name: string, slug: string }
  resource_type: SkillResourceType
  tools: SkillTool[]
  author: { display_name: string, username: string | null }
  downloads_count: number
  favorites_count: number
  published_at: string | null
}

export interface SkillOptions {
  categories: { id: number, name: string, slug: string }[]
  resource_types: SkillResourceType[]
  tools: SkillTool[]
  difficulties: SkillDifficulty[]
  languages: string[]
  licenses: string[]
  limits: { max_content: number, max_tags: number, max_files: number, max_text_bytes: number, max_zip_bytes: number, extensions: string[] }
}

export interface SkillListResponse {
  data: SkillRow[]
  current_page: number
  total_pages: number
  total_items: number
  totals?: { by_status: Partial<Record<SkillStatus, number>>, views: number, downloads: number, favorites: number, rating_average: number | null }
  counts?: Partial<Record<SkillStatus, number>>
}

// ---- Comunidad (Fase 2) ----
export interface SkillRatingSummary { average: number | null, count: number, distribution: Record<string, number> }

export interface SkillCommentItem {
  id: number
  parent_id: number | null
  content: string | null
  removed: boolean
  author: { display_name: string, username: string | null, avatar_url: string | null } | null
  created_at: string
  edited_at: string | null
  mine: boolean
  replies?: SkillCommentItem[]
}

export interface SkillFeedback {
  my_rating: number | null
  own_skill: boolean
  rating: SkillRatingSummary
  comments_count: number
  comments: { data: SkillCommentItem[], pagination: { current_page: number, total_pages: number, total_entries: number } }
}

export type SkillReportReason = 'spam' | 'malicious' | 'copyright' | 'inappropriate' | 'other'

export interface SkillReportRow {
  id: number
  reason: SkillReportReason
  details: string | null
  status: 'open' | 'actioned' | 'dismissed'
  created_at: string
  resolution_note: string | null
  reporter: string
  skill: { id: number, title: string, slug: string, status: SkillStatus }
  comment: { id: number, content: string, status: string } | null
}

// ---- Fase 3: asistente, GitHub y duplicados ----
export interface SkillSuggestions {
  title: string | null
  summary: string | null
  category: string | null
  resource_type: SkillResourceType | null
  difficulty: SkillDifficulty | null
  language: string | null
  tools: SkillTool[]
  tags: string[]
  requirements: string | null
  use_cases: string[]
}

export interface SkillAssistResponse { suggestions: SkillSuggestions, source: 'heuristic' | 'llm', notes: string[] }

export interface SkillGithubPreview {
  repository: string
  branch: string
  file: string
  file_sha: string
  title: string
  summary: string | null
  content: string
  tags: string[]
  license: string | null
  warnings: string[]
}

export interface SkillDuplicate {
  similarity: number
  exact: boolean
  own: boolean
  status: string
  title: string | null
  slug: string | null
  id?: number
  author?: string
}

// ---- Biblioteca dentro de la app (API pública /public/skills*) ----
export interface SkillLibraryCard {
  id: number
  slug: string
  title: string
  summary: string
  category: { id: number, name: string, slug: string }
  resource_type: SkillResourceType
  difficulty: SkillDifficulty
  language: string
  tools: SkillTool[]
  tags: { name: string, slug: string }[]
  author: { display_name: string, username: string | null, avatar_url: string | null, public: boolean }
  rating: { average: number | null, count: number }
  downloads_count: number
  favorites_count: number
  comments_count: number
  featured: boolean
  version: string
  published_at: string | null
}

export interface SkillLibraryDetail extends SkillLibraryCard {
  description: string | null
  requirements: string | null
  description_html: string
  requirements_html: string
  content: string
  content_html: string
  license: string
  github_url: string | null
  views_count: number
  updated_at: string
  examples: { title: string, use_case: string | null, instructions: string | null, input_example: string | null, output_example: string | null }[]
  versions: { version: string, changelog: string | null, created_at: string }[]
  files: SkillFile[]
  related: SkillLibraryCard[]
}

export interface SkillLibraryFilters {
  categories: { name: string, slug: string, description: string | null, count: number }[]
  resource_types: SkillResourceType[]
  tools: SkillTool[]
  difficulties: SkillDifficulty[]
  languages: string[]
  sorts: string[]
  stats: { skills: number, creators: number, downloads: number, categories: number }
}

export interface SkillLibraryPage {
  data: SkillLibraryCard[]
  pagination: { current_page: number, per_page: number, total_pages: number, total_entries: number }
}
