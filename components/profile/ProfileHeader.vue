<script setup lang="ts">
import type { PublicProfile } from '~/interfaces/profile'
import { Button } from '~/components/ui/button'

// Cabecera del perfil (portada, identidad, acciones y métricas). La comparten /@usuario,
// /@usuario/seguidores y /@usuario/siguiendo para que se vea siempre igual.
const props = defineProps<{
  profile: PublicProfile
  /** Métrica resaltada cuando estamos dentro de su lista. */
  active?: 'followers' | 'following'
}>()

const p = computed(() => props.profile)
const route = useRoute()
const { status } = useAuth()
const siteUrl = useSiteUrl()
const loggedIn = computed(() => status.value === 'authenticated')
const canonical = computed(() => siteUrl(`/@${p.value.username}`))
const socialTitle = computed(() => `${[p.value.full_name, p.value.headline].filter(Boolean).join(' — ').slice(0, 45)} | Backtrack Academy`)

// ---- Seguir / compartir ------------------------------------------------------------------
const api = useNuxtApp().$api as typeof $fetch
const following = ref(Boolean(p.value.is_following))
const followers = ref(p.value.stats.followers)
const pending = ref(false)
const copied = ref(false)

async function toggleFollow() {
  if (!loggedIn.value) {
    return navigateTo({ path: '/login', query: { redirect: route.fullPath } })
  }
  pending.value = true
  try {
    const res = await api<{ following: boolean, followers: number }>(
      `/profile/${encodeURIComponent(p.value.username)}/follow`,
      { method: following.value ? 'DELETE' : 'POST' },
    )
    following.value = res.following
    followers.value = res.followers
  }
  finally {
    pending.value = false
  }
}

async function share() {
  const url = canonical.value
  if (navigator.share) {
    try {
      await navigator.share({ title: socialTitle.value, url })
      return
    }
    catch { /* cancelado por el usuario: caemos al portapapeles */ }
  }
  await navigator.clipboard?.writeText(url)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}



const NuxtLinkComp = resolveComponent('NuxtLink')

// Cada métrica lleva a su sección (ancla) o a su lista; solo es enlace si la sección existe en la página.
const stats = computed(() => {
  const s = p.value.stats
  const act = p.value.activity
  const anchor = (id: string, shown: number) => (shown > 0 ? `/@${p.value.username}#${id}` : null)
  return [
    s.ranking ? { key: 'ranking', label: 'Ranking', value: `#${s.ranking}`, to: loggedIn.value ? '/ranking' : null } : null,
    s.certificates ? { key: 'certificates', label: 'Certificados', value: s.certificates, to: anchor('certificados', act.certificates.length) } : null,
    s.courses_taught ? { key: 'courses', label: 'Cursos', value: s.courses_taught, to: anchor('cursos', act.courses.length) } : null,
    s.articles ? { key: 'articles', label: 'Artículos', value: s.articles, to: anchor('articulos', act.articles.length) } : null,
    s.questions ? { key: 'questions', label: 'Preguntas', value: s.questions, to: anchor('preguntas', act.questions.length) } : null,
    { key: 'followers', label: 'Seguidores', value: followers.value, to: `/@${p.value.username}/seguidores` },
    { key: 'following', label: 'Siguiendo', value: s.following, to: `/@${p.value.username}/siguiendo` },
  ].filter(Boolean) as { key: string, label: string, value: string | number, to?: string | null }[]
})

</script>

