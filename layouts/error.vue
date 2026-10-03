<script setup lang="ts">
// Página de error global: sobria, estilo terminal. `error` lo inyecta Nuxt.
const props = defineProps<{ error: { statusCode?: number, statusMessage?: string } }>()

const is404 = computed(() => props.error?.statusCode === 404)
const title = computed(() => (is404.value ? 'Ruta no encontrada' : 'Algo salió mal'))
const detail = computed(() => (is404.value
  ? 'La página que buscas no existe o fue movida.'
  : (props.error?.statusMessage || 'Ocurrió un error inesperado. Inténtalo de nuevo en unos minutos.')))

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <main class="relative grid min-h-screen place-items-center overflow-hidden bg-background px-5 text-foreground">
    <div class="bt-tech-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,#000_10%,transparent_70%)]" aria-hidden="true" />

    <section class="relative w-full max-w-lg rounded-lg border border-border bg-surface-2 shadow-elev-2" role="alert">
      <div class="flex items-center gap-1.5 border-b border-subtle px-4 py-2.5">
        <span class="size-2.5 rounded-full bg-foreground/15" />
        <span class="size-2.5 rounded-full bg-foreground/15" />
        <span class="size-2.5 rounded-full bg-foreground/15" />
        <span class="ml-2 font-mono text-xs text-foreground-subtle">error — bash</span>
      </div>
      <div class="space-y-5 p-6 sm:p-8">
        <p class="font-mono text-sm text-foreground-muted">
          <span class="text-primary-text">$</span> curl -I {{ $route.fullPath }}
        </p>
        <p class="font-oswald text-7xl font-semibold leading-none text-foreground">
          {{ error?.statusCode ?? 500 }}<span class="text-primary-text">_</span>
        </p>
        <div>
          <h1 class="t-h2">
            {{ title }}
          </h1>
          <p class="t-body mt-2">
            {{ detail }}
          </p>
        </div>
        <button type="button" class="bt-btn-primary bt-btn-lg" @click="goHome">
          <Icon name="lucide:arrow-left" class="size-4" />
          Volver al inicio
        </button>
      </div>
    </section>
  </main>
</template>
