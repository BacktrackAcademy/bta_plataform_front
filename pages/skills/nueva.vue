<script setup lang="ts">
import PageHeader from '~/components/common/PageHeader.vue'

definePageMeta({ layout: 'custom', auth: true })
useSeoMeta({ title: 'Publicar una skill', robots: 'noindex, nofollow' })
</script>

<template>
  <div class="mx-auto w-full max-w-[960px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <PageHeader title="Publicar una skill">
      Comparte un prompt, skill de IA o automatización con la comunidad. Empiezas con un borrador.
    </PageHeader>
    <SkillsSkillForm />
  </div>
</template>
