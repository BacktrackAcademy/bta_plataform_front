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
  <footer v-if="compact" class="mt-10 border-t border-subtle bg-surface-1">
    <div class="mx-auto flex max-w-[1200px] flex-col gap-3 px-5 py-4 font-mono text-xs text-foreground-subtle sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
      <p>© {{ year }} Backtrack Academy · Santiago, Chile</p>
      <nav aria-label="Pie de página" class="flex flex-wrap items-center gap-x-5 gap-y-1">
        <a :href="landingUrl('/privacy_policy')" class="bt-focus rounded transition-colors hover:text-foreground">Privacidad</a>
        <a :href="landingUrl('/terms_of_use')" class="bt-focus rounded transition-colors hover:text-foreground">Términos</a>
        <a href="mailto:contacto@backtrackacademy.com" class="bt-focus rounded transition-colors hover:text-foreground">Contacto</a>
        <button type="button" class="bt-focus inline-flex items-center gap-1 rounded transition-colors hover:text-primary-text" @click="toTop">
          <Icon name="lucide:arrow-up" class="size-3" aria-hidden="true" />
          Arriba
        </button>
      </nav>
    </div>
  </footer>
  <footer v-else class="relative mt-16 overflow-hidden border-t border-subtle bg-surface-1 text-foreground">
    <!-- decorative: tech grid -->
    <div
      class="bt-tech-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
      aria-hidden="true"
    />

    <div class="relative mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 lg:px-10">
      <div class="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
        <!-- Brand / terminal -->
        <div>
          <NuxtLink to="/dashboard" class="bt-focus inline-block rounded" aria-label="Backtrack Academy — Inicio">
            <CommonBrandLogo class="w-36" />
          </NuxtLink>
          <p class="t-body mt-5 max-w-sm">
            Cursos prácticos de ciberseguridad ofensiva y defensiva, en español.
          </p>

          <div class="mt-6 max-w-sm rounded-lg border border-subtle bg-surface-2 font-mono text-sm">
            <div class="flex items-center gap-1.5 border-b border-subtle px-3 py-2">
              <span class="size-2.5 rounded-full bg-foreground/15" />
              <span class="size-2.5 rounded-full bg-foreground/15" />
              <span class="size-2.5 rounded-full bg-foreground/15" />
              <span class="ml-2 text-xs text-foreground-subtle">contacto — bash</span>
            </div>
            <div class="space-y-1.5 p-3.5">
              <p>
                <span class="text-primary-text">$</span>
                <a href="mailto:contacto@backtrackacademy.com" class="ml-2 text-foreground transition-colors hover:text-primary-text">mail contacto@</a>
              </p>
              <p>
                <span class="text-primary-text">$</span>
                <a href="mailto:ventas@backtrackacademy.com" class="ml-2 text-foreground transition-colors hover:text-primary-text">mail ventas@ <span class="text-foreground-subtle"># empresas</span></a>
              </p>
              <p class="flex items-center gap-2 text-foreground-muted">
                <span class="text-primary-text">$</span>
                <span>status</span>
                <span class="inline-flex items-center gap-1.5 text-success">
                  <span class="size-1.5 rounded-full bg-success" />
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
                class="bt-focus flex size-9 items-center justify-center rounded-md border border-subtle text-foreground-muted transition-colors duration-fast hover:border-border-strong hover:bg-surface-3 hover:text-foreground"
              >
                <Icon :name="s.icon" class="size-4" />
              </a>
            </li>
          </ul>
        </div>

        <!-- Link columns -->
        <nav aria-label="Pie de página" class="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
          <div v-for="col in columns" :key="col.title">
            <h3 class="font-oswald text-lg font-medium uppercase tracking-wider text-foreground">
              {{ col.title }}
            </h3>
            <p class="mb-4 mt-0.5 font-mono text-xs text-foreground-subtle">
              <span class="text-primary-text/80">$</span> {{ col.cmd }}
            </p>
            <ul class="space-y-2.5 text-[15px]">
              <li v-for="l in col.links" :key="l.label">
                <component
                  :is="l.external ? 'a' : 'NuxtLink'"
                  v-bind="l.external ? { href: l.to } : { to: l.to }"
                  class="foot__link group inline-flex items-center"
                  :class="l.highlight ? 'text-primary-text' : 'text-foreground-muted hover:text-foreground'"
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
      <div class="mt-14 flex flex-col items-start justify-between gap-4 border-t border-subtle pt-6 text-sm text-foreground-subtle sm:flex-row sm:items-center">
        <p>
          © {{ year }} Backtrack Academy · Santiago, Chile · Todos los derechos reservados.
        </p>
        <div class="flex items-center gap-4">
          <span class="hidden items-center gap-1.5 md:inline-flex">
            <Icon name="lucide:shield-check" class="size-4 text-primary-text" />
            Aprende. Practica. Protege.
          </span>
          <button
            type="button"
            class="bt-focus inline-flex items-center gap-1.5 rounded-md border border-subtle px-3 py-1.5 text-foreground-muted transition-colors hover:border-primary/60 hover:text-primary-text"
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
  transition: color var(--duration-base) ease;
}
.foot__arrow {
  width: 0;
  overflow: hidden;
  opacity: 0;
  color: hsl(var(--primary));
  transition: width var(--duration-base) ease, opacity var(--duration-base) ease;
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
  background: hsl(var(--primary));
}
</style>
