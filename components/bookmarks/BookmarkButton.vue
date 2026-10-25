<script setup lang="ts">
import type { BookmarkKind } from '~/interfaces/bookmarks'

// Guardar / Guardado: alterna en el servidor y refleja el estado real que devuelve.
// `slug` acepta el id o el slug del contenido; el estado inicial viene del detalle (`bookmarked`).
const props = defineProps<{ kind: BookmarkKind, slug: string | number, initial?: boolean, label?: string }>()

const { $api } = useNuxtApp()
const { status } = useAuth()
const route = useRoute()

const saved = ref(props.initial ?? false)
watch(() => props.initial, v => (saved.value = v ?? false))

const busy = ref(false)
const failed = ref(false)
async function toggle() {
  if (busy.value)
    return
  if (status.value !== 'authenticated') {
    await navigateTo({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  busy.value = true
  failed.value = false
  try {
    saved.value = (await $api<{ bookmarked: boolean }>(`/bookmarks/${props.kind}/${props.slug}`, { method: 'POST' })).bookmarked
  }
  catch {
    failed.value = true
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <button
    type="button"
    class="bt-btn-secondary !h-9 !px-3"
    :aria-pressed="saved"
    :aria-busy="busy"
    :disabled="busy"
    :title="failed ? 'No pudimos guardarlo. Inténtalo de nuevo.' : undefined"
    @click="toggle"
  >
    <Icon :name="failed ? 'lucide:triangle-alert' : 'lucide:bookmark'" class="size-4" :class="saved && !failed && 'fill-current text-primary-text'" aria-hidden="true" />
    {{ failed ? 'Reintentar' : saved ? 'Guardado' : 'Guardar' }}<span v-if="label" class="sr-only"> {{ label }}</span>
  </button>
</template>
