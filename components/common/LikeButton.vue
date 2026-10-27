<script setup lang="ts">
// Botón "Me sirve" reutilizable: POST <endpoint> alterna el like y devuelve { liked_by_me, likes_count }.
const props = defineProps<{
  endpoint: string
  initialLiked?: boolean
  initialCount?: number
  label?: string
}>()

const { $api } = useNuxtApp()

const liked = ref(props.initialLiked ?? false)
const count = ref(props.initialCount ?? 0)
const busy = ref(false)
const failed = ref(false)

watch(() => [props.initialLiked, props.initialCount], () => {
  liked.value = props.initialLiked ?? false
  count.value = props.initialCount ?? 0
})

async function toggle() {
  if (busy.value)
    return
  busy.value = true
  failed.value = false
  try {
    const r = await $api<{ liked_by_me: boolean, likes_count: number }>(props.endpoint, { method: 'POST' })
    liked.value = r.liked_by_me
    count.value = r.likes_count
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
    class="bt-btn-ghost !h-8 !px-2.5"
    :aria-pressed="liked"
    :disabled="busy"
    :title="failed ? 'No pudimos registrar tu voto' : undefined"
    @click="toggle"
  >
    <Icon name="lucide:thumbs-up" class="size-4" :class="liked && 'text-primary-text'" aria-hidden="true" />
    {{ label ?? 'Me sirve' }}<template v-if="count"> · {{ count }}</template>
  </button>
</template>
