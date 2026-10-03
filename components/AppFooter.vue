<script setup lang="ts">
// `compact`: slim single-row footer for data-heavy authenticated screens.
defineProps<{ compact?: boolean }>()

const landingUrl = useLandingUrl()
const year = new Date().getFullYear()

const columns = computed(() => [
  {
    title: 'Plataforma',
    cmd: 'ls ./plataforma',
    links: [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Catálogo de cursos', to: '/cursos' },
      { label: 'Mi progreso', to: '/mi-progreso' },
      { label: 'Guardados', to: '/guardados' },
      { label: 'Artículos', to: '/articulos' },
      { label: 'Debates', to: '/debates' },
      { label: 'Suscripción Pro', to: '/suscripciones', highlight: true },
    ],
  },
  {
    title: 'Academia',
    cmd: 'cat ./academia',
    links: [
      { label: 'Nosotros', to: landingUrl('/team'), external: true },
      { label: 'Patrocinios', to: landingUrl('/sponsorship'), external: true },
      { label: 'Valida tu certificado', to: landingUrl('/validate_certificate'), external: true },
      { label: 'Preguntas frecuentes', to: landingUrl('/preguntas-frecuentes'), external: true },
    ],
  },
  {
    title: 'Legal',
    cmd: 'cat ./legal',
    links: [
      { label: 'Políticas de privacidad', to: landingUrl('/privacy_policy'), external: true },
      { label: 'Términos de servicio', to: landingUrl('/terms_of_use'), external: true },
    ],
  },
])

