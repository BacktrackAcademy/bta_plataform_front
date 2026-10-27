<script setup lang="ts">
import type { SkillDuplicate } from '~/interfaces/skills'

// Aviso de contenido duplicado o casi duplicado. Informativo: el servidor bloquea solo copias exactas al enviar.
const props = defineProps<{ title: string, content: string, category: string, skillId?: number }>()

const { $api } = useNuxtApp()
const matches = ref<SkillDuplicate[]>([])
const checking = ref(false)

let timer: ReturnType<typeof setTimeout>
watch(() => props.content, (c) => {
  clearTimeout(timer)
  if (c.trim().length < 80) {
    matches.value = []
    return
  }
  timer = setTimeout(check, 1200)
})
onBeforeUnmount(() => clearTimeout(timer))

async function check() {
  checking.value = true
  try {
    const r = await $api<{ data: SkillDuplicate[] }>('/skills/duplicates', {
      method: 'POST',
      body: { title: props.title, content: props.content, category: props.category || undefined, id: props.skillId },
    })
    matches.value = r.data
  }
  catch {
    matches.value = []
  }
  finally {
    checking.value = false
  }
}
</script>

<template>
  <div v-if="matches.length" class="rounded-md border border-warning/30 bg-warning/[0.06] p-3 text-sm" role="status" aria-live="polite">
    <p class="font-medium text-warning">
      Encontramos contenido muy parecido
    </p>
    <ul class="mt-1 space-y-1 text-foreground-secondary">
      <li v-for="(m, i) in matches" :key="i">
        <span class="font-mono text-xs">{{ Math.round(m.similarity * 100) }}%</span>
        {{ m.exact ? 'idéntico' : 'similar' }} a
        <NuxtLink v-if="m.slug" :to="`/skills/${m.slug}`" target="_blank" class="underline">
          {{ m.title }}
        </NuxtLink>
        <span v-else>{{ m.title ?? 'otra skill en revisión' }}</span>
        <span v-if="m.own"> (tuya)</span>
      </li>
    </ul>
    <p class="t-small mt-1">
      Si ya existe algo igual, considera mejorarlo o aportar algo propio. Las copias exactas de otra persona no se pueden enviar a revisión.
    </p>
  </div>
</template>
