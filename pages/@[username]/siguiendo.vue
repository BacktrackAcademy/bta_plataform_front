<script lang="ts" setup>
import type { ProfilePeoplePage } from '~/interfaces/profile'

// Siguiendo: solo dentro de la aplicación (requiere sesión) y fuera de buscadores.
definePageMeta({ layout: 'custom', auth: true })
useSeoMeta({ title: 'Siguiendo', robots: 'noindex, follow' })

const username = computed(() => String(useRoute().params.username))
const page = ref(1)
const { data, status, error } = await useAPI<ProfilePeoplePage>(
  () => `/profile/${encodeURIComponent(username.value)}/following`,
  { query: computed(() => ({ page: page.value })), retry: false },
)
if (error.value?.statusCode === 404) {
  throw createError({ statusCode: 404, statusMessage: 'Perfil no encontrado', fatal: true })
}
</script>

<template>
  <ProfilePeopleList
    :username="username"
    title="Siguiendo"
    empty="Todavía no sigue a nadie."
    :page-data="data"
    :loading="status === 'pending'"
    @page="page = $event"
  />
</template>
