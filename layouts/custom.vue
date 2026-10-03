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
      { to: '/guardados', label: 'Guardados', icon: 'lucide:bookmark' },
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
// Pantallas "workspace" (p. ej. estudiar una clase): ocupan todo el alto, sin footer y admiten modo foco.
const isWorkspace = computed(() => route.meta.workspace === true)
const { focus } = useFocusMode()
const focusActive = computed(() => isWorkspace.value && focus.value)
// Header breadcrumb as a shell path: /curso/foo → ~/curso/foo
const sectionPath = computed(() => decodeURIComponent(route.path.replace(/^\/|\/$/g, '')) || 'dashboard')

const navLinkBase = 'bt-focus group relative flex items-center rounded-md text-sm font-medium text-foreground-muted transition-colors duration-fast ease-out hover:bg-foreground/[0.05] hover:text-foreground'
</script>

<template>
  <div class="shell min-h-screen bg-background text-foreground" :class="{ 'shell--focus': focusActive }">
    <!-- L1 · Sidebar (lg) / icon rail (md) / bottom bar (mobile) -->
    <nav
      v-if="!focusActive"
      aria-label="Principal"
      class="shell-menu fixed inset-x-0 bottom-0 z-40 border-t border-subtle bg-surface-1 md:static md:z-auto md:flex md:h-screen md:flex-col md:border-r md:border-t-0"
    >
      <div class="hidden h-16 shrink-0 items-center justify-center border-b border-subtle md:flex lg:justify-start lg:px-6">
        <NuxtLink to="/dashboard" class="bt-focus rounded-sm" aria-label="Backtrack Academy — Inicio">
          <CommonBrandLogo class="hidden w-[104px] lg:block" />
          <span class="font-oswald text-lg font-bold tracking-widest text-foreground lg:hidden">BT<span class="text-primary-text">_</span></span>
        </NuxtLink>
      </div>

      <div class="flex justify-around gap-1 px-2 py-1.5 md:flex-1 md:flex-col md:justify-start md:gap-0 md:overflow-y-auto md:px-3 md:py-5">
        <ul
          v-for="group in navGroups"
          :key="group.label"
          class="contents md:flex md:flex-col md:gap-0.5 md:[&:not(:first-of-type)]:mt-5 md:[&:not(:first-of-type)]:border-t md:[&:not(:first-of-type)]:border-subtle md:[&:not(:first-of-type)]:pt-5"
          :aria-label="group.label"
        >
          <li class="mb-1.5 hidden px-3 font-mono text-xs uppercase tracking-[0.16em] text-foreground-subtle lg:block" aria-hidden="true">
            <span class="text-primary-text/80">//</span> {{ group.label }}
          </li>
          <li v-for="item in group.items" :key="item.to" class="flex-1 md:flex-none">
            <NuxtLink
              :to="item.to"
              :title="item.label"
              active-class="nav-active"
              :class="navLinkBase"
              class="h-12 flex-col justify-center gap-0.5 md:h-9 md:flex-row md:justify-center md:gap-3 lg:justify-start lg:px-3"
            >
              <span class="nav-bar absolute inset-y-1.5 left-0 hidden w-0.5 rounded-full bg-primary opacity-0 transition-opacity duration-fast md:block" aria-hidden="true" />
              <Icon :name="item.icon" class="nav-icon size-[18px] shrink-0 transition-colors duration-fast" />
              <span class="text-[10px] md:hidden lg:inline lg:text-sm">{{ item.label }}</span>
              <span class="nav-prompt ml-auto hidden font-mono text-primary-text lg:inline" aria-hidden="true">&gt;</span>
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div class="hidden border-t border-subtle p-3 md:block">
        <p class="mb-1 hidden items-center gap-2 px-3 font-mono text-xs text-foreground-subtle lg:flex">
          <span class="size-1.5 rounded-full bg-success" aria-hidden="true" />
          sesión activa
        </p>
        <a
          href="mailto:contacto@backtrackacademy.com?subject=Feedback%20Backtrack%20Academy"
          title="Enviar feedback"
          :class="navLinkBase"
          class="h-9 justify-center gap-3 lg:justify-start lg:px-3"
        >
          <Icon name="lucide:terminal" class="size-[18px] shrink-0" />
          <span class="hidden lg:inline"><span class="font-mono text-primary-text">$</span> feedback</span>
        </a>
      </div>
    </nav>

    <div class="shell-body flex min-w-0 flex-col md:h-screen md:pb-0" :class="focusActive ? 'pb-0' : 'pb-[68px]'">
      <!-- Topbar: mismo nivel que el contenido, separada sólo por un borde -->
      <header v-if="!focusActive" class="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-subtle bg-background/85 px-4 backdrop-blur sm:px-6 lg:px-10">
        <NuxtLink to="/dashboard" class="bt-focus rounded-sm md:hidden" aria-label="Backtrack Academy — Inicio">
          <CommonBrandLogo class="w-28" />
        </NuxtLink>
        <p class="hidden min-w-0 items-center truncate font-mono text-sm text-foreground-secondary md:flex" aria-live="polite">
          <span class="text-primary-text">~/</span><span class="truncate">{{ sectionPath }}</span><span class="term-cursor ml-1" aria-hidden="true" />
        </p>
        <div class="flex items-center gap-3 sm:gap-4">
          <NuxtLink
            v-if="isPremium"
            to="/suscripciones"
            class="bt-btn h-9 border border-warning/40 bg-warning/10 px-3.5 font-oswald text-[15px] uppercase tracking-wider text-warning hover:bg-warning/15"
            title="Tu suscripción está activa"
          >
            <Icon name="lucide:crown" class="size-3.5" />
            Cuenta Premium
          </NuxtLink>
          <NuxtLink
            v-else
            to="/suscripciones"
            class="bt-btn-primary h-9 px-3.5 font-oswald text-[15px] uppercase tracking-wider"
          >
            <Icon name="lucide:zap" class="size-3.5" />
            Vuélvete Pro
          </NuxtLink>
          <span class="hidden h-6 w-px bg-border sm:block" aria-hidden="true" />
          <CommonThemeToggle />
          <NotificationsNotificationBell />
          <ProfileMenu />
        </div>
      </header>

      <main class="min-h-0 min-w-0 flex-1 bg-background" :class="isWorkspace ? 'md:flex md:flex-col md:overflow-hidden' : 'md:overflow-y-auto'">
        <slot />
        <AppFooter v-if="!isWorkspace" :compact="route.meta.footer === 'compact'" />
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

/* Modo foco: sin sidebar, el contenido ocupa todo el ancho */
@media (min-width: 768px) {
  .shell--focus {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* Item activo: tinte magenta muy transparente + barra lateral + icono de marca */
.nav-active {
  background-color: hsl(var(--primary) / 0.1);
  color: hsl(var(--foreground));
}
.nav-active .nav-bar {
  opacity: 1;
}
.nav-active .nav-icon {
  color: hsl(var(--primary-text));
}
.nav-prompt {
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity var(--duration-base) ease, transform var(--duration-base) ease;
}
.nav-active .nav-prompt {
  opacity: 1;
  transform: translateX(0);
}
/* Cursor de terminal: estático (sin parpadeo decorativo) */
.term-cursor {
  display: inline-block;
  width: 0.45rem;
  height: 0.95rem;
  background: hsl(var(--primary));
}
@media (max-width: 767px) {
  .nav-active {
    background-color: transparent;
    color: hsl(var(--primary-text));
  }
}
</style>
