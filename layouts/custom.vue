<script setup lang="ts">
const { isPremium } = usePremium()
const { count: cartCount } = useCart()
// El carrito vive en localStorage: el contador solo se pinta en cliente para no desajustar la hidratación.
const mounted = ref(false)
onMounted(() => (mounted.value = true))

// Authenticated shell: sidebar (lg) → icon rail (md) → bottom bar (mobile).
const SKILLS_OTHER = ['/skills/nueva', '/skills/editar', '/skills/mis-skills', '/skills/moderacion']
const navGroups = [
  {
    label: 'Aprender',
    items: [
      { to: '/dashboard', label: 'Inicio', icon: 'lucide:home' },
      { to: '/cursos', label: 'Cursos', icon: 'lucide:book-open' },
      { to: '/especialidades', label: 'Especialidades', icon: 'lucide:layers' },
      { to: '/examenes', label: 'Exámenes', icon: 'lucide:file-check-2' },
      { to: '/mi-progreso', label: 'Mi progreso', icon: 'lucide:bar-chart-3' },
      { to: '/guardados', label: 'Guardados', icon: 'lucide:bookmark' },
    ],
  },
  {
    label: 'Comunidad',
    items: [
      { to: '/articulos', label: 'Artículos', icon: 'lucide:file-text' },
      { to: '/debates', label: 'Debates', icon: 'lucide:message-circle' },
      { to: '/ranking', label: 'Ranking', icon: 'lucide:trophy' },
    ],
  },
  {
    label: 'Skills IA',
    items: [
      // /skills es prefijo de las demás: la Biblioteca (y sus fichas) se marca activa solo si no es otra pantalla del grupo.
      { to: '/skills', label: 'Biblioteca', icon: 'lucide:sparkles', badge: 'IA', match: (p: string) => p === '/skills' || (p.startsWith('/skills/') && !SKILLS_OTHER.some(o => p.startsWith(o))) },
      { to: '/skills/mis-skills', label: 'Mis skills', icon: 'lucide:folder-code', match: (p: string) => p.startsWith('/skills/mis-skills') },
    ],
  },
]
const route = useRoute()
// Ya autenticado: el destino guardado en el registro (cookie bta_next) cumplió su función.
onMounted(() => (useCookie('bta_next').value = null))
// Pantallas "workspace" (p. ej. estudiar una clase): ocupan todo el alto, sin footer y admiten modo foco.
const isWorkspace = computed(() => route.meta.workspace === true)
const { focus } = useFocusMode()
const focusActive = computed(() => isWorkspace.value && focus.value)
// En el workspace el shell ocupa exactamente el viewport: el documento no debe hacer scroll (evita bandas vacías
// bajo la app si algo —tooltips, overlays— se añade al <body>).
useHead({ bodyAttrs: { class: computed(() => isWorkspace.value ? 'md:overflow-hidden' : '') } })
// Header breadcrumb as a shell path: /curso/foo → ~/curso/foo
const sectionPath = computed(() => decodeURIComponent(route.path.replace(/^\/|\/$/g, '')) || 'dashboard')

// Barra inferior móvil: 4 destinos principales + "Más" (hoja con todos los grupos).
const moreOpen = ref(false)
const primaryTo = ['/dashboard', '/cursos', '/mi-progreso', '/skills']
const allItems = navGroups.flatMap(g => g.items)
const primaryItems = primaryTo.map(to => allItems.find(i => i.to === to)!)
function isItemActive(item: { to: string, match?: (p: string) => boolean }) {
  return item.match ? item.match(route.path) : route.path === item.to || route.path.startsWith(`${item.to}/`)
}
const moreActive = computed(() => !primaryItems.some(isItemActive) && allItems.some(isItemActive))
watch(() => route.fullPath, () => (moreOpen.value = false))
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape')
    moreOpen.value = false
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

const navLinkBase = 'bt-focus group relative flex items-center rounded-md text-sm font-medium text-foreground-muted transition-colors duration-fast ease-out hover:bg-foreground/[0.05] hover:text-foreground'
</script>

