<script setup lang="ts">
import type { SkillCommentItem, SkillFeedback } from '~/interfaces/skills'

// Valoración (1–5), comentarios con respuestas y denuncias de una skill publicada.
// Todo el texto de la comunidad se pinta como texto plano ({{ }}): nunca como HTML.
const props = defineProps<{ slug: string }>()

const { $api } = useNuxtApp()
const base = computed(() => `/skill-feedback/${encodeURIComponent(props.slug)}`)
const { data: fb, status, refresh } = useAPI<SkillFeedback>(() => base.value, { key: `skill-fb-${props.slug}`, lazy: true, server: false })

const error = ref('')
const busy = ref(false)
const hover = ref(0)

async function guard(fn: () => Promise<void>) {
  busy.value = true
  error.value = ''
  try {
    await fn()
  }
  catch (e: any) {
    error.value = e?.data?.errors?.join(' ') ?? 'No pudimos completar la acción.'
  }
  finally {
    busy.value = false
  }
}

function rate(n: number) {
  return guard(async () => {
    const r = await $api<{ my_rating: number, rating: SkillFeedback['rating'] }>(`${base.value}/rating`, { method: 'PUT', body: { rating: n } })
    if (fb.value)
      fb.value = { ...fb.value, my_rating: r.my_rating, rating: r.rating }
  })
}
function unrate() {
  return guard(async () => {
    const r = await $api<{ rating: SkillFeedback['rating'] }>(`${base.value}/rating`, { method: 'DELETE' })
    if (fb.value)
      fb.value = { ...fb.value, my_rating: null, rating: r.rating }
  })
}

// ---- Comentarios ----
const text = ref('')
const replyTo = ref<number | null>(null)
const replyText = ref('')
const editing = ref<number | null>(null)
const editText = ref('')

function postComment(parentId?: number) {
  return guard(async () => {
    const content = (parentId ? replyText.value : text.value).trim()
    if (!content)
      return
    await $api(`${base.value}/comments`, { method: 'POST', body: { content, parent_id: parentId } })
    text.value = ''
    replyText.value = ''
    replyTo.value = null
    await refresh()
  })
}
function saveEdit(c: SkillCommentItem) {
  return guard(async () => {
    await $api(`/skill-comments/${c.id}`, { method: 'PATCH', body: { content: editText.value.trim() } })
    editing.value = null
    await refresh()
  })
}
function removeComment(c: SkillCommentItem) {
  return guard(async () => {
  // eslint-disable-next-line no-alert
    if (!confirm('¿Eliminar tu comentario?'))
      return
    await $api(`/skill-comments/${c.id}`, { method: 'DELETE' })
    await refresh()
  })
}
function startEdit(c: SkillCommentItem) {
  editing.value = c.id
  editText.value = c.content ?? ''
}

// ---- Denuncias ----
const report = reactive({ open: false, endpoint: '', title: '' })
function reportSkill() {
  Object.assign(report, { open: true, endpoint: `${base.value}/reports`, title: 'Denunciar esta skill' })
}
function reportComment(c: SkillCommentItem) {
  Object.assign(report, { open: true, endpoint: `/skill-comments/${c.id}/reports`, title: 'Denunciar este comentario' })
}

const summary = computed(() => fb.value?.rating)
const stars = [1, 2, 3, 4, 5]
defineExpose({ reportSkill })
</script>

