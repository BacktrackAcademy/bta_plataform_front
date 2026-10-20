<script setup lang="ts">
// Editor Markdown con barra de herramientas y vista previa. La previa la renderiza el servidor
// (POST /markdown/preview) con el mismo renderer que verá el lector, así no hay diferencias.
const props = withDefaults(defineProps<{
  modelValue: string
  id?: string
  rows?: number
  maxlength?: number
  placeholder?: string
  required?: boolean
}>(), { rows: 9, maxlength: 10000 })

const emit = defineEmits<{ 'update:modelValue': [value: string], 'submit': [] }>()

const { $api } = useNuxtApp()
const area = ref<HTMLTextAreaElement>()
const tab = ref<'write' | 'preview'>('write')
const html = ref('')
const loading = ref(false)
const previewError = ref('')

const value = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })

// Envuelve la selección (o inserta una plantilla) y deja el cursor donde corresponde.
function wrap(before: string, after = before, placeholder = 'texto') {
  const el = area.value
  if (!el)
    return
  const { selectionStart: start, selectionEnd: end } = el
  const selected = value.value.slice(start, end) || placeholder
  value.value = `${value.value.slice(0, start)}${before}${selected}${after}${value.value.slice(end)}`
  nextTick(() => {
    el.focus()
    el.setSelectionRange(start + before.length, start + before.length + selected.length)
  })
}

// Prefija cada línea seleccionada (listas, citas).
function prefixLines(prefix: string) {
  const el = area.value
  if (!el)
    return
  const start = value.value.lastIndexOf('\n', el.selectionStart - 1) + 1
  const end = el.selectionEnd
  const block = value.value.slice(start, end) || 'elemento'
  const out = block.split('\n').map((l, i) => `${prefix === '1. ' ? `${i + 1}. ` : prefix}${l}`).join('\n')
  value.value = value.value.slice(0, start) + out + value.value.slice(end)
  nextTick(() => el.focus())
}

const tools = [
  { label: 'Negrita', icon: 'lucide:bold', run: () => wrap('**') },
  { label: 'Cursiva', icon: 'lucide:italic', run: () => wrap('*') },
  { label: 'Código en línea', icon: 'lucide:code', run: () => wrap('`', '`', 'comando') },
  { label: 'Bloque de código', icon: 'lucide:square-terminal', run: () => wrap('\n```\n', '\n```\n', 'código') },
  { label: 'Enlace', icon: 'lucide:link', run: () => wrap('[', '](https://)', 'texto del enlace') },
  { label: 'Lista', icon: 'lucide:list', run: () => prefixLines('- ') },
  { label: 'Lista numerada', icon: 'lucide:list-ordered', run: () => prefixLines('1. ') },
  { label: 'Cita', icon: 'lucide:quote', run: () => prefixLines('> ') },
]

async function showPreview() {
  tab.value = 'preview'
  previewError.value = ''
  if (!value.value.trim()) {
    html.value = ''
    return
  }
  loading.value = true
  try {
    html.value = (await $api<{ html: string }>('/markdown/preview', { method: 'POST', body: { text: value.value } })).html
  }
  catch {
    previewError.value = 'No pudimos generar la vista previa.'
  }
  finally {
    loading.value = false
  }
}

function onKey(e: KeyboardEvent) {
  if (!(e.ctrlKey || e.metaKey))
    return
  if (e.key === 'Enter')
    emit('submit')
  else if (e.key === 'b') {
    e.preventDefault()
    wrap('**')
  }
  else if (e.key === 'i') {
    e.preventDefault()
    wrap('*')
  }
}
</script>

<template>
  <div class="rounded-md border border-input bg-surface-1 focus-within:border-primary/70 focus-within:ring-2 focus-within:ring-primary/25">
    <div class="flex flex-wrap items-center gap-1 border-b border-subtle px-2 py-1.5">
      <div class="flex gap-1" role="tablist" aria-label="Modo del editor">
        <button type="button" role="tab" class="bt-chip !h-7" :aria-selected="tab === 'write'" :aria-pressed="tab === 'write'" @click="tab = 'write'">
          Escribir
        </button>
        <button type="button" role="tab" class="bt-chip !h-7" :aria-selected="tab === 'preview'" :aria-pressed="tab === 'preview'" @click="showPreview">
          Vista previa
        </button>
      </div>
      <div v-show="tab === 'write'" class="ml-auto flex flex-wrap gap-0.5">
        <button v-for="t in tools" :key="t.label" type="button" class="bt-icon-btn !size-8" :aria-label="t.label" :title="t.label" @click="t.run">
          <Icon :name="t.icon" class="size-4" />
        </button>
      </div>
    </div>

    <textarea
      v-show="tab === 'write'"
      :id="id"
      ref="area"
      v-model="value"
      :rows="rows"
      :maxlength="maxlength"
      :placeholder="placeholder"
      :required="required"
      class="block w-full resize-y bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none"
      @keydown="onKey"
    />

    <div v-if="tab === 'preview'" class="min-h-[120px] px-3 py-3" :style="{ minHeight: `${rows * 1.5}rem` }">
      <p v-if="loading" class="t-small">
        Generando vista previa…
      </p>
      <p v-else-if="previewError" class="font-mono text-xs text-danger" role="alert">
        {{ previewError }}
      </p>
      <p v-else-if="!html" class="t-small">
        Nada que previsualizar todavía.
      </p>
      <div v-else class="t-body prose-sm max-w-none break-words" v-html="html" />
    </div>
  </div>
</template>
