<script setup lang="ts">
import type { SkillGithubPreview } from '~/interfaces/skills'

// Importa SKILL.md / README.md de un repositorio público como vista previa. No guarda nada:
// al pulsar "Usar en el formulario" se rellenan los campos y la persona revisa antes de guardar.
const emit = defineEmits<{ import: [preview: SkillGithubPreview] }>()

const { $api } = useNuxtApp()
const url = ref('')
const busy = ref(false)
const error = ref('')
const preview = ref<SkillGithubPreview | null>(null)

async function load() {
  busy.value = true
  error.value = ''
  preview.value = null
  try {
    preview.value = await $api<SkillGithubPreview>('/skills/github/preview', { method: 'POST', body: { url: url.value.trim() } })
  }
  catch (e: any) {
    error.value = e?.data?.errors?.join(' ') ?? 'No pudimos importar el repositorio.'
  }
  finally {
    busy.value = false
  }
}
function use() {
  if (preview.value) {
    emit('import', preview.value)
    preview.value = null
  }
}
</script>

<template>
  <section class="bt-surface space-y-3 p-4" aria-labelledby="gh-title">
    <h3 id="gh-title" class="text-sm font-medium text-foreground">
      <Icon name="lucide:github" class="mr-1 size-4 text-foreground-muted" aria-hidden="true" />Importar desde GitHub
    </h3>
    <p class="t-small">
      Pega la URL de un repositorio público: traemos su SKILL.md (o README.md) como punto de partida. No se publica nada.
    </p>
    <form class="flex flex-col gap-2 sm:flex-row" @submit.prevent="load">
      <label for="gh-url" class="sr-only">URL del repositorio</label>
      <input id="gh-url" v-model="url" class="bt-input" type="url" placeholder="https://github.com/usuario/repo" required>
      <button type="submit" class="bt-btn-secondary shrink-0" :disabled="busy || !url.trim()" :aria-busy="busy">
        {{ busy ? 'Buscando…' : 'Buscar' }}
      </button>
    </form>
    <p v-if="error" class="font-mono text-xs text-danger" role="alert">
      {{ error }}
    </p>
    <div v-if="preview" class="space-y-2 rounded-md border border-subtle p-3 text-sm">
      <p class="text-foreground">
        <strong class="font-medium">{{ preview.title }}</strong> · <span class="font-mono text-xs text-foreground-muted">{{ preview.file }} en {{ preview.branch }}</span>
      </p>
      <p v-if="preview.summary" class="text-foreground-secondary">
        {{ preview.summary }}
      </p>
      <p v-if="preview.warnings.length" class="text-warning" role="alert">
        Detectamos posibles credenciales o avisos: {{ preview.warnings.join(', ') }}. Revísalo antes de guardar.
      </p>
      <button type="button" class="bt-btn-primary" @click="use">
        Usar en el formulario
      </button>
    </div>
  </section>
</template>
