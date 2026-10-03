<template>
  <div class="min-h-screen bg-background text-foreground">
    <header class="absolute inset-x-0 top-0 z-20">
      <div class="flex items-center justify-between h-20 px-6 lg:px-12">
        <NuxtLink to="/" aria-label="Backtrack Academy">
          <CommonBrandLogo class="w-28" />
        </NuxtLink>
        <CommonThemeToggle />
      </div>
    </header>
    <slot />
  </div>
</template>
