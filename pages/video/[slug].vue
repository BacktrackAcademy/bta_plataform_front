<script setup lang="ts">
import type { LessonProgressRow, LessonResponse, LessonState, LessonVideo, WorkspaceLesson, WorkspaceUnit } from '~/interfaces/learning'
import { onKeyStroke, useClipboard } from '@vueuse/core'
import TeacherAvatar from '~/components/courses/TeacherAvatar.vue'
import ProgressBar from '~/components/dashboard/ProgressBar.vue'

// Learning Workspace: video dominante + navegador del curso. Layout `custom` sin footer (meta.workspace).
definePageMeta({
  layout: 'custom',
  auth: true,
  workspace: true,
})

const route = useRoute()
const router = useRouter()
const { isPremium } = usePremium()
const { focus, toggleFocus } = useFocusMode()

const { data: lesson, error, refresh } = await useAPI<LessonResponse>(() => `/video/${route.params.slug}`)

useHead({ title: () => lesson.value?.titlevideo ?? 'Clase' })

const pad = (n: number) => String(n).padStart(2, '0')
// "MM:SS" → minutos (el backend interpreta el primer bloque como minutos)
function minutesOf(total?: string | null) {
  const [m, s] = (total ?? '').split(':').map(Number)
  return Number.isFinite(m) ? Math.max(1, Math.round(m + (s || 0) / 60)) : 0
}

const course = computed(() => lesson.value?.course)
const teacherName = computed(() => [course.value?.teacher?.name, course.value?.teacher?.lastname].filter(Boolean).join(' '))
const hasAccess = computed(() => lesson.value?.course_access ?? isPremium.value)

const progressRows = computed(() => new Map<number, LessonProgressRow>((lesson.value?.video_details_in_seconds ?? []).map(r => [r.id, r])))
// `is_finish` por clase llega desde el backend; si falta (API anterior) no mostramos clases completadas inventadas.
const hasFinishData = computed(() => (lesson.value?.video_details_in_seconds ?? []).some(r => r.is_finish !== undefined))
const currentFinished = computed(() => (lesson.value?.video_percent ?? 0) >= 99 || progressRows.value.get(lesson.value?.id ?? -1)?.is_finish === true)

const units = computed<WorkspaceUnit[]>(() => {
  let n = 0
  return (course.value?.syllabus ?? []).map(unit => ({
    titulo: unit.titulo,
    lessons: (unit.videos ?? []).map((v: LessonVideo): WorkspaceLesson => {
      const isCurrent = v.slug === lesson.value?.slug
      const finished = progressRows.value.get(v.id)?.is_finish === true || (isCurrent && currentFinished.value)
      const locked = !v.is_free && !hasAccess.value
      const state: LessonState = isCurrent ? 'current' : locked ? 'locked' : finished ? 'completed' : 'available'
      return { ...v, number: ++n, finished, locked, state }
    }),
  }))
})
const flat = computed(() => units.value.flatMap(u => u.lessons))
const currentIndex = computed(() => flat.value.findIndex(l => l.slug === lesson.value?.slug))
const current = computed(() => flat.value[currentIndex.value])
const currentUnit = computed(() => units.value.find(u => u.lessons.some(l => l.state === 'current')))

// Anterior/siguiente se derivan del temario ordenado; el `prev`/`next` del backend queda de respaldo.
function target(l?: WorkspaceLesson | LessonVideo | null) {
  if (!l)
    return null
  const known = flat.value.find(x => x.slug === l.slug)
  return { slug: l.slug, title: l.titlevideo, number: known?.number, locked: known ? known.locked : !l.is_free && !hasAccess.value }
}
const prevTarget = computed(() => currentIndex.value >= 0 ? target(flat.value[currentIndex.value - 1]) : target(lesson.value?.prev))
const nextTarget = computed(() => currentIndex.value >= 0 ? target(flat.value[currentIndex.value + 1]) : target(lesson.value?.next))

const totalLessons = computed(() => flat.value.length || lesson.value?.number_videos || 0)
const completedLessons = computed(() => hasFinishData.value ? flat.value.filter(l => l.finished).length : lesson.value?.videos_finish ?? 0)
const percent = computed(() => totalLessons.value > 0 ? Math.min(100, Math.round((completedLessons.value / totalLessons.value) * 100)) : 0)
const studied = computed(() => lesson.value?.time_studied_text ?? '')
const minutes = computed(() => minutesOf(lesson.value?.total))
const lessonLabel = computed(() => current.value ? `${pad(current.value.number)} — ${lesson.value?.titlevideo}` : lesson.value?.titlevideo ?? '')

