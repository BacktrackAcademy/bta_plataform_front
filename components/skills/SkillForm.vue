<script setup lang="ts">
import type { SkillExample, SkillFile, SkillGithubPreview, SkillManaged, SkillOptions } from '~/interfaces/skills'
import MarkdownEditor from '~/components/common/MarkdownEditor.vue'

// Formulario único de crear/editar. Siempre guarda como borrador; "Enviar a revisión" lo pasa a moderación.
// Un admin revisa antes de que sea público. Los archivos se adjuntan una vez guardado el borrador.
const props = defineProps<{ skill?: SkillManaged }>()

const { $api } = useNuxtApp()
const { data: options, error: optionsError, status: optionsStatus, refresh: refreshOptions } = useAPI<SkillOptions>('/skills/options', { lazy: true, server: false, retry: false })

const editing = computed(() => !!props.skill)
const current = ref<SkillManaged | undefined>(props.skill)

const title = ref(props.skill?.title ?? '')
const summary = ref(props.skill?.summary ?? '')
const category = ref(props.skill?.category.slug ?? '')
const resourceType = ref(props.skill?.resource_type ?? 'ai_skill')
const difficulty = ref(props.skill?.difficulty ?? 'beginner')
const language = ref(props.skill?.language ?? 'es')
const license = ref(props.skill?.license ?? 'mit')
const tools = ref<string[]>(props.skill?.tools ?? [])
const tagsText = ref((props.skill?.tags ?? []).map(t => t.name).join(', '))
const githubUrl = ref(props.skill?.github_url ?? '')
const version = ref(props.skill?.version ?? '1.0.0')
const changelog = ref('')
const requirements = ref(props.skill?.requirements ?? '')
const description = ref(props.skill?.description ?? '')
const content = ref(props.skill?.content ?? '')
const examples = ref<SkillExample[]>((props.skill?.examples ?? []).map(e => ({ ...e })))

const sending = ref(false)
const errors = ref<string[]>([])
const notice = ref('')

const locked = computed(() => !!current.value && !['draft', 'rejected', 'published', 'archived'].includes(current.value.status))
const reopens = computed(() => current.value?.status === 'published')
const optionsReady = computed(() => !!options.value?.categories.length)
const valid = computed(() =>
  optionsReady.value && title.value.trim().length >= 5 && summary.value.trim().length >= 20 && !!category.value && content.value.trim().length > 0,
)
const limits = computed(() => options.value?.limits)

// ---- Asistente e importación: solo rellenan el formulario; la persona revisa y guarda ----
const LICENSES = ['mit', 'apache-2.0', 'gpl-3.0', 'cc-by-4.0', 'cc0-1.0']
function applyPatch(patch: Record<string, unknown>) {
  const set: Record<string, (v: any) => void> = {
    title: v => (title.value = v),
    summary: v => (summary.value = v),
    category: v => (category.value = v),
    resourceType: v => (resourceType.value = v),
    difficulty: v => (difficulty.value = v),
    language: v => (language.value = v),
    tools: v => (tools.value = [...v]),
    tags: v => (tagsText.value = [...v].join(', ')),
    requirements: v => (requirements.value = v),
    // Los casos de uso se anexan a la descripción completa, sin pisar lo que ya escribiste.
    useCases: v => (description.value = `${description.value ? `${description.value}\n\n` : ''}## Casos de uso\n${(v as string[]).map(u => `- ${u}`).join('\n')}`),
  }
  Object.entries(patch).forEach(([k, v]) => set[k]?.(v))
}
function importFromGithub(p: SkillGithubPreview) {
  title.value = title.value || p.title
  summary.value = summary.value || p.summary || ''
  content.value = p.content
  if (p.tags.length)
    tagsText.value = p.tags.join(', ')
  if (p.license && LICENSES.includes(p.license))
    license.value = p.license
  githubUrl.value = p.repository
}

function toggleTool(t: string) {
  tools.value = tools.value.includes(t) ? tools.value.filter(x => x !== t) : [...tools.value, t]
}
function addExample() {
  if (examples.value.length < 10)
    examples.value.push({ title: '', use_case: '', instructions: '', input_example: '', output_example: '' })
}

function payload() {
  return {
    title: title.value.trim(),
    summary: summary.value.trim(),
    category: category.value,
    resource_type: resourceType.value,
    difficulty: difficulty.value,
    language: language.value,
    license: license.value,
    tools: tools.value,
    tags: tagsText.value.split(',').map(t => t.trim()).filter(Boolean),
    github_url: githubUrl.value.trim(),
    version: version.value.trim(),
    changelog: changelog.value.trim() || undefined,
    requirements: requirements.value,
    description: description.value,
    content: content.value,
    examples: examples.value.filter(e => e.title.trim()),
  }
}

