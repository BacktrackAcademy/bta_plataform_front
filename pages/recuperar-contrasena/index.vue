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

const config = useRuntimeConfig()
const email = ref('')
const loading = ref(false)
const sent = ref(false)
const error = ref<string | null>(null)
const errorCode = ref<string | null>(null)

async function handleSubmit() {
  if (loading.value)
    return
  loading.value = true
  error.value = null
  errorCode.value = null
  try {
    await $fetch(`${config.public.apiBaseUrl}/users/password`, {
      method: 'POST',
      body: { email: email.value.trim() },
    })
    sent.value = true
  }
  catch {
    errorCode.value = 'SRV_500'
    error.value = 'No pudimos enviar el enlace en este momento. Intenta de nuevo más tarde.'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthShell title="Recupera tu acceso" subtitle="Te enviaremos un enlace para restablecer tu contraseña." variant="recover">
    <div v-if="sent" class="flex flex-col gap-7">
      <AuthAlert variant="success" code="MAIL_SENT" message="Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña. Revisa también tu carpeta de spam." />
      <p class="text-center font-mono text-[13px] text-foreground-muted">
        <NuxtLink to="/login" :class="[linkClass, 'font-medium text-foreground hover:text-primary-text']">
          Volver a iniciar sesión
        </NuxtLink>
      </p>
    </div>

    <form v-else class="flex flex-col gap-7" @submit.prevent="handleSubmit">
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

      <p class="text-center font-mono text-[13px] text-foreground-muted">
        ¿Ya tienes cuenta?
        <NuxtLink to="/login" :class="[linkClass, 'font-medium text-foreground hover:text-primary-text']">
          Iniciar sesión
        </NuxtLink>
      </p>
    </form>
  </AuthShell>
</template>
