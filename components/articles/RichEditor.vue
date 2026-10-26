<script setup lang="ts">
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'

// Editor visual de artículos: edita y emite HTML (el mismo formato que ya tienen los artículos existentes).
// Las imágenes se suben al servidor (POST /articles/images) y se insertan con su URL permanente.
const props = defineProps<{ modelValue: string, id?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const { $api } = useNuxtApp()
const fileInput = ref<HTMLInputElement>()
const uploading = ref(false)
const error = ref('')
const IMAGE_MAX_MB = 5

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
    Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener', target: '_blank' } }),
    Image,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
  ],
  editorProps: {
    attributes: { id: props.id ?? '', class: 'prose prose-lg max-w-none dark:prose-invert min-h-[320px] px-4 py-3 focus:outline-none' },
    handlePaste: (_view, event) => uploadFromFiles(event.clipboardData?.files),
    handleDrop: (_view, event) => uploadFromFiles((event as DragEvent).dataTransfer?.files),
  },
  onUpdate: ({ editor }) => emit('update:modelValue', editor.isEmpty ? '' : editor.getHTML()),
})

onBeforeUnmount(() => editor.value?.destroy())

function uploadFromFiles(files?: FileList | null) {
  const file = files && Array.from(files).find(f => f.type.startsWith('image/'))
  if (!file)
    return false
  uploadImage(file)
  return true
}

async function uploadImage(file: File) {
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > IMAGE_MAX_MB * 1024 * 1024) {
    error.value = `Usa una imagen JPG, PNG, WEBP o GIF de máximo ${IMAGE_MAX_MB} MB.`
    return
  }
  error.value = ''
  uploading.value = true
  try {
    const body = new FormData()
    body.append('image', file)
    const { url } = await $api<{ url: string }>('/articles/images', { method: 'POST', body })
    editor.value?.chain().focus().setImage({ src: url, alt: file.name.replace(/\.[^.]+$/, '') }).run()
  }
  catch (e: any) {
    error.value = e?.data?.error ?? 'No pudimos subir la imagen.'
  }
  finally {
    uploading.value = false
  }
}

function onPick(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0])
    uploadImage(input.files[0])
  input.value = ''
}

function setLink() {
  const ed = editor.value
  if (!ed)
    return
  // eslint-disable-next-line no-alert
  const url = window.prompt('URL del enlace (déjalo vacío para quitarlo)', ed.getAttributes('link').href ?? 'https://')
  if (url === null)
    return
  if (url.trim() === '')
    ed.chain().focus().extendMarkRange('link').unsetLink().run()
  else
    ed.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
}

const tools = computed(() => {
  const e = editor.value
  const chain = () => e!.chain().focus()
  return [
    { label: 'Título', icon: 'lucide:heading-2', active: e?.isActive('heading', { level: 2 }), run: () => chain().toggleHeading({ level: 2 }).run() },
    { label: 'Subtítulo', icon: 'lucide:heading-3', active: e?.isActive('heading', { level: 3 }), run: () => chain().toggleHeading({ level: 3 }).run() },
    { label: 'Negrita', icon: 'lucide:bold', active: e?.isActive('bold'), run: () => chain().toggleBold().run() },
    { label: 'Cursiva', icon: 'lucide:italic', active: e?.isActive('italic'), run: () => chain().toggleItalic().run() },
    { label: 'Código en línea', icon: 'lucide:code', active: e?.isActive('code'), run: () => chain().toggleCode().run() },
    { label: 'Bloque de código', icon: 'lucide:square-terminal', active: e?.isActive('codeBlock'), run: () => chain().toggleCodeBlock().run() },
    { label: 'Enlace', icon: 'lucide:link', active: e?.isActive('link'), run: setLink },
    { label: 'Lista', icon: 'lucide:list', active: e?.isActive('bulletList'), run: () => chain().toggleBulletList().run() },
    { label: 'Lista numerada', icon: 'lucide:list-ordered', active: e?.isActive('orderedList'), run: () => chain().toggleOrderedList().run() },
    { label: 'Cita', icon: 'lucide:quote', active: e?.isActive('blockquote'), run: () => chain().toggleBlockquote().run() },
    { label: 'Justificar', icon: 'lucide:align-justify', active: e?.isActive({ textAlign: 'justify' }), run: () => chain().setTextAlign('justify').run() },
    { label: 'Alinear a la izquierda', icon: 'lucide:align-left', active: e?.isActive({ textAlign: 'left' }), run: () => chain().setTextAlign('left').run() },
  ]
})
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-subtle bg-surface-1">
    <div class="flex flex-wrap items-center gap-1 border-b border-subtle p-2">
      <button
        v-for="t in tools"
        :key="t.label"
        type="button"
        class="bt-chip !h-8 !px-2"
        :aria-pressed="!!t.active"
        :aria-label="t.label"
        :title="t.label"
        @click="t.run"
      >
        <Icon :name="t.icon" class="size-4" />
      </button>
      <button type="button" class="bt-chip !h-8 !px-2" aria-label="Insertar imagen" title="Insertar imagen" :disabled="uploading" @click="fileInput?.click()">
        <Icon :name="uploading ? 'lucide:loader-circle' : 'lucide:image-plus'" class="size-4" :class="uploading && 'animate-spin'" />
      </button>
      <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="sr-only" tabindex="-1" @change="onPick">
    </div>
    <EditorContent :editor="editor" />
    <p v-if="error" class="border-t border-subtle px-3 py-2 font-mono text-xs text-danger" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
:deep(.ProseMirror img) { @apply h-auto max-w-full rounded-md border border-subtle; }
:deep(.ProseMirror img.ProseMirror-selectednode) { @apply outline outline-2 outline-primary; }
:deep(.ProseMirror pre) { @apply overflow-x-auto rounded-md bg-surface-2 p-3 font-mono text-sm; }
</style>
