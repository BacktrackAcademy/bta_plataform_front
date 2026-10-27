<script setup lang="ts">
import type { SkillLibraryFilters, SkillLibraryPage } from '~/interfaces/skills'
import PageHeader from '~/components/common/PageHeader.vue'
import StateCard from '~/components/common/StateCard.vue'
import { Skeleton } from '~/components/ui/skeleton'

// Biblioteca de Backtrack Skills dentro de la plataforma (el sitio público indexable vive en la landing).
definePageMeta({ layout: 'custom', auth: true })
useSeoMeta({ title: 'Skills', robots: 'noindex, nofollow' })

const route = useRoute()
const router = useRouter()
const one = (v: unknown) => (Array.isArray(v) ? String(v[0] ?? '') : String(v ?? ''))

// Estado de la URL: se puede compartir y funciona con atrás/adelante.
const q = computed(() => one(route.query.q).slice(0, 100))
const category = computed(() => one(route.query.categoria))
const tipo = computed(() => one(route.query.tipo))
const herramienta = computed(() => one(route.query.herramienta))
const nivel = computed(() => one(route.query.nivel))
const orden = computed(() => one(route.query.orden) || 'recent')
const page = computed(() => Math.max(1, Number.parseInt(one(route.query.pagina)) || 1))
const hasFilters = computed(() => !!(q.value || category.value || tipo.value || herramienta.value || nivel.value || orden.value !== 'recent'))

function setQuery(patch: Record<string, string | undefined>) {
  const next: Record<string, string> = { ...route.query as Record<string, string> }
  delete next.pagina
  for (const [k, v] of Object.entries(patch)) {
    if (v)
      next[k] = v
    else delete next[k]
  }
  return router.push({ query: next })
}

const search = ref(q.value)
let timer: ReturnType<typeof setTimeout>
watch(search, (v) => {
  clearTimeout(timer)
  timer = setTimeout(() => v.trim() !== q.value && setQuery({ q: v.trim() }), 350)
})
watch(q, v => (search.value = v))
onBeforeUnmount(() => clearTimeout(timer))

const { data: filters } = useAPI<SkillLibraryFilters>('/public/skills/filters', { key: 'skills-lib-filters', lazy: true })
const { data, status, error, refresh } = useAPI<SkillLibraryPage>('/public/skills', {
  key: 'skills-lib-list',
  query: computed(() => ({
    per_page: 12,
    page: page.value,
    q: q.value || undefined,
    category: category.value || undefined,
    type: tipo.value || undefined,
    tool: herramienta.value || undefined,
    difficulty: nivel.value || undefined,
    sort: orden.value === 'recent' ? undefined : orden.value,
  })),
  lazy: true,
  watch: [q, category, tipo, herramienta, nivel, orden, page],
})

const loading = computed(() => status.value === 'pending' && !data.value)
const skills = computed(() => data.value?.data ?? [])
const pagination = computed(() => data.value?.pagination)
</script>