const socials = [
  { label: 'Facebook', icon: 'lucide:facebook', href: 'https://www.facebook.com/BackTrackAcademy/' },
  { label: 'Instagram', icon: 'lucide:instagram', href: 'https://www.instagram.com/backtrackacademy/' },
  { label: 'LinkedIn', icon: 'lucide:linkedin', href: 'https://www.linkedin.com/company/backtrack-academy/' },
]

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <footer v-if="compact" class="mt-10 border-t border-white/[0.06] bg-bta-dark-blue">
    <div class="mx-auto flex max-w-[1200px] flex-col gap-3 px-5 py-4 font-inconsolata text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
      <p>© {{ year }} Backtrack Academy · Santiago, Chile</p>
      <nav aria-label="Pie de página" class="flex flex-wrap items-center gap-x-5 gap-y-1">
        <a :href="landingUrl('/privacy_policy')" class="bt-focus rounded transition-colors hover:text-white">Privacidad</a>
        <a :href="landingUrl('/terms_of_use')" class="bt-focus rounded transition-colors hover:text-white">Términos</a>
        <a href="mailto:contacto@backtrackacademy.com" class="bt-focus rounded transition-colors hover:text-white">Contacto</a>
        <button type="button" class="bt-focus inline-flex items-center gap-1 rounded transition-colors hover:text-bta-pink" @click="toTop">
          <Icon name="lucide:arrow-up" class="size-3" aria-hidden="true" />
          Arriba
        </button>
      </nav>
    </div>
  </footer>
  <footer v-else class="relative mt-16 overflow-hidden border-t border-white/[0.06] bg-bta-dark-blue text-white">
    <!-- decorative: neon line + tech grid -->
    <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-bta-pink to-transparent" aria-hidden="true" />
    <div
      class="bt-tech-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
      aria-hidden="true"
    />
    <div class="pointer-events-none absolute -top-32 left-1/2 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-bta-pink/10 blur-3xl" aria-hidden="true" />

    <div class="relative mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 lg:px-10">
      <div class="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
        <!-- Brand / terminal -->
        <div>
          <NuxtLink to="/dashboard" class="bt-focus inline-block rounded" aria-label="Backtrack Academy — Inicio">
            <img class="w-36" src="~/assets/logo.svg" alt="Backtrack Academy">
          </NuxtLink>
          <p class="mt-5 max-w-sm font-inconsolata text-base leading-relaxed text-bta-text-2">
            Cursos prácticos de ciberseguridad ofensiva y defensiva, en español.
          </p>

          <div class="mt-6 max-w-sm rounded-lg border border-white/[0.08] bg-black/40 font-inconsolata text-sm shadow-[0_0_30px_-15px_rgba(236,16,117,0.6)]">
            <div class="flex items-center gap-1.5 border-b border-white/[0.06] px-3 py-2">
              <span class="size-2.5 rounded-full bg-[#ff5f56]" />
              <span class="size-2.5 rounded-full bg-[#ffbd2e]" />
              <span class="size-2.5 rounded-full bg-[#27c93f]" />
              <span class="ml-2 text-xs text-white/40">contacto — bash</span>
            </div>
            <div class="space-y-1.5 p-3.5">
              <p>
                <span class="text-bta-pink">$</span>
                <a href="mailto:contacto@backtrackacademy.com" class="ml-2 text-white transition-colors hover:text-bta-pink">mail contacto@</a>
              </p>
              <p>
                <span class="text-bta-pink">$</span>
                <a href="mailto:ventas@backtrackacademy.com" class="ml-2 text-white transition-colors hover:text-bta-pink">mail ventas@ <span class="text-white/40"># empresas</span></a>
              </p>
              <p class="flex items-center gap-2 text-white/60">
                <span class="text-bta-pink">$</span>
                <span>status</span>
                <span class="inline-flex items-center gap-1.5 text-emerald-400">
                  <span class="relative flex size-2">
                    <span class="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/60 motion-reduce:animate-none" />
                    <span class="relative inline-flex size-2 rounded-full bg-emerald-400" />
                  </span>
                  online
                </span>
                <span class="term-cursor" aria-hidden="true" />
              </p>
            </div>
          </div>

          <ul class="mt-6 flex items-center gap-2" aria-label="Redes sociales">
            <li v-for="s in socials" :key="s.label">
              <a
                :href="s.href"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="s.label"
                class="bt-focus flex size-9 items-center justify-center rounded-md border border-white/[0.08] text-bta-text-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-bta-pink/60 hover:text-bta-pink hover:shadow-[0_8px_20px_-10px_rgba(236,16,117,0.8)]"
              >
                <Icon :name="s.icon" class="size-4" />
              </a>
            </li>
          </ul>
        </div>

        <!-- Link columns -->
        <nav aria-label="Pie de página" class="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
          <div v-for="col in columns" :key="col.title">
            <h3 class="font-oswald text-lg font-medium uppercase tracking-wider text-white">
              {{ col.title }}
            </h3>
            <p class="mb-4 mt-0.5 font-inconsolata text-xs text-white/30">
              <span class="text-bta-pink/80">$</span> {{ col.cmd }}
            </p>
            <ul class="space-y-2.5 font-inconsolata text-[15px]">
              <li v-for="l in col.links" :key="l.label">
                <component
                  :is="l.external ? 'a' : 'NuxtLink'"
                  v-bind="l.external ? { href: l.to } : { to: l.to }"
                  class="foot__link group inline-flex items-center"
                  :class="l.highlight ? 'text-bta-pink' : 'text-bta-text-2 hover:text-white'"
                >
                  <span class="foot__arrow" aria-hidden="true">&gt;</span>
                  {{ l.label }}
                </component>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <!-- Bottom bar -->
      <div class="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] pt-6 font-inconsolata text-sm text-white/40 sm:flex-row sm:items-center">
        <p>
          © {{ year }} Backtrack Academy · Santiago, Chile · Todos los derechos reservados.
        </p>
        <div class="flex items-center gap-4">
          <span class="hidden items-center gap-1.5 md:inline-flex">
            <Icon name="lucide:shield-check" class="size-4 text-bta-pink" />
            Aprende. Practica. Protege.
          </span>
          <button
            type="button"
            class="bt-focus inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] px-3 py-1.5 text-white/60 transition-colors hover:border-bta-pink/60 hover:text-bta-pink"
            @click="toTop"
          >
            <Icon name="lucide:arrow-up" class="size-3.5" />
            Volver arriba
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.foot__link {
  transition: color 0.2s ease, transform 0.2s ease;
}
.foot__arrow {
  width: 0;
  overflow: hidden;
  opacity: 0;
  color: #ec1075;
  transition: width 0.2s ease, opacity 0.2s ease;
}
.foot__link:hover .foot__arrow,
.foot__link:focus-visible .foot__arrow {
  width: 0.9rem;
  opacity: 1;
}
.term-cursor {
  display: inline-block;
  width: 0.5rem;
  height: 1rem;
  background: #ec1075;
  animation: blink 1.1s steps(1) infinite;
}
@keyframes blink {
  50% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .term-cursor { animation: none; }
}
</style>
