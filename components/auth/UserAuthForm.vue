<script setup lang="ts">
import AuthAlert from '@/components/auth/AuthAlert.vue'
import AuthField from '@/components/auth/AuthField.vue'
import { linkClass, primaryButtonClass } from '@/components/auth/authClasses'

interface Props {
  buttonText: string
  loading?: boolean
  error?: string | null
  errorCode?: string | null
}

const props = withDefaults(defineProps<Props>(), { loading: false, error: null, errorCode: null })
const emit = defineEmits<{
  register: [userInfo: { email: string, password: string }]
  socialLogin: [provider: 'github' | 'linkedin']
}>()

const userInfo = ref({
  email: '',
  password: '',
})

function handleSubmit() {
  if (props.loading)
    return
  emit('register', userInfo.value)
}

function handleSocialLogin(provider: 'github' | 'linkedin') {
  if (props.loading)
    return
  emit('socialLogin', provider)
}

const socialClass = 'flex-1 flex items-center justify-center gap-2.5 h-10 rounded-md border border-[#252936] font-mono text-xs text-white/75 transition-colors duration-200 hover:bg-white/[0.05] hover:border-white/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bta-pink/60 disabled:opacity-50 disabled:pointer-events-none'
</script>

<template>
  <form class="flex flex-col gap-7" @submit.prevent="handleSubmit">
    <AuthAlert v-if="error" :code="errorCode" :message="error" />

    <AuthField
      id="email"
      v-model="userInfo.email"
      label="Correo electrónico"
      type="email"
      inputmode="email"
      autocomplete="email"
      placeholder="mail@example.com"
      :disabled="loading"
      :invalid="!!error"
    />

    <AuthField
      id="password"
      v-model="userInfo.password"
      label="Contraseña"
      type="password"
      autocomplete="current-password"
      placeholder="••••••••"
      :disabled="loading"
      :invalid="!!error"
    >
      <template #label-extra>
        <NuxtLink to="/recuperar-contrasena" :class="[linkClass, 'font-mono text-xs text-white/50 hover:text-bta-pink']">
          ¿Olvidaste tu contraseña?
        </NuxtLink>
      </template>
    </AuthField>

    <button
      type="submit"
      :disabled="loading"
      :aria-busy="loading"
      :class="primaryButtonClass"
    >
      <span class="inline-flex items-center justify-center gap-2">
        <Icon v-if="loading" name="lucide:loader-circle" class="size-5 animate-spin" />
        {{ loading ? 'Verificando…' : buttonText }}
      </span>
    </button>

    <div class="flex items-center gap-4" role="separator">
      <span class="h-px flex-1 bg-[#252936]" />
      <span class="font-mono text-xs text-white/35">o continuar con</span>
      <span class="h-px flex-1 bg-[#252936]" />
    </div>

    <div class="flex gap-3">
      <button type="button" :class="socialClass" :disabled="loading" @click="handleSocialLogin('github')">
        <Icon name="mdi:github" class="size-5" />
        GitHub
      </button>
      <button type="button" :class="socialClass" :disabled="loading" @click="handleSocialLogin('linkedin')">
        <Icon name="mdi:linkedin" class="size-5 text-[#3B9AE8]" />
        LinkedIn
      </button>
    </div>

    <div class="flex flex-col items-center gap-2 font-mono text-xs">
      <p class="text-white/55">
        ¿No tienes cuenta?
        <NuxtLink to="/crear-cuenta" :class="[linkClass, 'font-medium text-white hover:text-bta-pink']">
          Crear cuenta
        </NuxtLink>
      </p>
      <NuxtLink
        to="/reenviar-confirmacion"
        :class="[linkClass, 'text-xs text-white/40 hover:text-white/70']"
      >
        ¿No recibiste el correo de confirmación?
      </NuxtLink>
    </div>
  </form>
</template>

