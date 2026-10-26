<script setup lang="ts">
import type { SpecialtyDetail } from '~/interfaces/specialties'
import PageHeader from '~/components/common/PageHeader.vue'
import ProgressBar from '~/components/dashboard/ProgressBar.vue'
import ExamPanel from '~/components/specialties/ExamPanel.vue'

// Destino de "Comenzar especialidad" desde backtrackacademy.com (…/crear-cuenta?redirect=/especialidad/:slug).
// Ya autenticado: ruta de cursos en orden con tu avance, el examen de cada curso y el examen final de la especialidad.
// El contenido editorial indexable vive en el sitio público (canonical).
definePageMeta({
  layout: 'custom',
  auth: true,
})

const route = useRoute('especialidad-slug')
// Un string en `:is` no resuelve el componente (sin navegación): hay que resolverlo.
const NuxtLink = resolveComponent('NuxtLink')
const siteUrl = useSiteUrl()
const { viewOf, hrefOf } = useExamState()
const { data: specialty, error } = await useAPI<SpecialtyDetail>(`/specialties/${route.params.slug}`)
if (error.value)
  throw createError({ statusCode: error.value.statusCode === 404 ? 404 : 503, statusMessage: error.value.statusCode === 404 ? 'Especialidad no encontrada' : 'Servicio no disponible', fatal: true })

const s = computed(() => specialty.value!)
const { data: overview } = useAPI<{ vouchers_left: number }>('/exams', { lazy: true })

const next = computed(() => s.value.courses.find(c => !c.coming_soon && !c.progress.completed))
const started = computed(() => s.value.progress.courses_started > 0)
const duration = computed(() => formatCourseDuration({ total_duration_seconds: s.value.total_duration_seconds }))
const courseDuration = (seconds: number) => formatCourseDuration({ total_duration_seconds: seconds })

// Texto de cabecera según dónde está el alumno: empezar, continuar o rendir el examen final.
const cta = computed(() => {
  if (s.value.progress.status === 'certified')
    return null
  if (next.value)
    return { label: started.value ? 'Continuar con el siguiente curso' : 'Empezar con el primer curso', to: `/curso/${next.value.slug}` }
  return null
})

const sections = computed(() => [
  { title: 'Acerca de esta especialidad', html: s.value.description },
  { title: 'Qué aprenderás', html: s.value.learn },
  { title: 'Objetivos', html: s.value.goals },
  { title: 'Herramientas', html: s.value.work || s.value.tools },
  { title: 'Conocimientos requeridos', html: s.value.aptitude || s.value.requirements },
].filter(x => x.html))

// Es una pantalla de la app (sesión): el contenido indexable es la ficha pública, a la que apunta el canonical.
useSeoMeta({ title: () => s.value.name, robots: 'noindex, nofollow' })
useHead(() => ({ link: [{ rel: 'canonical', href: siteUrl(`/especialidad/${s.value.slug}`) }] }))
</script>