async function save(): Promise<SkillManaged | null> {
  errors.value = []
  notice.value = ''
  try {
    const saved = editing.value || current.value
      ? await $api<SkillManaged>(`/skills/${current.value!.id}`, { method: 'PATCH', body: payload() })
      : await $api<SkillManaged>('/skills', { method: 'POST', body: payload() })
    current.value = saved
    return saved
  }
  catch (e: any) {
    errors.value = e?.data?.errors ?? [e?.data?.error ?? 'No pudimos guardar la skill. Inténtalo de nuevo.']
    return null
  }
}

async function saveDraft() {
  if (!valid.value || sending.value || locked.value)
    return
  sending.value = true
  const wasNew = !current.value
  const saved = await save()
  sending.value = false
  if (!saved)
    return
  notice.value = reopens.value || saved.status === 'pending_review' ? 'Guardado. Los cambios se revisarán antes de ser públicos.' : 'Borrador guardado.'
  if (wasNew)
    await navigateTo(`/skills/editar/${saved.id}`, { replace: true })
}

async function submitForReview() {
  if (!valid.value || sending.value || locked.value)
    return
  sending.value = true
  const saved = await save()
  if (saved && saved.status !== 'pending_review') {
    try {
      await $api(`/skills/${saved.id}/submit`, { method: 'POST' })
      await navigateTo('/skills/mis-skills')
    }
    catch (e: any) {
      errors.value = e?.data?.errors ?? ['No pudimos enviar la skill a revisión.']
    }
  }
  else if (saved) {
    await navigateTo('/skills/mis-skills')
  }
  sending.value = false
}

function onFiles(r: { files: SkillFile[], status: string }) {
  if (current.value) {
    current.value = { ...current.value, files: r.files, status: (r.status || current.value.status) as SkillManaged['status'] }
  }
}

const field = 'text-sm font-medium text-foreground'
</script>

