<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { X } from 'lucide-vue-next'
import { computed, ref } from 'vue'

interface Option {
  value: string
  label: string
}

// Definición de las props
const props = defineProps<{
  options: Option[]
  selected: string[]
  placeholder?: string
  searchPlaceholder?: string
  className?: string
}>()

const emit = defineEmits(['change'])

const open = ref(false)
const searchQuery = ref('')

const filteredOptions = computed(() => {
  if (!searchQuery.value)
    return props.options

  return props.options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

function handleUnselect(value: string) {
  emit('change', props.selected.filter(s => s !== value))
}

function handleSelect(value: string) {
  emit('change', props.selected.includes(value)
    ? props.selected.filter(s => s !== value)
    : [...props.selected, value])
  // Evitamos que se cierre el popover
  open.value = true
  // Limpiamos la búsqueda para mostrar todas las opciones de nuevo
  searchQuery.value = ''
}

function handleSearch(value: string) {
  searchQuery.value = value
}

// Prevenir que el click en el botón de eliminar cierre el popover
function handleMouseDownPrevent(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <div
        role="combobox"
        tabindex="0"
        :aria-expanded="open"
        :data-open="open"
        :class="cn(
          'relative flex min-h-10 w-full cursor-pointer flex-wrap items-center justify-start gap-1 rounded-md border border-input bg-surface-2 px-3 py-2 text-sm text-foreground transition-[border-color,box-shadow] duration-fast ease-out hover:border-foreground-subtle focus-visible:border-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 data-[open=true]:border-primary/70 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )"
      >
        <div class="flex flex-wrap gap-1 flex-grow">
          <p v-if="selected.length === 0" class="text-sm text-foreground-subtle">
            {{ placeholder }}
          </p>
          <Badge
            v-for="value in selected"
            :key="value"
            variant="secondary"
            class="mb-1 mr-1 px-1.5 font-normal"
          >
            {{ options.find((o) => o.value === value)?.label }}
            <button
              type="button"
              class="bt-focus ml-1 rounded-sm"
              @keydown.enter="handleUnselect(value)"
              @mousedown="handleMouseDownPrevent"
              @click="handleUnselect(value)"
            >
              <X class="h-3 w-3 text-muted-foreground hover:text-foreground" />
              <span class="sr-only">Eliminar {{ value }}</span>
            </button>
          </Badge>
        </div>
      </div>
    </PopoverTrigger>
    <PopoverContent class="w-[--radix-popover-trigger-width] p-0" align="start">
      <Command>
        <CommandInput
          :placeholder="searchPlaceholder"
          @input="handleSearch($event.target.value)"
        />
        <CommandList>
          <CommandEmpty>No se encontraron resultados.</CommandEmpty>
          <CommandGroup>
            <CommandItem
              v-for="option in filteredOptions"
              :key="option.value"
              :value="option.value"
              @select="handleSelect(option.value)"
            >
              <span :class="{ 'opacity-50': props.selected.includes(option.value) }">
                {{ option.label }}
              </span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
