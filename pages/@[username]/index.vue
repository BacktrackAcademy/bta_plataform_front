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
    <div class="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
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
      <header class="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-bta-surface">
        <div class="bt-tech-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" aria-hidden="true" />
        <div class="pointer-events-none absolute -left-16 -top-24 h-56 w-[26rem] rounded-full bg-bta-pink/[0.12] blur-3xl" aria-hidden="true" />

        <div class="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:gap-7 sm:p-8">
          <ProfileAvatar :src="p.avatar_url" :name="p.full_name" size="lg" class="mx-auto sm:mx-0" />

          <div class="min-w-0 flex-1 text-center sm:text-left">
            <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-start">
              <h1 class="break-words font-oswald text-3xl font-semibold leading-tight text-white [text-wrap:balance] sm:text-4xl">
                {{ p.full_name }}
              </h1>
              <span
                v-if="p.role_label"
                class="rounded border border-bta-pink/40 bg-bta-pink/[0.08] px-2 py-0.5 font-inconsolata text-[11px] uppercase tracking-widest text-bta-pink"
              >{{ p.role_label }}</span>
            </div>
            <p class="mt-1 break-all font-inconsolata text-sm text-bta-pink">
              @{{ p.username }}
            </p>
            <p v-if="p.headline" class="mt-3 text-base font-medium text-white/90">
              {{ p.headline }}
            </p>
            <p v-if="p.aboutme" class="mx-auto mt-2 max-w-2xl whitespace-pre-line font-inconsolata text-sm leading-relaxed text-bta-text-2 sm:mx-0">
              {{ p.aboutme }}
            </p>
          </div>

          <div class="flex shrink-0 flex-wrap items-center justify-center gap-2 sm:flex-col sm:items-stretch">
            <Button v-if="p.is_owner" as-child class="bt-focus rounded-md bg-bta-pink px-4 text-white hover:bg-bta-pink/85">
              <NuxtLink to="/perfil/editar">
                <Icon name="lucide:pencil" class="mr-2 size-4" /> Editar perfil
              </NuxtLink>
            </Button>
            <Button
              v-else
              :disabled="pending"
              :aria-pressed="following"
              class="bt-focus rounded-md px-4"
              :class="following ? 'border border-white/20 bg-transparent text-white hover:bg-white/10' : 'bg-bta-pink text-white hover:bg-bta-pink/85'"
              @click="toggleFollow"
            >
              <Icon :name="following ? 'lucide:user-check' : 'lucide:user-plus'" class="mr-2 size-4" />
              {{ following ? 'Siguiendo' : 'Seguir' }}
            </Button>
            <Button
              variant="outline"
              class="bt-focus rounded-md border-white/15 bg-transparent px-4 text-white hover:bg-white/10 hover:text-white"
              @click="share"
            >
              <Icon :name="copied ? 'lucide:check' : 'lucide:share-2'" class="mr-2 size-4" />
              {{ copied ? 'Enlace copiado' : 'Compartir' }}
            </Button>
          </div>
        </div>

        <!-- Métricas compactas: solo las que existen -->
        <dl class="relative flex flex-wrap justify-center gap-x-7 gap-y-3 border-t border-white/[0.06] px-5 py-4 sm:justify-start sm:px-8">
          <div v-for="s in stats" :key="s.key" class="flex items-baseline gap-2">
            <component :is="s.to ? 'NuxtLink' : 'div'" :to="s.to || undefined" class="bt-focus group flex items-baseline gap-2 rounded">
              <dd class="order-1 font-oswald text-xl font-semibold leading-none text-bta-pink">
                {{ s.value }}
              </dd>
              <dt class="order-2 font-inconsolata text-xs text-bta-text-2 group-hover:text-white">
                {{ s.label }}
              </dt>
            </component>
          </div>
        </dl>
      </header>

      <!-- Contenido -->
      <div class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div class="min-w-0 space-y-8">
          <ProfileSection v-if="a.certificates.length" id="certificados" title="Certificados" :count="p.stats.certificates" :shown="a.certificates.length">
            <ul class="grid gap-3 sm:grid-cols-2">
              <li v-for="c in a.certificates" :key="c.title + c.date" class="bt-surface flex items-start gap-3 p-4">
                <Icon name="lucide:award" class="mt-0.5 size-5 shrink-0 text-bta-pink" aria-hidden="true" />
                <div class="min-w-0">
                  <NuxtLink v-if="c.slug" :to="`/cursos/${c.slug}`" class="bt-focus block truncate rounded font-oswald text-lg leading-snug text-white hover:text-bta-pink">
                    {{ c.title }}
                  </NuxtLink>
                  <span v-else class="block truncate font-oswald text-lg leading-snug text-white">{{ c.title }}</span>
                  <p class="font-inconsolata text-xs text-gray-muted">
                    Aprobado · {{ fmtDate(c.date) }}
                  </p>
                </div>
              </li>
            </ul>
          </ProfileSection>

          <ProfileSection v-if="a.articles.length" id="articulos" title="Artículos" :count="p.stats.articles" :shown="a.articles.length">
            <ul class="bt-surface divide-y divide-white/[0.06]">
              <li v-for="art in a.articles" :key="art.slug">
                <NuxtLink :to="`/articulos/${art.slug}`" class="bt-focus group flex items-baseline justify-between gap-4 rounded px-4 py-3">
                  <span class="min-w-0 truncate text-white transition-colors group-hover:text-bta-pink">{{ art.title }}</span>
                  <span class="shrink-0 font-inconsolata text-xs text-gray-muted">
                    <span v-if="art.category" class="hidden sm:inline">{{ art.category }} · </span>{{ fmtDate(art.published_at) }}
                  </span>
                </NuxtLink>
              </li>
            </ul>
          </ProfileSection>

          <ProfileSection v-if="a.questions.length" id="preguntas" title="Preguntas" :count="p.stats.questions" :shown="a.questions.length">
            <ul class="bt-surface divide-y divide-white/[0.06]">
              <li v-for="q in a.questions" :key="q.slug">
                <NuxtLink :to="`/debates/${q.slug}`" class="bt-focus group flex items-baseline justify-between gap-4 rounded px-4 py-3">
                  <span class="min-w-0 truncate text-white transition-colors group-hover:text-bta-pink">{{ q.title }}</span>
                  <span class="shrink-0 font-inconsolata text-xs text-gray-muted">
                    {{ q.answers }} {{ q.answers === 1 ? 'respuesta' : 'respuestas' }}
                  </span>
                </NuxtLink>
              </li>
            </ul>
          </ProfileSection>

          <ProfileSection v-if="a.courses.length" id="cursos" title="Cursos impartidos" :count="p.stats.courses_taught" :shown="a.courses.length">
            <ul class="grid gap-3 sm:grid-cols-2">
              <li v-for="c in a.courses" :key="c.slug">
                <NuxtLink :to="`/cursos/${c.slug}`" class="bt-surface bt-surface-hover bt-focus block truncate p-4 font-oswald text-lg text-white">
                  {{ c.title }}
                </NuxtLink>
              </li>
            </ul>
          </ProfileSection>

          <p v-if="!hasActivity" class="bt-surface p-6 text-center font-inconsolata text-sm text-bta-text-2">
            <span class="text-bta-pink">$</span> Aún no hay actividad pública para mostrar.
          </p>
        </div>

        <aside class="min-w-0 space-y-6">
          <ProfileSection v-if="p.specialties.length" id="especialidades" title="Especialidades">
            <ul class="flex flex-wrap gap-2">
              <li v-for="s in p.specialties" :key="s" class="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 font-inconsolata text-xs text-white">
                {{ s }}
              </li>
            </ul>
          </ProfileSection>

          <ProfileSection v-if="Object.keys(p.links).length" id="enlaces" title="Enlaces">
            <ul class="space-y-2">
              <li v-for="(url, key) in p.links" :key="key">
                <a :href="url" target="_blank" rel="noopener noreferrer nofollow ugc" class="bt-focus inline-flex items-center gap-2 rounded font-inconsolata text-sm text-bta-text-2 transition-colors hover:text-bta-pink">
                  <Icon :name="linkIcons[key] || 'lucide:link'" class="size-4" aria-hidden="true" />
                  {{ linkLabels[key] || key }}
                </a>
              </li>
            </ul>
          </ProfileSection>

          <p v-if="memberSince" class="font-inconsolata text-xs text-gray-muted">
            <span class="text-bta-pink/70">//</span> Miembro desde {{ memberSince }}
          </p>
        </aside>
      </div>
    </div>
  </NuxtLayout>
</template>
