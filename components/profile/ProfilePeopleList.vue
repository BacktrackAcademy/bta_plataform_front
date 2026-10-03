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
    <NuxtLink :to="`/@${username}`" class="bt-focus inline-flex items-center gap-2 rounded font-inconsolata text-sm text-foreground-muted transition-colors hover:text-foreground">
      <Icon name="lucide:arrow-left" class="size-4" aria-hidden="true" /> @{{ username }}
    </NuxtLink>
    <div class="mt-4 flex items-center gap-3">
      <h1 class="font-oswald text-3xl font-semibold leading-none tracking-tight text-foreground sm:text-4xl">
        {{ title }}
      </h1>
      <span v-if="pageData" class="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-inconsolata text-xs font-bold tabular-nums text-primary-text">{{ pageData.total_items }}</span>
    </div>
    <span class="mt-4 block h-px bg-gradient-to-r from-primary/60 via-foreground/10 to-transparent" aria-hidden="true" />

    <p v-if="pageData && !pageData.data.length" class="bt-surface mt-6 p-6 text-center font-inconsolata text-sm text-foreground-muted">
      <span class="text-primary-text">$</span> {{ empty }}
    </p>

    <ul v-else class="mt-6 space-y-2" :aria-busy="loading">
      <li v-for="person in pageData?.data" :key="person.username" class="bt-surface group flex items-center gap-3.5 p-3.5 transition-colors hover:border-border hover:bg-surface-3">
        <ProfileAvatar :src="person.avatar_url" :name="person.full_name" size="sm" />
        <div class="min-w-0 flex-1">
          <p class="truncate font-sans text-[15px] font-semibold text-foreground">
            {{ person.full_name }}
          </p>
          <p class="truncate font-inconsolata text-xs text-foreground-muted">
            <NuxtLink v-if="person.profile_public" :to="`/@${person.username}`" class="bt-focus rounded text-primary-text hover:underline">
              @{{ person.username }}
            </NuxtLink>
            <span v-else>@{{ person.username }}</span>
            <span v-if="person.headline"> · {{ person.headline }}</span>
          </p>
        </div>
        <NuxtLink
          v-if="person.profile_public"
          :to="`/@${person.username}`"
          class="bt-focus shrink-0 rounded-lg border border-border px-3 py-1.5 font-inconsolata text-xs text-foreground-muted transition-colors hover:border-primary/50 hover:text-foreground"
          :aria-label="`Ver perfil de ${person.full_name}`"
        >
          Ver perfil
        </NuxtLink>
      </li>
    </ul>

    <nav v-if="pageData && pageData.total_pages > 1" class="mt-6 flex items-center justify-between font-inconsolata text-sm" aria-label="Paginación">
      <button class="bt-focus rounded-lg border border-border px-3 py-1.5 text-foreground-muted transition-colors hover:border-strong hover:text-foreground disabled:opacity-40" :disabled="pageData.current_page <= 1" @click="$emit('page', pageData.current_page - 1)">
        ← Anterior
      </button>
      <span class="tabular-nums text-foreground-subtle">{{ pageData.current_page }} / {{ pageData.total_pages }}</span>
      <button class="bt-focus rounded-lg border border-border px-3 py-1.5 text-foreground-muted transition-colors hover:border-strong hover:text-foreground disabled:opacity-40" :disabled="pageData.current_page >= pageData.total_pages" @click="$emit('page', pageData.current_page + 1)">
        Siguiente →
      </button>
    </nav>
  </div>
</template>
