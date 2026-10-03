<script lang="ts" setup>
import type { PublicProfile } from '~/interfaces/profile'
import { Button } from '~/components/ui/button'

// Perfil público de Backtrack Academy: /@username
// SSR para que buscadores vean el contenido. Indexable SOLO si el usuario lo decidió
// (el backend manda `indexable`); perfiles privados responden 404 igual que un usuario inexistente.
definePageMeta({ layout: false, auth: false })

const route = useRoute()
const username = computed(() => String(route.params.username))
const { status } = useAuth()
const siteUrl = useSiteUrl()
const loggedIn = computed(() => status.value === 'authenticated')

const { data: profile, error } = await useAPI<PublicProfile>(
  () => `/profile/${encodeURIComponent(username.value)}`,
  { key: `profile-${username.value}`, retry: false },
)

if (error.value || !profile.value) {
  throw createError({ statusCode: 404, statusMessage: 'Perfil no encontrado', fatal: true })
}

// /@omar_veliz -> /@Omar_veliz (una sola URL por perfil)
if (profile.value.username !== username.value) {
  await navigateTo(`/@${profile.value.username}`, { redirectCode: 301, replace: true })
}

const p = computed(() => profile.value as PublicProfile)
const canonical = computed(() => siteUrl(`/@${p.value.username}`))

// app.vue agrega el sufijo " | Backtrack Academy" al <title>; og/twitter lo llevan explícito.
const title = computed(() => [p.value.full_name, p.value.headline].filter(Boolean).join(' — ').slice(0, 45))
const socialTitle = computed(() => `${title.value} | Backtrack Academy`)
const description = computed(() => {
  const text = [p.value.headline, p.value.aboutme].filter(Boolean).join('. ').replace(/\s+/g, ' ').trim()
  return (text || `Perfil de ${p.value.full_name} en Backtrack Academy.`).slice(0, 155)
})
const ogImage = computed(() => p.value.avatar_url || siteUrl('/og-image.png'))
const robots = computed(() => (p.value.indexable ? 'index, follow' : 'noindex, follow'))

useSeoMeta({
  title,
  description,
  robots,
  ogType: 'profile',
  ogTitle: socialTitle,
  ogDescription: description,
  ogUrl: canonical,
  ogImage,
  ogSiteName: 'Backtrack Academy',
  twitterCard: 'summary',
  twitterTitle: socialTitle,
  twitterDescription: description,
  twitterImage: ogImage,
})

useHead(() => ({
  // Sin canonical en perfiles noindex: evitamos señales mixtas.
  link: p.value.indexable ? [{ rel: 'canonical', href: canonical.value }] : [],
  script: p.value.indexable
    ? [{
        type: 'application/ld+json',
        // Solo datos que el usuario hizo públicos. `sameAs` únicamente con enlaces que él cargó.
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Person',
          'name': p.value.full_name,
          'url': canonical.value,
          ...(p.value.avatar_url && { image: p.value.avatar_url }),
          ...(description.value && { description: description.value }),
          ...(p.value.headline && { jobTitle: p.value.headline }),
          ...(Object.values(p.value.links).length && { sameAs: Object.values(p.value.links) }),
        }).replace(/</g, '\\u003c'),
      }]
    : [],
}))

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

// ---- Presentación ------------------------------------------------------------------------
function fmtDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString('es-CL', { month: 'short', year: 'numeric' }) : ''
}

const memberSince = computed(() => (p.value.member_since ? new Date(p.value.member_since).getFullYear() : null))

const stats = computed(() => {
  const s = p.value.stats
  return [
    s.ranking ? { key: 'ranking', label: 'Ranking', value: `#${s.ranking}` } : null,
    s.certificates ? { key: 'certificates', label: 'Certificados', value: s.certificates } : null,
    s.courses_taught ? { key: 'courses', label: 'Cursos', value: s.courses_taught } : null,
    s.articles ? { key: 'articles', label: 'Artículos', value: s.articles } : null,
    s.questions ? { key: 'questions', label: 'Preguntas', value: s.questions } : null,
    { key: 'followers', label: 'Seguidores', value: followers.value, to: loggedIn.value ? `/@${p.value.username}/seguidores` : null },
    { key: 'following', label: 'Siguiendo', value: s.following, to: loggedIn.value ? `/@${p.value.username}/siguiendo` : null },
  ].filter(Boolean) as { key: string, label: string, value: string | number, to?: string | null }[]
})

