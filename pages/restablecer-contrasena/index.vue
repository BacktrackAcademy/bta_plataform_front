<script setup lang="ts">
import AuthAlert from '@/components/auth/AuthAlert.vue'
import AuthField from '@/components/auth/AuthField.vue'
import AuthShell from '@/components/auth/AuthShell.vue'
import { linkClass, primaryButtonClass } from '@/components/auth/authClasses'

useSeoMeta({
  title: 'Restablecer contraseña',
  description: 'Crea una nueva contraseña para tu cuenta de Backtrack Academy.',
  robots: 'noindex, nofollow',
})

definePageMeta({
  auth: false,
  layout: 'auth',
})

// El enlace del correo de recuperación llega aquí con ?token=...
const route = useRoute()
const config = useRuntimeConfig()
const token = typeof route.query.token === 'string' ? route.query.token : ''

const password = ref('')
const confirmation = ref('')
const loading = ref(false)
const done = ref(false)
const tokenInvalid = ref(!token)
const error = ref<string | null>(null)
const errorCode = ref<string | null>(null)

async function handleSubmit() {
  if (loading.value)
    return
  error.value = null
  errorCode.value = null
  if (password.value.length < 8) {
    errorCode.value = 'VAL_422'
    error.value = 'La contraseña debe tener al menos 8 caracteres.'
    return
  }
  if (password.value !== confirmation.value) {
    errorCode.value = 'VAL_422'
    error.value = 'Las contraseñas no coinciden.'
    return
  }
  loading.value = true
  try {
    await $fetch(`${config.public.apiBaseUrl}/users/password`, {
      method: 'PATCH',
      body: { token, password: password.value, password_confirmation: confirmation.value },
    })
    done.value = true
  }
  catch (e: any) {
    if (e?.response?.status === 422 && e?.data?.error === 'invalid_token') {
      tokenInvalid.value = true
    }
    else if (e?.response?.status === 422) {
      errorCode.value = 'VAL_422'
      error.value = 'La contraseña no es válida. Usa al menos 8 caracteres.'
    }
    else {
      errorCode.value = 'SRV_500'
      error.value = 'No pudimos cambiar tu contraseña en este momento. Intenta de nuevo más tarde.'
    }
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthShell title="Nueva contraseña" subtitle="Elige una contraseña nueva para tu cuenta." variant="recover">
    <div v-if="done" class="flex flex-col gap-7">
      <AuthAlert variant="success" code="PASSWORD_RESET" message="Tu contraseña fue actualizada. Ya puedes iniciar sesión." />
      <NuxtLink to="/login" :class="primaryButtonClass" class="text-center">
        Iniciar sesión
      </NuxtLink>
    </div>

    <div v-else-if="tokenInvalid" class="flex flex-col gap-7">
      <AuthAlert code="TOKEN_422" message="El enlace no es válido o ya expiró. Pide uno nuevo." />
      <NuxtLink to="/recuperar-contrasena" :class="primaryButtonClass" class="text-center">
        Pedir un nuevo enlace
      </NuxtLink>
    </div>

    <form v-else class="flex flex-col gap-7" @submit.prevent="handleSubmit">
      <AuthAlert v-if="error" :code="errorCode" :message="error" />

      <AuthField
        id="password"
        v-model="password"
        label="Nueva contraseña"
        type="password"
        autocomplete="new-password"
        placeholder="Mínimo 8 caracteres"
        :disabled="loading"
        :invalid="!!error"
      />

      <AuthField
        id="password_confirmation"
        v-model="confirmation"
        label="Repite la contraseña"
        type="password"
        autocomplete="new-password"
        :disabled="loading"
        :invalid="!!error"
      />

      <button type="submit" :disabled="loading" :aria-busy="loading" :class="primaryButtonClass">
        <span class="inline-flex items-center justify-center gap-2">
          <Icon v-if="loading" name="lucide:loader-circle" class="size-5 animate-spin" />
          {{ loading ? 'Procesando…' : 'Cambiar contraseña' }}
        </span>
      </button>

      <p class="text-center font-mono text-[13px] text-foreground-muted">
        <NuxtLink to="/login" :class="[linkClass, 'font-medium text-foreground hover:text-primary-text']">
          Volver a iniciar sesión
        </NuxtLink>
      </p>
    </form>
  </AuthShell>
</template>
