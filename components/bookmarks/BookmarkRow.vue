<script setup lang="ts">
import type { BookmarkItem, BookmarkKind } from '~/interfaces/bookmarks'
import ProgressBar from '~/components/dashboard/ProgressBar.vue'

const props = defineProps<{ item: BookmarkItem, removing?: boolean }>()
defineEmits<{ remove: [item: BookmarkItem] }>()

const { timeAgo } = useFormatter()
const siteUrl = useSiteUrl()

const META: Record<BookmarkKind, { label: string, icon: string, cta: string }> = {
  video: { label: 'Lección', icon: 'lucide:play', cta: 'Ver lección' },
  post: { label: 'Artículo', icon: 'lucide:file-text', cta: 'Leer artículo' },
  discussion: { label: 'Pregunta', icon: 'lucide:message-circle', cta: 'Ver discusión' },
}
const meta = computed(() => META[props.item.kind])
const progress = computed(() => props.item.progress ?? 0)
const cta = computed(() => props.item.kind === 'video' && progress.value > 0 && progress.value < 100 ? 'Continuar lección' : meta.value.cta)

// Lecciones y artículos viven en este front; los debates aún no tienen página aquí, van al sitio principal.
const external = computed(() => props.item.kind === 'discussion')
const href = computed(() => {
  switch (props.item.kind) {
    case 'video': return `/video/${props.item.slug}`
    case 'post': return `/articulos/${props.item.slug}`
    default: return siteUrl(`/debate/${props.item.slug}`)
  }
})
const details = computed(() => [
  props.item.context,
  props.item.author ? `por ${props.item.author}` : null,
  props.item.duration ? `${props.item.duration} min` : null,
  props.item.answers ? `${props.item.answers} ${props.item.answers === 1 ? 'respuesta' : 'respuestas'}` : null,
].filter(Boolean))
</script>

<template>
  <li
    class="group relative flex items-start gap-3 border-b border-subtle px-3 py-4 transition-[background-color,opacity] duration-fast hover:bg-surface-2 sm:gap-4 sm:px-4"
    :class="{ 'pointer-events-none opacity-40': removing }"
  >
    <span class="hidden size-9 shrink-0 items-center justify-center rounded-md border border-subtle bg-surface-2 text-foreground-muted group-hover:bg-surface-3 sm:flex" aria-hidden="true">
      <Icon :name="meta.icon" class="size-4" />
    </span>

    <div class="min-w-0 flex-1">
      <p class="t-meta flex flex-wrap items-center gap-x-2 !text-xs">
        <span class="text-foreground-secondary">{{ meta.label }}</span>
        <template v-for="d in details" :key="d">
          <span aria-hidden="true">·</span>
          <span>{{ d }}</span>
        </template>
      </p>
      <h3 class="mt-1 text-[17px] font-medium leading-snug text-foreground">
        <a v-if="external" :href="href" class="bt-focus rounded-sm after:absolute after:inset-0 hover:underline">{{ item.title }}</a>
        <NuxtLink v-else :to="href" class="bt-focus rounded-sm after:absolute after:inset-0 hover:underline">
          {{ item.title }}
        </NuxtLink>
      </h3>
      <p v-if="item.excerpt" class="t-small mt-1 line-clamp-2 hidden sm:block">
        {{ item.excerpt }}
      </p>
      <div v-if="item.kind === 'video' && progress > 0" class="mt-2 flex max-w-[280px] items-center gap-3">
        <ProgressBar :value="progress" :label="`Progreso en ${item.title}`" />
        <span class="t-meta whitespace-nowrap !text-xs text-foreground-secondary">{{ progress >= 100 ? 'Completada' : `${progress}%` }}</span>
      </div>
      <p class="t-caption mt-1.5 hidden sm:block">
        Guardado {{ timeAgo(item.saved_at) }}
      </p>
    </div>

    <div class="relative z-10 flex shrink-0 items-center gap-1 self-center">
      <span class="hidden text-sm text-foreground-muted transition-colors duration-fast group-hover:text-foreground md:inline">{{ cta }} →</span>
      <button
        type="button"
        class="bt-focus -mr-2 inline-flex size-11 items-center justify-center rounded-md text-primary-text transition-colors duration-fast hover:bg-primary/10 active:bg-primary/15"
        aria-pressed="true"
        :aria-label="`Quitar «${item.title}» de Guardados`"
        title="Quitar de Guardados"
        :disabled="removing"
        @click="$emit('remove', item)"
      >
        <Icon name="mdi:bookmark" class="size-5" />
      </button>
    </div>
  </li>
</template>