// Progreso de reproducción: misma regla de siempre (POST /details/add_percentage), sin tocar su cadencia.
const { $api } = useNuxtApp()
function addPercentage(percent: number) {
  if (!lesson.value)
    return
  $api('/details/add_percentage', {
    method: 'POST',
    body: { detail_id: lesson.value.id, percent: percent * 100 },
  }).catch(() => {})
}
// Al terminar el video se relee el estado real (el backend decide cuándo una clase queda completada).
const wasFinished = ref(false)
function onEnded() {
  wasFinished.value = true
  refresh()
}

// Compartir: enlace a la clase (sólo cliente, sin backend).
const { copy, copied } = useClipboard({ copiedDuring: 2000 })
async function share() {
  const url = window.location.href
  if (navigator.share) {
    try {
      await navigator.share({ title: lesson.value?.titlevideo, url })
      return
    }
    catch {}
  }
  copy(url)
}

// Temario móvil/tablet
const tocOpen = ref(false)

// Atajos: ] siguiente · [ anterior · F modo foco · Esc salir del modo foco
function typing(e: KeyboardEvent) {
  const el = e.target as HTMLElement | null
  return !!el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))
}
onKeyStroke(']', (e) => {
  if (!typing(e) && nextTarget.value && !nextTarget.value.locked)
    router.push(`/video/${nextTarget.value.slug}`)
})
onKeyStroke('[', (e) => {
  if (!typing(e) && prevTarget.value && !prevTarget.value.locked)
    router.push(`/video/${prevTarget.value.slug}`)
})
onKeyStroke(['f', 'F'], (e) => {
  if (!typing(e) && !e.metaKey && !e.ctrlKey && !e.altKey)
    toggleFocus()
})
onKeyStroke('Escape', () => {
  if (focus.value && !tocOpen.value)
    focus.value = false
})
</script>