<template>
  <div class="shell min-h-screen bg-background text-foreground" :class="{ 'shell--focus': focusActive }">
    <!-- L1 · Sidebar (lg) / icon rail (md) / bottom bar (mobile) -->
    <nav
      v-if="!focusActive"
      aria-label="Principal"
      class="shell-menu hidden md:static md:z-auto md:flex md:h-screen md:flex-col md:border-r md:border-subtle"
    >
      <div class="hidden h-16 shrink-0 items-center justify-center border-b border-subtle md:flex lg:justify-start lg:px-6">
        <NuxtLink to="/dashboard" class="bt-focus rounded-sm" aria-label="Backtrack Academy — Inicio">
          <CommonBrandLogo class="hidden w-[104px] lg:block" />
          <span class="font-oswald text-lg font-bold tracking-widest text-foreground lg:hidden">BT<span class="text-primary-text">_</span></span>
        </NuxtLink>
      </div>

      <div class="flex md:flex-1 md:flex-col md:justify-start md:gap-0 md:overflow-y-auto md:overflow-x-visible md:px-3 md:py-5">
        <ul
          v-for="group in navGroups"
          :key="group.label"
          class="contents md:flex md:flex-col md:gap-0.5 md:[&:not(:first-of-type)]:mt-5 md:[&:not(:first-of-type)]:border-t md:[&:not(:first-of-type)]:border-subtle md:[&:not(:first-of-type)]:pt-5"
          :aria-label="group.label"
        >
          <li class="mb-1.5 hidden px-3 font-mono text-xs uppercase tracking-[0.16em] text-foreground-subtle lg:block" aria-hidden="true">
            <span class="text-primary-text/80">//</span> {{ group.label }}
          </li>
          <li v-for="item in group.items" :key="item.to" class="min-w-[72px] flex-1 md:min-w-0 md:flex-none">
            <NuxtLink
              :to="item.to"
              :title="item.label"
              :active-class="item.match ? '' : 'nav-active'"
              :class="[navLinkBase, item.match?.(route.path) ? 'nav-active' : '']"
              class="h-12 flex-col justify-center gap-0.5 md:h-9 md:flex-row md:justify-center md:gap-3 lg:justify-start lg:px-3"
            >
              <span class="nav-bar absolute inset-y-1.5 left-0 hidden w-0.5 rounded-full bg-primary opacity-0 transition-opacity duration-fast md:block" aria-hidden="true" />
              <Icon :name="item.icon" class="nav-icon size-[18px] shrink-0 transition-colors duration-fast" />
              <span class="text-[10px] md:hidden lg:inline lg:text-sm">{{ item.label }}</span>
              <span v-if="item.badge" class="ml-2 hidden rounded border border-primary/40 bg-primary/10 px-1.5 font-mono text-[10px] leading-4 text-primary-text lg:inline">{{ item.badge }}</span>
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

    <!-- Barra inferior (mobile): destinos principales + hoja "Más" -->
    <template v-if="!focusActive">
      <div v-if="moreOpen" class="fixed inset-0 z-40 bg-black/60 md:hidden" aria-hidden="true" @click="moreOpen = false" />
      <section
        v-if="moreOpen"
        id="more-sheet"
        role="dialog"
        aria-label="Todas las secciones"
        class="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-50 max-h-[70dvh] overflow-y-auto rounded-t-xl border border-b-0 border-subtle bg-surface-1 p-4 md:hidden"
      >
        <div v-for="group in navGroups" :key="group.label" class="mb-4 last:mb-0">
          <p class="mb-2 px-1 font-mono text-xs uppercase tracking-[0.16em] text-foreground-subtle"><span class="text-primary-text/80">//</span> {{ group.label }}</p>
          <ul class="grid grid-cols-2 gap-2">
            <li v-for="item in group.items" :key="item.to">
              <NuxtLink
                :to="item.to"
                :class="[navLinkBase, isItemActive(item) ? 'nav-active' : '']"
                class="h-11 gap-3 border border-subtle px-3"
              >
                <Icon :name="item.icon" class="nav-icon size-[18px] shrink-0" />
                <span class="truncate">{{ item.label }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </section>
      <nav aria-label="Principal" class="fixed inset-x-0 bottom-0 z-50 flex border-t border-subtle bg-surface-1 pb-[env(safe-area-inset-bottom)] md:hidden">
        <NuxtLink
          v-for="item in primaryItems"
          :key="item.to"
          :to="item.to"
          :class="[navLinkBase, isItemActive(item) ? 'nav-active' : '']"
          class="h-16 flex-1 flex-col justify-center gap-1 rounded-none"
        >
          <Icon :name="item.icon" class="nav-icon size-5 shrink-0" />
          <span class="text-[11px]">{{ item.label }}</span>
        </NuxtLink>
        <button
          type="button"
          :class="[navLinkBase, moreOpen || moreActive ? 'nav-active' : '']"
          class="h-16 flex-1 flex-col justify-center gap-1 rounded-none"
          aria-controls="more-sheet"
          :aria-expanded="moreOpen"
          @click="moreOpen = !moreOpen"
        >
          <Icon :name="moreOpen ? 'lucide:x' : 'lucide:menu'" class="nav-icon size-5 shrink-0" />
          <span class="text-[11px]">Más</span>
        </button>
      </nav>
    </template>

    <div class="shell-body flex min-w-0 flex-col md:h-screen md:pb-0" :class="focusActive ? 'pb-0' : 'pb-[calc(64px+env(safe-area-inset-bottom))]'">
      <!-- Topbar: mismo nivel que el contenido, separada sólo por un borde -->
      <header v-if="!focusActive" class="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-subtle bg-background/85 px-3 backdrop-blur sm:gap-4 sm:px-6 lg:px-10">
        <NuxtLink to="/dashboard" class="bt-focus rounded-sm md:hidden" aria-label="Backtrack Academy — Inicio">
          <CommonBrandLogo class="w-24 sm:w-28" />
        </NuxtLink>
        <p class="hidden min-w-0 items-center truncate font-mono text-sm text-foreground-secondary md:flex" aria-live="polite">
          <span class="text-primary-text">~/</span><span class="truncate">{{ sectionPath }}</span><span class="term-cursor ml-1" aria-hidden="true" />
        </p>
        <div class="flex min-w-0 items-center gap-1 sm:gap-4">
          <NuxtLink
            v-if="isPremium"
            to="/suscripciones"
            class="bt-btn h-9 border border-warning/40 bg-warning/10 px-2.5 font-oswald text-[15px] uppercase tracking-wider text-warning hover:bg-warning/15 sm:px-3.5"
            title="Tu suscripción está activa"
            aria-label="Cuenta Premium"
          >
            <Icon name="lucide:crown" class="size-3.5" />
            <span class="hidden sm:inline">Cuenta Premium</span>
          </NuxtLink>
          <NuxtLink
            v-else
            to="/suscripciones"
            class="bt-btn-primary h-9 px-2.5 font-oswald text-[15px] uppercase tracking-wider sm:px-3.5"
            aria-label="Vuélvete Pro"
          >
            <Icon name="lucide:zap" class="size-3.5" />
            <span class="hidden sm:inline">Vuélvete Pro</span>
          </NuxtLink>
          <CommonScoreChip class="max-sm:hidden" />
          <span class="hidden h-6 w-px bg-border sm:block" aria-hidden="true" />
          <CommonThemeToggle />
          <NuxtLink
            to="/suscripciones/carrito"
            class="relative inline-flex size-9 items-center justify-center rounded-md text-foreground-subtle transition-colors hover:text-foreground"
            :aria-label="mounted && cartCount ? `Carrito, ${cartCount} ${cartCount === 1 ? 'producto' : 'productos'}` : 'Carrito'"
          >
            <Icon name="lucide:shopping-cart" class="size-5" />
            <span
              v-if="mounted && cartCount"
              class="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-white"
              aria-hidden="true"
            >{{ cartCount > 99 ? '99+' : cartCount }}</span>
          </NuxtLink>
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
