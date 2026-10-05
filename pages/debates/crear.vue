<script setup lang="ts">
import MarkdownEditor from '~/components/common/MarkdownEditor.vue'
import type { DiscussionKind } from '@/interfaces/discussion.response'
import PageHeader from '~/components/common/PageHeader.vue'

definePageMeta({ layout: 'custom', auth: true })
useSeoMeta({ title: 'Crear debate', robots: 'noindex' })

const TITLE_MIN = 10
const TITLE_MAX = 150
const BODY_MAX = 10000

const { $api } = useNuxtApp()
const { data: categories } = useAPI<{ id: number, name: string }[]>('/category', { lazy: true, server: false })

const kind = ref<DiscussionKind>('question')
const title = ref('')
const body = ref('')
const categoryId = ref<number | ''>('')
const accepted = ref(false)
const sending = ref(false)
const error = ref('')

const meta = computed(() => kindMeta(kind.value))
const valid = computed(() =>
  title.value.trim().length >= TITLE_MIN
  && title.value.length <= TITLE_MAX
  && body.value.trim().length > 0
  && body.value.length <= BODY_MAX
  && !!categoryId.value
  && accepted.value,
)

async function submit() {
  if (!valid.value || sending.value)
    return
  sending.value = true
  error.value = ''
  try {
    const created = await $api<{ slug: string }>('/discussions', {
      method: 'POST',
      body: { kind: kind.value, title: title.value, body: body.value, category_id: categoryId.value },
    })
    await navigateTo(`/debates/${created.slug}`)
  }
  catch (e: any) {
    error.value = e?.data?.error ?? 'No pudimos crear tu debate. Inténtalo de nuevo.'
  }
  finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-[900px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <PageHeader title="Crear debate">
      Esta es una comunidad: pregunta, comparte lo que aprendiste y ayuda a otros a avanzar.
    </PageHeader>

    <form class="mt-8 space-y-8" @submit.prevent="submit">
      <fieldset>
        <legend class="font-mono text-[13px] text-foreground-muted">
          <span class="text-primary-text">//</span> ¿qué quieres hacer?
        </legend>
        <div class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label
            v-for="k in DISCUSSION_KINDS"
            :key="k.value"
            class="bt-card bt-focus-within flex cursor-pointer items-start gap-3 p-4 transition-colors duration-fast"
            :class="kind === k.value ? 'border-primary/60 bg-primary/10' : 'hover:border-border'"
          >
            <input v-model="kind" type="radio" name="kind" :value="k.value" class="sr-only">
            <Icon :name="k.icon" class="mt-0.5 size-5 shrink-0 text-primary-text" />
            <span class="min-w-0">
              <span class="block text-sm font-medium text-foreground">{{ k.label }}</span>
              <span class="t-small block">{{ k.hint }}</span>
            </span>
          </label>
        </div>
      </fieldset>

      <div>
        <label for="d-title" class="text-sm font-medium text-foreground">Título</label>
        <input id="d-title" v-model="title" class="bt-input mt-2" type="text" :maxlength="TITLE_MAX" :placeholder="meta.titlePlaceholder" required>
        <p class="t-small mt-1 font-mono">
          {{ title.length }}/{{ TITLE_MAX }} · mínimo {{ TITLE_MIN }}. Sé claro y concreto.
        </p>
      </div>

      <div>
        <label for="d-body" class="text-sm font-medium text-foreground">Detalle</label>
        <div class="mt-2">
          <MarkdownEditor id="d-body" v-model="body" :rows="10" :maxlength="BODY_MAX" :placeholder="meta.bodyPlaceholder" />
        </div>
        <p class="t-small mt-1 font-mono">
          {{ body.length }}/{{ BODY_MAX }} · Admite Markdown (negrita, código, bloques, enlaces y listas)
        </p>
      </div>

      <div>
        <label for="d-cat" class="text-sm font-medium text-foreground">Categoría</label>
        <select id="d-cat" v-model="categoryId" class="bt-input mt-2" required>
          <option value="" disabled>
            Elige una categoría
          </option>
          <option v-for="c in categories" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>
      </div>

      <aside class="bt-surface space-y-2 p-5">
        <h2 class="font-mono text-[13px] text-foreground-muted">
          <span class="text-primary-text">//</span> cómo ser buen vecino en la comunidad
        </h2>
        <ul class="t-small list-disc space-y-1 pl-5">
          <li>Busca antes si tu tema ya se discutió.</li>
          <li>Cuida la ortografía y explica el contexto; si es un error, incluye el log.</li>
          <li>No publiques contenido ilegal (carding, piratería) ni datos de terceros.</li>
          <li>Agradece y marca el debate como resuelto cuando recibas ayuda.</li>
          <li>Responder a otros suma puntos y descuentos en la plataforma.</li>
        </ul>
      </aside>

      <label class="flex items-start gap-3 text-sm text-foreground-secondary">
        <input v-model="accepted" type="checkbox" class="mt-1">
        <span>Entiendo que mi debate será revisado por el equipo antes de hacerse público y acepto las normas de la comunidad.</span>
      </label>

      <div class="flex items-center justify-between gap-3">
        <p class="font-mono text-xs" :class="error ? 'text-danger' : 'text-foreground-subtle'" :role="error ? 'alert' : undefined">
          {{ error }}
        </p>
        <div class="flex gap-2">
          <NuxtLink to="/debates" class="bt-btn-ghost">
            Cancelar
          </NuxtLink>
          <button type="submit" class="bt-btn-primary" :disabled="!valid || sending" :aria-busy="sending">
            Enviar a revisión
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
