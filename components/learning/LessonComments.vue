<script setup lang="ts">
import type { LessonComment } from '~/interfaces/learning'
import TeacherAvatar from '~/components/courses/TeacherAvatar.vue'

// Comentarios de la clase: GET/POST/DELETE /video/:slug/comments.
const props = defineProps<{ slug: string }>()

const MAX_LENGTH = 2000
const { $api } = useNuxtApp()
const { timeAgo } = useFormatter()

const { data, status, error: loadError, refresh } = useAPI<{ data: LessonComment[], total_items: number }>(
  () => `/video/${props.slug}/comments`,
  { lazy: true, server: false },
)

const items = ref<LessonComment[]>([])
const total = ref(0)
watch(data, (v) => {
  items.value = v?.data ?? []
  total.value = v?.total_items ?? items.value.length
}, { immediate: true })

const body = ref('')
const sending = ref(false)
const formError = ref('')
const canSend = computed(() => body.value.trim().length > 0 && body.value.length <= MAX_LENGTH && !sending.value)

async function submit() {
  if (!canSend.value)
    return
  sending.value = true
  formError.value = ''
  try {
    const created = await $api<LessonComment>(`/video/${props.slug}/comments`, { method: 'POST', body: { body: body.value } })
    items.value.unshift(created)
    total.value++
    body.value = ''
  }
  catch (e: any) {
    formError.value = e?.data?.error ?? 'No pudimos publicar tu comentario. Inténtalo de nuevo.'
  }
  finally {
    sending.value = false
  }
}

async function remove(comment: LessonComment) {
  try {
    await $api(`/video/${props.slug}/comments/${comment.id}`, { method: 'DELETE' })
    items.value = items.value.filter(c => c.id !== comment.id)
    total.value = Math.max(0, total.value - 1)
  }
  catch {
    formError.value = 'No pudimos eliminar el comentario.'
  }
}

const authorOf = (c: LessonComment) => [c.user.name, c.user.lastname].filter(Boolean).join(' ') || c.user.username || 'Usuario'
</script>

<template>
  <section aria-labelledby="comments-title">
    <h2 id="comments-title" class="t-eyebrow">
      <span class="text-primary-text">//</span> comentarios<template v-if="total">
        ({{ total }})
      </template>
    </h2>

    <form class="mt-3" @submit.prevent="submit">
      <label for="lesson-comment" class="sr-only">Escribe un comentario</label>
      <textarea
        id="lesson-comment"
        v-model="body"
        rows="3"
        :maxlength="MAX_LENGTH"
        class="bt-input !h-auto min-h-[84px] resize-y py-2"
        :placeholder="items.length || status === 'pending' ? 'Escribe un comentario…' : 'Sé el primero en comentar…'"
        @keydown.ctrl.enter="submit"
        @keydown.meta.enter="submit"
      />
      <div class="mt-2 flex items-center justify-between gap-3">
        <p class="font-mono text-xs" :class="formError ? 'text-danger' : 'text-foreground-subtle'" :role="formError ? 'alert' : undefined">
          {{ formError || `${body.length}/${MAX_LENGTH}` }}
        </p>
        <button type="submit" class="bt-btn-primary !h-9" :disabled="!canSend" :aria-busy="sending">
          Publicar
        </button>
      </div>
    </form>

    <p v-if="status === 'pending'" class="t-small mt-4">
      Cargando comentarios…
    </p>
    <div v-else-if="loadError" class="mt-4 flex items-center gap-3">
      <p class="t-small">
        No pudimos cargar los comentarios.
      </p>
      <button type="button" class="bt-btn-ghost !h-8 !px-2.5" @click="refresh()">
        Reintentar
      </button>
    </div>
    <p v-else-if="!items.length" class="t-small mt-4">
      Aún no hay comentarios en esta clase.
    </p>

    <ul v-else class="mt-4 divide-y divide-border-subtle border-t border-subtle">
      <li v-for="c in items" :key="c.id" class="flex gap-3 py-3">
        <TeacherAvatar :name="authorOf(c)" />
        <div class="min-w-0 flex-1">
          <p class="flex flex-wrap items-baseline gap-x-2 text-sm">
            <span class="font-medium text-foreground">{{ authorOf(c) }}</span>
            <span class="t-meta !text-xs">{{ timeAgo(c.created_at) }}</span>
          </p>
          <p class="t-body mt-1 whitespace-pre-line break-words">
            {{ c.body }}
          </p>
        </div>
        <button v-if="c.mine" type="button" class="bt-icon-btn !size-8 shrink-0" aria-label="Eliminar comentario" title="Eliminar" @click="remove(c)">
          <Icon name="lucide:trash-2" class="size-4" />
        </button>
      </li>
    </ul>
  </section>
</template>
