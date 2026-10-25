<script setup lang="ts">
import type { ManagedArticle } from '@/interfaces/article-management'
import {
  ARTICLE_IMAGE_MAX_BYTES,
  ARTICLE_IMAGE_TYPES,

} from '@/interfaces/article-management'
import Image from '@tiptap/extension-image'
import { Placeholder } from '@tiptap/extensions'
import StarterKit from '@tiptap/starter-kit'
// Editor de artículos para el autor (/my/articles) y para el administrador (/admin/articles): mismas rutas,
// distinta base. Guarda solo (autosave) y sube las imágenes al servidor, que las valida por contenido.
import { EditorContent, useEditor } from '@tiptap/vue-3'

const props = defineProps<{
  article: ManagedArticle
  base: '/my/articles' | '/admin/articles'
}>()

const emit = defineEmits<{ saved: [article: ManagedArticle], dirty: [value: boolean] }>()

const TITLE_MAX = 150
const SHORT_MAX = 300

const { $api } = useNuxtApp()
const { data: categories } = useAPI<{ id: number, name: string }[]>('/category', { lazy: true, server: false })

const title = ref(props.article.title ?? '')
const short = ref(props.article.short ?? '')
const categoryId = ref<number | ''>(props.article.category?.id ?? '')
const metatag = ref(props.article.metatag ?? '')
const coverUrl = ref(props.article.cover_url)
const editable = computed(() => props.article.editable)

const saveState = ref<'saved' | 'saving' | 'dirty' | 'error'>('saved')
const message = ref('')
const imageError = ref('')
const uploading = ref(false)
const coverInput = ref<HTMLInputElement>()
const bodyInput = ref<HTMLInputElement>()
const url = (path = '') => `${props.base}/${props.article.id}${path}`

function checkImage(file: File): string {
  if (!ARTICLE_IMAGE_TYPES.includes(file.type))
    return 'Usa una imagen JPG, PNG, WEBP o GIF.'
  if (file.size > ARTICLE_IMAGE_MAX_BYTES)
    return 'La imagen pesa más de 5 MB.'
  return ''
}

async function upload(path: string, file: File): Promise<{ url?: string, cover_url?: string } | null> {
  imageError.value = checkImage(file)
  if (imageError.value)
    return null
  uploading.value = true
  try {
    const body = new FormData()
    body.append('image', file)
    return await $api(url(path), { method: 'POST', body })
  }
  catch (e: any) {
    imageError.value = e?.data?.error ?? 'No pudimos subir la imagen. Inténtalo de nuevo.'
    return null
  }
  finally {
    uploading.value = false
  }
}

const editor = useEditor({
  content: props.article.description || '',
  editable: props.article.editable,
  immediatelyRender: false,
  extensions: [
    StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true } }),
    Image,
    Placeholder.configure({ placeholder: 'Escribe aquí tu artículo…' }),
  ],
  editorProps: {
    attributes: { class: 'prose prose-lg dark:prose-invert max-w-none min-h-[360px] px-4 py-3 focus:outline-none' },
    // Pegar o arrastrar una imagen la sube al servidor en vez de incrustarla como base64.
    handlePaste: (_view, event) => takeImages(event.clipboardData?.files),
    handleDrop: (_view, event) => takeImages(event.dataTransfer?.files),
  },
  onUpdate: () => markDirty(),
})

async function insertImage(file: File) {
  const res = await upload('/images', file)
  if (res?.url)
    editor.value?.chain().focus().setImage({ src: res.url, alt: file.name.replace(/\.[^.]+$/, '') }).run()
}

function takeImages(files?: FileList | null): boolean {
  const images = Array.from(files ?? []).filter(f => f.type.startsWith('image/'))
  if (!images.length)
    return false
  images.forEach(insertImage)
  return true
}

let saveTimer: ReturnType<typeof setTimeout>

// Cada cambio reinicia la espera; se guarda cuando el autor hace una pausa.
function markDirty() {
  if (!editable.value)
    return
  saveState.value = 'dirty'
  emit('dirty', true)
  clearTimeout(saveTimer)
  saveTimer = setTimeout(save, 1500)
}

watch([title, short, categoryId, metatag], markDirty)

let chain: Promise<void> = Promise.resolve()

// Serializa los guardados para que uno lento no pise a otro más nuevo.
function save(): Promise<void> {
  chain = chain.then(doSave)
  return chain
}

