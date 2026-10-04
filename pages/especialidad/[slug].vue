<script setup lang="ts">
import PageHeader from '~/components/common/PageHeader.vue'

// Destino de "Comenzar especialidad" desde backtrackacademy.com (…/crear-cuenta?redirect=/especialidad/:slug).
// Ya autenticado: muestra la ruta de cursos en orden y lleva a empezar. El contenido editorial vive en el sitio público.
interface SpecialtyCourse {
  slug: string
  title: string
  summary: string | null
  level: string | null
  duration_seconds: number
  lessons_count: number
  coming_soon: boolean
}
interface Specialty {
  slug: string
  name: string
  summary: string | null
  level: string | null
  courses_count: number
  total_duration_seconds: number
  courses: SpecialtyCourse[]
}

definePageMeta({
  layout: 'custom',
  auth: true,
})

const route = useRoute('especialidad-slug')
const siteUrl = useSiteUrl()
const { data: specialty, error } = await useAPI<Specialty>(`/public/specialties/${route.params.slug}`)
if (error.value)
  throw createError({ statusCode: error.value.statusCode === 404 ? 404 : 503, statusMessage: error.value.statusCode === 404 ? 'Especialidad no encontrada' : 'Servicio no disponible', fatal: true })

const s = computed(() => specialty.value!)
const startable = computed(() => s.value.courses.filter(c => !c.coming_soon))
const first = computed(() => startable.value[0])

// Es una pantalla de la app (sesión): el contenido indexable es la ficha pública, a la que apunta el canonical.
useSeoMeta({ title: () => s.value.name, robots: 'noindex, nofollow' })
useHead(() => ({ link: [{ rel: 'canonical', href: siteUrl(`/especialidad/${s.value.slug}`) }] }))

const duration = (seconds: number) => formatCourseDuration({ total_duration_seconds: seconds })
</script>

<template>
  <div class="mx-auto w-full max-w-[1200px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
    <PageHeader :title="s.name">
      <template v-if="s.level">
        {{ s.level }} ·
      </template>
      {{ s.courses_count }} {{ s.courses_count === 1 ? 'curso' : 'cursos' }}<template v-if="duration(s.total_duration_seconds)">
        · {{ duration(s.total_duration_seconds) }}
      </template>
      <template #actions>
        <NuxtLink v-if="first" :to="`/curso/${first.slug}`" class="bt-btn-primary bt-btn-lg">
          Empezar con el primer curso
        </NuxtLink>
      </template>
    </PageHeader>

    <p v-if="s.summary" class="t-body mt-6 max-w-[720px]">
      {{ s.summary }}
    </p>

    <ol class="mt-8 divide-y divide-subtle border-y border-subtle">
      <li v-for="(c, i) in s.courses" :key="c.slug">
        <component
          :is="c.coming_soon ? 'div' : 'NuxtLink'"
          :to="c.coming_soon ? undefined : `/curso/${c.slug}`"
          class="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-x-4 py-4"
          :class="c.coming_soon ? 'opacity-60' : 'transition-colors hover:text-primary-text'"
        >
          <span class="font-mono text-sm text-foreground-muted">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="min-w-0">
            <span class="block font-oswald text-lg">{{ c.title }}</span>
            <span v-if="c.summary" class="t-small mt-0.5 line-clamp-1 block">{{ c.summary }}</span>
          </span>
          <span class="t-small text-right font-mono">
            <template v-if="c.coming_soon">Próximamente</template>
            <template v-else>
              {{ c.lessons_count }} clases<template v-if="duration(c.duration_seconds)"> · {{ duration(c.duration_seconds) }}</template>
            </template>
          </span>
        </component>
      </li>
    </ol>
  </div>
</template>
