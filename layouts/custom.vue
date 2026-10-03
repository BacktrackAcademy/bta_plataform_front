<script setup lang="ts">
const { isPremium } = usePremium()

// Authenticated shell: sidebar (lg) → icon rail (md) → bottom bar (mobile).
const navGroups = [
  {
    label: 'Aprender',
    items: [
      { to: '/dashboard', label: 'Inicio', icon: 'lucide:home' },
      { to: '/cursos', label: 'Mis cursos', icon: 'lucide:book-open' },
      { to: '/mi-progreso', label: 'Mi progreso', icon: 'lucide:bar-chart-3' },
    ],
  },
  {
    label: 'Comunidad',
    items: [
      { to: '/articulos', label: 'Artículos', icon: 'lucide:file-text' },
      { to: '/debates', label: 'Debates', icon: 'lucide:message-circle' },
    ],
  },
]
const route = useRoute()
// Header breadcrumb as a shell path: /curso/foo → ~/curso/foo
const sectionPath = computed(() => decodeURIComponent(route.path.replace(/^\/|\/$/g, '')) || 'dashboard')

const navLinkBase = 'bt-focus group relative flex items-center rounded-md font-inconsolata text-[15px] text-bta-text-2 transition-colors duration-200 hover:bg-white/[0.04] hover:text-white'
</script>

