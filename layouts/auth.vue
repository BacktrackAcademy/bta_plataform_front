<template>
  <div class="min-h-screen bg-[#0E0F22] text-white">
    <header class="absolute inset-x-0 top-0 z-20">
      <div class="flex items-center justify-between h-20 px-6 lg:px-12">
        <NuxtLink to="/" aria-label="Backtrack Academy">
          <img class="w-28" src="~/assets/logo.svg" alt="Backtrack Academy">
        </NuxtLink>
      </div>
    </header>
    <slot />
  </div>
</template>
