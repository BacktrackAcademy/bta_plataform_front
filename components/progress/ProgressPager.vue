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

const btn = 'bt-focus inline-flex h-9 items-center justify-center rounded-md border border-subtle bg-surface-1 px-3 font-mono text-sm transition-colors duration-fast disabled:pointer-events-none disabled:opacity-45'
</script>

<template>
  <nav v-if="totalPages > 1" aria-label="Paginación de cursos" class="flex flex-wrap items-center justify-center gap-1.5">
    <button type="button" :class="btn" class="gap-1.5 text-foreground-secondary hover:border-border hover:bg-surface-3 hover:text-foreground" :disabled="page <= 1" @click="emit('update:page', page - 1)">
      <Icon name="lucide:arrow-left" class="size-3.5" aria-hidden="true" /> PREV
    </button>
    <template v-for="(n, i) in pages" :key="i">
      <span v-if="n === null" class="px-1 font-inconsolata text-foreground-subtle" aria-hidden="true">…</span>
      <button
        v-else
        type="button"
        :class="[btn, n === page ? '!border-primary/50 !bg-primary/10 text-foreground' : 'text-foreground-muted hover:border-border hover:bg-surface-3 hover:text-foreground']"
        :aria-current="n === page ? 'page' : undefined"
        :aria-label="`Página ${n}`"
        @click="emit('update:page', n)"
      >
        {{ pad(n) }}
      </button>
    </template>
    <button type="button" :class="btn" class="gap-1.5 text-foreground-secondary hover:border-border hover:bg-surface-3 hover:text-foreground" :disabled="page >= totalPages" @click="emit('update:page', page + 1)">
      NEXT <Icon name="lucide:arrow-right" class="size-3.5" aria-hidden="true" />
    </button>
  </nav>
</template>
