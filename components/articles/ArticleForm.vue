<script setup lang="ts">
import type { ManagedArticle } from '@/interfaces/articles.response'
import RichEditor from '~/components/articles/RichEditor.vue'

// Formulario compartido de crear/editar artículo. Los autores lo envían como borrador; el admin puede publicar.
const props = defineProps<{
  article?: ManagedArticle & { description: string }
  isAdmin: boolean
}>()

const TITLE_MIN = 10
const TITLE_MAX = 150
const SHORT_MAX = 300
const BODY_MAX = 200000
const IMAGE_MAX_MB = 5

const { $api } = useNuxtApp()
const { data: categories } = useAPI<{ id: number, name: string }[]>('/category', { lazy: true, server: false })

const title = ref(props.article?.title ?? '')
const short = ref(props.article?.short ?? '')
const description = ref(props.article?.description ?? '')
const categoryId = ref<number | ''>(props.article?.category_id ?? '')
const image = ref<File | null>(null)
const imagePreview = ref(props.article?.image_thumb_service || '')
const sending = ref(false)
const error = ref('')

const editing = computed(() => !!props.article)
const wasPublic = computed(() => !!props.article?.is_public)
// Un autor no admin no puede tocar un artículo ya publicado (el backend también lo bloquea).
const locked = computed(() => wasPublic.value && !props.isAdmin)

const valid = computed(() =>
  title.value.trim().length >= TITLE_MIN
  && title.value.length <= TITLE_MAX
  && short.value.length <= SHORT_MAX
  && description.value.trim().length > 0
  && description.value.length <= BODY_MAX
  && !!categoryId.value,
)

function onImage(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file)
    return
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > IMAGE_MAX_MB * 1024 * 1024) {
    error.value = `Usa una imagen JPG, PNG, WEBP o GIF de máximo ${IMAGE_MAX_MB} MB.`
    return
  }
  error.value = ''
  image.value = file
  imagePreview.value = URL.createObjectURL(file)
}

async function submit(publish = false) {
  if (!valid.value || sending.value || locked.value)
    return
  sending.value = true
  error.value = ''
  try {
    const body = new FormData()
    body.append('title', title.value.trim())
    body.append('short', short.value.trim())
    body.append('description', description.value)
    body.append('category_id', String(categoryId.value))
    if (image.value)
      body.append('image', image.value)

    const saved = editing.value
      ? await $api<{ id: number }>(`/articles/${props.article!.id}`, { method: 'PATCH', body })
      : await $api<{ id: number }>('/articles', { method: 'POST', body })
    if (publish && props.isAdmin)
      await $api(`/articles/${saved.id}/publish`, { method: 'PATCH' })
    await navigateTo('/articulos/administrar')
  }
  catch (e: any) {
    error.value = e?.data?.error ?? 'No pudimos guardar el artículo. Inténtalo de nuevo.'
  }
  finally {
    sending.value = false
  }
}
</script>

<template>
  <form class="mt-8 space-y-8" @submit.prevent="submit(false)">
    <p v-if="locked" class="bt-surface p-4 text-sm text-foreground-secondary" role="alert">
      Este artículo ya está publicado: solo un administrador puede editarlo.
    </p>

    <fieldset :disabled="locked || sending" class="space-y-8">
      <div>
        <label for="a-title" class="text-sm font-medium text-foreground">Título</label>
        <input id="a-title" v-model="title" class="bt-input mt-2" type="text" :maxlength="TITLE_MAX" placeholder="Ej. Nueva vulnerabilidad crítica en OpenSSH" required>
        <p class="t-small mt-1 font-mono">
          {{ title.length }}/{{ TITLE_MAX }} · mínimo {{ TITLE_MIN }}
        </p>
      </div>

      <div>
        <label for="a-short" class="text-sm font-medium text-foreground">Resumen</label>
        <textarea id="a-short" v-model="short" class="bt-input mt-2" rows="3" :maxlength="SHORT_MAX" placeholder="Una o dos frases que aparecerán en la tarjeta del artículo" />
        <p class="t-small mt-1 font-mono">
          {{ short.length }}/{{ SHORT_MAX }} · opcional
        </p>
      </div>

      <div>
        <label for="a-cat" class="text-sm font-medium text-foreground">Categoría</label>
        <select id="a-cat" v-model="categoryId" class="bt-input mt-2" required>
          <option value="" disabled>
            Elige una categoría
          </option>
          <option v-for="c in categories" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>
      </div>

      <div>
        <label for="a-image" class="text-sm font-medium text-foreground">Imagen de portada</label>
        <div class="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div class="aspect-[2/1] w-full overflow-hidden rounded-lg border border-subtle bg-surface-2 sm:w-64">
            <img v-if="imagePreview" :src="imagePreview" alt="Vista previa de la portada" class="size-full object-cover">
            <div v-else class="flex size-full items-center justify-center text-foreground-subtle">
              <Icon name="lucide:image" class="size-8" />
            </div>
          </div>
          <div class="min-w-0">
            <input id="a-image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="text-sm text-foreground-secondary" @change="onImage">
            <p class="t-small mt-1 font-mono">
              JPG, PNG, WEBP o GIF · máximo {{ IMAGE_MAX_MB }} MB · proporción 2:1
            </p>
          </div>
        </div>
      </div>

      <div>
        <label for="a-body" class="text-sm font-medium text-foreground">Contenido</label>
        <div class="mt-2">
          <RichEditor id="a-body" v-model="description" />
        </div>
        <p class="t-small mt-1 font-mono">
          {{ description.length }}/{{ BODY_MAX }} · Pega o arrastra imágenes directamente en el texto
        </p>
      </div>
    </fieldset>

    <p v-if="!isAdmin && !locked" class="t-small">
      Tu artículo se guarda como borrador y un administrador lo revisa antes de publicarlo.
    </p>

    <div class="flex items-center justify-between gap-3">
      <p class="font-mono text-xs" :class="error ? 'text-danger' : 'text-foreground-subtle'" :role="error ? 'alert' : undefined">
        {{ error }}
      </p>
      <div class="flex gap-2">
        <NuxtLink to="/articulos/administrar" class="bt-btn-ghost">
          Cancelar
        </NuxtLink>
        <button type="submit" class="bt-btn-secondary" :disabled="!valid || sending || locked" :aria-busy="sending">
          {{ editing ? 'Guardar cambios' : 'Guardar borrador' }}
        </button>
        <button v-if="isAdmin && !wasPublic" type="button" class="bt-btn-primary" :disabled="!valid || sending" @click="submit(true)">
          {{ editing ? 'Guardar y publicar' : 'Publicar ahora' }}
        </button>
      </div>
    </div>
  </form>
</template>
