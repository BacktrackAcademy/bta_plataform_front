<script setup lang="ts">
import type { ProfilePeoplePage } from '~/interfaces/profile'

// Lista de seguidores / siguiendo (solo se muestra a usuarios con sesión).
defineProps<{
  username: string
  title: string
  empty: string
  pageData: ProfilePeoplePage | null | undefined
  loading?: boolean
}>()
defineEmits<{ (e: 'page', page: number): void }>()
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
    <NuxtLink :to="`/@${username}`" class="bt-focus inline-flex items-center gap-2 rounded font-inconsolata text-sm text-bta-text-2 transition-colors hover:text-white">
      <Icon name="lucide:arrow-left" class="size-4" aria-hidden="true" /> @{{ username }}
    </NuxtLink>
    <div class="mt-4 flex items-center gap-3">
      <h1 class="font-oswald text-3xl font-semibold leading-none tracking-tight text-white sm:text-4xl">
        {{ title }}
      </h1>
      <span v-if="pageData" class="rounded-full border border-bta-pink/30 bg-bta-pink/10 px-2.5 py-0.5 font-inconsolata text-xs font-bold tabular-nums text-bta-pink">{{ pageData.total_items }}</span>
    </div>
    <span class="mt-4 block h-px bg-gradient-to-r from-bta-pink/60 via-white/10 to-transparent" aria-hidden="true" />

    <p v-if="pageData && !pageData.data.length" class="bt-surface mt-6 p-6 text-center font-inconsolata text-sm text-bta-text-2">
      <span class="text-bta-pink">$</span> {{ empty }}
    </p>

    <ul v-else class="mt-6 space-y-2" :aria-busy="loading">
      <li v-for="person in pageData?.data" :key="person.username" class="bt-surface group flex items-center gap-3.5 p-3.5 transition-colors hover:border-white/15 hover:bg-bta-elevated">
        <ProfileAvatar :src="person.avatar_url" :name="person.full_name" size="sm" />
        <div class="min-w-0 flex-1">
          <p class="truncate font-sans text-[15px] font-semibold text-white">
            {{ person.full_name }}
          </p>
          <p class="truncate font-inconsolata text-xs text-bta-text-2">
            <NuxtLink v-if="person.profile_public" :to="`/@${person.username}`" class="bt-focus rounded text-bta-pink hover:underline">
              @{{ person.username }}
            </NuxtLink>
            <span v-else>@{{ person.username }}</span>
            <span v-if="person.headline"> · {{ person.headline }}</span>
          </p>
        </div>
        <NuxtLink
          v-if="person.profile_public"
          :to="`/@${person.username}`"
          class="bt-focus shrink-0 rounded-lg border border-white/10 px-3 py-1.5 font-inconsolata text-xs text-bta-text-2 transition-colors hover:border-bta-pink/50 hover:text-white"
          :aria-label="`Ver perfil de ${person.full_name}`"
        >
          Ver perfil
        </NuxtLink>
      </li>
    </ul>

    <nav v-if="pageData && pageData.total_pages > 1" class="mt-6 flex items-center justify-between font-inconsolata text-sm" aria-label="Paginación">
      <button class="bt-focus rounded-lg border border-white/10 px-3 py-1.5 text-bta-text-2 transition-colors hover:border-white/25 hover:text-white disabled:opacity-40" :disabled="pageData.current_page <= 1" @click="$emit('page', pageData.current_page - 1)">
        ← Anterior
      </button>
      <span class="tabular-nums text-gray-muted">{{ pageData.current_page }} / {{ pageData.total_pages }}</span>
      <button class="bt-focus rounded-lg border border-white/10 px-3 py-1.5 text-bta-text-2 transition-colors hover:border-white/25 hover:text-white disabled:opacity-40" :disabled="pageData.current_page >= pageData.total_pages" @click="$emit('page', pageData.current_page + 1)">
        Siguiente →
      </button>
    </nav>
  </div>
</template>
