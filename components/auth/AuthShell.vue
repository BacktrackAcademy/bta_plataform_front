<script setup lang="ts">
import AuthBackdrop from '@/components/auth/AuthBackdrop.vue'
import AuthTerminal from '@/components/auth/AuthTerminal.vue'

// Shared split-screen frame for login, sign-up and account-recovery pages.
defineProps<{
  title: string
  subtitle: string
  variant?: 'login' | 'register' | 'recover' | 'resend'
}>()
</script>

<template>
  <main class="min-h-screen flex flex-col lg:flex-row bg-[#05060B]">
    <section class="relative hidden md:flex lg:w-[58%] md:h-[260px] lg:h-auto items-end lg:items-center px-10 lg:px-24 pb-8 lg:pb-0 overflow-hidden">
      <AuthBackdrop />
      <div class="relative z-10 auth-rise w-full max-w-xl" aria-hidden="true">
        <p class="flex items-center gap-2 font-mono text-[11px] text-white/50 mb-8">
          <span class="relative flex size-2">
            <span class="auth-ping absolute inline-flex size-full rounded-full bg-bta-pink opacity-60" />
            <span class="relative inline-flex size-2 rounded-full bg-bta-pink" />
          </span>
          SYSTEM ONLINE
        </p>
        <AuthTerminal :variant="variant" class="hidden lg:block" />
        <div class="lg:hidden">
          <p class="font-oswald font-bold uppercase text-5xl leading-[0.95] text-white">
            Happy<br>Hacking
          </p>
          <p class="mt-5 font-mono text-sm text-white/70">
            Comienza tu carrera en Ciberseguridad
          </p>
        </div>
      </div>
    </section>

    <section class="relative flex flex-1 items-center justify-center px-5 pt-28 pb-12 md:pt-12 lg:p-12 bg-[#080A10] lg:border-l border-[#171A24]">
      <div class="auth-rise w-full max-w-[460px]">
        <header class="mb-10">
          <h1 class="font-oswald font-bold uppercase tracking-wide text-4xl text-white">
            {{ title }}
          </h1>
          <p class="mt-3 font-mono text-sm text-white/55">
            {{ subtitle }}
          </p>
        </header>
        <slot />
      </div>
    </section>
  </main>
</template>

<style scoped>
.auth-rise { animation: auth-rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both; }
.auth-ping { animation: auth-ping 2.8s cubic-bezier(0, 0, 0.2, 1) infinite; }
@keyframes auth-rise { from { opacity: 0; transform: translateY(14px); } }
@keyframes auth-ping { 75%, 100% { transform: scale(2.4); opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .auth-rise, .auth-ping { animation: none; }
}
</style>
