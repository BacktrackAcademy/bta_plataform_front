<script setup lang="ts">
import AuthAlert from '@/components/auth/AuthAlert.vue'
import AuthField from '@/components/auth/AuthField.vue'
import { primaryButtonClass } from '@/components/auth/authClasses'

interface UserInfo {
  email: string
  password: string
  password_confirmation: string
}

interface Props {
  buttonText: string
  loading?: boolean
  error?: string | null
  errorCode?: string | null
}

const props = withDefaults(defineProps<Props>(), { loading: false, error: null, errorCode: null })

const emit = defineEmits<{
  register: [userInfo: UserInfo]
}>()

const userInfo = ref<UserInfo>({
  email: '',
  password: '',
  password_confirmation: '',
})

function handleSubmit() {
  if (props.loading)
    return
  emit('register', userInfo.value)
}
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
    />
    <AuthField
      id="password"
      v-model="userInfo.password"
      label="Contraseña"
      type="password"
      autocomplete="new-password"
      placeholder="mínimo 8 caracteres"
      :disabled="loading"
    />
    <AuthField
      id="password_confirmation"
      v-model="userInfo.password_confirmation"
      label="Repetir contraseña"
      type="password"
      autocomplete="new-password"
      placeholder="••••••••"
      :disabled="loading"
    />

    <button type="submit" :disabled="loading" :aria-busy="loading" :class="primaryButtonClass">
      <span class="inline-flex items-center justify-center gap-2">
        <Icon v-if="loading" name="lucide:loader-circle" class="size-5 animate-spin" />
        {{ loading ? 'Creando cuenta…' : buttonText }}
      </span>
    </button>
  </form>
</template>