<template>
  <div class="shell min-h-screen bg-bta-bg text-white">
    <!-- Sidebar (lg) / icon rail (md) / bottom bar (mobile) -->
    <nav
      aria-label="Principal"
      class="shell-menu fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.06] bg-bta-side md:static md:z-auto md:flex md:h-screen md:flex-col md:border-r md:border-t-0"
    >
      <div class="hidden h-16 shrink-0 items-center justify-center border-b border-white/[0.06] md:flex lg:justify-start lg:px-6">
        <NuxtLink to="/dashboard" class="bt-focus rounded" aria-label="Backtrack Academy — Inicio">
          <img class="hidden w-[104px] lg:block" src="~/assets/logo.svg" alt="Backtrack Academy">
          <span class="font-oswald text-lg font-bold tracking-widest text-white lg:hidden">BT<span class="text-bta-pink">_</span></span>
        </NuxtLink>
      </div>

      <div class="flex justify-around gap-1 px-2 py-1.5 md:flex-1 md:flex-col md:justify-start md:gap-6 md:overflow-y-auto md:px-3 md:py-6">
        <ul
          v-for="group in navGroups"
          :key="group.label"
          class="contents md:flex md:flex-col md:gap-1"
          :aria-label="group.label"
        >
          <li class="mb-1 hidden px-3 font-inconsolata text-[11px] uppercase tracking-[0.18em] text-gray-muted lg:block" aria-hidden="true">
            <span class="text-bta-pink/70">//</span> {{ group.label }}
          </li>
          <li v-for="item in group.items" :key="item.to" class="flex-1 md:flex-none">
            <NuxtLink
              :to="item.to"
              :title="item.label"
              active-class="nav-active !text-white"
              :class="navLinkBase"
              class="h-12 flex-col justify-center gap-0.5 md:h-10 md:flex-row md:justify-center md:gap-3 lg:justify-start lg:px-3"
            >
              <span class="nav-bar absolute inset-y-2 left-0 hidden w-0.5 bg-bta-pink opacity-0 shadow-[0_0_10px_rgba(236,16,117,0.8)] transition-opacity duration-200 md:block" aria-hidden="true" />
              <Icon :name="item.icon" class="nav-icon size-[18px] shrink-0 transition-colors duration-200" />
              <span class="text-[10px] md:hidden lg:inline lg:text-[15px]">{{ item.label }}</span>
              <span class="nav-prompt ml-auto hidden font-inconsolata text-bta-pink lg:inline" aria-hidden="true">&gt;</span>
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div class="hidden border-t border-white/[0.06] p-3 md:block">
        <p class="mb-2 hidden items-center gap-2 px-3 font-inconsolata text-xs text-gray-muted lg:flex">
          <span class="relative flex size-2">
            <span class="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/50 motion-reduce:animate-none" />
            <span class="relative inline-flex size-2 rounded-full bg-emerald-400" />
          </span>
          sesión activa
        </p>
        <a
          href="mailto:contacto@backtrackacademy.com?subject=Feedback%20Backtrack%20Academy"
          title="Enviar feedback"
          :class="navLinkBase"
          class="h-10 justify-center gap-3 text-[13px] lg:justify-start lg:px-3"
        >
          <Icon name="lucide:terminal" class="size-[18px] shrink-0" />
          <span class="hidden lg:inline"><span class="text-bta-pink">$</span> feedback</span>
        </a>
      </div>
    </nav>

    <div class="shell-body flex min-w-0 flex-col pb-[68px] md:h-screen md:pb-0">
      <header class="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-white/[0.06] bg-bta-bg/85 px-4 backdrop-blur sm:px-6 lg:px-10">
        <div class="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-bta-pink/50 via-bta-pink/10 to-transparent" aria-hidden="true" />
        <NuxtLink to="/dashboard" class="bt-focus rounded md:hidden" aria-label="Backtrack Academy — Inicio">
          <img class="w-28" src="~/assets/logo.svg" alt="Backtrack Academy">
        </NuxtLink>
        <p class="hidden min-w-0 items-center truncate font-inconsolata text-sm text-white md:flex" aria-live="polite">
          <span class="text-bta-pink">~/</span><span class="truncate">{{ sectionPath }}</span><span class="term-cursor ml-1" aria-hidden="true" />
        </p>
        <div class="flex items-center gap-3 sm:gap-4">
          <NuxtLink
            v-if="isPremium"
            to="/suscripciones"
            class="bt-focus group inline-flex h-9 items-center gap-2 border border-amber-400/70 bg-amber-400/[0.10] px-3.5 font-oswald text-[15px] uppercase tracking-wider text-amber-300 shadow-[0_0_20px_-8px_rgba(251,191,36,0.8)] transition-all duration-200 hover:border-amber-300 hover:bg-amber-400 hover:text-bta-dark-blue"
            title="Tu suscripción está activa"
          >
            <Icon name="lucide:crown" class="size-3.5 text-amber-300 transition-colors group-hover:text-bta-dark-blue" />
            Cuenta Premium
          </NuxtLink>
          <NuxtLink
            v-else
            to="/suscripciones"
            class="bt-focus group inline-flex h-9 items-center gap-2 border border-bta-pink/70 bg-bta-pink/[0.08] px-3.5 font-oswald text-[15px] uppercase tracking-wider text-white shadow-[0_0_20px_-8px_rgba(236,16,117,0.8)] transition-all duration-200 hover:border-bta-pink hover:bg-bta-pink"
          >
            <Icon name="lucide:zap" class="size-3.5 text-bta-pink transition-colors group-hover:text-white" />
            Vuélvete Pro
          </NuxtLink>
          <span class="hidden h-6 w-px bg-white/[0.08] sm:block" aria-hidden="true" />
          <ProfileMenu />
        </div>
      </header>

      <main class="min-w-0 flex-1 md:overflow-y-auto">
        <slot />
        <AppFooter />
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell {
  display: block;
}

@media (min-width: 768px) {
  .shell {
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr);
    height: 100vh;
    overflow: hidden;
  }
}

@media (min-width: 1024px) {
  .shell {
    grid-template-columns: 232px minmax(0, 1fr);
  }
}

.nav-active {
  background-image: linear-gradient(90deg, rgba(236, 16, 117, 0.14), transparent 85%);
}
.nav-active .nav-bar {
  opacity: 1;
}
.nav-active .nav-icon {
  color: #ec1075;
}
.nav-prompt {
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.nav-active .nav-prompt,
a:hover .nav-prompt {
  opacity: 1;
  transform: translateX(0);
}
.term-cursor {
  display: inline-block;
  width: 0.45rem;
  height: 0.95rem;
  background: #ec1075;
  animation: term-blink 1.1s steps(1) infinite;
}
@keyframes term-blink {
  50% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .term-cursor { animation: none; }
}
@media (max-width: 767px) {
  .nav-active {
    background-image: none;
    color: #ec1075 !important;
  }
}
</style>
