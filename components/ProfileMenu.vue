<script lang="ts" setup>
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import TeacherAvatar from '~/components/courses/TeacherAvatar.vue'

const { data: session, signOut } = useAuth()

const user = computed(() => session.value?.user)
const profilePath = computed(() => (user.value?.username ? `/@${user.value.username}` : '/perfil'))
const shortName = computed(() => [user.value?.name?.split(' ')[0], user.value?.lastname?.split(' ')[0]].filter(Boolean).join(' '))
const fullName = computed(() => [user.value?.name, user.value?.lastname].filter(Boolean).join(' '))

const itemClass = 'group/item cursor-pointer gap-2 rounded-md px-3 py-2 text-sm text-foreground-secondary focus:bg-surface-4 focus:text-foreground'

async function handleLogout() {
  await signOut()
  navigateTo('/')
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger
      class="bt-focus group flex items-center gap-2.5 rounded-md p-1 pr-2 transition-colors duration-fast hover:bg-surface-4"
      aria-label="Menú de usuario"
    >
      <TeacherAvatar :src="user?.avatar_url" :name="fullName || '?'" class="!size-8 text-base" />
      <span class="hidden max-w-[180px] truncate text-sm text-foreground sm:block">
        {{ shortName }}
      </span>
      <Icon
        name="lucide:chevron-down"
        class="size-4 text-foreground-muted transition-transform duration-base group-data-[state=open]:rotate-180"
      />
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" class="mt-1 w-64 p-1.5 text-foreground">
      <DropdownMenuLabel class="px-3 pb-1 pt-2 font-normal">
        <p class="font-mono text-xs text-foreground-subtle">
          <span class="text-primary-text">$</span> whoami
        </p>
      </DropdownMenuLabel>
      <DropdownMenuItem as-child class="group/profile cursor-pointer rounded-md p-3 focus:bg-surface-4">
        <NuxtLink :to="profilePath" class="flex items-center gap-3" title="Ver mi perfil">
          <TeacherAvatar
            :src="user?.avatar_url"
            :name="fullName || '?'"
            class="!size-14 shrink-0 text-2xl ring-2 ring-transparent transition-shadow duration-200 group-hover/profile:ring-primary group-focus/profile:ring-primary"
          />
          <span class="min-w-0 flex-1">
            <span class="block truncate font-oswald text-lg font-semibold leading-tight text-foreground">
              {{ fullName }}
            </span>
            <span class="block truncate font-mono text-xs text-foreground-muted">
              {{ user?.email }}
            </span>
          </span>
          <Icon name="lucide:chevron-right" class="size-4 shrink-0 text-primary-text opacity-0 transition-opacity duration-200 group-hover/profile:opacity-100 group-focus/profile:opacity-100" />
        </NuxtLink>
      </DropdownMenuItem>
      <DropdownMenuSeparator class="bg-border" />
      <DropdownMenuItem as-child :class="itemClass">
        <NuxtLink to="/perfil/editar">
          <span class="text-primary-text" aria-hidden="true">&gt;</span>
          <span>Editar perfil</span>
        </NuxtLink>
      </DropdownMenuItem>
      <DropdownMenuItem :class="itemClass" class="!text-danger focus:!bg-danger/10 focus:!text-danger" @select="handleLogout">
        <span aria-hidden="true">&gt;</span>
        <span>Cerrar sesión</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
