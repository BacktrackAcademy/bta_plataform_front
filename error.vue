<script setup lang="ts">
// Página de error global (Nuxt la usa desde la raíz). `error` lo inyecta Nuxt.
// 404 → "Charly tocó algo que no debía"; cualquier otro error → "OOPS! tenemos un bug".
const props = defineProps<{ error: { statusCode?: number, statusMessage?: string } }>()

const route = useRoute()
const is404 = computed(() => props.error?.statusCode === 404)
const code = computed(() => props.error?.statusCode ?? 500)
const title = computed(() => (is404.value ? 'Creo que Charly tocó algo que no debía.' : '¡Oops! Parece que tenemos un bug.'))
const detail = computed(() => (is404.value
  ? 'Esta página desapareció misteriosamente. Sigamos explorando.'
  : (props.error?.statusMessage || 'Ocurrió un error inesperado. Inténtalo de nuevo en unos minutos.')))
const cta = computed(() => (is404.value ? 'Explorar cursos' : 'Volver atrás'))

function onCta() {
  if (is404.value)
    return clearError({ redirect: '/cursos' })
  if (import.meta.client && window.history.length > 1) {
    clearError()
    return window.history.back()
  }
  return clearError({ redirect: '/dashboard' })
}

function goHome() {
  return clearError({ redirect: '/dashboard' })
}
</script>

<template>
  <main class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-5 py-12 text-foreground">
    <div class="bt-tech-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,#000_10%,transparent_70%)]" aria-hidden="true" />
    <div class="pointer-events-none absolute left-1/2 top-[38%] size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[120px]" aria-hidden="true" />

    <section class="relative flex w-full max-w-3xl flex-col items-center text-center" role="alert">
      <span class="pointer-events-none absolute -top-2 select-none font-oswald text-[10rem] font-semibold leading-none tracking-tight text-foreground/[0.05] sm:-top-6 sm:text-[17rem]" aria-hidden="true">{{ code }}</span>

      <img
        src="/charlie-404.png"
        alt="Charly sosteniendo dos cables desconectados"
        width="2626"
        height="1448"
        class="relative h-auto w-full max-w-2xl select-none drop-shadow-[0_0_40px_rgba(236,72,153,0.25)]"
        draggable="false"
      >

      <p class="relative mt-2 font-mono text-xs text-foreground-subtle">
        <span class="text-primary-text">$</span> curl -I {{ route.fullPath }}
        <span class="ml-2 rounded border border-border bg-surface-2 px-1.5 py-0.5 text-foreground-muted">{{ code }}</span>
      </p>

      <h1 class="t-h1 relative mt-5 max-w-xl text-balance uppercase">
        {{ title }}
      </h1>
      <p class="t-body relative mt-3 max-w-md">
        {{ detail }}
      </p>

      <div class="relative mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <button type="button" class="bt-btn-primary bt-btn-lg uppercase" @click="onCta">
          {{ cta }}
        </button>
        <button type="button" class="bt-btn-lg rounded-md border border-border px-5 font-medium text-foreground-muted uppercase transition-colors hover:border-primary hover:text-foreground" @click="goHome">
          Ir al inicio
        </button>
      </div>
    </section>
  </main>
</template>
