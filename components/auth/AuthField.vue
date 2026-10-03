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
      <label :for="id" class="block font-mono text-xs text-foreground-muted">{{ label }}</label>
      <slot name="label-extra" />
    </div>
    <div class="group flex items-center gap-3 h-11 border-b border-input transition-colors duration-base hover:border-foreground-subtle focus-within:border-primary">
      <span class="term-prompt font-mono text-sm text-primary-text select-none" aria-hidden="true">&gt;</span>
      <input
        :id="id"
        v-model="model"
        class="term-input flex-1 min-w-0 h-full bg-transparent font-mono text-sm text-foreground caret-primary placeholder:text-foreground-subtle outline-none disabled:opacity-60"
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
        class="p-1 bt-focus rounded-sm text-foreground-muted hover:text-foreground transition-colors duration-fast"
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
  -webkit-text-fill-color: hsl(var(--foreground));
  caret-color: hsl(var(--primary));
  -webkit-box-shadow: 0 0 0 1000px hsl(var(--surface-1)) inset;
  box-shadow: 0 0 0 1000px hsl(var(--surface-1)) inset;
  transition: background-color 9999s ease-out 0s;
}
.term-input {
  caret-shape: block;
  font-variant-ligatures: none;
}
.term-input::selection {
  background: hsl(var(--primary)/0.35);
  color: hsl(var(--foreground));
}
</style>
