<script setup lang="ts">
import type { SkillManaged } from '~/interfaces/skills'
import PageHeader from '~/components/common/PageHeader.vue'
import StateCard from '~/components/common/StateCard.vue'
import { Skeleton } from '~/components/ui/skeleton'

definePageMeta({ layout: 'custom', auth: true })
useSeoMeta({ title: 'Editar skill', robots: 'noindex, nofollow' })

// Carga solo en cliente: la skill es privada del autor y la sesión viaja con el token del navegador.
const id = String(useRoute().params.id)
const { data: skill, status, error, refresh } = useAPI<SkillManaged>(`/skills/${id}`, {
  key: `skill-edit-${id}`,
  lazy: true,
  server: false,
  retry: false,
})
</script>

<template>
  <div class="mx-auto w-full max-w-[960px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <PageHeader title="Editar skill">
      <template v-if="skill">
        <SkillsSkillStatusBadge :status="skill.status" />
        <span class="ml-2 font-mono">v{{ skill.version }}</span>
      </template>
    </PageHeader>
    <div v-if="status === 'pending' || status === 'idle'" class="mt-8 space-y-3" aria-busy="true">
      <Skeleton v-for="n in 4" :key="n" class="h-12 w-full" />
    </div>
    <StateCard v-else-if="error" class="mt-8" variant="error" title="No encontramos esta skill" text="Puede que no exista o no sea tuya.">
      <button type="button" class="bt-btn-secondary" @click="refresh()">
        Reintentar
      </button>
    </StateCard>
    <SkillsSkillForm v-else-if="skill" :skill="skill" />
  </div>
</template>
