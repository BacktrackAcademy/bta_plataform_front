<script setup lang="ts">
import type { SkillListResponse, SkillRow, SkillStatus } from '~/interfaces/skills'
import PageHeader from '~/components/common/PageHeader.vue'
import StateCard from '~/components/common/StateCard.vue'
import { Skeleton } from '~/components/ui/skeleton'

definePageMeta({ layout: 'custom', auth: true })
useSeoMeta({ title: 'Mis skills', robots: 'noindex, nofollow' })

const { $api } = useNuxtApp()
const { data: me } = useAPI<{ role: string }>('/user/info', { lazy: true, server: false })
const isAdmin = computed(() => me.value?.role === 'admin')

type Filter = 'all' | SkillStatus
const filter = ref<Filter>('all')
const page = ref(1)
const busyId = ref<number | null>(null)
const error = ref('')

const { data, status, refresh } = useAPI<SkillListResponse>('/skills', {
  query: computed(() => ({ page: page.value, per_page: 15, status: filter.value === 'all' ? undefined : filter.value })),
  lazy: true,
  server: false,
})
watch(filter, () => (page.value = 1))

const loading = computed(() => status.value === 'pending' && !data.value)
const by = computed(() => data.value?.totals?.by_status ?? {})
const total = computed(() => Object.values(by.value).reduce((a, b) => a + (b ?? 0), 0))
const tabs = computed(() => [
  { value: 'all' as Filter, label: 'Todas', count: total.value },
  ...(['published', 'draft', 'pending_review', 'rejected', 'archived', 'suspended'] as SkillStatus[])
    .filter(s => by.value[s])
    .map(s => ({ value: s as Filter, label: SKILL_STATUS_LABELS[s], count: by.value[s] ?? 0 })),
])
const stats = computed(() => [
  { label: 'Publicadas', value: by.value.published ?? 0 },
  { label: 'Borradores', value: by.value.draft ?? 0 },
  { label: 'Visualizaciones', value: data.value?.totals?.views ?? 0 },
  { label: 'Descargas', value: data.value?.totals?.downloads ?? 0 },
  { label: 'Favoritos', value: data.value?.totals?.favorites ?? 0 },
  { label: 'Valoración', value: data.value?.totals?.rating_average ?? '—' },
])

async function act(s: SkillRow, action: 'submit' | 'archive' | 'unarchive' | 'delete') {
  const msgs: Record<string, string> = {
    submit: `¿Enviar "${s.title}" a revisión?`,
    archive: `¿Archivar "${s.title}"? Dejará de ser pública.`,
    unarchive: `¿Devolver "${s.title}" a borrador?`,
    delete: `¿Eliminar "${s.title}" definitivamente? No se puede deshacer.`,
  }
  // eslint-disable-next-line no-alert
  if (!confirm(msgs[action]))
    return
  busyId.value = s.id
  error.value = ''
  try {
    if (action === 'delete')
      await $api(`/skills/${s.id}`, { method: 'DELETE' })
    else
      await $api(`/skills/${s.id}/${action}`, { method: 'POST' })
    await refresh()
  }
  catch (e: any) {
    error.value = e?.data?.errors?.join(' ') ?? 'No pudimos completar la acción.'
  }
  finally {
    busyId.value = null
  }
}

const canSubmit = (s: SkillRow) => ['draft', 'rejected', 'archived'].includes(s.status)
const canDelete = (s: SkillRow) => ['draft', 'rejected', 'archived'].includes(s.status)
const canEdit = (s: SkillRow) => !['pending_review', 'suspended'].includes(s.status)
</script>

