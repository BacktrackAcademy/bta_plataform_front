<script setup lang="ts">
// Terminal-style pager: ← PREV 01 02 03 NEXT →. Real buttons, aria-current on the active page.
const props = defineProps<{ page: number, totalPages: number }>()
const emit = defineEmits<{ 'update:page': [page: number] }>()

const pad = (n: number) => String(n).padStart(2, '0')

// First, last and a window around the current page; null = ellipsis.
const pages = computed<(number | null)[]>(() => {
  const { page, totalPages } = props
  const keep = new Set([1, totalPages, page - 1, page, page + 1])
  const list: (number | null)[] = []
  for (let n = 1; n <= totalPages; n++) {
    if (keep.has(n))
      list.push(n)
    else if (list[list.length - 1] !== null)
      list.push(null)
  }
  return list
})

const btn = 'bt-focus inline-flex h-9 items-center justify-center border border-white/[0.06] px-3 font-inconsolata text-sm transition-colors disabled:pointer-events-none disabled:opacity-30'
</script>

<template>
  <nav v-if="totalPages > 1" aria-label="Paginación de cursos" class="flex flex-wrap items-center justify-center gap-1.5">
    <button type="button" :class="btn" class="gap-1.5 text-white/80 hover:border-bta-pink/50 hover:text-white" :disabled="page <= 1" @click="emit('update:page', page - 1)">
      <Icon name="lucide:arrow-left" class="size-3.5" aria-hidden="true" /> PREV
    </button>
    <template v-for="(n, i) in pages" :key="i">
      <span v-if="n === null" class="px-1 font-inconsolata text-gray-muted" aria-hidden="true">…</span>
      <button
        v-else
        type="button"
        :class="[btn, n === page ? '!border-bta-pink bg-bta-pink/10 text-white' : 'text-bta-text-2 hover:border-bta-pink/50 hover:text-white']"
        :aria-current="n === page ? 'page' : undefined"
        :aria-label="`Página ${n}`"
        @click="emit('update:page', n)"
      >
        {{ pad(n) }}
      </button>
    </template>
    <button type="button" :class="btn" class="gap-1.5 text-white/80 hover:border-bta-pink/50 hover:text-white" :disabled="page >= totalPages" @click="emit('update:page', page + 1)">
      NEXT <Icon name="lucide:arrow-right" class="size-3.5" aria-hidden="true" />
    </button>
  </nav>
</template>
