<script lang="ts" setup>
// /perfil era una copia del perfil propio. Ahora hay una sola página de perfil: /@username.
definePageMeta({ layout: 'custom', auth: true })
const { data: session } = useAuth()
const username = session.value?.user?.username
await navigateTo(username ? `/@${username}` : '/dashboard', { replace: true, redirectCode: 301 })
</script>

<template>
  <div />
</template>
