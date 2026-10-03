<script setup lang="ts">
import type { NotificationCategory, NotificationItem } from '~/interfaces/notifications'
import { NuxtLink } from '#components'
import TeacherAvatar from '~/components/courses/TeacherAvatar.vue'

// Fila de notificación, compartida por el dropdown del header (`compact`) y /perfil/notifications.
// Con destino es un enlace real que cubre toda la fila; sin destino (notificaciones antiguas) es solo texto.
const props = defineProps<{ item: NotificationItem, compact?: boolean }>()
const emit = defineEmits<{ read: [item: NotificationItem], navigate: [] }>()

const { notificationDate } = useFormatter()
const siteUrl = useSiteUrl()

const ICONS: Record<NotificationCategory, string> = {
  courses: 'lucide:graduation-cap',
  articles: 'lucide:file-text',
  community: 'lucide:users',
  system: 'lucide:bell',
}

// Cursos, artículos, lecciones y perfiles viven en este front; los debates y las rutas relativas
// de notificaciones antiguas aún viven en el sitio principal.
const link = computed<{ to: string, external: boolean } | null>(() => {
  const t = props.item.target
  if (!t)
    return null
  switch (t.kind) {
    case 'course': return { to: `/curso/${t.slug}`, external: false }
    case 'post': return { to: `/articulos/${t.slug}`, external: false }
    case 'video': return { to: `/video/${t.slug}`, external: false }
    case 'user': return { to: `/@${t.username}`, external: false }
    case 'discussion': return { to: siteUrl(`/debate/${t.slug}`), external: true }
    case 'url': return t.url.startsWith('/') ? { to: siteUrl(t.url), external: true } : { to: t.url, external: true }
    default: return null
  }
})

const date = computed(() => notificationDate(props.item.created_at))
const fullDate = computed(() => new Date(props.item.created_at).toLocaleString('es'))

function onOpen() {
  if (!props.item.read)
    emit('read', props.item)
  emit('navigate')
}

const linkClass = 'bt-focus rounded-sm after:absolute after:inset-0 after:content-[\'\']'
</script>

<template>
  <li
    class="group relative flex items-start gap-3 border-b border-subtle transition-colors duration-fast last:border-b-0 hover:bg-surface-3"
    :class="[
      compact ? 'px-4 py-3' : 'px-3 py-3.5 sm:gap-4 sm:px-4',
      item.read ? '' : 'bg-primary/[0.04]',
    ]"
  >
    <span
      v-if="!item.read"
      class="absolute left-1 top-[1.15rem] size-1.5 rounded-full bg-primary sm:left-1.5"
      aria-hidden="true"
    />

    <TeacherAvatar
      v-if="item.actor"
      :src="item.actor.avatar_url"
      :name="item.actor.name"
      :class="compact ? '!size-8 text-base' : '!size-9 text-lg'"
    />
    <span
      v-else
      class="flex shrink-0 items-center justify-center rounded-full border border-subtle bg-surface-2 text-foreground-muted"
      :class="compact ? 'size-8' : 'size-9'"
      aria-hidden="true"
    >
      <Icon :name="ICONS[item.category]" class="size-4" />
    </span>

    <div class="min-w-0 flex-1">
      <p class="text-sm leading-snug text-foreground-secondary" :class="{ 'text-foreground': !item.read }">
        <span class="sr-only">{{ item.read ? '' : 'No leída. ' }}</span>
        <strong v-if="item.actor" class="font-semibold text-foreground">{{ item.actor.name }}</strong>
        {{ ' ' }}
        <component
          :is="link ? (link.external ? 'a' : NuxtLink) : 'span'"
          v-bind="link ? (link.external ? { href: link.to, target: '_blank', rel: 'noopener' } : { to: link.to }) : {}"
          :class="link ? linkClass : ''"
          @click="link && onOpen()"
        >
          <template v-if="item.actor">
            {{ item.lead }}
          </template>
          <strong v-else class="font-medium text-foreground">{{ item.lead }}</strong>
        </component>
      </p>
      <p v-if="item.subject" class="mt-0.5 truncate text-sm font-medium text-foreground">
        {{ item.subject }}
      </p>
      <p class="t-meta mt-1 !text-xs">
        <time :datetime="item.created_at" :title="fullDate">{{ date }}</time>
      </p>
    </div>

    <button
      v-if="!item.read && !compact"
      type="button"
      class="bt-icon-btn relative z-10 !size-9 shrink-0 sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100"
      title="Marcar como leída"
      aria-label="Marcar como leída"
      @click="emit('read', item)"
    >
      <Icon name="lucide:check" class="size-4" />
    </button>
  </li>
</template>
