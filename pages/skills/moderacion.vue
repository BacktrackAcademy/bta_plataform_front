<script setup lang="ts">
import type { SkillListResponse, SkillReportRow, SkillStatus } from '~/interfaces/skills'
import PageHeader from '~/components/common/PageHeader.vue'
import StateCard from '~/components/common/StateCard.vue'

definePageMeta({ layout: 'custom', auth: true })
useSeoMeta({ title: 'Moderación de skills', robots: 'noindex, nofollow' })

const { $api } = useNuxtApp()
const { data: me, status: meStatus } = useAPI<{ role: string }>('/user/info', { lazy: true, server: false })
const isAdmin = computed(() => me.value?.role === 'admin')

type Tab = 'skills' | 'reports' | 'categories' | 'tags' | 'logs'
const tab = ref<Tab>('skills')
const status = ref<SkillStatus>('pending_review')
const search = ref('')
const query = ref('')
const page = ref(1)
const selected = ref<number | null>(null)

let timer: ReturnType<typeof setTimeout>
watch(search, (v) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    query.value = v.trim()
    page.value = 1
  }, 300)
})
watch(status, () => {
  page.value = 1
  selected.value = null
})

const { data: list, refresh } = useAPI<SkillListResponse>('/admin/skills', {
  query: computed(() => ({ status: status.value, q: query.value || undefined, page: page.value })),
  lazy: true,
  server: false,
  immediate: true,
})
const counts = computed(() => list.value?.counts ?? {})
const STATUSES: SkillStatus[] = ['pending_review', 'published', 'suspended', 'rejected', 'draft', 'archived']

// Denuncias
const reportStatus = ref<'open' | 'actioned' | 'dismissed'>('open')
const { data: reports, refresh: refreshReports } = useAPI<{ data: SkillReportRow[], counts: Record<string, number>, total_pages: number }>('/admin/skills/reports', {
  query: computed(() => ({ status: reportStatus.value })),
  lazy: true,
  server: false,
})
const reportNote = ref<Record<number, string>>({})
const reportError = ref('')
async function resolveReport(r: SkillReportRow, outcome: 'actioned' | 'dismissed', opts: { hide_comment?: boolean, suspend_skill?: boolean } = {}) {
  reportError.value = ''
  try {
    await $api(`/admin/skills/reports/${r.id}/resolve`, { method: 'POST', body: { outcome, note: reportNote.value[r.id]?.trim() || undefined, ...opts } })
    await refreshReports()
  }
  catch (e: any) {
    reportError.value = e?.data?.errors?.join(' ') ?? 'No pudimos resolver la denuncia.'
  }
}

// Categorías
const { data: cats, refresh: refreshCats } = useAPI<{ data: { id: number, name: string, slug: string, description: string | null, count: number }[] }>('/admin/skills/categories', { lazy: true, server: false })
const newCat = ref('')
const catError = ref('')
async function addCategory() {
  if (!newCat.value.trim())
    return
  catError.value = ''
  try {
    await $api('/admin/skills/categories', { method: 'POST', body: { name: newCat.value.trim() } })
    newCat.value = ''
    await refreshCats()
  }
  catch (e: any) {
    catError.value = e?.data?.errors?.join(' ') ?? 'No pudimos crear la categoría.'
  }
}
async function renameCategory(c: { id: number, name: string }) {
  // eslint-disable-next-line no-alert
  const name = prompt('Nuevo nombre de la categoría', c.name)?.trim()
  if (!name || name === c.name)
    return
  try {
    await $api(`/admin/skills/categories/${c.id}`, { method: 'PATCH', body: { name } })
    await refreshCats()
  }
  catch (e: any) {
    catError.value = e?.data?.errors?.join(' ') ?? 'No pudimos renombrar la categoría.'
  }
}
async function removeCategory(c: { id: number, name: string }) {
  // eslint-disable-next-line no-alert
  if (!confirm(`¿Eliminar la categoría "${c.name}"?`))
    return
  catError.value = ''
  try {
    await $api(`/admin/skills/categories/${c.id}`, { method: 'DELETE' })
    await refreshCats()
  }
  catch (e: any) {
    catError.value = e?.data?.errors?.join(' ') ?? 'No pudimos eliminar la categoría.'
  }
}

// Etiquetas
const { data: tags, refresh: refreshTags } = useAPI<{ data: { id: number, name: string, count: number }[] }>('/admin/skills/tags', { lazy: true, server: false })
async function removeTag(t: { id: number, name: string }) {
  // eslint-disable-next-line no-alert
  if (!confirm(`¿Eliminar la etiqueta "${t.name}" de todas las skills?`))
    return
  await $api(`/admin/skills/tags/${t.id}`, { method: 'DELETE' })
  await refreshTags()
}

