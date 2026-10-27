<script setup lang="ts">
import type { SkillLibraryDetail } from '~/interfaces/skills'
import PageHeader from '~/components/common/PageHeader.vue'

// Ficha de la skill dentro de la plataforma. La ficha indexable vive en el sitio público (canonical).
definePageMeta({ layout: 'custom', auth: true })

const { $api } = useNuxtApp()
const route = useRoute()
const landingUrl = useLandingUrl()
const apiBase = String(useRuntimeConfig().public.apiBaseUrl)
const slug = String(route.params.slug)

const { data, error } = await useAPI<SkillLibraryDetail>(`/public/skills/${encodeURIComponent(slug)}`, { key: `app-skill-${slug}` })
if (error.value || !data.value)
  throw createError({ statusCode: 404, statusMessage: 'Skill no encontrada', fatal: true })
const skill = computed(() => data.value!)
useSeoMeta({ title: () => skill.value.title, robots: 'noindex, nofollow' })

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'skill', label: 'Skill' },
  { id: 'examples', label: 'Examples' },
  { id: 'versions', label: 'Versions' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'install', label: 'Instalación' },
] as const
type TabId = (typeof TABS)[number]['id']
const tab = ref<TabId>('overview')
const tabs = computed(() => TABS.filter(t => t.id !== 'examples' || skill.value.examples.length))

const feedback = ref<{ reportSkill: () => void } | null>(null)
const saved = ref(false)
const busy = ref(false)
const copied = ref<'content' | 'link' | null>(null)
let copiedTimer: ReturnType<typeof setTimeout>

onMounted(async () => {
  const hash = route.hash.replace('#', '') as TabId
  if (tabs.value.some(t => t.id === hash))
    tab.value = hash
  // Llegada desde "Reportar contenido" del sitio público: abre la pestaña de comunidad y el formulario.
  if (route.query.reportar) {
    tab.value = 'reviews'
    nextTick(() => setTimeout(() => feedback.value?.reportSkill(), 400))
  }
  $fetch(`/public/skills/${encodeURIComponent(slug)}/view`, { baseURL: apiBase, method: 'POST' }).catch(() => {})
  try {
    const r = await $api<{ data: { id: number }[] }>('/skills/saved')
    saved.value = r.data.some(s => s.id === skill.value.id)
  }
  catch { /* sin estado inicial: el botón sigue funcionando */ }
})
onBeforeUnmount(() => clearTimeout(copiedTimer))

async function toggleSave() {
  busy.value = true
  try {
    saved.value = (await $api<{ bookmarked: boolean }>(`/bookmarks/skill/${skill.value.id}`, { method: 'POST' })).bookmarked
  }
  finally {
    busy.value = false
  }
}
async function copy(what: 'content' | 'link') {
  try {
    await navigator.clipboard.writeText(what === 'content' ? skill.value.content : landingUrl(`/skills/${slug}`))
    copied.value = what
    clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => (copied.value = null), 2000)
  }
  catch { /* el contenido sigue visible en la pestaña Skill */ }
}

const hasPackage = computed(() => skill.value.files.some(f => f.content_type === 'application/zip'))
const downloadUrl = computed(() => `${apiBase}/public/skills/${encodeURIComponent(slug)}/download`)
const prose = 'prose prose-invert max-w-none break-words prose-pre:font-mono prose-code:font-mono prose-a:text-primary-text'
</script>

