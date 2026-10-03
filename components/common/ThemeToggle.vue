<script setup lang="ts">
// Botón día/noche. `useColorMode` guarda la preferencia (localStorage) y pone `dark`/`light` en <html>.
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

function toggle() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <ClientOnly>
    <button
      type="button"
      class="bt-icon-btn"
      :aria-label="isDark ? 'Cambiar a modo día' : 'Cambiar a modo noche'"
      :title="isDark ? 'Modo día' : 'Modo noche'"
      @click="toggle"
    >
      <Icon :name="isDark ? 'lucide:sun' : 'lucide:moon'" class="size-[18px]" />
    </button>
    <template #fallback>
      <span class="inline-block size-10" aria-hidden="true" />
    </template>
  </ClientOnly>
</template>
