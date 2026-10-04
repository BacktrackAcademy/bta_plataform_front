<script setup lang="ts">
import AuthShell from '@/components/auth/AuthShell.vue'
import UserAuthForm from '@/components/auth/UserAuthForm'

useSeoMeta({
  title: 'Iniciar sesión',
  description: 'Accede a tu cuenta de Backtrack Academy y continúa tu formación en ciberseguridad y hacking ético.',
})

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const error = ref<string | null>(null)
const loading = ref(false)
const errorCode = ref<string | null>(null)
const route = useRoute()
const redirect = usePostLoginRedirect()

// Maps Auth.js error codes/messages to a terminal-style code + friendly message
function describeError(raw: string): { code: string, message: string } {
  switch (raw) {
    case 'Invalid credentials':
    case 'CredentialsSignin':
      return { code: 'AUTH_401', message: 'Credenciales inválidas. Verifica tu correo y contraseña.' }
    case 'Server error':
      return { code: 'SRV_503', message: 'No pudimos contactar el servidor de autenticación. Intenta de nuevo en unos minutos.' }
    case 'AccessDenied':
      return { code: 'AUTH_403', message: 'Acceso denegado para esta cuenta.' }
    case 'OAuthSignin':
    case 'OAuthCallback':
    case 'OAuthAccountNotLinked':
    case 'Callback':
      return { code: 'OAUTH_ERR', message: 'No se pudo completar el inicio de sesión con el proveedor externo.' }
    default:
      return { code: 'ERR_UNKNOWN', message: 'Ocurrió un error inesperado al iniciar sesión.' }
  }
}

function setError(raw: string | null) {
  if (!raw) {
    error.value = null
    errorCode.value = null
    return
  }
  const { code, message } = describeError(raw)
  error.value = message
  errorCode.value = code
}

onMounted(() => {
  if (typeof route.query.error === 'string')
    setError(route.query.error)
})
const router = useRouter()
const { signIn } = useAuth()

// Nueva función de login usando Nuxt Auth
async function loginUser(credentials: Record<string, any>) {
  setError(null)
  loading.value = true
  try {
    const result = await signIn('credentials', { ...credentials, redirect: false })

    if (result?.error) {
      throw new Error(result.error)
    }
    // Tras un login exitoso: el destino con el que llegó el visitante (si es válido) o el dashboard
    router.push(redirect.consume() ?? '/dashboard')
  }
  catch (err: any) {
    setError(err.message || 'unknown')
  }
  finally {
    loading.value = false
  }
}

async function handleSocialLogin(provider: 'github' | 'linkedin') {
  setError(null)
  try {
    const result = await signIn(provider, {
      callbackUrl: redirect.target.value ?? '/dashboard',
    })

    if (result?.error) {
      throw new Error(result.error)
    }
  }
  catch (err: any) {
    setError(err.message || 'OAuthSignin')
  }
}
</script>

<template>
  <AuthShell title="Bienvenido de vuelta" subtitle="Accede a tu cuenta de Backtrack Academy." variant="login">
    <UserAuthForm
      button-text="Iniciar sesión"
      :loading="loading"
      :error="error"
      :error-code="errorCode"
      @register="loginUser"
      @social-login="handleSocialLogin"
    />
  </AuthShell>
</template>
