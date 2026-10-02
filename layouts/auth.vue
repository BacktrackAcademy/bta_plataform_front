<script setup lang="ts">
const links = [
  { name: 'Cursos', url: '/cursos' },
  { name: 'Artículos', url: '/articulos' },
  { name: 'Debates', url: '/debates' },
]
</script>

<template>
  <div class="min-h-screen bg-[#05060B] text-white">
    <header class="absolute inset-x-0 top-0 z-20">
      <div class="flex items-center justify-between h-20 px-6 lg:px-12">
        <NuxtLink to="/" aria-label="Backtrack Academy">
          <img class="w-28" src="~/assets/logo.svg" alt="Backtrack Academy">
        </NuxtLink>
        <nav class="hidden md:flex items-center gap-8 font-oswald uppercase text-sm tracking-wide" aria-label="Principal">
          <NuxtLink
            v-for="link in links"
            :key="link.url"
            :to="link.url"
            class="text-white/55 hover:text-white transition-colors duration-300 focus-visible:outline-none focus-visible:text-white focus-visible:underline underline-offset-8 decoration-bta-pink"
          >
            {{ link.name }}
          </NuxtLink>
        </nav>
      </div>
    </header>
    <slot />
  </div>
</template>