<template>
  <div class="mx-auto w-full max-w-[1200px] space-y-6 px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <PageHeader title="Mis skills">
      Tus publicaciones en Backtrack Skills y su estado de revisión.
      <template #actions>
        <div class="flex flex-wrap gap-2">
          <NuxtLink v-if="isAdmin" to="/skills/moderacion" class="bt-btn-secondary">
            <Icon name="lucide:shield-check" class="size-4" /> Moderación
          </NuxtLink>
          <NuxtLink to="/skills/nueva" class="bt-btn-primary">
            <Icon name="lucide:plus" class="size-4" /> Nueva skill
          </NuxtLink>
        </div>
      </template>
    </PageHeader>

    <dl class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <div v-for="s in stats" :key="s.label" class="bt-surface px-4 py-3">
        <dt class="t-small">
          {{ s.label }}
        </dt>
        <dd class="font-mono text-2xl text-foreground">
          {{ s.value }}
        </dd>
      </div>
    </dl>

    <div class="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
      <button v-for="t in tabs" :key="t.value" type="button" class="bt-chip" :aria-pressed="filter === t.value" @click="filter = t.value">
        {{ t.label }} <span class="font-mono text-foreground-subtle">{{ t.count }}</span>
      </button>
    </div>

    <p v-if="error" class="font-mono text-xs text-danger" role="alert">
      {{ error }}
    </p>

    <div v-if="loading" class="space-y-2">
      <Skeleton v-for="i in 5" :key="i" class="h-16 w-full" />
    </div>
    <StateCard v-else-if="status === 'error'" variant="error" title="No pudimos cargar tus skills">
      <button type="button" class="bt-btn-secondary" @click="refresh()">
        Reintentar
      </button>
    </StateCard>
    <StateCard v-else-if="!data?.data.length" title="Aún no tienes skills" text="Publica tu primera skill o prompt y compártela con la comunidad.">
      <NuxtLink to="/skills/nueva" class="bt-btn-primary">
        Publicar una skill
      </NuxtLink>
    </StateCard>

    <template v-else>
      <!-- Escritorio: tabla -->
      <div class="bt-surface hidden overflow-x-auto md:block">
        <table class="w-full min-w-[820px] text-left text-sm">
          <thead class="border-b border-subtle font-mono text-xs text-foreground-muted">
            <tr>
              <th class="px-4 py-3 font-normal">
                Título
              </th>
              <th class="px-4 py-3 font-normal">
                Estado
              </th>
              <th class="px-4 py-3 font-normal">
                Fecha
              </th>
              <th class="px-4 py-3 text-right font-normal">
                Vistas
              </th>
              <th class="px-4 py-3 text-right font-normal">
                Descargas
              </th>
              <th class="px-4 py-3 text-right font-normal">
                Valoración
              </th>
              <th class="px-4 py-3 text-right font-normal">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-subtle">
            <tr v-for="s in data.data" :key="s.id" :class="busyId === s.id && 'opacity-60'">
              <td class="px-4 py-3">
                <p class="line-clamp-1 font-medium text-foreground">
                  {{ s.title }}
                </p>
                <p class="t-small">
                  {{ s.category.name }} · {{ SKILL_TYPE_LABELS[s.resource_type] }} · v{{ s.version }}
                </p>
                <p v-if="s.status === 'rejected' && s.rejection_reason" class="mt-1 text-xs text-danger">
                  {{ s.rejection_reason }}
                </p>
              </td>
              <td class="px-4 py-3">
                <SkillsSkillStatusBadge :status="s.status" />
              </td>
              <td class="px-4 py-3 font-mono text-xs text-foreground-muted">
                {{ formatSkillDate(s.published_at ?? s.created_at) }}
              </td>
              <td class="px-4 py-3 text-right font-mono">
                {{ s.views_count }}
              </td>
              <td class="px-4 py-3 text-right font-mono">
                {{ s.downloads_count }}
              </td>
              <td class="px-4 py-3 text-right font-mono">
                {{ s.rating.average ?? '—' }}
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap items-center justify-end gap-1.5">
                  <NuxtLink v-if="s.status === 'published'" :to="`/skills/${s.slug}`" class="bt-btn-ghost">
                    Ver
                  </NuxtLink>
                  <NuxtLink v-if="canEdit(s)" :to="`/skills/editar/${s.id}`" class="bt-btn-ghost">
                    Editar
                  </NuxtLink>
                  <button v-if="canSubmit(s)" type="button" class="bt-btn-secondary" :disabled="busyId === s.id" @click="act(s, 'submit')">
                    Enviar
                  </button>
                  <button v-if="s.status === 'published'" type="button" class="bt-btn-ghost" :disabled="busyId === s.id" @click="act(s, 'archive')">
                    Archivar
                  </button>
                  <button v-if="s.status === 'archived'" type="button" class="bt-btn-ghost" :disabled="busyId === s.id" @click="act(s, 'unarchive')">
                    A borrador
                  </button>
                  <button v-if="canDelete(s)" type="button" class="bt-btn-ghost text-danger" :disabled="busyId === s.id" @click="act(s, 'delete')">
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Móvil: tarjetas -->
      <ul class="space-y-3 md:hidden">
        <li v-for="s in data.data" :key="s.id" class="bt-surface space-y-3 p-4" :class="busyId === s.id && 'opacity-60'">
          <div class="flex items-start justify-between gap-3">
            <p class="font-medium text-foreground">
              {{ s.title }}
            </p>
            <SkillsSkillStatusBadge :status="s.status" />
          </div>
          <p class="t-small">
            {{ s.category.name }} · v{{ s.version }} · {{ formatSkillDate(s.published_at ?? s.created_at) }}
          </p>
          <p v-if="s.status === 'rejected' && s.rejection_reason" class="text-xs text-danger">
            {{ s.rejection_reason }}
          </p>
          <p class="font-mono text-xs text-foreground-muted">
            {{ s.views_count }} vistas · {{ s.downloads_count }} descargas · {{ s.favorites_count }} favoritos
          </p>
          <div class="flex flex-wrap gap-2">
            <NuxtLink v-if="canEdit(s)" :to="`/skills/editar/${s.id}`" class="bt-btn-secondary">
              Editar
            </NuxtLink>
            <button v-if="canSubmit(s)" type="button" class="bt-btn-secondary" @click="act(s, 'submit')">
              Enviar
            </button>
            <button v-if="s.status === 'published'" type="button" class="bt-btn-ghost" @click="act(s, 'archive')">
              Archivar
            </button>
            <button v-if="canDelete(s)" type="button" class="bt-btn-ghost text-danger" @click="act(s, 'delete')">
              Eliminar
            </button>
          </div>
        </li>
      </ul>

      <div v-if="data.total_pages > 1" class="flex items-center justify-center gap-3">
        <button type="button" class="bt-btn-secondary" :disabled="page <= 1" @click="page--">
          Anterior
        </button>
        <span class="font-mono text-sm text-foreground-muted">{{ page }} / {{ data.total_pages }}</span>
        <button type="button" class="bt-btn-secondary" :disabled="page >= data.total_pages" @click="page++">
          Siguiente
        </button>
      </div>
    </template>
  </div>
</template>