<template>
  <div class="mx-auto w-full max-w-[1200px] space-y-6 px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <PageHeader title="Skills IA">
      Prompts, skills y agentes para Claude, ChatGPT, Gemini, Cursor y Codex. Creados por hackers, para hackers.
      <template #actions>
        <div class="flex flex-wrap gap-2">
          <NuxtLink :to="{ path: '/guardados', query: { tipo: 'skill' } }" class="bt-btn-secondary">
            <Icon name="lucide:bookmark-check" class="size-4" /> Guardadas
          </NuxtLink>
          <NuxtLink to="/skills/nueva" class="bt-btn-primary">
            <Icon name="lucide:plus" class="size-4" /> Publicar una skill
          </NuxtLink>
        </div>
      </template>
    </PageHeader>

    <!-- Acceso rápido por herramienta de IA -->
    <section v-if="filters?.tools.length" class="flex flex-wrap items-center gap-2" aria-label="Funciona con">
      <span class="inline-flex items-center gap-1.5 font-mono text-xs text-foreground-muted">
        <Icon name="lucide:sparkles" class="size-4 text-primary-text" aria-hidden="true" /> Funciona con
      </span>
      <button type="button" class="bt-chip h-9" :aria-pressed="!herramienta" @click="setQuery({ herramienta: undefined })">
        Todas
      </button>
      <button v-for="t in filters.tools" :key="t" type="button" class="bt-chip h-9" :aria-pressed="herramienta === t" @click="setQuery({ herramienta: herramienta === t ? undefined : t })">
        {{ SKILL_TOOL_LABELS[t] }}
      </button>
    </section>

    <!-- Búsqueda y filtros -->
    <form class="space-y-3" role="search" aria-label="Buscar skills" @submit.prevent="setQuery({ q: search.trim() })">
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative min-w-[220px] flex-1">
          <Icon name="lucide:search" class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" aria-hidden="true" />
          <label for="sk-q" class="sr-only">Buscar skill</label>
          <input id="sk-q" v-model="search" type="search" autocomplete="off" placeholder="Buscar por nombre, contenido, etiqueta o autor…" class="bt-input pl-9">
        </div>
        <label class="sr-only" for="sk-tipo">Tipo de recurso</label>
        <select id="sk-tipo" class="bt-input !w-auto" :value="tipo" @change="setQuery({ tipo: ($event.target as HTMLSelectElement).value })">
          <option value="">
            Todos los tipos
          </option>
          <option v-for="t in filters?.resource_types" :key="t" :value="t">
            {{ SKILL_TYPE_LABELS[t] }}
          </option>
        </select>
        <label class="sr-only" for="sk-nivel">Nivel técnico</label>
        <select id="sk-nivel" class="bt-input !w-auto" :value="nivel" @change="setQuery({ nivel: ($event.target as HTMLSelectElement).value })">
          <option value="">
            Todos los niveles
          </option>
          <option v-for="d in filters?.difficulties" :key="d" :value="d">
            {{ SKILL_DIFFICULTY_LABELS[d] }}
          </option>
        </select>
        <label class="sr-only" for="sk-orden">Ordenar por</label>
        <select id="sk-orden" class="bt-input !w-auto" :value="orden" @change="setQuery({ orden: ($event.target as HTMLSelectElement).value === 'recent' ? undefined : ($event.target as HTMLSelectElement).value })">
          <option v-for="s in filters?.sorts" :key="s" :value="s">
            {{ SKILL_SORT_LABELS[s] }}
          </option>
        </select>
      </div>

      <div v-if="filters?.categories.length" class="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Categorías">
        <button type="button" class="bt-chip h-9" :aria-pressed="!category" @click="setQuery({ categoria: undefined })">
          Todas
        </button>
        <button v-for="c in filters.categories" :key="c.slug" type="button" class="bt-chip h-9" :aria-pressed="category === c.slug" @click="setQuery({ categoria: c.slug })">
          <Icon v-if="c.slug === 'ai-security'" name="lucide:sparkles" class="size-3.5 text-primary-text" aria-hidden="true" />
          {{ c.name }} <span class="font-mono text-xs text-foreground-subtle">{{ c.count }}</span>
        </button>
      </div>
    </form>

    <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-foreground-muted" aria-live="polite">
      <p>
        <span class="text-foreground">{{ pagination?.total_entries ?? 0 }}</span> {{ pagination?.total_entries === 1 ? 'skill' : 'skills' }}
      </p>
      <button v-if="hasFilters" type="button" class="text-primary-text hover:underline" @click="router.push({ query: {} })">
        Limpiar filtros
      </button>
    </div>

    <StateCard v-if="error" variant="error" title="No pudimos cargar la biblioteca" text="Revisa tu conexión e inténtalo de nuevo.">
      <button type="button" class="bt-btn-secondary" @click="refresh()">
        Reintentar
      </button>
    </StateCard>
    <div v-else-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      <Skeleton v-for="n in 6" :key="n" class="h-48 w-full" />
    </div>
    <StateCard
      v-else-if="!skills.length"
      :title="hasFilters ? 'Ninguna skill coincide con tu búsqueda' : 'Aún no hay skills publicadas'"
      :text="hasFilters ? 'Prueba con otros filtros.' : 'Sé la primera persona en compartir una con la comunidad.'"
    >
      <NuxtLink v-if="!hasFilters" to="/skills/nueva" class="bt-btn-primary">
        Publicar una skill
      </NuxtLink>
      <button v-else type="button" class="bt-btn-secondary" @click="router.push({ query: {} })">
        Limpiar filtros
      </button>
    </StateCard>
    <template v-else>
      <div class="grid gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3" :class="status === 'pending' && 'opacity-60'">
        <SkillsSkillCard v-for="s in skills" :key="s.slug" :skill="s" />
      </div>
      <div v-if="pagination && pagination.total_pages > 1" class="flex items-center justify-center gap-3">
        <button type="button" class="bt-btn-secondary" :disabled="page <= 1" @click="router.push({ query: { ...route.query, pagina: String(page - 1) } })">
          Anterior
        </button>
        <span class="font-mono text-sm text-foreground-muted">{{ page }} / {{ pagination.total_pages }}</span>
        <button type="button" class="bt-btn-secondary" :disabled="page >= pagination.total_pages" @click="router.push({ query: { ...route.query, pagina: String(page + 1) } })">
          Siguiente
        </button>
      </div>
    </template>
  </div>
</template>
