<script setup lang="ts">
import { HamburgerAnimatedButton } from '#components'

const { status } = useAuth()
const hamburgerMenuIsOpen = ref(false)
const links = [
  { name: 'Cursos', url: '/cursos' },
  { name: 'Artículos', url: '/articulos' },
  { name: 'Debates', url: '/debates' },
  { name: 'Noticias', url: '/noticias' },
]

function closeBurgerMenu() {
  hamburgerMenuIsOpen.value = false
}
function toggleBurgerMenu() {
  hamburgerMenuIsOpen.value = !hamburgerMenuIsOpen.value
}
</script>

<template>
  <nav class="relative h-20 z-[999999]">
    <div
      :class="{ ' -translate-y-[300%]': !hamburgerMenuIsOpen }"
      class="fixed lg:hidden w-full bg-surface-1 top-20 left-0 z-90 overflow-y-scroll h-[calc(100vh-5rem)] duration-500"
    >
      <HamburgerMenu @close="closeBurgerMenu" />
    </div>
    <div
      class="fixed top-0 left-0 w-full bg-surface-1"
    >
      <div class="container flex gap-6 items-center h-20">
        <div @click.prevent="closeBurgerMenu">
          <NuxtLink to="/">
            <img class="w-32" src="~/assets/logo.svg" alt="logo">
          </NuxtLink>
        </div>
        <div
          class="hidden lg:grid grid-flow-col auto-cols-auto items-center justify-items-center gap-8 ml-auto uppercase text-sm"
        >
          <NuxtLink
            v-for="(link, key) in links"
            :key="key"
            :to="link.url"
            class="nav__link"
          >
            <span class="relative text-foreground">
              {{ link.name }}
            </span>
          </NuxtLink>
          <NuxtLink
            to="/login"
            class="shadow-md shadow-primary/50 text-foreground font-oswald border-primary border px-3 py-1 flex-shrink-0"
          >
            Vuélvete Pro!
          </NuxtLink>
          <NuxtLink to="/login" class="nav__link">
            <span v-if="status.toLowerCase() === 'authenticated'">
              Dashboard
            </span>
            <span v-else>
              Iniciar sesión
            </span>
          </NuxtLink>
        </div>
        <HamburgerAnimatedButton
          :state="hamburgerMenuIsOpen"
          @toggle="toggleBurgerMenu"
        />
      </div>
    </div>
  </nav>
</template>

<style scoped>
.nav__link {
  @apply text-center text-foreground font-oswald relative before:block before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-full before:bg-primary before:scale-x-0 before:transition-all hover:before:scale-x-100;
}
</style>