<template>
  <form class="mt-8 space-y-10" @submit.prevent="saveDraft">
    <div v-if="optionsError" class="flex flex-wrap items-center justify-between gap-3 rounded-md border border-danger/30 bg-danger/[0.06] p-4 text-sm" role="alert">
      <p class="text-danger">
        No pudimos cargar las categorías y opciones del formulario. Sin ellas no se puede guardar la skill.
      </p>
      <button type="button" class="bt-btn-secondary" @click="refreshOptions()">
        Reintentar
      </button>
    </div>
    <p v-else-if="optionsStatus === 'pending' || optionsStatus === 'idle'" class="t-small" role="status">
      Cargando opciones del formulario…
    </p>

    <p v-if="current?.status === 'rejected' && current.rejection_reason" class="bt-surface border-danger/40 p-4 text-sm text-foreground-secondary" role="alert">
      <strong class="text-foreground">Rechazada:</strong> {{ current.rejection_reason }}. Corrige y vuelve a enviarla a revisión.
    </p>
    <p v-if="locked" class="bt-surface p-4 text-sm text-foreground-secondary" role="alert">
      Esta skill está {{ SKILL_STATUS_LABELS[current!.status].toLowerCase() }} y no se puede editar ahora.
    </p>
    <p v-else-if="reopens" class="bt-surface p-4 text-sm text-foreground-secondary" role="status">
      Esta skill ya es pública. Si cambias su contenido o archivos volverá a revisión y se despublicará hasta que se apruebe.
    </p>

    <fieldset :disabled="locked || sending" class="space-y-10">
      <!-- Atajos: importar y asistente -->
      <section class="space-y-4" aria-label="Atajos para completar la skill">
        <SkillsSkillGithubImport @import="importFromGithub" />
        <SkillsSkillAssistant :content="content" :title="title" :categories="options?.categories ?? []" @apply="applyPatch" />
      </section>

      <!-- Información general -->
      <section class="space-y-6" aria-labelledby="sec-general">
        <h2 id="sec-general" class="t-h3">
          Información general
        </h2>
        <div>
          <label for="s-title" :class="field">Título</label>
          <input id="s-title" v-model="title" class="bt-input mt-2" type="text" maxlength="120" placeholder="Ej. Revisión OWASP Top 10 de una aplicación web" required>
          <p class="t-small mt-1 font-mono">
            {{ title.length }}/120 · mínimo 5 · la URL se genera sola y no cambia después
          </p>
        </div>
        <div>
          <label for="s-summary" :class="field">Descripción corta</label>
          <textarea id="s-summary" v-model="summary" class="bt-input mt-2 !h-auto" rows="3" maxlength="280" placeholder="Qué hace y para quién es, en una o dos frases" required />
          <p class="t-small mt-1 font-mono">
            {{ summary.length }}/280 · mínimo 20
          </p>
        </div>
        <div class="grid gap-6 sm:grid-cols-2">
          <div>
            <label for="s-cat" :class="field">Categoría</label>
            <select id="s-cat" v-model="category" class="bt-input mt-2" required>
              <option value="" disabled>
                Elige una categoría
              </option>
              <option v-for="c in options?.categories" :key="c.id" :value="c.slug">
                {{ c.name }}
              </option>
            </select>
          </div>
          <div>
            <label for="s-tags" :class="field">Etiquetas</label>
            <input id="s-tags" v-model="tagsText" class="bt-input mt-2" type="text" placeholder="owasp, xss, burp (separadas por coma)">
            <p class="t-small mt-1 font-mono">
              Máximo {{ limits?.max_tags ?? 8 }}
            </p>
          </div>
        </div>
        <div class="grid gap-6 sm:grid-cols-3">
          <div>
            <label for="s-level" :class="field">Nivel técnico</label>
            <select id="s-level" v-model="difficulty" class="bt-input mt-2">
              <option v-for="d in options?.difficulties" :key="d" :value="d">
                {{ SKILL_DIFFICULTY_LABELS[d] }}
              </option>
            </select>
          </div>
          <div>
            <label for="s-lang" :class="field">Idioma</label>
            <select id="s-lang" v-model="language" class="bt-input mt-2">
              <option v-for="l in options?.languages" :key="l" :value="l">
                {{ SKILL_LANGUAGE_LABELS[l] ?? l }}
              </option>
            </select>
          </div>
          <div>
            <label for="s-license" :class="field">Licencia de uso</label>
            <select id="s-license" v-model="license" class="bt-input mt-2">
              <option v-for="l in options?.licenses" :key="l" :value="l">
                {{ SKILL_LICENSE_LABELS[l] ?? l }}
              </option>
            </select>
          </div>
        </div>
      </section>

      <!-- Tipo y compatibilidad -->
      <section class="space-y-6" aria-labelledby="sec-type">
        <h2 id="sec-type" class="t-h3">
          Tipo y compatibilidad
        </h2>
        <div role="group" aria-label="Tipo de recurso" class="flex flex-wrap gap-2">
          <button v-for="t in options?.resource_types" :key="t" type="button" class="bt-chip h-9" :aria-pressed="resourceType === t" @click="resourceType = t">
            {{ SKILL_TYPE_LABELS[t] }}
          </button>
        </div>
        <div role="group" aria-label="Herramientas compatibles">
          <p :class="field">
            Funciona con
          </p>
          <div class="mt-2 flex flex-wrap gap-2">
            <button v-for="t in options?.tools" :key="t" type="button" class="bt-chip h-9" :aria-pressed="tools.includes(t)" @click="toggleTool(t)">
              {{ SKILL_TOOL_LABELS[t] }}
            </button>
          </div>
          <p class="t-small mt-1">
            Si no eliges ninguna se marca como Universal.
          </p>
        </div>
      </section>

      <!-- Contenido -->
      <section class="space-y-6" aria-labelledby="sec-content">
        <h2 id="sec-content" class="t-h3">
          Contenido
        </h2>
        <div>
          <label for="s-content" :class="field">Contenido de la skill (Markdown)</label>
          <div class="mt-2">
            <MarkdownEditor id="s-content" v-model="content" :rows="18" :maxlength="limits?.max_content ?? 100000" preview-url="/skills/preview" placeholder="# Nombre de la skill&#10;&#10;Instrucciones, prompt o configuración completa…" />
          </div>
          <p class="t-small mt-1 font-mono">
            {{ content.length }}/{{ limits?.max_content ?? 100000 }} · bloques de código, tablas, listas, enlaces e imágenes https
          </p>
          <SkillsSkillDuplicates class="mt-3" :title="title" :content="content" :category="category" :skill-id="current?.id" />
          <p v-if="current?.scan?.length" class="mt-2 font-mono text-xs text-warning" role="status">
            Detectamos: {{ current.scan.map(s => s.label).join(', ') }}. {{ current.scan.some(s => s.blocking) ? 'Quita las credenciales antes de enviarla.' : 'Un moderador lo revisará.' }}
          </p>
        </div>
        <div>
          <label for="s-desc" :class="field">Descripción completa <span class="font-normal text-foreground-muted">(opcional)</span></label>
          <div class="mt-2">
            <MarkdownEditor id="s-desc" v-model="description" :rows="8" :maxlength="20000" preview-url="/skills/preview" placeholder="Objetivos, contexto y casos de uso" />
          </div>
        </div>
        <div>
          <label for="s-req" :class="field">Requisitos <span class="font-normal text-foreground-muted">(opcional)</span></label>
          <textarea id="s-req" v-model="requirements" class="bt-input mt-2 !h-auto" rows="3" maxlength="5000" placeholder="Herramientas, permisos o conocimientos previos" />
        </div>
      </section>

      <!-- Ejemplos -->
      <section class="space-y-4" aria-labelledby="sec-examples">
        <div class="flex items-center justify-between gap-3">
          <h2 id="sec-examples" class="t-h3">
            Ejemplos de uso
          </h2>
          <button type="button" class="bt-btn-secondary" :disabled="examples.length >= 10" @click="addExample">
            <Icon name="lucide:plus" class="size-4" /> Agregar ejemplo
          </button>
        </div>
        <p v-if="!examples.length" class="t-small">
          Un buen ejemplo (entrada y salida esperada) hace que más personas la usen.
        </p>
        <div v-for="(e, i) in examples" :key="i" class="bt-surface space-y-3 p-4">
          <div class="flex items-center gap-3">
            <input v-model="e.title" class="bt-input" type="text" maxlength="120" :aria-label="`Título del ejemplo ${i + 1}`" placeholder="Título del ejemplo">
            <button type="button" class="bt-icon-btn" :aria-label="`Quitar ejemplo ${i + 1}`" @click="examples.splice(i, 1)">
              <Icon name="lucide:trash-2" class="size-4" />
            </button>
          </div>
          <textarea v-model="e.use_case" class="bt-input !h-auto" rows="2" maxlength="5000" aria-label="Caso de uso" placeholder="Caso de uso" />
          <textarea v-model="e.instructions" class="bt-input !h-auto" rows="2" maxlength="5000" aria-label="Instrucciones" placeholder="Instrucciones" />
          <div class="grid gap-3 md:grid-cols-2">
            <textarea v-model="e.input_example" class="bt-input !h-auto font-mono" rows="4" maxlength="5000" aria-label="Ejemplo de entrada" placeholder="Ejemplo de entrada" />
            <textarea v-model="e.output_example" class="bt-input !h-auto font-mono" rows="4" maxlength="5000" aria-label="Salida esperada" placeholder="Salida esperada" />
          </div>
        </div>
      </section>

      <!-- Versión y repositorio -->
      <section class="space-y-6" aria-labelledby="sec-version">
        <h2 id="sec-version" class="t-h3">
          Versión y repositorio
        </h2>
        <div class="grid gap-6 sm:grid-cols-2">
          <div>
            <label for="s-version" :class="field">Versión</label>
            <input id="s-version" v-model="version" class="bt-input mt-2 font-mono" type="text" pattern="\d{1,3}\.\d{1,3}\.\d{1,3}" placeholder="1.0.0">
          </div>
          <div>
            <label for="s-github" :class="field">Repositorio público de GitHub <span class="font-normal text-foreground-muted">(opcional)</span></label>
            <input id="s-github" v-model="githubUrl" class="bt-input mt-2" type="url" placeholder="https://github.com/usuario/repo">
          </div>
        </div>
        <div v-if="editing">
          <label for="s-changelog" :class="field">Notas de la versión <span class="font-normal text-foreground-muted">(opcional)</span></label>
          <textarea id="s-changelog" v-model="changelog" class="bt-input mt-2 !h-auto" rows="2" maxlength="2000" placeholder="Qué cambió respecto a la versión anterior" />
        </div>
      </section>
    </fieldset>

    <!-- Archivos -->
    <section class="space-y-4" aria-labelledby="sec-files">
      <h2 id="sec-files" class="t-h3">
        Archivos
      </h2>
      <SkillsSkillFileUploader v-if="current && limits" :skill-id="current.id" :files="current.files" :limits="limits" :disabled="locked" @changed="onFiles" />
      <p v-else class="t-small">
        Guarda el borrador para poder adjuntar archivos (SKILL.md, JSON, YAML o un paquete ZIP).
      </p>
    </section>

    <div v-if="errors.length" class="rounded-md border border-danger/30 bg-danger/[0.06] p-4 text-sm text-danger" role="alert">
      <ul class="list-disc space-y-1 pl-5">
        <li v-for="e in errors" :key="e">
          {{ e }}
        </li>
      </ul>
    </div>
    <p v-if="notice" class="font-mono text-xs text-success" role="status">
      {{ notice }}
    </p>

    <div class="flex flex-wrap items-center gap-3 border-t border-subtle pt-6">
      <button type="submit" class="bt-btn-secondary" :disabled="!valid || sending || locked" :aria-busy="sending">
        Guardar borrador
      </button>
      <button type="button" class="bt-btn-primary" :disabled="!valid || sending || locked || current?.status === 'pending_review'" @click="submitForReview">
        Enviar a revisión
      </button>
      <NuxtLink to="/skills/mis-skills" class="bt-btn-ghost">
        Volver
      </NuxtLink>
    </div>
    <p class="t-small">
      Toda skill la revisa un moderador antes de publicarse. Comparte solo contenido que puedas licenciar y evita incluir credenciales o datos de terceros.
    </p>
  </form>
</template>
