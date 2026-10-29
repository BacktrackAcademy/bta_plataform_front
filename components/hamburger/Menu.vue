<script setup lang="ts">
const emit = defineEmits<{
  close: []
}>()

const { status } = useAuth()
const isAuthenticated = computed(() => status.value === 'authenticated')

const mobileLinks = [
  { name: 'Cursos', url: '/cursos' },
  { name: 'Artículos', url: '/articulos' },
  { name: 'Debates', url: '/debates' },
  { name: 'Noticias', url: '/noticias' },
  { name: 'Planes', url: '/suscripciones' },
]
</script>

<template>
  <div class="flex flex-col p-4">
    <div class="mb-5 flex flex-col">
      <NuxtLink
        v-for="link in mobileLinks"
        :key="link.url"
        :to="link.url"
        class="border-b border-subtle px-1.5 pb-2 pt-3 font-oswald text-lg text-foreground"
        @click="emit('close')"
      >
        {{ link.name }}
      </NuxtLink>
    </div>
    <NuxtLink
      :to="isAuthenticated ? '/dashboard' : '/login'"
      class="bt-btn-primary my-0 block rounded-lg py-2 text-center font-oswald text-xl"
      @click="emit('close')"
    >
      {{ isAuthenticated ? 'Ir a mi dashboard' : 'Inicia sesión o Regístrate' }}
    </NuxtLink>
    <div class="mt-4 flex items-center justify-between border-t border-subtle pt-4 text-sm text-foreground-muted">
      <span>Apariencia</span>
      <CommonThemeToggle />
    </div>
  </div>
</template>