<template>
  <section class="space-y-8" aria-labelledby="fb-title">
    <h2 id="fb-title" class="t-h3">
      Valoraciones y comentarios
    </h2>
    <p v-if="status === 'pending' && !fb" class="t-small">
      Cargando…
    </p>
    <p v-else-if="status === 'error'" class="font-mono text-xs text-danger" role="alert">
      No pudimos cargar la comunidad de esta skill.
    </p>

    <template v-else-if="fb">
      <!-- Valoración -->
      <div class="bt-surface flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="font-mono text-3xl text-foreground">
            {{ summary?.average ?? '—' }} <span class="text-sm text-foreground-muted">/ 5 · {{ summary?.count }} {{ summary?.count === 1 ? 'valoración' : 'valoraciones' }}</span>
          </p>
          <ul class="mt-2 space-y-0.5 font-mono text-xs text-foreground-muted" aria-label="Distribución">
            <li v-for="n in [5, 4, 3, 2, 1]" :key="n">
              {{ n }}★ {{ summary?.distribution[String(n)] ?? 0 }}
            </li>
          </ul>
        </div>
        <div v-if="!fb.own_skill">
          <p class="text-sm font-medium text-foreground">
            {{ fb.my_rating ? 'Tu valoración' : 'Valora esta skill' }}
          </p>
          <div class="mt-1 flex items-center gap-1" role="radiogroup" aria-label="Tu valoración" @mouseleave="hover = 0">
            <button
              v-for="n in stars"
              :key="n"
              type="button"
              role="radio"
              :aria-checked="fb.my_rating === n"
              :aria-label="`${n} ${n === 1 ? 'estrella' : 'estrellas'}`"
              class="bt-icon-btn !size-9"
              :disabled="busy"
              @mouseenter="hover = n"
              @click="rate(n)"
            >
              <Icon name="lucide:star" class="size-5" :class="(hover || fb.my_rating || 0) >= n ? 'fill-primary text-primary' : ''" />
            </button>
            <button v-if="fb.my_rating" type="button" class="bt-btn-ghost !h-8" :disabled="busy" @click="unrate">
              Quitar
            </button>
          </div>
        </div>
        <p v-else class="t-small">
          No puedes valorar tu propia skill.
        </p>
      </div>

      <!-- Nuevo comentario -->
      <form class="space-y-2" @submit.prevent="postComment()">
        <label for="fb-new" class="text-sm font-medium text-foreground">Comentarios ({{ fb.comments_count }})</label>
        <textarea id="fb-new" v-model="text" class="bt-input !h-auto" rows="3" maxlength="2000" placeholder="Comparte tu experiencia usándola (texto plano)" />
        <div class="flex items-center justify-between gap-3">
          <span class="t-small font-mono">{{ text.length }}/2000</span>
          <button type="submit" class="bt-btn-primary" :disabled="busy || !text.trim()">
            Comentar
          </button>
        </div>
      </form>
      <p v-if="error" class="font-mono text-xs text-danger" role="alert">
        {{ error }}
      </p>

      <!-- Hilo -->
      <p v-if="!fb.comments.data.length" class="t-small">
        Aún no hay comentarios. Sé la primera persona en comentar.
      </p>
      <ul v-else class="space-y-5">
        <li v-for="c in fb.comments.data" :key="c.id" class="space-y-3">
          <div class="bt-surface p-4">
            <p class="t-small">
              <strong class="font-medium text-foreground">{{ c.author?.display_name ?? 'Comentario eliminado' }}</strong>
              · {{ formatSkillDate(c.created_at) }}<span v-if="c.edited_at"> · editado</span>
            </p>
            <p v-if="c.removed" class="mt-1 text-sm italic text-foreground-muted">
              Este comentario fue eliminado.
            </p>
            <template v-else-if="editing === c.id">
              <textarea v-model="editText" class="bt-input mt-2 !h-auto" rows="3" maxlength="2000" aria-label="Editar comentario" />
              <div class="mt-2 flex gap-2">
                <button type="button" class="bt-btn-primary !h-8" :disabled="busy || !editText.trim()" @click="saveEdit(c)">
                  Guardar
                </button>
                <button type="button" class="bt-btn-ghost !h-8" @click="editing = null">
                  Cancelar
                </button>
              </div>
            </template>
            <p v-else class="mt-1 whitespace-pre-line break-words text-sm text-foreground-secondary">
              {{ c.content }}
            </p>
            <div v-if="!c.removed && editing !== c.id" class="mt-2 flex flex-wrap gap-1">
              <button type="button" class="bt-btn-ghost !h-8" @click="replyTo = replyTo === c.id ? null : c.id">
                Responder
              </button>
              <template v-if="c.mine">
                <button type="button" class="bt-btn-ghost !h-8" @click="startEdit(c)">
                  Editar
                </button>
                <button type="button" class="bt-btn-ghost !h-8 text-danger" @click="removeComment(c)">
                  Eliminar
                </button>
              </template>
              <button v-else type="button" class="bt-btn-ghost !h-8" @click="reportComment(c)">
                Denunciar
              </button>
            </div>
            <form v-if="replyTo === c.id" class="mt-3 space-y-2" @submit.prevent="postComment(c.id)">
              <textarea v-model="replyText" class="bt-input !h-auto" rows="2" maxlength="2000" aria-label="Tu respuesta" />
              <button type="submit" class="bt-btn-secondary !h-8" :disabled="busy || !replyText.trim()">
                Responder
              </button>
            </form>
          </div>

          <ul v-if="c.replies?.length" class="ml-4 space-y-3 border-l border-subtle pl-4 sm:ml-8">
            <li v-for="r in c.replies" :key="r.id" class="bt-surface p-3">
              <p class="t-small">
                <strong class="font-medium text-foreground">{{ r.author?.display_name ?? 'Comentario eliminado' }}</strong>
                · {{ formatSkillDate(r.created_at) }}<span v-if="r.edited_at"> · editado</span>
              </p>
              <p v-if="r.removed" class="mt-1 text-sm italic text-foreground-muted">
                Este comentario fue eliminado.
              </p>
              <template v-else-if="editing === r.id">
                <textarea v-model="editText" class="bt-input mt-2 !h-auto" rows="2" maxlength="2000" aria-label="Editar respuesta" />
                <div class="mt-2 flex gap-2">
                  <button type="button" class="bt-btn-primary !h-8" :disabled="busy || !editText.trim()" @click="saveEdit(r)">
                    Guardar
                  </button>
                  <button type="button" class="bt-btn-ghost !h-8" @click="editing = null">
                    Cancelar
                  </button>
                </div>
              </template>
              <p v-else class="mt-1 whitespace-pre-line break-words text-sm text-foreground-secondary">
                {{ r.content }}
              </p>
              <div v-if="!r.removed && editing !== r.id" class="mt-1 flex gap-1">
                <template v-if="r.mine">
                  <button type="button" class="bt-btn-ghost !h-8" @click="startEdit(r)">
                    Editar
                  </button>
                  <button type="button" class="bt-btn-ghost !h-8 text-danger" @click="removeComment(r)">
                    Eliminar
                  </button>
                </template>
                <button v-else type="button" class="bt-btn-ghost !h-8" @click="reportComment(r)">
                  Denunciar
                </button>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </template>

    <SkillsSkillReportDialog :open="report.open" :endpoint="report.endpoint" :title="report.title" @close="report.open = false" />
  </section>
</template>
