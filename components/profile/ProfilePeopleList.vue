<script setup lang="ts">
import type { ProfilePeoplePage, ProfilePerson, PublicProfile } from '~/interfaces/profile'

// Lista de seguidores / siguiendo (solo se muestra a usuarios con sesión).
// La cabecera es la del perfil; Seguidores / Siguiendo se cambian desde sus métricas.
const props = defineProps<{
  username: string
  title: string
  empty: string
  active: 'followers' | 'following'
  pageData: ProfilePeoplePage | null | undefined
  loading?: boolean
}>()
defineEmits<{ (e: 'page', page: number): void }>()

// Perfil para la cabecera. Comparte caché con la página de perfil y no bloquea la lista.
const { data: profile } = useAPI<PublicProfile>(
  () => `/profile/${encodeURIComponent(props.username)}`,
  { key: `profile-${props.username}`, lazy: true, retry: false },
)
// Seguir / dejar de seguir desde la lista (estado local por usuario, sobre lo que trae el API).
const api = useNuxtApp().$api as typeof $fetch
const overrides = reactive<Record<string, boolean>>({})
const busy = reactive<Record<string, boolean>>({})
const isFollowing = (p: ProfilePerson) => overrides[p.username] ?? p.is_following
// Un perfil no público responde 404 en el API (ni seguir ni dejar de seguir), así que no se ofrece.
const canToggle = (p: ProfilePerson) => !p.is_me && p.profile_public

async function toggleFollow(person: ProfilePerson) {
  if (busy[person.username]) return
  busy[person.username] = true
  try {
    const res = await api<{ following: boolean }>(
      `/profile/${encodeURIComponent(person.username)}/follow`,
      { method: isFollowing(person) ? 'DELETE' : 'POST' },
    )
    overrides[person.username] = res.following
  }
  finally {
    busy[person.username] = false
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
    <!-- Cabecera: el perfil completo, siempre igual (componente compartido con /@usuario) -->
    <ProfileHeader v-if="profile" :profile="profile" :active="active" />
    <div v-else class="h-[26rem] animate-pulse rounded-lg border border-subtle bg-surface-2" aria-hidden="true" />

    <!-- Lista -->
    <section class="mt-8" :aria-labelledby="'people-title'">
      <header class="mb-3.5 flex items-center gap-3">
        <h2 id="people-title" class="font-mono text-[13px] font-bold uppercase tracking-[0.18em] text-foreground-secondary">
          <span class="text-primary-text/70" aria-hidden="true">//</span> {{ title }}
        </h2>
        <span class="h-px flex-1 bg-gradient-to-r from-foreground/10 to-transparent" aria-hidden="true" />
        <p v-if="pageData" class="rounded-full border border-border px-2 py-0.5 font-mono text-xs tabular-nums text-foreground-muted">
          {{ pageData.total_items }}
        </p>
      </header>

      <p v-if="pageData && !pageData.data.length" class="bt-surface p-6 text-center text-sm text-foreground-muted">
        <span class="text-primary-text">$</span> {{ empty }}
      </p>

      <ul v-else class="grid gap-3 sm:grid-cols-2" :aria-busy="loading">
        <li v-for="person in pageData?.data" :key="person.username" class="bt-surface bt-surface-hover flex items-center gap-3.5 p-4">
          <ProfileAvatar :src="person.avatar_url" :name="person.full_name" size="sm" />
          <div class="min-w-0 flex-1">
            <NuxtLink v-if="person.profile_public" :to="`/@${person.username}`" class="bt-focus block truncate rounded font-sans text-base font-semibold text-foreground transition-colors hover:text-primary-text">
              {{ person.full_name }}
            </NuxtLink>
            <p v-else class="truncate font-sans text-base font-semibold text-foreground">
              {{ person.full_name }}
            </p>
            <p class="truncate font-mono text-[13px] text-foreground-muted">
              @{{ person.username }}
            </p>
            <p v-if="person.headline" class="mt-0.5 truncate text-sm text-foreground-muted">
              {{ person.headline }}
            </p>
          </div>
          <button
            v-if="canToggle(person)"
            type="button"
            class="bt-focus shrink-0 rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition-colors disabled:opacity-60"
            :class="isFollowing(person) ? 'border border-strong text-foreground hover:bg-foreground/10' : 'bg-primary text-primary-foreground hover:bg-primary/90'"
            :aria-pressed="isFollowing(person)"
            :disabled="busy[person.username]"
            @click="toggleFollow(person)"
          >
            {{ isFollowing(person) ? 'Siguiendo' : 'Seguir' }}
          </button>
        </li>
      </ul>

      <nav v-if="pageData && pageData.total_pages > 1" class="mt-6 flex items-center justify-between text-sm" aria-label="Paginación">
        <button class="bt-focus rounded-lg border border-border px-3 py-1.5 text-foreground-muted transition-colors hover:border-strong hover:text-foreground disabled:opacity-40" :disabled="pageData.current_page <= 1" @click="$emit('page', pageData.current_page - 1)">
          ← Anterior
        </button>
        <span class="tabular-nums text-foreground-subtle">{{ pageData.current_page }} / {{ pageData.total_pages }}</span>
        <button class="bt-focus rounded-lg border border-border px-3 py-1.5 text-foreground-muted transition-colors hover:border-strong hover:text-foreground disabled:opacity-40" :disabled="pageData.current_page >= pageData.total_pages" @click="$emit('page', pageData.current_page + 1)">
          Siguiente →
        </button>
      </nav>
    </section>
  </div>
</template>