const a = computed(() => p.value.activity)
const hasActivity = computed(() =>
  a.value.certificates.length + a.value.articles.length + a.value.questions.length + a.value.courses.length > 0,
)
const linkLabels: Record<string, string> = { linkedin: 'LinkedIn', twitter: 'X', facebook: 'Facebook' }
const linkIcons: Record<string, string> = { linkedin: 'lucide:linkedin', twitter: 'lucide:twitter', facebook: 'lucide:facebook' }
</script>

<template>
  <NuxtLayout :name="loggedIn ? 'custom' : 'default'">
    <div class="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <!-- Vista previa del dueño con perfil privado -->
      <div
        v-if="p.is_owner && !p.public"
        class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-400/30 bg-amber-400/[0.06] px-4 py-3 font-inconsolata text-sm text-amber-200"
        role="status"
      >
        <p>
          <span class="text-amber-400">$</span> Solo tú ves esta página. Para que otras personas la encuentren, activa tu perfil público.
        </p>
        <NuxtLink to="/perfil/editar#privacidad" class="bt-focus rounded border border-amber-400/50 px-3 py-1 text-amber-100 transition-colors hover:bg-amber-400/15">
          Configurar privacidad
        </NuxtLink>
      </div>

      <!-- Cabecera -->
      <header class="overflow-hidden rounded-2xl border border-white/[0.07] bg-bta-surface shadow-[0_30px_60px_-40px_rgba(236,16,117,0.35)]">
        <!-- Portada -->
        <div class="relative h-28 overflow-hidden sm:h-40" aria-hidden="true">
          <div class="absolute inset-0 bg-[radial-gradient(120%_140%_at_0%_0%,rgba(236,16,117,0.38),transparent_55%),radial-gradient(90%_120%_at_100%_100%,rgba(88,64,255,0.22),transparent_60%)]" />
          <div class="bt-tech-grid absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          <div class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-bta-pink/60 to-transparent" />
        </div>

        <div class="relative px-5 pb-6 sm:px-8">
          <div class="-mt-14 flex flex-col items-center gap-4 sm:-mt-[4.5rem] sm:flex-row sm:items-end sm:gap-6">
            <ProfileAvatar :src="p.avatar_url" :name="p.full_name" size="lg" class="shrink-0 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.8)]" />

            <div class="min-w-0 flex-1 text-center sm:pb-1 sm:text-left">
              <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-start">
                <h1 class="break-words font-oswald text-3xl font-semibold leading-none tracking-tight text-white [text-wrap:balance] sm:text-[2.6rem]">
                  {{ p.full_name }}
                </h1>
                <span
                  v-if="p.role_label"
                  class="inline-flex items-center gap-1.5 rounded-full border border-bta-pink/40 bg-bta-pink/10 px-2.5 py-0.5 font-inconsolata text-[11px] font-bold uppercase tracking-[0.14em] text-bta-pink"
                >
                  <Icon name="lucide:badge-check" class="size-3.5" aria-hidden="true" />{{ p.role_label }}
                </span>
              </div>
              <p class="mt-2 break-all font-inconsolata text-sm text-bta-pink">
                @{{ p.username }}
              </p>
            </div>

            <div class="flex shrink-0 flex-wrap items-center justify-center gap-2 sm:pb-1">
              <Button v-if="p.is_owner" as-child class="bt-focus rounded-lg bg-bta-pink px-4 font-semibold text-white shadow-[0_8px_24px_-10px_rgba(236,16,117,0.9)] hover:bg-bta-pink/90">
                <NuxtLink to="/perfil/editar">
                  <Icon name="lucide:pencil" class="mr-2 size-4" /> Editar perfil
                </NuxtLink>
              </Button>
              <Button
                v-else
                :disabled="pending"
                :aria-pressed="following"
                class="bt-focus rounded-lg px-4 font-semibold"
                :class="following ? 'border border-white/20 bg-transparent text-white hover:bg-white/10' : 'bg-bta-pink text-white shadow-[0_8px_24px_-10px_rgba(236,16,117,0.9)] hover:bg-bta-pink/90'"
                @click="toggleFollow"
              >
                <Icon :name="following ? 'lucide:user-check' : 'lucide:user-plus'" class="mr-2 size-4" />
                {{ following ? 'Siguiendo' : 'Seguir' }}
              </Button>
              <Button
                variant="outline"
                class="bt-focus rounded-lg border-white/15 bg-white/[0.03] px-4 text-white hover:bg-white/10 hover:text-white"
                @click="share"
              >
                <Icon :name="copied ? 'lucide:check' : 'lucide:share-2'" class="mr-2 size-4" />
                {{ copied ? 'Enlace copiado' : 'Compartir' }}
              </Button>
            </div>
          </div>

          <div v-if="p.headline || p.aboutme" class="mt-6 max-w-3xl text-center sm:text-left">
            <p v-if="p.headline" class="font-sans text-xl font-semibold leading-snug tracking-tight text-white">
              {{ p.headline }}
            </p>
            <p v-if="p.aboutme" class="mt-2 whitespace-pre-line font-sans text-base leading-7 text-white/70">
              {{ p.aboutme }}
            </p>
          </div>
        </div>

        <!-- Métricas: solo las que existen -->
        <dl class="grid grid-cols-2 divide-x divide-y divide-white/[0.06] border-t border-white/[0.06] bg-white/[0.015] sm:grid-flow-col sm:auto-cols-fr sm:divide-y-0">
          <div v-for="s in stats" :key="s.key">
            <component :is="s.to ? 'NuxtLink' : 'div'" :to="s.to || undefined" class="bt-focus group block px-4 py-4 text-center transition-colors sm:text-left" :class="s.to && 'hover:bg-white/[0.04]'">
              <dd class="font-oswald text-2xl font-semibold leading-none tabular-nums" :class="s.key === 'ranking' ? 'text-bta-pink' : 'text-white'">
                {{ s.value }}
              </dd>
              <dt class="mt-1.5 font-inconsolata text-xs uppercase tracking-[0.14em] text-bta-text-2 transition-colors group-hover:text-white">
                {{ s.label }}
              </dt>
            </component>
          </div>
        </dl>
      </header>

      <!-- Contenido -->
      <div class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div class="min-w-0 space-y-8">
          <ProfileSection v-if="a.certificates.length" id="certificados" title="Certificados" :count="p.stats.certificates" :shown="a.certificates.length">
            <ul class="grid gap-3 sm:grid-cols-2">
              <li v-for="c in a.certificates" :key="c.title + c.date" class="bt-surface bt-surface-hover flex items-center gap-3.5 p-4">
                <span class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-bta-pink/25 bg-bta-pink/10">
                  <Icon name="lucide:award" class="size-5 text-bta-pink" aria-hidden="true" />
                </span>
                <div class="min-w-0">
                  <NuxtLink v-if="c.slug" :to="`/cursos/${c.slug}`" class="bt-focus line-clamp-2 rounded font-sans text-base font-semibold leading-snug text-white hover:text-bta-pink">
                    {{ c.title }}
                  </NuxtLink>
                  <span v-else class="line-clamp-2 font-sans text-base font-semibold leading-snug text-white">{{ c.title }}</span>
                  <p class="mt-0.5 font-inconsolata text-[13px] text-bta-text-2">
                    <span class="text-emerald-400">●</span> Aprobado · {{ fmtDate(c.date) }}
                  </p>
                </div>
              </li>
            </ul>
          </ProfileSection>

          <ProfileSection v-if="a.articles.length" id="articulos" title="Artículos" :count="p.stats.articles" :shown="a.articles.length">
            <ul class="bt-surface divide-y divide-white/[0.06] overflow-hidden">
              <li v-for="art in a.articles" :key="art.slug">
                <NuxtLink :to="`/articulos/${art.slug}`" class="bt-focus group flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-white/[0.03]">
                  <span class="min-w-0 truncate font-sans text-base font-medium text-white transition-colors group-hover:text-bta-pink">{{ art.title }}</span>
                  <span class="flex shrink-0 items-center gap-2 font-inconsolata text-[13px] text-bta-text-2">
                    <span v-if="art.category" class="hidden rounded border border-white/10 px-1.5 py-0.5 sm:inline">{{ art.category }}</span>{{ fmtDate(art.published_at) }}
                  </span>
                </NuxtLink>
              </li>
            </ul>
          </ProfileSection>

          <ProfileSection v-if="a.questions.length" id="preguntas" title="Preguntas" :count="p.stats.questions" :shown="a.questions.length">
            <ul class="bt-surface divide-y divide-white/[0.06] overflow-hidden">
              <li v-for="q in a.questions" :key="q.slug">
                <NuxtLink :to="`/debates/${q.slug}`" class="bt-focus group flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-white/[0.03]">
                  <span class="min-w-0 truncate font-sans text-base font-medium text-white transition-colors group-hover:text-bta-pink">{{ q.title }}</span>
                  <span class="flex shrink-0 items-center gap-1.5 font-inconsolata text-[13px] text-bta-text-2">
                    <Icon name="lucide:message-square" class="size-3.5" aria-hidden="true" />{{ q.answers }}<span class="hidden sm:inline">{{ q.answers === 1 ? 'respuesta' : 'respuestas' }}</span>
                  </span>
                </NuxtLink>
              </li>
            </ul>
          </ProfileSection>

          <ProfileSection v-if="a.courses.length" id="cursos" title="Cursos impartidos" :count="p.stats.courses_taught" :shown="a.courses.length">
            <ul class="grid gap-3 sm:grid-cols-2">
              <li v-for="c in a.courses" :key="c.slug">
                <NuxtLink :to="`/cursos/${c.slug}`" class="bt-surface bt-surface-hover bt-focus block truncate p-4 font-sans text-base font-semibold text-white">
                  {{ c.title }}
                </NuxtLink>
              </li>
            </ul>
          </ProfileSection>

          <p v-if="!hasActivity" class="bt-surface p-6 text-center font-inconsolata text-sm text-bta-text-2">
            <span class="text-bta-pink">$</span> Aún no hay actividad pública para mostrar.
          </p>
        </div>

        <aside class="min-w-0 space-y-8 lg:sticky lg:top-24 lg:self-start">
          <ProfileSection v-if="p.specialties.length" id="especialidades" title="Especialidades">
            <ul class="flex flex-wrap gap-2">
              <li v-for="s in p.specialties" :key="s" class="rounded-md border border-bta-pink/20 bg-bta-pink/[0.07] px-2.5 py-1 font-inconsolata text-[13px] text-white">
                {{ s }}
              </li>
            </ul>
          </ProfileSection>

          <ProfileSection v-if="Object.keys(p.links).length" id="enlaces" title="Enlaces">
            <ul class="space-y-2">
              <li v-for="(url, key) in p.links" :key="key">
                <a :href="url" target="_blank" rel="noopener noreferrer nofollow ugc" class="bt-focus bt-surface bt-surface-hover group flex items-center gap-3 px-3.5 py-2.5 font-sans text-sm font-medium text-white">
                  <Icon :name="linkIcons[key] || 'lucide:link'" class="size-4 text-bta-text-2 transition-colors group-hover:text-bta-pink" aria-hidden="true" />
                  <span class="flex-1">{{ linkLabels[key] || key }}</span>
                  <Icon name="lucide:arrow-up-right" class="size-4 text-gray-muted transition-colors group-hover:text-bta-pink" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </ProfileSection>

          <p v-if="memberSince" class="font-inconsolata text-[13px] text-bta-text-2">
            <span class="text-bta-pink/70">//</span> Miembro desde {{ memberSince }}
          </p>
        </aside>
      </div>
    </div>
  </NuxtLayout>
</template>
