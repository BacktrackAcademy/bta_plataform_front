<script setup lang="ts">
import type { WorkspaceUnit } from '~/interfaces/learning'
import ProgressBar from '~/components/dashboard/ProgressBar.vue'

// Navegador del curso: unidades colapsables, estado por clase y scroll propio.
// Estados: completada · actual · disponible · bloqueada.
const props = defineProps<{
  courseTitle: string
  units: WorkspaceUnit[]
  completed: number
  total: number
  percent: number
  studied?: string
}>()

const NuxtLink = resolveComponent('NuxtLink')
const MANY_LESSONS = 25
const pad = (n: number) => String(n).padStart(2, '0')

const currentUnit = computed(() => props.units.findIndex(u => u.lessons.some(l => l.state === 'current')))
// Con muchas clases sólo se abre la unidad actual; el resto queda colapsado.
const open = ref<boolean[]>(props.units.map((_, i) => props.total <= MANY_LESSONS || i === currentUnit.value))

function toggle(i: number) {
  open.value[i] = !open.value[i]
}

const scroller = ref<HTMLElement | null>(null)
function centerCurrent() {
  const el = scroller.value?.querySelector<HTMLElement>('[aria-current="page"]')
  if (!el || !scroller.value)
    return
  scroller.value.scrollTop = el.offsetTop - scroller.value.clientHeight / 2 + el.offsetHeight / 2
}
onMounted(() => nextTick(centerCurrent))
watch(currentUnit, (i) => {
  if (i >= 0)
    open.value[i] = true
  nextTick(centerCurrent)
})

const stateLabel = { completed: 'Completada', current: 'Clase actual', available: 'Disponible', locked: 'Bloqueada: requiere acceso al curso' } as const
</script>

<template>
  <div class="flex h-full min-h-0 flex-col bg-surface-1">
    <header class="shrink-0 border-b border-subtle px-4 py-3">
      <p class="font-mono text-[13px] text-foreground-muted">
        <span class="text-primary-text">//</span> temario
      </p>
      <h2 class="mt-1 line-clamp-2 font-oswald text-base font-medium leading-snug text-foreground">
        {{ courseTitle }}
      </h2>
      <div class="mb-1.5 mt-3 flex items-baseline justify-between font-mono text-xs text-foreground-muted">
        <span>{{ completed }} / {{ total }} clases</span>
        <span class="text-foreground">{{ percent }}%</span>
      </div>
      <ProgressBar :value="percent" label="Progreso del curso" />
      <p v-if="studied" class="mt-2 font-mono text-xs text-foreground-subtle">
        Tiempo estudiado <span class="text-foreground-muted">{{ studied }}</span>
      </p>
    </header>

    <nav ref="scroller" aria-label="Temario del curso" class="relative min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6">
      <section v-for="(unit, i) in units" :key="unit.titulo + i">
        <h3 class="sticky top-0 z-10 border-b border-subtle bg-surface-1">
          <button
            type="button"
            class="bt-focus flex w-full items-start gap-2 px-4 py-2.5 text-left transition-colors duration-fast hover:bg-surface-2"
            :aria-expanded="open[i]"
            @click="toggle(i)"
          >
            <Icon name="lucide:chevron-right" class="mt-0.5 size-3.5 shrink-0 text-foreground-subtle transition-transform duration-fast" :class="{ 'rotate-90': open[i] }" aria-hidden="true" />
            <span class="min-w-0 flex-1 text-[13px] font-medium leading-snug text-foreground-secondary">{{ unit.titulo }}</span>
            <span class="mt-px font-mono text-xs text-foreground-subtle">{{ unit.lessons.filter(l => l.finished).length }}/{{ unit.lessons.length }}</span>
          </button>
        </h3>

        <ul v-show="open[i]">
          <li v-for="lesson in unit.lessons" :key="lesson.id">
            <component
              :is="lesson.state === 'locked' ? 'div' : NuxtLink"
              :to="lesson.state === 'locked' ? undefined : `/video/${lesson.slug}`"
              :aria-current="lesson.state === 'current' ? 'page' : undefined"
              :aria-disabled="lesson.state === 'locked' ? 'true' : undefined"
              :title="stateLabel[lesson.state]"
              class="bt-focus relative flex items-start gap-3 py-2 pl-4 pr-4 text-[13px] leading-snug transition-colors duration-fast"
              :class="{
                'bg-primary/10 text-foreground': lesson.state === 'current',
                'text-foreground-secondary hover:bg-foreground/[0.05] hover:text-foreground': lesson.state === 'available' || lesson.state === 'completed',
                'cursor-not-allowed text-foreground-subtle': lesson.state === 'locked',
              }"
            >
              <span v-if="lesson.state === 'current'" class="absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary" aria-hidden="true" />
              <span class="mt-px flex size-4 shrink-0 items-center justify-center" aria-hidden="true">
                <Icon v-if="lesson.state === 'completed'" name="lucide:circle-check" class="size-4 text-success" />
                <span v-else-if="lesson.state === 'current'" class="size-2 rounded-full bg-primary" />
                <Icon v-else-if="lesson.state === 'locked'" name="lucide:lock" class="size-3.5" />
                <Icon v-else name="lucide:circle" class="size-3.5 text-foreground-subtle" />
              </span>
              <span class="min-w-0 flex-1" :class="{ 'font-medium': lesson.state === 'current' }">
                <span class="mr-1.5 font-mono text-xs text-foreground-subtle">{{ pad(lesson.number) }}</span>{{ lesson.titlevideo }}
              </span>
              <span v-if="lesson.total" class="mt-px shrink-0 font-mono text-xs text-foreground-subtle">{{ lesson.total }}</span>
              <span class="sr-only">{{ stateLabel[lesson.state] }}</span>
            </component>
          </li>
        </ul>
      </section>
    </nav>
  </div>
</template>