async function doSave() {
  if (!editable.value || saveState.value !== 'dirty')
    return
  saveState.value = 'saving'
  message.value = ''
  clearTimeout(saveTimer)
  try {
    const description = editor.value?.isEmpty ? '' : editor.value?.getHTML() ?? ''
    const saved = await $api<ManagedArticle>(url(), {
      method: 'PATCH',
      body: { title: title.value, short: short.value, category_id: categoryId.value || null, metatag: metatag.value, description },
    })
    // Si siguió escribiendo mientras guardaba, queda pendiente otro guardado.
    saveState.value = saveState.value === 'saving' ? 'saved' : saveState.value
    emit('dirty', saveState.value !== 'saved')
    emit('saved', saved)
  }
  catch (e: any) {
    saveState.value = 'error'
    message.value = e?.data?.error ?? 'No pudimos guardar los cambios.'
  }
}

async function onCover(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file)
    return
  const res = await upload('/cover', file)
  if (res?.cover_url)
    coverUrl.value = res.cover_url
}

async function removeCover() {
  try {
    await $api(url('/cover'), { method: 'DELETE' })
    coverUrl.value = null
  }
  catch {
    imageError.value = 'No pudimos quitar la imagen.'
  }
}

const linkOpen = ref(false)
const linkHref = ref('https://')

function openLink() {
  linkHref.value = editor.value?.getAttributes('link').href ?? 'https://'
  linkOpen.value = true
}

// Solo http(s): un enlace vacío o con otro esquema (javascript:) quita el enlace.
function applyLink() {
  if (/^https?:\/\//i.test(linkHref.value))
    editor.value?.chain().focus().extendMarkRange('link').setLink({ href: linkHref.value }).run()
  else
    editor.value?.chain().focus().unsetLink().run()
  linkOpen.value = false
}

function onBodyImage(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file)
    insertImage(file)
}

const tools = computed(() => {
  const ed = editor.value
  if (!ed)
    return []
  return [
    { label: 'Subtítulo', icon: 'lucide:heading-2', active: ed.isActive('heading', { level: 2 }), run: () => ed.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: 'Sub-subtítulo', icon: 'lucide:heading-3', active: ed.isActive('heading', { level: 3 }), run: () => ed.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: 'Negrita', icon: 'lucide:bold', active: ed.isActive('bold'), run: () => ed.chain().focus().toggleBold().run() },
    { label: 'Cursiva', icon: 'lucide:italic', active: ed.isActive('italic'), run: () => ed.chain().focus().toggleItalic().run() },
    { label: 'Código en línea', icon: 'lucide:code', active: ed.isActive('code'), run: () => ed.chain().focus().toggleCode().run() },
    { label: 'Bloque de código', icon: 'lucide:square-terminal', active: ed.isActive('codeBlock'), run: () => ed.chain().focus().toggleCodeBlock().run() },
    { label: 'Lista', icon: 'lucide:list', active: ed.isActive('bulletList'), run: () => ed.chain().focus().toggleBulletList().run() },
    { label: 'Lista numerada', icon: 'lucide:list-ordered', active: ed.isActive('orderedList'), run: () => ed.chain().focus().toggleOrderedList().run() },
    { label: 'Cita', icon: 'lucide:quote', active: ed.isActive('blockquote'), run: () => ed.chain().focus().toggleBlockquote().run() },
    { label: 'Enlace', icon: 'lucide:link', active: ed.isActive('link'), run: openLink },
    { label: 'Deshacer', icon: 'lucide:undo-2', active: false, run: () => ed.chain().focus().undo().run() },
    { label: 'Rehacer', icon: 'lucide:redo-2', active: false, run: () => ed.chain().focus().redo().run() },
  ]
})

// Avisa antes de cerrar la pestaña con cambios sin guardar.
function beforeUnload(e: BeforeUnloadEvent) {
  if (saveState.value === 'dirty' || saveState.value === 'saving')
    e.preventDefault()
}
onMounted(() => window.addEventListener('beforeunload', beforeUnload))
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeUnload)
  clearTimeout(saveTimer)
  editor.value?.destroy()
})

const saveLabel = computed(() => ({
  saved: 'Guardado',
  saving: 'Guardando…',
  dirty: 'Cambios sin guardar',
  error: message.value || 'Error al guardar',
})[saveState.value])

// Para la página: guarda lo pendiente antes de enviar a revisión o publicar.
async function flush() {
  clearTimeout(saveTimer)
  if (saveState.value === 'dirty')
    await save()
  await chain
  return saveState.value !== 'error'
}
defineExpose({ flush })
</script>