<template>
  <header class="overflow-hidden rounded-lg border border-subtle bg-surface-2 shadow-elev-2">
    <!-- Portada -->
    <div class="relative h-32 overflow-hidden sm:h-44" aria-hidden="true">
      <div class="absolute inset-0 bg-[radial-gradient(120%_140%_at_0%_0%,hsl(var(--primary)/0.38),transparent_55%),radial-gradient(90%_120%_at_100%_100%,hsl(var(--brand-violet)/0.35),transparent_60%)]" />
      <div class="bt-tech-grid absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
    </div>

    <div class="relative px-5 pb-8 sm:px-8">
      <div class="-mt-14 flex flex-col items-center gap-5 sm:-mt-16 sm:flex-row sm:items-start sm:gap-7">
        <ProfileAvatar :src="p.avatar_url" :name="p.full_name" size="lg" class="shrink-0 shadow-elev-2" />

        <div class="min-w-0 flex-1 text-center sm:pt-[5.75rem] sm:text-left">
          <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-start">
            <h1 class="break-words font-oswald text-3xl font-semibold leading-none tracking-tight text-foreground [text-wrap:balance] sm:text-[2.6rem]">
              {{ p.full_name }}
            </h1>
            <span
              v-if="p.role_label"
              class="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-primary-text"
            >
              <Icon name="lucide:badge-check" class="size-3.5" aria-hidden="true" />{{ p.role_label }}
            </span>
          </div>
          <div class="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-start">
            <template v-if="p.headline">
              <p class="font-sans text-base font-semibold leading-tight text-foreground">
                {{ p.headline }}
              </p>
              <span class="text-foreground-muted/60" aria-hidden="true">·</span>
            </template>
            <p class="break-all text-base leading-tight text-primary-text">
              @{{ p.username }}
            </p>
          </div>
          <p v-if="p.aboutme" class="mt-3 max-w-2xl whitespace-pre-line font-sans text-[15px] leading-snug tracking-[-0.01em] text-foreground-muted sm:text-base sm:leading-6">
            {{ p.aboutme }}
          </p>
        </div>

        <div class="flex shrink-0 flex-wrap items-center justify-center gap-2 sm:pt-[5.5rem]">
          <Button v-if="p.is_owner" as-child class="bt-focus rounded-lg bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90">
            <NuxtLink to="/perfil/editar">
              <Icon name="lucide:pencil" class="mr-2 size-4" /> Editar perfil
            </NuxtLink>
          </Button>
          <Button
            v-else
            :disabled="pending"
            :aria-pressed="following"
            class="bt-focus rounded-lg px-4 font-semibold"
            :class="following ? 'border border-strong bg-transparent text-foreground hover:bg-foreground/10' : 'bg-primary text-primary-foreground hover:bg-primary/90'"
            @click="toggleFollow"
          >
            <Icon :name="following ? 'lucide:user-check' : 'lucide:user-plus'" class="mr-2 size-4" />
            {{ following ? 'Siguiendo' : 'Seguir' }}
          </Button>
          <Button
            variant="outline"
            class="bt-focus rounded-lg border-border bg-foreground/[0.03] px-4 text-foreground hover:bg-foreground/10 hover:text-foreground"
            @click="share"
          >
            <Icon :name="copied ? 'lucide:check' : 'lucide:share-2'" class="mr-2 size-4" />
            {{ copied ? 'Enlace copiado' : 'Compartir' }}
          </Button>
        </div>
      </div>
    </div>

    <!-- Métricas: solo las que existen -->
    <dl class="grid grid-cols-2 divide-x divide-y divide-subtle border-t border-subtle bg-foreground/[0.015] sm:grid-flow-col sm:auto-cols-fr sm:divide-y-0">
      <div v-for="s in stats" :key="s.key">
        <component :is="s.to ? NuxtLinkComp : 'div'" :to="s.to || undefined" class="bt-focus group block px-4 py-4 text-center transition-colors sm:text-left" :class="[s.to && 'hover:bg-foreground/[0.04]', s.key === active && 'bg-primary/[0.06] shadow-[inset_0_-2px_0_hsl(var(--primary))]']" :aria-current="s.key === active ? 'page' : undefined">
          <dd class="font-oswald text-2xl font-semibold leading-none tabular-nums" :class="s.key === 'ranking' || s.key === active ? 'text-primary-text' : 'text-foreground'">
            {{ s.value }}
          </dd>
          <dt class="mt-1.5 font-mono text-xs uppercase tracking-[0.14em] text-foreground-muted transition-colors group-hover:text-foreground">
            {{ s.label }}
          </dt>
        </component>
      </div>
    </dl>
  </header>
</template>
