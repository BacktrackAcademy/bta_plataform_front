<script setup lang="ts">
// Denuncia de una skill o de un comentario. `endpoint` ya incluye el objetivo; el motivo es obligatorio.
const props = defineProps<{ open: boolean, endpoint: string, title: string }>()
const emit = defineEmits<{ close: [], done: [] }>()

const { $api } = useNuxtApp()
const reason = ref('spam')
const details = ref('')
const busy = ref(false)
const error = ref('')
const sent = ref(false)

watch(() => props.open, (o) => {
  if (o) {
    reason.value = 'spam'
    details.value = ''
    error.value = ''
    sent.value = false
  }
})

async function submit() {
  busy.value = true
  error.value = ''
  try {
    await $api(props.endpoint, { method: 'POST', body: { reason: reason.value, details: details.value.trim() || undefined } })
    sent.value = true
    emit('done')
  }
  catch (e: any) {
    error.value = e?.data?.errors?.join(' ') ?? 'No pudimos enviar la denuncia.'
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-[100] flex items-center justify-center bg-scrim p-4" role="dialog" aria-modal="true" :aria-label="title" @keydown.esc="emit('close')" @click.self="emit('close')">
    <div class="bt-surface w-full max-w-md space-y-4 bg-surface-2 p-5">
      <h2 class="t-h3">
        {{ title }}
      </h2>
      <template v-if="!sent">
        <fieldset class="space-y-2">
          <legend class="sr-only">
            Motivo
          </legend>
          <label v-for="(label, key) in SKILL_REPORT_REASONS" :key="key" class="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input v-model="reason" type="radio" name="report-reason" :value="key" class="accent-[hsl(var(--primary))]">
            {{ label }}
          </label>
        </fieldset>
        <div>
          <label for="report-details" class="text-sm font-medium text-foreground">Detalles <span class="font-normal text-foreground-muted">(opcional)</span></label>
          <textarea id="report-details" v-model="details" class="bt-input mt-2 !h-auto" rows="3" maxlength="1000" />
        </div>
        <p v-if="error" class="font-mono text-xs text-danger" role="alert">
          {{ error }}
        </p>
        <div class="flex justify-end gap-2">
          <button type="button" class="bt-btn-ghost" @click="emit('close')">
            Cancelar
          </button>
          <button type="button" class="bt-btn-primary" :disabled="busy" :aria-busy="busy" @click="submit">
            Enviar denuncia
          </button>
        </div>
      </template>
      <template v-else>
        <p class="text-sm text-foreground-secondary" role="status">
          Gracias. Un moderador revisará la denuncia.
        </p>
        <div class="flex justify-end">
          <button type="button" class="bt-btn-secondary" @click="emit('close')">
            Cerrar
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