<template>
  <div class="mx-auto w-full max-w-[1200px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <nav aria-label="Ruta" class="mb-4 font-mono text-sm text-foreground-muted">
      <NuxtLink to="/especialidades" class="transition-colors hover:text-primary-text">
        ~/especialidades
      </NuxtLink>
      <span class="mx-1 text-primary-text">/</span>
      <span class="text-foreground-secondary">{{ s.slug }}</span>
    </nav>

    <PageHeader :title="s.name">
      <template v-if="s.level">
        {{ s.level }} ·
      </template>
      {{ s.courses_count }} {{ s.courses_count === 1 ? 'curso' : 'cursos' }}<template v-if="duration">
        · {{ duration }}
      </template>
      <template #actions>
        <NuxtLink v-if="cta" :to="cta.to" class="bt-btn-primary bt-btn-lg">
          {{ cta.label }}
        </NuxtLink>
      </template>
    </PageHeader>

    <!-- Avance de la especialidad -->
    <section class="bt-surface mt-6 p-5" aria-labelledby="progress-title">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h2 id="progress-title" class="font-mono text-[13px] text-foreground-muted">
            <span class="text-primary-text">//</span> tu avance
          </h2>
          <p class="mt-1 font-oswald text-3xl text-foreground">
            {{ s.progress.percent }}<span class="text-xl text-foreground-muted">%</span>
          </p>
        </div>
        <p class="t-small text-right">
          {{ s.progress.courses_completed }} de {{ s.progress.courses_total }} cursos completados
        </p>
      </div>
      <ProgressBar class="mt-3" size="md" :value="s.progress.percent" :label="`Avance en ${s.name}`" />
    </section>

    <p v-if="!s.has_access" class="bt-surface mt-4 p-4 text-sm" role="status">
      Algunos cursos de esta especialidad requieren una suscripción.
      <NuxtLink to="/suscripciones" class="ml-1 text-primary-text underline">
        Ver planes
      </NuxtLink>
    </p>

    <p v-if="s.summary && !s.description" class="t-body mt-6 max-w-[720px]">
      {{ s.summary }}
    </p>

    <!-- Cursos en orden -->
    <h2 class="bt-section-title !text-xl mt-10">
      Ruta de cursos
    </h2>
    <ol class="mt-4 divide-y divide-subtle border-y border-subtle">
      <li v-for="(c, i) in s.courses" :key="c.slug" class="grid grid-cols-[40px_minmax(0,1fr)] gap-x-4 py-4 sm:grid-cols-[40px_minmax(0,1fr)_auto]">
        <span class="font-mono text-sm text-foreground-muted">{{ String(i + 1).padStart(2, '0') }}</span>
        <div class="min-w-0" :class="{ 'opacity-60': c.coming_soon }">
          <component
            :is="c.coming_soon ? 'p' : NuxtLink"
            :to="c.coming_soon ? undefined : `/curso/${c.slug}`"
            class="block font-oswald text-lg transition-colors"
            :class="{ 'hover:text-primary-text': !c.coming_soon }"
          >
            {{ c.title }}
            <Icon v-if="c.progress.completed" name="lucide:circle-check" class="ml-1 inline size-4 align-[-2px] text-success" aria-label="Completado" />
          </component>
          <p v-if="c.summary" class="t-small mt-0.5 line-clamp-1">
            {{ c.summary }}
          </p>
          <template v-if="!c.coming_soon">
            <ProgressBar class="mt-3 max-w-[420px]" :value="c.progress.percent" :label="`Progreso en ${c.title}`" />
            <p class="t-meta mt-1.5 !text-xs">
              {{ c.progress.lessons_done }} / {{ c.progress.lessons_total || c.lessons_count }} clases
              <template v-if="courseDuration(c.duration_seconds)">
                · {{ courseDuration(c.duration_seconds) }}
              </template>
              · {{ c.progress.percent }}%
            </p>
          </template>
        </div>
        <div class="col-span-2 mt-3 flex items-center sm:col-span-1 sm:mt-0 sm:justify-end">
          <span v-if="c.coming_soon" class="t-small font-mono">Próximamente</span>
          <template v-else-if="c.exam">
            <NuxtLink
              v-if="hrefOf(c.exam)"
              :to="hrefOf(c.exam)!"
              class="bt-btn-secondary h-9 px-3 text-sm"
              :aria-label="`${viewOf(c.exam).action ?? 'Examen'} de ${c.title}`"
            >
              <Icon :name="viewOf(c.exam).icon" class="size-4" aria-hidden="true" />
              {{ viewOf(c.exam).action }}
            </NuxtLink>
            <span v-else class="t-small inline-flex items-center gap-1.5 font-mono" :title="viewOf(c.exam).label">
              <Icon name="lucide:lock" class="size-3.5" aria-hidden="true" />
              Examen
            </span>
          </template>
        </div>
      </li>
    </ol>

    <!-- Examen final -->
    <div v-if="s.exam" class="mt-8">
      <ExamPanel :exam="s.exam" :title="s.name" :vouchers-left="overview?.vouchers_left" />
    </div>

    <!-- Contenido editorial (ya saneado por la API) -->
    <div v-if="sections.length" class="mt-12 space-y-8">
      <section v-for="x in sections" :key="x.title" class="max-w-[760px]">
        <h2 class="bt-section-title !text-xl">
          {{ x.title }}
        </h2>
        <div class="t-body prose-sm mt-3 max-w-none" v-html="x.html" />
      </section>
    </div>
  </div>
</template>
