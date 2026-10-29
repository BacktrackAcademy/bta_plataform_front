<script setup lang="ts">
defineProps<{
  state: boolean
}>()

defineEmits<{
  toggle: []
}>()
</script>

<template>
  <div class="ml-auto block lg:hidden">
    <button
      type="button"
      class="bt-focus relative flex size-11 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-surface-4"
      :aria-label="state ? 'Cerrar menú' : 'Abrir menú'"
      :aria-expanded="state"
      @click="$emit('toggle')"
    >
      <span class="relative block h-4 w-5" aria-hidden="true">
        <span
          class="absolute left-0 block h-0.5 w-full rounded-full bg-current transition-all duration-300"
          :class="state ? 'top-[7px] rotate-45' : 'top-0'"
        />
        <span
          class="absolute left-0 top-[7px] block h-0.5 w-full rounded-full bg-current transition-opacity duration-300"
          :class="{ 'opacity-0': state }"
        />
        <span
          class="absolute left-0 block h-0.5 w-full rounded-full bg-current transition-all duration-300"
          :class="state ? 'top-[7px] -rotate-45' : 'top-[14px]'"
        />
      </span>
    </button>
  </div>
</template>
