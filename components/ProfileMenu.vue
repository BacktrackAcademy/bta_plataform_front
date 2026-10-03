<script lang="ts" setup>
import TeacherAvatar from '~/components/courses/TeacherAvatar.vue'
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
const shortName = computed(() => [user.value?.name?.split(' ')[0], user.value?.lastname?.split(' ')[0]].filter(Boolean).join(' '))
const fullName = computed(() => [user.value?.name, user.value?.lastname].filter(Boolean).join(' '))

const itemClass = 'group/item cursor-pointer gap-2 rounded-md px-3 py-2 font-inconsolata text-sm text-white focus:bg-white/[0.06] focus:text-white'

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
      <TeacherAvatar :src="user?.avatar_url" :name="fullName || '?'" class="!size-8 text-base" />
      <span class="hidden max-w-[180px] truncate font-inconsolata text-sm text-white sm:block">
        {{ shortName }}
      </span>
      <Icon
        name="lucide:chevron-down"
        class="size-4 text-bta-text-2 transition-transform duration-200 group-data-[state=open]:rotate-180"
      />
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" class="relative mt-1 w-64 overflow-hidden rounded-xl border-white/[0.08] bg-bta-dark-blue p-1.5 text-white shadow-[0_18px_40px_-18px_rgba(236,16,117,0.35)]">
      <span class="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-bta-pink/70 to-transparent" aria-hidden="true" />
      <DropdownMenuLabel class="font-normal">
        <p class="font-inconsolata text-xs text-gray-muted">
          <span class="text-bta-pink">$</span> whoami
        </p>
        <p class="mt-1 truncate font-oswald text-xl font-semibold leading-tight text-white">
          {{ fullName }}
        </p>
        <p class="truncate font-inconsolata text-xs text-bta-text-2">
          {{ user?.email }}
        </p>
      </DropdownMenuLabel>
      <DropdownMenuSeparator class="bg-white/[0.08]" />
      <DropdownMenuItem as-child :class="itemClass">
        <NuxtLink to="/perfil">
          <span class="text-bta-pink" aria-hidden="true">&gt;</span>
          <span>Ver mi perfil</span>
        </NuxtLink>
      </DropdownMenuItem>
      <DropdownMenuItem :class="itemClass" class="!text-red-400 focus:!bg-red-500/10 focus:!text-red-300" @select="handleLogout">
        <span aria-hidden="true">&gt;</span>
        <span>Cerrar sesión</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
