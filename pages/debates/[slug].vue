<script setup lang="ts">
import MarkdownEditor from '~/components/common/MarkdownEditor.vue'
import type { DiscussionComment, DiscussionDetail } from '@/interfaces/discussion.response'
import { IsPublic } from '@/interfaces/discussion.response'

definePageMeta({ layout: 'custom', auth: true })

const MAX_LENGTH = 5000
const route = useRoute()
const slug = String(route.params.slug)
const { $api } = useNuxtApp()
const { timeAgo } = useFormatter()

const { data: discussion, status, error, refresh } = useAPI<DiscussionDetail>(`/discussion/${slug}`, { key: `discussion-${slug}` })

useSeoMeta({ title: () => discussion.value?.title ?? 'Debate', robots: 'noindex' })

const comments = ref<DiscussionComment[]>([])
const likes = ref(0)
const liked = ref(false)
watch(discussion, (d) => {
  comments.value = d?.comments ?? []
  likes.value = d?.likes_count ?? 0
  liked.value = d?.liked_by_me ?? false
}, { immediate: true })

const isPublished = computed(() => discussion.value?.is_public === IsPublic.Published)
const author = (u: { name?: string, lastname?: string, username?: string }) => [u.name, u.lastname].filter(Boolean).join(' ') || u.username || 'Usuario'

const actionError = ref('')

async function toggleLike() {
  try {
    const r = await $api<{ liked_by_me: boolean, likes_count: number }>(`/discussion/${slug}/like`, { method: 'POST' })
    liked.value = r.liked_by_me
    likes.value = r.likes_count
  }
  catch { actionError.value = 'No pudimos registrar tu voto.' }
}

async function toggleResolved() {
  try {
    await $api(`/discussion/${slug}/resolve`, { method: 'POST' })
    await refresh()
  }
  catch { actionError.value = 'No pudimos actualizar el estado.' }
}

async function moderate(state: 'published' | 'rejected') {
  try {
    await $api(`/discussion/${slug}/moderate`, { method: 'PATCH', body: { state } })
    await refresh()
  }
  catch { actionError.value = 'No pudimos actualizar la moderación.' }
}

const text = ref('')
const sending = ref(false)
const formError = ref('')
const canSend = computed(() => text.value.trim().length > 0 && text.value.length <= MAX_LENGTH && !sending.value)

async function submit() {
  if (!canSend.value)
    return
  sending.value = true
  formError.value = ''
  try {
    const created = await $api<DiscussionComment>(`/discussion/${slug}/comments`, { method: 'POST', body: { body: text.value } })
    comments.value.push(created)
    text.value = ''
  }
  catch (e: any) {
    formError.value = e?.data?.error ?? 'No pudimos publicar tu respuesta.'
  }
  finally {
    sending.value = false
  }
}

async function remove(c: DiscussionComment) {
  try {
    await $api(`/discussion/${slug}/comments/${c.id}`, { method: 'DELETE' })
    comments.value = comments.value.filter(x => x.id !== c.id)
  }
  catch { formError.value = 'No pudimos eliminar la respuesta.' }
}
</script>

