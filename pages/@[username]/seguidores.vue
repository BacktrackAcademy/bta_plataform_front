<script lang="ts" setup>
import type { ProfilePeoplePage } from '~/interfaces/profile'

// Seguidores: solo dentro de la aplicación (requiere sesión) y fuera de buscadores.
definePageMeta({ layout: 'custom', auth: true })
useSeoMeta({ title: 'Seguidores', robots: 'noindex, follow' })

const username = computed(() => String(useRoute().params.username))
const page = ref(1)
const { data, status, error } = await useAPI<ProfilePeoplePage>(
  () => `/profile/${encodeURIComponent(username.value)}/followers`,
  { query: computed(() => ({ page: page.value })), retry: false },
)
if (error.value?.statusCode === 404) {
  throw createError({ statusCode: 404, statusMessage: 'Perfil no encontrado', fatal: true })
}
</script>

<template>
  <ProfilePeopleList
    :username="username"
    title="Seguidores"
    empty="Todavía no tiene seguidores."
    :page-data="data"
    :loading="status === 'pending'"
    @page="page = $event"
  />
</template>
