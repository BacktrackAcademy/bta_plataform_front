<script setup lang="ts">
// The public landing lives in its own app (bta_plataform_landing_page). Here "/" just routes into the platform.
definePageMeta({ auth: false })

const { status } = useAuth()
await navigateTo(status.value === 'authenticated' ? '/dashboard' : '/login', { replace: true })
</script>

<template>
  <div />
</template>
