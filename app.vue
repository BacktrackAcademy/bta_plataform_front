<script setup lang="ts">
useHead({
  htmlAttrs: {
    lang: 'es',
    class: 'dark',
  },
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: '48x48' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    // {
    //   rel: 'icon',
    //   type: 'image/x-icon',
    //   href: '/favicon-dark.ico',
    //   media: '(prefers-color-scheme: dark)',
    // },
  ],
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} | Backtrack Academy` : 'Cursos online de Hacking ético - Backtrack Academy'
  },
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- <Analytics/> -->
  </div>
</template>
