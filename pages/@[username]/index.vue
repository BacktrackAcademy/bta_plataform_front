<script lang="ts" setup>
import type { PublicProfile } from '~/interfaces/profile'

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
const ogImage = computed(() => p.value.avatar_url || siteUrl('/og-default.jpg'))
// El perfil indexable vive en backtrackacademy.com/@usuario (canonical); esta copia dentro de la app nunca se indexa.
const robots = 'noindex, follow'

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

// Sin canonical ni JSON-LD aquí: la copia de la app es noindex y la señal indexable es la de backtrackacademy.com/@usuario
// (noindex + canonical a otra URL serían señales mixtas).

// ---- Presentación ------------------------------------------------------------------------
function fmtDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString('es-CL', { month: 'short', year: 'numeric' }) : ''
}

const memberSince = computed(() => (p.value.member_since ? new Date(p.value.member_since).getFullYear() : null))

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
        class="mb-4 flex flex-wrap items-center justify-between gap-3 bt-surface px-4 py-3 text-sm text-foreground-secondary"
        role="status"
      >
        <p>
          <span class="font-mono text-primary-text">$</span> Solo tú ves esta página. Para que otras personas la encuentren, activa tu perfil público.
        </p>
        <NuxtLink to="/perfil/editar#privacidad" class="bt-btn-secondary !h-8">
          Configurar privacidad
        </NuxtLink>
      </div>

      <ProfileHeader :profile="p" />

      <!-- Contenido -->
      <div class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div class="min-w-0 space-y-8">
          <ProfileSection v-if="a.certificates.length" id="certificados" title="Certificados" :count="p.stats.certificates" :shown="a.certificates.length">
            <ul class="grid gap-3 sm:grid-cols-2">
              <li v-for="c in a.certificates" :key="c.title + c.date" class="bt-surface bt-surface-hover flex items-center gap-3.5 p-4">
                <span class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10">
                  <Icon name="lucide:award" class="size-5 text-primary-text" aria-hidden="true" />
                </span>
                <div class="min-w-0">
                  <NuxtLink v-if="c.slug" :to="`/cursos/${c.slug}`" class="bt-focus line-clamp-2 rounded font-sans text-base font-semibold leading-snug text-foreground hover:text-primary-text">
                    {{ c.title }}
                  </NuxtLink>
                  <span v-else class="line-clamp-2 font-sans text-base font-semibold leading-snug text-foreground">{{ c.title }}</span>
                  <p class="mt-0.5 font-mono text-[13px] text-foreground-muted">
                    <span class="text-success">●</span> Aprobado · {{ fmtDate(c.date) }}
                  </p>
                </div>
              </li>
            </ul>
          </ProfileSection>

          <ProfileSection v-if="a.articles.length" id="articulos" title="Artículos" :count="p.stats.articles" :shown="a.articles.length">
            <ul class="bt-surface divide-y divide-subtle overflow-hidden">
              <li v-for="art in a.articles" :key="art.slug">
                <NuxtLink :to="`/articulos/${art.slug}`" class="bt-focus group flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-foreground/[0.03]">
                  <span class="min-w-0 truncate font-sans text-base font-medium text-foreground transition-colors group-hover:text-primary-text">{{ art.title }}</span>
                  <span class="flex shrink-0 items-center gap-2 font-mono text-[13px] text-foreground-muted">
                    <span v-if="art.category" class="hidden rounded border border-border px-1.5 py-0.5 sm:inline">{{ art.category }}</span>{{ fmtDate(art.published_at) }}
                  </span>
                </NuxtLink>
              </li>
            </ul>
          </ProfileSection>

          <ProfileSection v-if="a.questions.length" id="preguntas" title="Preguntas" :count="p.stats.questions" :shown="a.questions.length">
            <ul class="bt-surface divide-y divide-subtle overflow-hidden">
              <li v-for="q in a.questions" :key="q.slug">
                <NuxtLink :to="`/debates/${q.slug}`" class="bt-focus group flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-foreground/[0.03]">
                  <span class="min-w-0 truncate font-sans text-base font-medium text-foreground transition-colors group-hover:text-primary-text">{{ q.title }}</span>
                  <span class="flex shrink-0 items-center gap-1.5 font-mono text-[13px] text-foreground-muted">
                    <Icon name="lucide:message-square" class="size-3.5" aria-hidden="true" />{{ q.answers }}<span class="hidden sm:inline">{{ q.answers === 1 ? 'respuesta' : 'respuestas' }}</span>
                  </span>
                </NuxtLink>
              </li>
            </ul>
          </ProfileSection>

          <ProfileSection v-if="a.courses.length" id="cursos" title="Cursos impartidos" :count="p.stats.courses_taught" :shown="a.courses.length">
            <ul class="grid gap-3 sm:grid-cols-2">
              <li v-for="c in a.courses" :key="c.slug">
                <NuxtLink :to="`/cursos/${c.slug}`" class="bt-surface bt-surface-hover bt-focus block truncate p-4 font-sans text-base font-semibold text-foreground">
                  {{ c.title }}
                </NuxtLink>
              </li>
            </ul>
          </ProfileSection>

          <p v-if="!hasActivity" class="bt-surface p-6 text-center text-sm text-foreground-muted">
            <span class="text-primary-text">$</span> Aún no hay actividad pública para mostrar.
          </p>
        </div>

        <aside class="min-w-0 space-y-8 lg:sticky lg:top-24 lg:self-start">
          <ProfileSection v-if="p.specialties.length" id="especialidades" title="Especialidades">
            <ul class="flex flex-wrap gap-2">
              <li v-for="s in p.specialties" :key="s" class="rounded-md border border-primary/20 bg-primary/[0.07] px-2.5 py-1 font-mono text-[13px] text-foreground">
                {{ s }}
              </li>
            </ul>
          </ProfileSection>

          <ProfileSection v-if="Object.keys(p.links).length" id="enlaces" title="Enlaces">
            <ul class="space-y-2">
              <li v-for="(url, key) in p.links" :key="key">
                <a :href="url" target="_blank" rel="noopener noreferrer nofollow ugc" class="bt-focus bt-surface bt-surface-hover group flex items-center gap-3 px-3.5 py-2.5 font-sans text-sm font-medium text-foreground">
                  <Icon :name="linkIcons[key] || 'lucide:link'" class="size-4 text-foreground-muted transition-colors group-hover:text-primary-text" aria-hidden="true" />
                  <span class="flex-1">{{ linkLabels[key] || key }}</span>
                  <Icon name="lucide:arrow-up-right" class="size-4 text-foreground-subtle transition-colors group-hover:text-primary-text" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </ProfileSection>

          <p v-if="memberSince" class="font-mono text-[13px] text-foreground-muted">
            <span class="text-primary-text/70">//</span> Miembro desde {{ memberSince }}
          </p>
        </aside>
      </div>
    </div>
  </NuxtLayout>
</template>
