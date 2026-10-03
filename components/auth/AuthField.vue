<script setup lang="ts">
// Terminal-style underlined field shared by every auth form.
interface Props {
  id: string
  label: string
  type?: 'text' | 'email' | 'password'
  autocomplete?: string
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  inputmode?: 'email' | 'text'
}

const props = withDefaults(defineProps<Props>(), { type: 'text', autocomplete: 'off', placeholder: '', inputmode: 'text' })
const model = defineModel<string>({ required: true })

const reveal = ref(false)
const inputType = computed(() => (props.type === 'password' && reveal.value ? 'text' : props.type))
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <label :for="id" class="block font-mono text-[11px] text-foreground-subtle">{{ label }}</label>
      <slot name="label-extra" />
    </div>
    <div class="group flex items-center gap-3 h-11 border-b border-[#2D2C4A] transition-colors duration-300 hover:border-strong focus-within:border-primary focus-within:shadow-[0_1px_0_0_hsl(var(--primary)/0.6)]">
      <span class="term-prompt font-mono text-sm text-primary-text select-none" aria-hidden="true">&gt;</span>
      <input
        :id="id"
        v-model="model"
        class="term-input flex-1 min-w-0 h-full bg-transparent font-mono text-sm text-foreground caret-primary placeholder:text-foreground/25 outline-none disabled:opacity-60"
        :type="inputType"
        :name="id"
        :inputmode="inputmode"
        :autocomplete="autocomplete"
        :autocapitalize="type === 'text' ? undefined : 'none'"
        :spellcheck="type === 'text' ? undefined : false"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-invalid="invalid"
        required
      >
      <button
        v-if="type === 'password'"
        type="button"
        class="p-1 rounded text-foreground-subtle hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        :aria-label="reveal ? 'Ocultar contraseña' : 'Mostrar contraseña'"
        :aria-pressed="reveal"
        @click="reveal = !reveal"
      >
        <Icon :name="reveal ? 'lucide:eye' : 'lucide:eye-off'" class="size-4" />
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Neutralise the browser autofill background so it stays on the dark surface */
.term-input:-webkit-autofill,
.term-input:-webkit-autofill:hover,
.term-input:-webkit-autofill:focus {
  -webkit-text-fill-color: #fff;
  caret-color: hsl(var(--primary));
  -webkit-box-shadow: 0 0 0 1000px #070916 inset;
  box-shadow: 0 0 0 1000px #070916 inset;
  transition: background-color 9999s ease-out 0s;
}
.term-input {
  caret-shape: block;
  font-variant-ligatures: none;
}
.term-input::selection {
  background: hsl(var(--primary)/0.35);
  color: #fff;
}
/* Prompt blinks like a terminal cursor while its field has focus */
.group:focus-within .term-prompt {
  animation: term-blink 1.1s steps(1) infinite;
}
@keyframes term-blink {
  50% { opacity: 0.15; }
}
@media (prefers-reduced-motion: reduce) {
  .group:focus-within .term-prompt { animation: none; }
}
</style>