<template>
  <div class="mx-auto w-full max-w-[900px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <NuxtLink to="/debates" class="bt-focus inline-flex items-center gap-1 rounded-sm text-sm text-foreground-secondary hover:text-primary-text">
      <Icon name="lucide:chevron-left" class="size-4" /> Debates
    </NuxtLink>

    <p v-if="status === 'pending'" class="t-small mt-6">
      Cargando debate…
    </p>
    <div v-else-if="error || !discussion" class="mt-6">
      <p class="t-body">
        No encontramos este debate o aún no está disponible.
      </p>
    </div>

    <article v-else class="mt-6">
      <div v-if="discussion.mine && discussion.is_public === IsPublic.Pending" class="bt-surface mb-6 flex items-start gap-3 p-4" role="status">
        <Icon name="lucide:clock" class="mt-0.5 size-5 shrink-0 text-primary-text" />
        <p class="t-small">
          Tu debate está en revisión. Te avisaremos cuando sea público para que toda la comunidad pueda participar.
        </p>
      </div>
      <div v-else-if="discussion.mine && discussion.is_public === IsPublic.Rejected" class="bt-surface mb-6 p-4" role="status">
        <p class="t-small">
          Este debate no fue aprobado por el equipo de moderación.
        </p>
      </div>

      <div v-if="discussion.can_moderate && !isPublished" class="bt-surface mb-6 flex flex-wrap items-center gap-3 p-4">
        <p class="t-small mr-auto">
          Moderación · estado: <strong>{{ discussion.is_public }}</strong>
        </p>
        <button type="button" class="bt-btn-primary !h-9" @click="moderate('published')">
          Publicar
        </button>
        <button v-if="discussion.is_public !== IsPublic.Rejected" type="button" class="bt-btn-ghost !h-9" @click="moderate('rejected')">
          Rechazar
        </button>
      </div>

      <header>
        <p class="font-mono text-xs text-foreground-muted">
          <span class="text-primary-text">//</span> {{ discussion.kind_label }}<template v-if="discussion.category">
            · {{ discussion.category.name }}
          </template>
          <span v-if="discussion.resolved_at" class="ml-2 text-success">· resuelto</span>
        </p>
        <h1 class="t-h1 mt-2">
          {{ discussion.title }}
        </h1>
        <p class="t-meta mt-2">
          {{ author(discussion.user) }} · <time :datetime="discussion.created_at">{{ timeAgo(discussion.created_at) }}</time>
        </p>
      </header>

      <div class="t-body prose-sm mt-6 max-w-none" v-html="discussion.body_html" />

      <div class="mt-6 flex flex-wrap items-center gap-3 border-t border-subtle pt-4">
        <button v-if="isPublished" type="button" class="bt-chip" :aria-pressed="liked" @click="toggleLike">
          <Icon name="lucide:thumbs-up" class="size-4" /> Me sirve · {{ likes }}
        </button>
        <button v-if="discussion.mine && isPublished" type="button" class="bt-chip" :aria-pressed="!!discussion.resolved_at" @click="toggleResolved">
          <Icon name="lucide:check-circle-2" class="size-4" /> {{ discussion.resolved_at ? 'Resuelto' : 'Marcar como resuelto' }}
        </button>
        <p v-if="actionError" class="font-mono text-xs text-danger" role="alert">
          {{ actionError }}
        </p>
      </div>

      <section v-if="isPublished" class="mt-10" aria-labelledby="answers-title">
        <h2 id="answers-title" class="font-mono text-[13px] text-foreground-muted">
          <span class="text-primary-text">//</span> respuestas<template v-if="comments.length">
            ({{ comments.length }})
          </template>
        </h2>

        <ul v-if="comments.length" class="mt-4 divide-y divide-border-subtle border-t border-subtle">
          <li v-for="c in comments" :key="c.id" class="flex gap-3 py-4">
            <div class="min-w-0 flex-1">
              <p class="flex flex-wrap items-baseline gap-x-2 text-sm">
                <span class="font-medium text-foreground">{{ author(c.user) }}</span>
                <span class="t-meta !text-xs">{{ timeAgo(c.created_at) }}</span>
              </p>
              <div class="t-body prose-sm mt-1 max-w-none break-words" v-html="c.body_html" />
            </div>
            <button v-if="c.mine" type="button" class="bt-icon-btn !size-8 shrink-0" aria-label="Eliminar respuesta" @click="remove(c)">
              <Icon name="lucide:trash-2" class="size-4" />
            </button>
          </li>
        </ul>
        <p v-else class="t-small mt-4">
          Nadie ha respondido todavía. ¡Sé quien ayude primero!
        </p>

        <form class="mt-6" @submit.prevent="submit">
          <label for="answer" class="sr-only">Tu respuesta</label>
          <MarkdownEditor
            id="answer"
            v-model="text"
            :rows="5"
            :maxlength="MAX_LENGTH"
            placeholder="Aporta tu experiencia, un enlace o el siguiente paso…"
            @submit="submit"
          />
          <div class="mt-2 flex items-center justify-between gap-3">
            <p class="font-mono text-xs" :class="formError ? 'text-danger' : 'text-foreground-subtle'" :role="formError ? 'alert' : undefined">
              {{ formError || `${text.length}/${MAX_LENGTH}` }}
            </p>
            <button type="submit" class="bt-btn-primary !h-9" :disabled="!canSend" :aria-busy="sending">
              Responder
            </button>
          </div>
        </form>
      </section>
    </article>
  </div>
</template>
