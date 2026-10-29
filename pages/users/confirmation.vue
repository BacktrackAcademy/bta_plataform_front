<script setup lang="ts">
import AuthAlert from '@/components/auth/AuthAlert.vue'
import AuthShell from '@/components/auth/AuthShell.vue'
import { linkClass, primaryButtonClass } from '@/components/auth/authClasses'

useSeoMeta({
  title: 'Confirmar cuenta',
  description: 'Confirma tu cuenta de Backtrack Academy.',
  robots: 'noindex, nofollow',
})

definePageMeta({
  auth: false,
  layout: 'auth',
})

// El enlace del correo de confirmación llega aquí con ?confirmation_token=...
type State = 'loading' | 'confirmed' | 'invalid' | 'error'

const route = useRoute()
const config = useRuntimeConfig()
const state = ref<State>('loading')

onMounted(async () => {
  const token = route.query.confirmation_token
  if (typeof token !== 'string' || !token) {
    state.value = 'invalid'
    return
  }
  try {
    await $fetch(`${config.public.apiBaseUrl}/users/confirm`, {
      method: 'POST',
      body: { confirmation_token: token },
    })
    state.value = 'confirmed'
  }
  catch (e: any) {
    state.value = e?.response?.status === 422 ? 'invalid' : 'error'
  }
})
</script>

<template>
  <AuthShell title="Confirma tu cuenta" subtitle="Estamos verificando tu enlace de confirmación." variant="resend">
    <div class="flex flex-col gap-7">
      <p v-if="state === 'loading'" class="flex items-center gap-2 font-mono text-sm text-foreground-muted">
        <Icon name="lucide:loader-circle" class="size-5 animate-spin" />
        Verificando…
      </p>

      <template v-else-if="state === 'confirmed'">
        <AuthAlert variant="success" code="ACCOUNT_CONFIRMED" message="Tu cuenta quedó confirmada. Ya puedes iniciar sesión." />
        <NuxtLink to="/login" :class="primaryButtonClass" class="text-center">
          Iniciar sesión
        </NuxtLink>
      </template>

      <template v-else>
        <AuthAlert
          :code="state === 'invalid' ? 'CONF_422' : 'SRV_500'"
          :message="state === 'invalid'
            ? 'El enlace no es válido o ya expiró. Pide un nuevo correo de confirmación.'
            : 'No pudimos confirmar tu cuenta en este momento. Intenta de nuevo más tarde.'"
        />
        <p class="text-center font-mono text-[13px] text-foreground-muted">
          <NuxtLink to="/reenviar-confirmacion" :class="[linkClass, 'font-medium text-foreground hover:text-primary-text']">
            Reenviar correo de confirmación
          </NuxtLink>
        </p>
      </template>
    </div>
  </AuthShell>
</template>
