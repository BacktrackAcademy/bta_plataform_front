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
    <h1 class="mt-4 font-oswald text-3xl font-semibold text-white">
      {{ title }}
      <span v-if="pageData" class="ml-1 font-inconsolata text-base font-normal text-gray-muted">{{ pageData.total_items }}</span>
    </h1>

    <p v-if="pageData && !pageData.data.length" class="bt-surface mt-6 p-6 text-center font-inconsolata text-sm text-bta-text-2">
      <span class="text-bta-pink">$</span> {{ empty }}
    </p>

    <ul v-else class="mt-6 space-y-2" :aria-busy="loading">
      <li v-for="person in pageData?.data" :key="person.username" class="bt-surface flex items-center gap-3 p-3">
        <ProfileAvatar :src="person.avatar_url" :name="person.full_name" size="sm" />
        <div class="min-w-0 flex-1">
          <p class="truncate font-medium text-white">
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
      </li>
    </ul>

    <nav v-if="pageData && pageData.total_pages > 1" class="mt-6 flex items-center justify-between font-inconsolata text-sm" aria-label="Paginación">
      <button class="bt-focus rounded px-3 py-1 text-bta-text-2 hover:text-white disabled:opacity-40" :disabled="pageData.current_page <= 1" @click="$emit('page', pageData.current_page - 1)">
        ← Anterior
      </button>
      <span class="text-gray-muted">{{ pageData.current_page }} / {{ pageData.total_pages }}</span>
      <button class="bt-focus rounded px-3 py-1 text-bta-text-2 hover:text-white disabled:opacity-40" :disabled="pageData.current_page >= pageData.total_pages" @click="$emit('page', pageData.current_page + 1)">
        Siguiente →
      </button>
    </nav>
  </div>
</template>
