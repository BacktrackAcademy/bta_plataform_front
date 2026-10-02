<script setup lang="ts">
import AuthAlert from '@/components/auth/AuthAlert.vue'
import AuthField from '@/components/auth/AuthField.vue'
import AuthShell from '@/components/auth/AuthShell.vue'
import { linkClass, primaryButtonClass } from '@/components/auth/authClasses'

useSeoMeta({
  title: 'Recuperar contraseña',
  description: 'Recupera el acceso a tu cuenta de Backtrack Academy con un enlace seguro enviado a tu correo.',
  robots: 'noindex, follow',
})

definePageMeta({
  auth: false,
  layout: 'auth',
})

const email = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const errorCode = ref<string | null>(null)

// TODO: the API does not expose this endpoint yet. Wire the request here once it exists.
async function handleSubmit() {
  if (loading.value)
    return
  loading.value = true
  error.value = null
  errorCode.value = null
  await Promise.resolve()
  errorCode.value = 'SRV_501'
  error.value = 'Esta función aún no está disponible. Intenta más tarde o contacta a soporte.'
  loading.value = false
}
</script>

<template>
  <AuthShell title="Recupera tu acceso" subtitle="Te enviaremos un enlace para restablecer tu contraseña." variant="recover">
    <form class="flex flex-col gap-7" @submit.prevent="handleSubmit">
      <AuthAlert v-if="error" :code="errorCode" :message="error" />

      <AuthField
        id="email"
        v-model="email"
        label="Correo electrónico"
        type="email"
        inputmode="email"
        autocomplete="email"
        placeholder="mail@example.com"
        :disabled="loading"
        :invalid="!!error"
      />

      <button type="submit" :disabled="loading" :aria-busy="loading" :class="primaryButtonClass">
        <span class="inline-flex items-center justify-center gap-2">
          <Icon v-if="loading" name="lucide:loader-circle" class="size-5 animate-spin" />
          {{ loading ? 'Procesando…' : 'Enviar enlace' }}
        </span>
      </button>

      <p class="text-center font-mono text-[13px] text-white/55">
        ¿Ya tienes cuenta?
        <NuxtLink to="/login" :class="[linkClass, 'font-medium text-white hover:text-bta-pink']">
          Iniciar sesión
        </NuxtLink>
      </p>
    </form>
  </AuthShell>
</template>