// Bitácora
const { data: logs } = useAPI<{ data: { id: number, action: string, note: string | null, actor: string, created_at: string, skill: { title: string } }[] }>('/admin/skills/logs', { lazy: true, server: false })

const tabs: { key: Tab, label: string }[] = [
  { key: 'skills', label: 'Skills' },
  { key: 'reports', label: 'Denuncias' },
  { key: 'categories', label: 'Categorías' },
  { key: 'tags', label: 'Etiquetas' },
  { key: 'logs', label: 'Bitácora' },
]
</script>

<template>
  <div class="mx-auto w-full max-w-[1280px] space-y-6 px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <PageHeader title="Moderación de skills">
      Revisa, aprueba o rechaza publicaciones y administra categorías y etiquetas.
    </PageHeader>

    <StateCard v-if="meStatus !== 'pending' && !isAdmin" variant="error" title="Solo para administradores" text="No tienes permiso para moderar skills." />

    <template v-else-if="isAdmin">
      <div class="flex flex-wrap gap-2" role="tablist">
        <button v-for="t in tabs" :key="t.key" type="button" role="tab" class="bt-chip" :aria-selected="tab === t.key" :aria-pressed="tab === t.key" @click="tab = t.key">
          {{ t.label }}
        </button>
      </div>

      <div v-if="tab === 'skills'" class="space-y-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex flex-wrap gap-2" role="group" aria-label="Estado">
            <button v-for="s in STATUSES" :key="s" type="button" class="bt-chip" :aria-pressed="status === s" @click="status = s">
              {{ SKILL_STATUS_LABELS[s] }} <span class="font-mono text-foreground-subtle">{{ counts[s] ?? 0 }}</span>
            </button>
          </div>
          <input v-model="search" type="search" class="bt-input sm:max-w-xs" placeholder="Buscar por título…" aria-label="Buscar skills">
        </div>

        <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div>
            <p v-if="!list?.data.length" class="bt-surface p-6 text-center text-sm text-foreground-secondary">
              No hay skills en este estado.
            </p>
            <ul v-else class="bt-surface divide-y divide-subtle">
              <li v-for="s in list.data" :key="s.id">
                <button type="button" class="w-full px-4 py-3 text-left transition-colors hover:bg-surface-2" :class="selected === s.id && 'bg-surface-3'" :aria-current="selected === s.id" @click="selected = s.id">
                  <p class="line-clamp-1 font-medium text-foreground">
                    {{ s.title }}
                  </p>
                  <p class="t-small">
                    {{ s.category.name }} · {{ s.author?.name }} · {{ formatSkillDate(s.updated_at) }}
                  </p>
                </button>
              </li>
            </ul>
            <div v-if="list && list.total_pages > 1" class="mt-4 flex items-center justify-center gap-3">
              <button type="button" class="bt-btn-secondary" :disabled="page <= 1" @click="page--">
                Anterior
              </button>
              <span class="font-mono text-sm text-foreground-muted">{{ page }} / {{ list.total_pages }}</span>
              <button type="button" class="bt-btn-secondary" :disabled="page >= list.total_pages" @click="page++">
                Siguiente
              </button>
            </div>
          </div>
          <div>
            <SkillsSkillModerationDetail v-if="selected" :id="selected" @changed="refresh()" />
            <p v-else class="bt-surface p-6 text-sm text-foreground-secondary">
              Elige una skill de la lista para revisarla.
            </p>
          </div>
        </div>
      </div>

      <section v-else-if="tab === 'reports'" class="space-y-4">
        <div class="flex flex-wrap gap-2" role="group" aria-label="Estado de las denuncias">
          <button v-for="s in (['open', 'actioned', 'dismissed'] as const)" :key="s" type="button" class="bt-chip" :aria-pressed="reportStatus === s" @click="reportStatus = s">
            {{ { open: 'Abiertas', actioned: 'Atendidas', dismissed: 'Descartadas' }[s] }} <span class="font-mono text-foreground-subtle">{{ reports?.counts?.[s] ?? 0 }}</span>
          </button>
        </div>
        <p v-if="reportError" class="font-mono text-xs text-danger" role="alert">
          {{ reportError }}
        </p>
        <p v-if="!reports?.data.length" class="bt-surface p-6 text-sm text-foreground-secondary">
          No hay denuncias en este estado.
        </p>
        <ul v-else class="space-y-3">
          <li v-for="r in reports.data" :key="r.id" class="bt-surface space-y-3 p-4">
            <p class="t-small">
              {{ SKILL_REPORT_REASONS[r.reason] ?? r.reason }} · por {{ r.reporter }} · {{ formatSkillDate(r.created_at) }}
            </p>
            <p class="text-sm text-foreground">
              Skill: <strong class="font-medium">{{ r.skill.title }}</strong> <SkillsSkillStatusBadge :status="r.skill.status" />
            </p>
            <blockquote v-if="r.comment" class="whitespace-pre-line break-words border-l-2 border-border pl-3 text-sm text-foreground-secondary">
              {{ r.comment.content }}
            </blockquote>
            <p v-if="r.details" class="text-sm text-foreground-secondary">
              “{{ r.details }}”
            </p>
            <template v-if="r.status === 'open'">
              <input v-model="reportNote[r.id]" class="bt-input" type="text" maxlength="1000" placeholder="Nota de resolución (opcional; obligatoria si suspendes)" :aria-label="`Nota para la denuncia ${r.id}`">
              <div class="flex flex-wrap gap-2">
                <button v-if="r.comment" type="button" class="bt-btn-primary" @click="resolveReport(r, 'actioned', { hide_comment: true })">
                  Ocultar comentario
                </button>
                <button v-if="r.skill.status === 'published'" type="button" class="bt-btn-secondary" @click="resolveReport(r, 'actioned', { suspend_skill: true })">
                  Suspender skill
                </button>
                <button type="button" class="bt-btn-ghost" @click="resolveReport(r, 'dismissed')">
                  Descartar
                </button>
              </div>
            </template>
            <p v-else-if="r.resolution_note" class="t-small">
              Resolución: {{ r.resolution_note }}
            </p>
          </li>
        </ul>
      </section>

      <section v-else-if="tab === 'categories'" class="space-y-4">
        <form class="flex max-w-md gap-2" @submit.prevent="addCategory">
          <input v-model="newCat" class="bt-input" type="text" maxlength="60" placeholder="Nueva categoría" aria-label="Nombre de la categoría">
          <button type="submit" class="bt-btn-primary">
            Agregar
          </button>
        </form>
        <p v-if="catError" class="font-mono text-xs text-danger" role="alert">
          {{ catError }}
        </p>
        <ul class="bt-surface divide-y divide-subtle">
          <li v-for="c in cats?.data" :key="c.id" class="flex items-center gap-3 px-4 py-3 text-sm">
            <span class="flex-1 text-foreground">{{ c.name }} <span class="font-mono text-xs text-foreground-muted">/{{ c.slug }}</span></span>
            <span class="font-mono text-xs text-foreground-muted">{{ c.count }} skills</span>
            <button type="button" class="bt-btn-ghost !h-8" @click="renameCategory(c)">
              Renombrar
            </button>
            <button type="button" class="bt-btn-ghost !h-8 text-danger" @click="removeCategory(c)">
              Eliminar
            </button>
          </li>
        </ul>
      </section>

      <section v-else-if="tab === 'tags'">
        <p v-if="!tags?.data.length" class="bt-surface p-6 text-sm text-foreground-secondary">
          Aún no hay etiquetas.
        </p>
        <ul v-else class="bt-surface divide-y divide-subtle">
          <li v-for="t in tags.data" :key="t.id" class="flex items-center gap-3 px-4 py-2.5 text-sm">
            <span class="flex-1 text-foreground">{{ t.name }}</span>
            <span class="font-mono text-xs text-foreground-muted">{{ t.count }}</span>
            <button type="button" class="bt-btn-ghost !h-8 text-danger" @click="removeTag(t)">
              Eliminar
            </button>
          </li>
        </ul>
      </section>

      <section v-else>
        <p v-if="!logs?.data.length" class="bt-surface p-6 text-sm text-foreground-secondary">
          Sin acciones registradas.
        </p>
        <ul v-else class="bt-surface divide-y divide-subtle text-sm">
          <li v-for="l in logs.data" :key="l.id" class="px-4 py-2.5">
            <span class="font-mono text-xs text-foreground-muted">{{ formatSkillDate(l.created_at) }}</span>
            · {{ l.actor }} · <strong class="font-medium">{{ l.action }}</strong> · {{ l.skill.title }}<span v-if="l.note" class="text-foreground-muted"> — {{ l.note }}</span>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