<template>
  <div class="mx-auto w-full max-w-[1100px] space-y-6 px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <nav aria-label="Migas de pan" class="t-small">
      <NuxtLink to="/skills" class="hover:text-foreground">
        Skills
      </NuxtLink>
      <span aria-hidden="true"> / </span>
      <NuxtLink :to="{ path: '/skills', query: { categoria: skill.category.slug } }" class="hover:text-foreground">
        {{ skill.category.name }}
      </NuxtLink>
    </nav>

    <PageHeader :title="skill.title">
      {{ skill.category.name }} · {{ SKILL_TYPE_LABELS[skill.resource_type] }} · {{ SKILL_DIFFICULTY_LABELS[skill.difficulty] }} · por {{ skill.author.display_name }} · v{{ skill.version }}
    </PageHeader>

    <p class="t-body max-w-3xl">
      {{ skill.summary }}
    </p>

    <ul class="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-foreground-muted">
      <li><time :datetime="skill.published_at ?? undefined">{{ formatSkillDate(skill.published_at) }}</time></li>
      <li>{{ compactNumber(skill.downloads_count) }} descargas</li>
      <li>{{ compactNumber(skill.favorites_count) }} guardadas</li>
      <li v-if="skill.rating.count">
        ★ {{ skill.rating.average }} ({{ skill.rating.count }})
      </li>
      <li v-for="t in skill.tools" :key="t" class="rounded border border-subtle px-1.5 py-0.5">
        {{ SKILL_TOOL_LABELS[t] }}
      </li>
    </ul>

    <div class="flex flex-wrap gap-2">
      <button type="button" class="bt-btn-primary" @click="copy('content')">
        <Icon :name="copied === 'content' ? 'lucide:check' : 'lucide:copy'" class="size-4" /> {{ copied === 'content' ? 'Copiado' : 'Copiar contenido' }}
      </button>
      <a :href="downloadUrl" class="bt-btn-secondary" rel="nofollow">
        <Icon name="lucide:download" class="size-4" /> Descargar{{ hasPackage ? ' paquete' : '' }}
      </a>
      <button type="button" class="bt-btn-secondary" :disabled="busy" :aria-pressed="saved" @click="toggleSave">
        <Icon :name="saved ? 'lucide:bookmark-check' : 'lucide:bookmark'" class="size-4" /> {{ saved ? 'Guardada' : 'Guardar' }}
      </button>
      <button type="button" class="bt-btn-ghost" @click="copy('link')">
        <Icon :name="copied === 'link' ? 'lucide:check' : 'lucide:link'" class="size-4" /> {{ copied === 'link' ? 'Enlace copiado' : 'Copiar enlace' }}
      </button>
      <button type="button" class="bt-btn-ghost" @click="tab = 'reviews'; $nextTick(() => feedback?.reportSkill())">
        <Icon name="lucide:flag" class="size-4" /> Reportar
      </button>
    </div>

    <div class="flex gap-1 overflow-x-auto border-b border-subtle" role="tablist" aria-label="Secciones de la skill">
      <button
        v-for="t in tabs"
        :id="`tab-${t.id}`"
        :key="t.id"
        type="button"
        role="tab"
        :aria-selected="tab === t.id"
        :aria-controls="`panel-${t.id}`"
        class="bt-focus whitespace-nowrap border-b-2 px-4 py-2.5 text-sm transition-colors"
        :class="tab === t.id ? 'border-primary text-foreground' : 'border-transparent text-foreground-muted hover:text-foreground'"
        @click="tab = t.id"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- HTML saneado por el servidor (Skills::Renderer): único origen de v-html en esta página. -->
    <section id="panel-overview" role="tabpanel" aria-labelledby="tab-overview" :hidden="tab !== 'overview'" class="space-y-8">
      <!-- eslint-disable vue/no-v-html -->
      <div v-if="skill.description_html" :class="prose" v-html="skill.description_html" />
      <p v-else class="t-body">
        {{ skill.summary }}
      </p>
      <div v-if="skill.requirements_html">
        <h2 class="t-h3">
          Requisitos
        </h2>
        <div class="mt-2" :class="prose" v-html="skill.requirements_html" />
      </div>
      <!-- eslint-enable vue/no-v-html -->
      <dl class="grid gap-4 border-t border-subtle pt-5 text-sm sm:grid-cols-3">
        <div>
          <dt class="t-small">
            Licencia
          </dt>
          <dd class="text-foreground">
            {{ SKILL_LICENSE_LABELS[skill.license] ?? skill.license }}
          </dd>
        </div>
        <div v-if="skill.tags.length">
          <dt class="t-small">
            Etiquetas
          </dt>
          <dd class="text-foreground">
            {{ skill.tags.map(t => t.name).join(', ') }}
          </dd>
        </div>
        <div v-if="skill.github_url">
          <dt class="t-small">
            Repositorio
          </dt>
          <dd><a :href="skill.github_url" target="_blank" rel="noopener noreferrer nofollow" class="text-primary-text hover:underline">GitHub ↗</a></dd>
        </div>
      </dl>
    </section>

    <section id="panel-skill" role="tabpanel" aria-labelledby="tab-skill" :hidden="tab !== 'skill'">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="bt-surface p-5" :class="prose" v-html="skill.content_html" />
    </section>

    <section v-if="skill.examples.length" id="panel-examples" role="tabpanel" aria-labelledby="tab-examples" :hidden="tab !== 'examples'" class="space-y-8">
      <div v-for="(e, i) in skill.examples" :key="i" class="space-y-3">
        <h2 class="t-h3">
          {{ e.title }}
        </h2>
        <p v-if="e.use_case" class="t-body">
          {{ e.use_case }}
        </p>
        <p v-if="e.instructions" class="t-body whitespace-pre-line">
          {{ e.instructions }}
        </p>
        <div class="grid gap-3 md:grid-cols-2">
          <div v-if="e.input_example">
            <p class="t-small mb-1">
              Entrada
            </p>
            <pre class="bt-surface overflow-x-auto p-3 font-mono text-xs text-foreground-secondary"><code>{{ e.input_example }}</code></pre>
          </div>
          <div v-if="e.output_example">
            <p class="t-small mb-1">
              Salida esperada
            </p>
            <pre class="bt-surface overflow-x-auto p-3 font-mono text-xs text-foreground-secondary"><code>{{ e.output_example }}</code></pre>
          </div>
        </div>
      </div>
    </section>

    <section id="panel-versions" role="tabpanel" aria-labelledby="tab-versions" :hidden="tab !== 'versions'">
      <ol class="space-y-4">
        <li v-for="v in skill.versions" :key="v.version" class="border-l-2 border-primary/60 pl-4">
          <p class="font-mono text-sm text-foreground">
            v{{ v.version }} <time class="ml-2 text-foreground-muted" :datetime="v.created_at">{{ formatSkillDate(v.created_at) }}</time>
          </p>
          <p v-if="v.changelog" class="t-body mt-1">
            {{ v.changelog }}
          </p>
        </li>
      </ol>
    </section>

    <section id="panel-reviews" role="tabpanel" aria-labelledby="tab-reviews" :hidden="tab !== 'reviews'">
      <SkillsSkillFeedback ref="feedback" :slug="slug" />
    </section>

    <section id="panel-install" role="tabpanel" aria-labelledby="tab-install" :hidden="tab !== 'install'">
      <SkillsSkillInstallGuide :tools="skill.tools" :resource-type="skill.resource_type" :has-package="hasPackage" />
    </section>

    <section v-if="skill.related.length" class="space-y-4 pt-4" aria-label="Skills relacionadas">
      <h2 class="t-h3">
        Más de {{ skill.category.name }}
      </h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SkillsSkillCard v-for="r in skill.related" :key="r.slug" :skill="r" />
      </div>
    </section>
  </div>
</template>