<template>
  <div class="space-y-8">
    <div>
      <label for="a-title" class="text-sm font-medium text-foreground">Título</label>
      <input id="a-title" v-model="title" class="bt-input mt-2" type="text" :maxlength="TITLE_MAX" :disabled="!editable" placeholder="Un título claro y concreto">
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <div>
        <label for="a-cat" class="text-sm font-medium text-foreground">Categoría</label>
        <select id="a-cat" v-model="categoryId" class="bt-input mt-2" :disabled="!editable">
          <option value="" disabled>
            Elige una categoría
          </option>
          <option v-for="c in categories" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>
      </div>
      <div>
        <label for="a-tags" class="text-sm font-medium text-foreground">Palabras clave <span class="text-foreground-subtle">(opcional)</span></label>
        <input id="a-tags" v-model="metatag" class="bt-input mt-2" type="text" maxlength="200" :disabled="!editable" placeholder="pentesting, nmap, redes">
      </div>
    </div>

    <div>
      <label for="a-short" class="text-sm font-medium text-foreground">Descripción corta</label>
      <textarea id="a-short" v-model="short" class="bt-input mt-2 min-h-24" :maxlength="SHORT_MAX" :disabled="!editable" placeholder="Resumen de 1–2 frases que aparece en la tarjeta y en buscadores" />
      <p class="t-small mt-1 font-mono">
        {{ short.length }}/{{ SHORT_MAX }}
      </p>
    </div>

    <div>
      <p class="text-sm font-medium text-foreground">
        Imagen destacada
      </p>
      <div class="bt-surface mt-2 overflow-hidden">
        <div class="relative aspect-[2/1] w-full bg-surface-3">
          <img v-if="coverUrl" :src="coverUrl" alt="Imagen destacada del artículo" class="size-full object-cover">
          <div v-else class="grid size-full place-items-center text-foreground-subtle">
            <Icon name="lucide:image" class="size-10" />
          </div>
        </div>
        <div v-if="editable" class="flex flex-wrap items-center gap-2 p-3">
          <input ref="coverInput" type="file" class="sr-only" accept="image/jpeg,image/png,image/webp,image/gif" @change="onCover">
          <button type="button" class="bt-btn-secondary" :disabled="uploading" @click="coverInput?.click()">
            <Icon name="lucide:upload" /> {{ coverUrl ? 'Cambiar imagen' : 'Subir imagen' }}
          </button>
          <button v-if="coverUrl" type="button" class="bt-btn-ghost" @click="removeCover">
            Quitar
          </button>
          <span class="t-small">Proporción 2:1 (recomendado 1270×560) · JPG, PNG, WEBP o GIF · máx. 5 MB</span>
        </div>
      </div>
    </div>

    <div>
      <p class="text-sm font-medium text-foreground">
        Contenido
      </p>
      <div class="mt-2 rounded-md border border-input bg-surface-1 focus-within:border-primary/70 focus-within:ring-2 focus-within:ring-primary/25">
        <div v-if="editable" class="flex flex-wrap items-center gap-0.5 border-b border-subtle px-2 py-1.5" role="toolbar" aria-label="Formato del texto">
          <button
            v-for="t in tools"
            :key="t.label"
            type="button"
            class="bt-icon-btn !size-8"
            :class="t.active ? 'bg-primary/15 text-primary-text' : ''"
            :aria-label="t.label"
            :aria-pressed="t.active"
            :title="t.label"
            @click="t.run"
          >
            <Icon :name="t.icon" class="size-4" />
          </button>
          <input ref="bodyInput" type="file" class="sr-only" accept="image/jpeg,image/png,image/webp,image/gif" @change="onBodyImage">
          <button type="button" class="bt-icon-btn !size-8" aria-label="Insertar imagen" title="Insertar imagen (también puedes pegarla o arrastrarla)" :disabled="uploading" @click="bodyInput?.click()">
            <Icon :name="uploading ? 'lucide:loader-circle' : 'lucide:image-plus'" class="size-4" :class="uploading ? 'animate-spin' : ''" />
          </button>
        </div>
        <form v-if="linkOpen" class="flex items-center gap-2 border-b border-subtle px-2 py-1.5" @submit.prevent="applyLink">
          <label for="a-link" class="sr-only">Dirección del enlace</label>
          <input id="a-link" v-model="linkHref" class="bt-input !h-8" type="url" placeholder="https://…" autofocus>
          <button type="submit" class="bt-btn-secondary !h-8">
            Aplicar
          </button>
          <button type="button" class="bt-btn-ghost !h-8" @click="linkOpen = false">
            Cancelar
          </button>
        </form>
        <ClientOnly>
          <EditorContent :editor="editor" />
          <template #fallback>
            <div class="min-h-[360px] px-4 py-3 text-foreground-subtle">
              Cargando editor…
            </div>
          </template>
        </ClientOnly>
      </div>
      <p v-if="imageError" class="mt-2 font-mono text-xs text-danger" role="alert">
        {{ imageError }}
      </p>
    </div>

    <p class="font-mono text-xs" :class="saveState === 'error' ? 'text-danger' : 'text-foreground-subtle'" :role="saveState === 'error' ? 'alert' : 'status'" aria-live="polite">
      <template v-if="editable">
        {{ saveLabel }}
      </template>
    </p>
  </div>
</template>
