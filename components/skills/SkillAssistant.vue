<script setup lang="ts">
import type { SkillAssistResponse, SkillSuggestions } from '~/interfaces/skills'

// AI Skill Assistant: SUGIERE metadatos a partir del contenido. No guarda ni publica nada:
// cada sugerencia se aplica solo si la persona pulsa "Aplicar", y después puede editarla.
const props = defineProps<{ content: string, title: string, categories: { slug: string, name: string }[] }>()
const emit = defineEmits<{ apply: [patch: Partial<Record<string, unknown>>] }>()

const { $api } = useNuxtApp()
const busy = ref(false)
const error = ref('')
const result = ref<SkillAssistResponse | null>(null)
const applied = ref(new Set<string>())

const canAsk = computed(() => props.content.trim().length >= 30)

async function ask() {
  busy.value = true
  error.value = ''
  applied.value = new Set()
  try {
    result.value = await $api<SkillAssistResponse>('/skills/assist', { method: 'POST', body: { content: props.content, title: props.title || undefined } })
  }
  catch (e: any) {
    result.value = null
    error.value = e?.data?.errors?.join(' ') ?? 'No pudimos analizar el contenido.'
  }
  finally {
    busy.value = false
  }
}

interface Row { key: string, label: string, display: string, patch: Record<string, unknown> }
const rows = computed<Row[]>(() => {
  const s: SkillSuggestions | undefined = result.value?.suggestions
  if (!s)
    return []
  const catName = (slug: string | null) => props.categories.find(c => c.slug === slug)?.name ?? slug ?? ''
  const out: Row[] = []
  if (s.title)
    out.push({ key: 'title', label: 'Título', display: s.title, patch: { title: s.title } })
  if (s.summary)
    out.push({ key: 'summary', label: 'Descripción corta', display: s.summary, patch: { summary: s.summary } })
  if (s.category)
    out.push({ key: 'category', label: 'Categoría', display: catName(s.category), patch: { category: s.category } })
  if (s.resource_type)
    out.push({ key: 'resource_type', label: 'Tipo', display: SKILL_TYPE_LABELS[s.resource_type], patch: { resourceType: s.resource_type } })
  if (s.difficulty)
    out.push({ key: 'difficulty', label: 'Nivel técnico', display: SKILL_DIFFICULTY_LABELS[s.difficulty], patch: { difficulty: s.difficulty } })
  if (s.language)
    out.push({ key: 'language', label: 'Idioma', display: SKILL_LANGUAGE_LABELS[s.language] ?? s.language, patch: { language: s.language } })
  if (s.tools.length)
    out.push({ key: 'tools', label: 'Compatibilidad', display: s.tools.map(t => SKILL_TOOL_LABELS[t]).join(', '), patch: { tools: s.tools } })
  if (s.tags.length)
    out.push({ key: 'tags', label: 'Etiquetas', display: s.tags.join(', '), patch: { tags: s.tags } })
  if (s.requirements)
    out.push({ key: 'requirements', label: 'Requisitos', display: s.requirements, patch: { requirements: s.requirements } })
  if (s.use_cases.length)
    out.push({ key: 'use_cases', label: 'Casos de uso', display: s.use_cases.join(' · '), patch: { useCases: s.use_cases } })
  return out
})

function apply(row: Row) {
  emit('apply', row.patch)
  applied.value = new Set([...applied.value, row.key])
}
function applyAll() {
  rows.value.filter(r => !applied.value.has(r.key)).forEach(apply)
}
</script>

<template>
  <section class="bt-surface space-y-3 p-4" aria-labelledby="assist-title">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 id="assist-title" class="text-sm font-medium text-foreground">
          <Icon name="lucide:sparkles" class="mr-1 size-4 text-primary-text" aria-hidden="true" />Asistente de publicación
        </h3>
        <p class="t-small mt-1">
          Analiza tu contenido y sugiere título, categoría, etiquetas y más. No publica nada: tú decides qué aplicar.
        </p>
      </div>
      <button type="button" class="bt-btn-secondary" :disabled="busy || !canAsk" :aria-busy="busy" @click="ask">
        {{ busy ? 'Analizando…' : 'Sugerir metadatos' }}
      </button>
    </div>
    <p v-if="!canAsk" class="t-small">
      Escribe o pega el contenido (mínimo 30 caracteres) para activar el asistente.
    </p>
    <p v-if="error" class="font-mono text-xs text-danger" role="alert">
      {{ error }}
    </p>

    <template v-if="result">
      <p class="t-small font-mono">
        Fuente: {{ result.source === 'llm' ? 'modelo de IA (revisado por reglas)' : 'análisis local, sin servicios externos' }}
      </p>
      <p v-for="n in result.notes" :key="n" class="t-small text-warning" role="status">
        {{ n }}
      </p>
      <p v-if="!rows.length" class="t-small">
        No encontramos sugerencias claras. Completa los campos a mano.
      </p>
      <template v-else>
        <ul class="divide-y divide-subtle rounded-md border border-subtle">
          <li v-for="r in rows" :key="r.key" class="flex items-start gap-3 px-3 py-2.5">
            <div class="min-w-0 flex-1">
              <p class="t-small">
                {{ r.label }}
              </p>
              <p class="line-clamp-3 whitespace-pre-line break-words text-sm text-foreground">
                {{ r.display }}
              </p>
            </div>
            <button type="button" class="bt-btn-ghost !h-8" :disabled="applied.has(r.key)" @click="apply(r)">
              {{ applied.has(r.key) ? 'Aplicado' : 'Aplicar' }}
            </button>
          </li>
        </ul>
        <button type="button" class="bt-btn-secondary" :disabled="applied.size === rows.length" @click="applyAll">
          Aplicar todas
        </button>
      </template>
    </template>
  </section>
</template>
