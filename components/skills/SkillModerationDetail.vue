<script setup lang="ts">
import type { SkillManaged } from '~/interfaces/skills'

// Revisión de una skill: el contenido se muestra como TEXTO PLANO (nunca como HTML) y los archivos solo se listan.
const props = defineProps<{ id: number }>()
const emit = defineEmits<{ changed: [] }>()

const { $api } = useNuxtApp()
const landingUrl = useLandingUrl()
const { data: skill, status, refresh } = useAPI<SkillManaged & { author: { id: number, username: string, name: string, public_profile: boolean } }>(
  () => `/admin/skills/${props.id}`,
  { key: `mod-skill-${props.id}`, watch: [() => props.id] },
)

const note = ref('')
const busy = ref(false)
const error = ref('')

async function act(action: 'approve' | 'reject' | 'suspend' | 'restore' | 'feature' | 'unfeature') {
  if (['reject', 'suspend'].includes(action) && !note.value.trim()) {
    error.value = 'Indica el motivo: se le mostrará al autor.'
    return
  }
  busy.value = true
  error.value = ''
  try {
    await $api(`/admin/skills/${props.id}/${action}`, { method: 'POST', body: { note: note.value.trim() || undefined } })
    note.value = ''
    await refresh()
    emit('changed')
  }
  catch (e: any) {
    error.value = e?.data?.errors?.join(' ') ?? 'No pudimos aplicar la acción.'
  }
  finally {
    busy.value = false
  }
}
const can = (to: string) => skill.value?.allowed_transitions.includes(to as any)
</script>

<template>
  <div v-if="status === 'pending' && !skill" class="t-small">
    Cargando…
  </div>
  <article v-else-if="skill" class="bt-surface space-y-5 p-5">
    <header class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h2 class="t-h3">
          {{ skill.title }}
        </h2>
        <p class="t-small mt-1">
          {{ skill.category.name }} · {{ SKILL_TYPE_LABELS[skill.resource_type] }} · v{{ skill.version }} · {{ SKILL_LICENSE_LABELS[skill.license] ?? skill.license }}
        </p>
        <p class="t-small">
          Autor: {{ skill.author.name }} (@{{ skill.author.username }}) · {{ skill.author.public_profile ? 'perfil público' : 'perfil privado' }}
        </p>
      </div>
      <SkillsSkillStatusBadge :status="skill.status" />
    </header>

    <p class="text-sm text-foreground-secondary">
      {{ skill.summary }}
    </p>

    <div v-if="skill.scan.length" class="rounded-md border border-warning/30 bg-warning/[0.06] p-3 text-sm" role="alert">
      <p class="font-medium text-warning">
        Alertas automáticas
      </p>
      <ul class="mt-1 list-disc pl-5 text-foreground-secondary">
        <li v-for="s in skill.scan" :key="s.type">
          {{ s.label }}{{ s.blocking ? ' (bloqueante)' : '' }}
        </li>
      </ul>
    </div>

    <div v-if="skill.duplicates?.length" class="rounded-md border border-warning/30 bg-warning/[0.06] p-3 text-sm" role="alert">
      <p class="font-medium text-warning">
        Posibles duplicados
      </p>
      <ul class="mt-1 list-disc pl-5 text-foreground-secondary">
        <li v-for="d in skill.duplicates" :key="d.id">
          {{ Math.round(d.similarity * 100) }}% {{ d.exact ? 'idéntico' : 'similar' }} a «{{ d.title }}» de {{ d.author }} ({{ d.status }})
        </li>
      </ul>
    </div>

    <section v-if="skill.files.length" aria-label="Archivos">
      <p class="text-sm font-medium text-foreground">
        Archivos adjuntos
      </p>
      <ul class="mt-1 text-sm text-foreground-secondary">
        <li v-for="f in skill.files" :key="f.id" class="font-mono">
          {{ f.filename }} · {{ formatBytes(f.byte_size) }}
        </li>
      </ul>
      <p v-if="skill.scripts?.length" class="mt-2 text-sm text-warning">
        El ZIP incluye scripts: {{ skill.scripts.join(', ') }}. Léelos antes de aprobar.
      </p>
    </section>

    <section aria-label="Contenido">
      <p class="text-sm font-medium text-foreground">
        Contenido (texto plano)
      </p>
      <pre class="mt-1 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-md border border-subtle bg-surface-2 p-3 font-mono text-xs text-foreground-secondary">{{ skill.content }}</pre>
    </section>

    <section v-if="skill.logs?.length" aria-label="Historial de moderación">
      <p class="text-sm font-medium text-foreground">
        Historial
      </p>
      <ul class="mt-1 space-y-1 text-xs text-foreground-muted">
        <li v-for="l in skill.logs" :key="l.id">
          {{ formatSkillDate(l.created_at) }} · {{ l.actor }} · {{ l.action }}<span v-if="l.note"> — {{ l.note }}</span>
        </li>
      </ul>
    </section>

    <section class="space-y-3 border-t border-subtle pt-4">
      <label for="mod-note" class="text-sm font-medium text-foreground">Motivo <span class="font-normal text-foreground-muted">(obligatorio al rechazar o suspender)</span></label>
      <textarea id="mod-note" v-model="note" class="bt-input !h-auto" rows="2" maxlength="1000" />
      <p v-if="error" class="font-mono text-xs text-danger" role="alert">
        {{ error }}
      </p>
      <div class="flex flex-wrap gap-2">
        <button v-if="can('published')" type="button" class="bt-btn-primary" :disabled="busy" @click="act(skill.status === 'suspended' ? 'restore' : 'approve')">
          {{ skill.status === 'suspended' ? 'Restaurar' : 'Aprobar y publicar' }}
        </button>
        <button v-if="can('rejected')" type="button" class="bt-btn-secondary" :disabled="busy" @click="act('reject')">
          Rechazar
        </button>
        <button v-if="can('suspended')" type="button" class="bt-btn-secondary" :disabled="busy" @click="act('suspend')">
          Suspender
        </button>
        <button v-if="skill.status === 'published'" type="button" class="bt-btn-ghost" :disabled="busy" @click="act(skill.featured ? 'unfeature' : 'feature')">
          {{ skill.featured ? 'Quitar destacada' : 'Destacar' }}
        </button>
        <a v-if="skill.status === 'published'" :href="landingUrl(`/skills/${skill.slug}`)" class="bt-btn-ghost" target="_blank" rel="noopener">Ver pública</a>
      </div>
    </section>
  </article>
</template>