<template>
  <div v-if="lesson && course" class="flex flex-col md:min-h-0 md:flex-1" :class="focus ? 'min-h-dvh' : 'min-h-[calc(100dvh-4rem)]'">
    <!-- Barra de contexto: dónde estoy y cuánto llevo -->
    <div class="flex h-11 shrink-0 items-center gap-3 border-b border-subtle bg-surface-1 px-4 sm:px-6">
      <NuxtLink v-if="focus" to="/dashboard" class="bt-focus mr-1 shrink-0 rounded-sm" aria-label="Backtrack Academy — Inicio">
        <CommonBrandLogo class="w-24" />
      </NuxtLink>
      <nav aria-label="Ruta" class="flex min-w-0 flex-1 items-center gap-1.5 font-mono text-sm text-foreground-muted">
        <NuxtLink to="/cursos" class="bt-focus hidden shrink-0 rounded-sm transition-colors hover:text-primary-text sm:inline">
          ~/cursos
        </NuxtLink>
        <span class="hidden text-primary-text sm:inline">/</span>
        <NuxtLink :to="`/curso/${course.slug}`" class="bt-focus min-w-0 truncate rounded-sm transition-colors hover:text-primary-text" :title="course.titulo">
          {{ course.slug }}
        </NuxtLink>
        <template v-if="current">
          <span class="text-primary-text">/</span>
          <span class="shrink-0 text-foreground-secondary">{{ pad(current.number) }}</span>
        </template>
      </nav>

      <div class="flex shrink-0 items-center gap-3 font-mono text-xs text-foreground-muted" :title="`${completedLessons} de ${totalLessons} clases completadas`">
        <span class="hidden sm:inline">Curso</span>
        <ProgressBar :value="percent" label="Progreso del curso" class="!w-16 sm:!w-28" />
        <span class="w-9 text-right text-foreground">{{ percent }}%</span>
      </div>

      <button
        type="button"
        class="bt-icon-btn !size-8 shrink-0"
        :aria-pressed="focus"
        :aria-label="focus ? 'Salir del modo foco' : 'Activar modo foco'"
        :title="focus ? 'Salir del modo foco (Esc)' : 'Modo foco (F)'"
        @click="toggleFocus"
      >
        <Icon :name="focus ? 'lucide:x' : 'lucide:maximize'" class="size-4" />
      </button>
    </div>

    <div class="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
      <!-- Contenido -->
      <div class="flex min-h-0 min-w-0 flex-col">
        <div class="min-h-0 flex-1 md:overflow-y-auto">
          <div class="border-b border-subtle bg-black">
            <div class="stage mx-auto" :style="{ '--stage-reserve': focus ? '13rem' : '17rem' }">
              <LearningVideoStage :key="lesson.id" :video-id="lesson.url" :title="lesson.titlevideo" @progress="addPercentage" @ended="onEnded" />
            </div>
          </div>

          <!-- Temario (< lg): abre un bottom sheet -->
          <button
            type="button"
            class="bt-focus flex w-full items-center gap-3 border-b border-subtle bg-surface-1 px-4 py-2.5 text-left transition-colors hover:bg-surface-2 sm:px-6 lg:hidden"
            aria-haspopup="dialog"
            @click="tocOpen = true"
          >
            <Icon name="lucide:list-video" class="size-4 shrink-0 text-primary-text" aria-hidden="true" />
            <span class="min-w-0 flex-1">
              <span class="block text-sm font-medium text-foreground">Temario ({{ completedLessons }}/{{ totalLessons }})</span>
              <span v-if="currentUnit" class="t-meta block truncate !text-xs">{{ currentUnit.titulo }}</span>
            </span>
            <Icon name="lucide:chevron-up" class="size-4 shrink-0 text-foreground-subtle" aria-hidden="true" />
          </button>

          <article class="max-w-3xl px-4 py-5 sm:px-6">
            <p v-if="currentUnit" class="t-eyebrow truncate">
              <span class="text-primary-text">//</span> {{ currentUnit.titulo }}
            </p>
            <h1 class="mt-1 font-oswald text-xl font-semibold leading-snug text-foreground sm:text-2xl">
              {{ lessonLabel }}
            </h1>

            <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span v-if="teacherName" class="flex items-center gap-2 text-foreground-secondary">
                <TeacherAvatar :src="course.teacher?.avatar_url" :name="teacherName" />
                {{ teacherName }}
              </span>
              <span class="t-meta">
                Video<template v-if="minutes"> · {{ minutes }} min</template>
              </span>
              <span v-if="currentFinished || wasFinished" class="flex items-center gap-1.5 text-sm text-success">
                <Icon name="lucide:circle-check" class="size-4" aria-hidden="true" />
                Completada
              </span>
              <button type="button" class="bt-btn-ghost !h-8 !px-2.5 sm:ml-auto" @click="share">
                <Icon :name="copied ? 'lucide:check' : 'lucide:share-2'" class="size-4" aria-hidden="true" />
                {{ copied ? 'Enlace copiado' : 'Compartir' }}
              </button>
            </div>

            <p v-if="lesson.description" class="t-body mt-4 whitespace-pre-line">
              {{ lesson.description }}
            </p>
          </article>

          <div class="max-w-5xl space-y-10 px-4 pb-10 pt-2 sm:px-6">
            <LearningProgressChart v-if="lesson.video_details_in_seconds?.length" :rows="lesson.video_details_in_seconds" />
            <LearningExamCard v-if="lesson.exam" :exam="lesson.exam" :course-slug="course.slug" class="max-w-3xl" />
            <LearningLessonComments :key="lesson.slug" :slug="lesson.slug" class="max-w-3xl" />
          </div>
        </div>

        <!-- Siguiente acción: siempre a la vista -->
        <LearningLessonPager
          class="shrink-0 border-t border-subtle bg-surface-1 px-4 py-3 sm:px-6"
          :prev="prevTarget"
          :next="nextTarget"
          :finished="currentFinished || wasFinished"
          :course-slug="course.slug"
        />
      </div>

      <!-- Course navigator (lg+) con scroll propio -->
      <aside class="hidden min-h-0 border-l border-subtle lg:block" aria-label="Temario">
        <LearningCourseNavigator
          :course-title="course.titulo"
          :units="units"
          :completed="completedLessons"
          :total="totalLessons"
          :percent="percent"
          :studied="studied"
        />
      </aside>
    </div>

    <LearningTocSheet v-model="tocOpen" :label="`temario ${completedLessons}/${totalLessons}`">
      <LearningCourseNavigator
        :course-title="course.titulo"
        :units="units"
        :completed="completedLessons"
        :total="totalLessons"
        :percent="percent"
        :studied="studied"
      />
    </LearningTocSheet>
  </div>

  <div v-else class="p-4 sm:p-6">
    <CommonStateCard
      variant="error"
      title="No pudimos cargar esta clase"
      :text="error ? 'Revisa tu conexión e inténtalo de nuevo.' : 'La clase no existe o ya no está disponible.'"
    >
      <button type="button" class="bt-btn-secondary" @click="refresh()">
        Reintentar
      </button>
    </CommonStateCard>
  </div>
</template>

<style scoped>
/* Video 16:9 que nunca empuja la información fuera de pantalla: el ancho se limita según el alto disponible. */
@media (min-width: 768px) {
  .stage {
    width: min(100%, calc((100dvh - var(--stage-reserve)) * 16 / 9));
    min-width: min(100%, 480px);
  }
}
</style>
