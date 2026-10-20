<script setup lang="ts">
import type { RankingResponse } from '@/interfaces/ranking'
import PageHeader from '~/components/common/PageHeader.vue'

definePageMeta({ layout: 'custom', auth: true })
useSeoMeta({ title: 'Ranking', description: 'Ranking de la comunidad de Backtrack Academy.', robots: 'noindex' })

const page = ref(1)
const { data, status, error, refresh } = useAPI<RankingResponse>('/ranking', {
  query: computed(() => ({ page: page.value })),
  lazy: true,
  server: false,
})

const nf = new Intl.NumberFormat('es')
// Bandera a partir del código ISO-2 (🇨🇱 = regional indicators).
const flag = (code?: string | null) => code && /^[a-z]{2}$/i.test(code)
  ? String.fromCodePoint(...code.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0)))
  : ''
const medal = (n: number) => (n === 1 ? 'text-yellow-400' : n === 2 ? 'text-slate-300' : n === 3 ? 'text-amber-600' : '')
const top = computed(() => (page.value === 1 ? data.value?.data.slice(0, 3) ?? [] : []))
const rest = computed(() => (page.value === 1 ? data.value?.data.slice(3) : data.value?.data) ?? [])
</script>

<template>
  <div class="mx-auto w-full max-w-[900px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <PageHeader title="Ranking">
      Puntaje por tiempo de estudio y participación en la comunidad. Solo aparecen quienes tienen su perfil público.
    </PageHeader>

    <!-- Tu puesto -->
    <aside v-if="data?.me" class="bt-surface mt-6 flex flex-wrap items-center justify-between gap-3 p-4" aria-label="Tu puesto">
      <div>
        <p class="font-mono text-[13px] text-foreground-muted">
          <span class="text-primary-text">//</span> tu puesto
        </p>
        <p v-if="data.me.position" class="font-oswald text-3xl text-primary-text">
          #{{ nf.format(data.me.position) }} <span class="text-base text-foreground-muted">· {{ nf.format(data.me.score) }} pts</span>
        </p>
        <p v-else-if="data.me.qualifies" class="t-small mt-1">
          Tienes {{ nf.format(data.me.score) }} pts, pero tu perfil es privado y no apareces en el ranking.
        </p>
        <p v-else class="t-small mt-1">
          Sigue estudiando y participando para entrar al ranking. Tienes {{ nf.format(data.me.score) }} pts.
        </p>
      </div>
      <NuxtLink v-if="data.me.qualifies && !data.me.public_profile" to="/perfil/editar#privacidad" class="bt-btn-secondary">
        Hacer público mi perfil
      </NuxtLink>
    </aside>

    <p v-if="status === 'pending' && !data" class="t-small mt-8">
      Cargando ranking…
    </p>
    <div v-else-if="error" class="mt-8 flex items-center gap-3">
      <p class="t-small">
        No pudimos cargar el ranking.
      </p>
      <button type="button" class="bt-btn-ghost !h-8 !px-2.5" @click="refresh()">
        Reintentar
      </button>
    </div>

    <template v-else-if="data">
      <p v-if="!data.data.length" class="bt-surface mt-8 p-6 text-center text-sm text-foreground-muted">
        <span class="text-primary-text">$</span> Todavía no hay perfiles públicos en el ranking.
      </p>

      <!-- Podio -->
      <ol v-if="top.length" class="mt-8 grid gap-3 sm:grid-cols-3">
        <li v-for="p in top" :key="p.username">
          <NuxtLink :to="`/@${p.username}`" class="bt-surface bt-surface-hover bt-focus flex flex-col items-center gap-2 p-5 text-center" :class="p.is_me && 'border-primary/50'">
            <Icon name="lucide:trophy" class="size-6" :class="medal(p.position)" aria-hidden="true" />
            <ProfileAvatar :src="p.avatar_url" :name="p.full_name" size="sm" />
            <span class="font-oswald text-lg leading-tight text-foreground">{{ p.full_name }}</span>
            <span class="font-mono text-xs text-foreground-muted">#{{ p.position }} · {{ flag(p.country_flag) }}</span>
            <span class="font-oswald text-2xl text-primary-text">{{ nf.format(p.score) }} <span class="text-sm text-foreground-muted">pts</span></span>
          </NuxtLink>
        </li>
      </ol>

      <!-- Resto -->
      <ol v-if="rest.length" class="bt-surface mt-4 divide-y divide-subtle overflow-hidden">
        <li v-for="p in rest" :key="p.username">
          <NuxtLink :to="`/@${p.username}`" class="bt-focus group flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-foreground/[0.03]" :class="p.is_me && 'bg-primary/[0.06]'">
            <span class="w-12 shrink-0 font-oswald text-lg tabular-nums text-foreground-muted">#{{ p.position }}</span>
            <ProfileAvatar :src="p.avatar_url" :name="p.full_name" size="sm" />
            <span class="min-w-0 flex-1">
              <span class="block truncate font-sans text-base font-semibold text-foreground transition-colors group-hover:text-primary-text">{{ p.full_name }}<span v-if="p.is_me" class="ml-2 font-mono text-xs text-primary-text">(tú)</span></span>
              <span v-if="p.headline" class="block truncate text-sm text-foreground-muted">{{ p.headline }}</span>
            </span>
            <span class="shrink-0 text-lg" aria-hidden="true">{{ flag(p.country_flag) }}</span>
            <span class="w-20 shrink-0 text-right font-mono text-sm tabular-nums text-foreground">{{ nf.format(p.score) }}</span>
          </NuxtLink>
        </li>
      </ol>

      <nav v-if="data.total_pages > 1" class="mt-6 flex items-center justify-between text-sm" aria-label="Paginación">
        <button class="bt-focus rounded-lg border border-border px-3 py-1.5 text-foreground-muted transition-colors hover:border-strong hover:text-foreground disabled:opacity-40" :disabled="page <= 1" @click="page--">
          ← Anterior
        </button>
        <span class="tabular-nums text-foreground-subtle">{{ data.current_page }} / {{ data.total_pages }}</span>
        <button class="bt-focus rounded-lg border border-border px-3 py-1.5 text-foreground-muted transition-colors hover:border-strong hover:text-foreground disabled:opacity-40" :disabled="page >= data.total_pages" @click="page++">
          Siguiente →
        </button>
      </nav>
    </template>
  </div>
</template>
