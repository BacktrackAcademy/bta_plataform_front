<script setup lang="ts">
import AuthAlert from '@/components/auth/AuthAlert.vue'
import AuthShell from '@/components/auth/AuthShell.vue'
import UserRegisterForm from '@/components/auth/UserRegisterForm.vue'
import { linkClass } from '@/components/auth/authClasses'

useSeoMeta({
  title: 'Crear cuenta gratis',
  description: 'Únete gratis a Backtrack Academy y comienza a aprender ciberseguridad y hacking ético desde cero con los mejores hackers.',
})

definePageMeta({
  auth: false,
  layout: 'auth',
  middleware: 'guest',
})

interface RegistrationInfo {
  email: string
  password: string
  password_confirmation: string
}

const error = ref<string | null>(null)
const errorCode = ref<string | null>(null)
const loading = ref(false)
const registered = ref(false)
const config = useRuntimeConfig()
// "Empezar ahora" desde el sitio público trae ?redirect=: se guarda porque el email de confirmación rompe la cadena de URLs.
const redirect = usePostLoginRedirect()
redirect.remember()

function setError(code: string | null, message: string | null) {
  errorCode.value = code
  error.value = message
}

async function handleRegister(registrationInfo: RegistrationInfo) {
  setError(null, null)
  loading.value = true
  try {
    await $fetch(`${config.public.apiBaseUrl}/users`, {
      method: 'POST',
      body: {
        user: registrationInfo,
      },
    })
    registered.value = true
  }
  catch (e: any) {
    console.log(e)

    if (e?.response?.status === 409) {
      setError('USR_409', e.response._data || 'El usuario ya existe')
    }
    else {
      setError('REG_422', 'Hubo un error, por favor confirma que ambas contraseñas coincidan y tengan más de 8 dígitos')
    }
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthShell
    title="Crea tu cuenta"
    subtitle="Únete gratis y aprende desde cero con los mejores hackers."
    variant="register"
  >
    <div v-if="registered" class="flex flex-col gap-6">
      <AuthAlert
        variant="success"
        code="ACCOUNT_CREATED"
        message="Cuenta creada. Revisa tu correo y confirma tu cuenta para poder iniciar sesión."
      />
      <NuxtLink :to="redirect.withRedirect('/login')" :class="[linkClass, 'font-mono text-sm text-foreground-muted hover:text-primary-text']">
        &gt; Ir a iniciar sesión
      </NuxtLink>
    </div>
    <template v-else>
      <UserRegisterForm
        button-text="Crear cuenta"
        :loading="loading"
        :error="error"
        :error-code="errorCode"
        @register="handleRegister"
      />
      <div class="mt-8 flex flex-col items-center gap-2 font-mono text-[13px]">
        <p class="text-foreground-muted">
          ¿Ya tienes cuenta?
          <NuxtLink :to="redirect.withRedirect('/login')" :class="[linkClass, 'font-medium text-foreground hover:text-primary-text']">
            Iniciar sesión
          </NuxtLink>
        </p>
        <NuxtLink to="/reenviar-confirmacion" :class="[linkClass, 'text-xs text-foreground-subtle hover:text-foreground-muted']">
          ¿No recibiste el correo de confirmación?
        </NuxtLink>
      </div>
    </template>
  </AuthShell>
</template>
