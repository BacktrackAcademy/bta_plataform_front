<script setup lang="ts">
const landingUrl = useLandingUrl()
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <header class="absolute inset-x-0 top-0 z-20">
      <div class="flex items-center justify-between h-20 px-6 lg:px-12">
        <a :href="landingUrl('/')" class="bt-focus rounded-sm" aria-label="Backtrack Academy — Volver al sitio">
          <CommonBrandLogo class="w-28" />
        </a>
        <CommonThemeToggle />
      </div>
    </header>
    <slot />
  </div>
</template>
