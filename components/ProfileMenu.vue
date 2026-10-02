<script lang="ts" setup>
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const { data: session, signOut } = useAuth()

const user = computed(() => session.value?.user)
const initials = computed(() => (user.value?.name?.[0] ?? '?').toUpperCase())

async function handleLogout() {
  await signOut()
  navigateTo('/')
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger
      class="bt-focus group flex items-center gap-2.5 rounded-md p-1 pr-2 transition-colors duration-200 hover:bg-white/[0.05]"
      aria-label="Menú de usuario"
    >
      <Avatar class="size-8 border border-white/15">
        <AvatarImage v-if="user?.avatar_url" :src="user.avatar_url" :alt="user?.name ?? 'Avatar'" />
        <AvatarFallback class="bg-bta-elevated text-xs font-semibold text-white">
          {{ initials }}
        </AvatarFallback>
      </Avatar>
      <span class="hidden max-w-[140px] truncate text-sm font-medium text-white sm:block">
        {{ user?.name }} {{ user?.lastname }}
      </span>
      <Icon
        name="lucide:chevron-down"
        class="size-4 text-bta-text-2 transition-transform duration-200 group-data-[state=open]:rotate-180"
      />
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" class="mt-1 w-60 border-white/[0.08] bg-bta-elevated text-white">
      <DropdownMenuLabel class="font-normal">
        <p class="truncate text-sm font-medium text-white">
          {{ user?.name }} {{ user?.lastname }}
        </p>
        <p class="truncate text-xs text-bta-text-2">
          {{ user?.email }}
        </p>
      </DropdownMenuLabel>
      <DropdownMenuSeparator class="bg-white/[0.08]" />
      <DropdownMenuItem as-child>
        <NuxtLink to="/perfil" class="flex w-full cursor-pointer items-center gap-2 text-white">
          <Icon name="lucide:user" class="size-4" />
          <span>Ver mi perfil</span>
        </NuxtLink>
      </DropdownMenuItem>
      <DropdownMenuItem class="cursor-pointer" @select="handleLogout">
        <Icon name="lucide:log-out" class="mr-2 size-4 text-red-400" />
        <span class="text-red-400">Cerrar sesión</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
