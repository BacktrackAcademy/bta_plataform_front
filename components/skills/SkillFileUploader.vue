<script setup lang="ts">
import type { SkillFile, SkillOptions } from '~/interfaces/skills'

// Subida de archivos de apoyo. El navegador solo hace una validación rápida (extensión y tamaño);
// la validación real (contenido, ZIP, credenciales) la hace el servidor y nunca se ejecuta nada.
const props = defineProps<{ skillId: number, files: SkillFile[], limits: SkillOptions['limits'], disabled?: boolean }>()
const emit = defineEmits<{ changed: [skill: { files: SkillFile[], status: string }] }>()

const { $api } = useNuxtApp()
const busy = ref(false)
const error = ref('')
const input = ref<HTMLInputElement>()

const accept = computed(() => props.limits.extensions.join(','))
const remaining = computed(() => props.limits.max_files - props.files.length)

async function onPick(e: Event) {
  const picked = Array.from((e.target as HTMLInputElement).files ?? [])
  if (input.value)
    input.value.value = ''
  if (!picked.length)
    return
  error.value = ''
  if (picked.length > remaining.value) {
    error.value = `Solo puedes adjuntar ${props.limits.max_files} archivos por skill.`
    return
  }
  for (const f of picked) {
    const ext = `.${f.name.split('.').pop()?.toLowerCase()}`
    const max = ext === '.zip' ? props.limits.max_zip_bytes : props.limits.max_text_bytes
    if (!props.limits.extensions.includes(ext)) {
      error.value = `${f.name}: extensión no permitida (${props.limits.extensions.join(', ')}).`
      return
    }
    if (f.size > max) {
      error.value = `${f.name}: supera el máximo de ${formatBytes(max)}.`
      return
    }
  }
  busy.value = true
  try {
    const body = new FormData()
    picked.forEach(f => body.append('files[]', f))
    emit('changed', await $api(`/skills/${props.skillId}/files`, { method: 'POST', body }))
  }
  catch (err: any) {
    error.value = err?.data?.errors?.join(' ') ?? 'No pudimos subir el archivo.'
  }
  finally {
    busy.value = false
  }
}

async function remove(f: SkillFile) {
  // eslint-disable-next-line no-alert
  if (!confirm(`¿Quitar ${f.filename}?`))
    return
  busy.value = true
  error.value = ''
  try {
    await $api(`/skills/${props.skillId}/files/${f.id}`, { method: 'DELETE' })
    emit('changed', { files: props.files.filter(x => x.id !== f.id), status: '' })
  }
  catch {
    error.value = 'No pudimos quitar el archivo.'
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <div>
    <ul v-if="files.length" class="bt-surface divide-y divide-subtle">
      <li v-for="f in files" :key="f.id" class="flex items-center gap-3 px-4 py-3 text-sm">
        <Icon :name="f.content_type === 'application/zip' ? 'lucide:file-archive' : 'lucide:file-text'" class="size-4 shrink-0 text-foreground-muted" aria-hidden="true" />
        <span class="min-w-0 flex-1 truncate text-foreground">{{ f.filename }}</span>
        <span class="font-mono text-xs text-foreground-muted">{{ formatBytes(f.byte_size) }}</span>
        <button type="button" class="bt-btn-ghost !h-8" :disabled="busy || disabled" @click="remove(f)">
          Quitar
        </button>
      </li>
    </ul>
    <p v-else class="t-small">
      Aún no has adjuntado archivos. Es opcional: el contenido Markdown ya basta.
    </p>

    <div class="mt-3 flex flex-wrap items-center gap-3">
      <input ref="input" type="file" multiple class="sr-only" :accept="accept" @change="onPick">
      <button type="button" class="bt-btn-secondary" :disabled="busy || disabled || remaining <= 0" :aria-busy="busy" @click="input?.click()">
        <Icon name="lucide:upload" class="size-4" />
        {{ busy ? 'Validando…' : 'Adjuntar archivos' }}
      </button>
      <p class="t-small font-mono">
        {{ limits.extensions.join(' ') }} · texto {{ formatBytes(limits.max_text_bytes) }} · ZIP {{ formatBytes(limits.max_zip_bytes) }} · {{ files.length }}/{{ limits.max_files }}
      </p>
    </div>
    <p class="t-small mt-2">
      Los archivos se tratan como contenido no confiable: se validan en el servidor y nunca se ejecutan. Un ZIP de AI Skill debe incluir un <span class="font-mono">SKILL.md</span> en la raíz.
    </p>
    <p v-if="error" class="mt-2 font-mono text-xs text-danger" role="alert">
      {{ error }}
    </p>
  </div>
</template>
