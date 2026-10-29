<script setup lang="ts">
import TeacherAvatar from '~/components/courses/TeacherAvatar.vue'

definePageMeta({
  layout: 'custom',
  auth: true,
})

interface Opinion {
  id?: number
  opinion: string
  evaluation: number
  user: {
    name?: string
    username?: string
    avatar_url_small?: string
  }
}

interface OpinionsPage {
  data: Opinion[]
  current_page: number
  total_pages: number
  total_items: number
}

const route = useRoute()
const slug = route.params.slug as string
const { $api } = useNuxtApp()

const { data: course } = await useAPI<{ slug: string, titulo: string }>(`/course/${slug}`)
const { data: first, status, error, refresh } = await useAPI<OpinionsPage>(`/course/${slug}/opinions`)

const opinions = ref<Opinion[]>([])
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)
watch(first, (v) => {
  opinions.value = v?.data ?? []
  page.value = v?.current_page ?? 1
  totalPages.value = v?.total_pages ?? 1
  total.value = v?.total_items ?? opinions.value.length
}, { immediate: true })

const loadingMore = ref(false)
const moreError = ref(false)
async function loadMore() {
  loadingMore.value = true
  moreError.value = false
  try {
    const next = await $api<OpinionsPage>(`/course/${slug}/opinions`, { query: { page: page.value + 1 } })
    opinions.value.push(...next.data)
    page.value = next.current_page
    totalPages.value = next.total_pages
  }
  catch {
    moreError.value = true
  }
  finally {
    loadingMore.value = false
  }
}

const stars = (o: Opinion) => Math.min(5, Math.max(0, Math.round(o.evaluation ?? 0)))
const average = computed(() => opinions.value.length
  ? opinions.value.reduce((sum, o) => sum + stars(o), 0) / opinions.value.length
  : 0)
</script>

<template>
  <div class="bg-background">
    <div class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-10">
      <nav aria-label="Ruta" class="mb-6 font-mono text-sm text-foreground-muted">
        <NuxtLink to="/cursos" class="transition-colors hover:text-primary-text">
          ~/cursos
        </NuxtLink>
        <span class="mx-1 text-primary-text">/</span>
        <NuxtLink :to="`/curso/${slug}`" class="transition-colors hover:text-primary-text">
          {{ slug }}
        </NuxtLink>
        <span class="mx-1 text-primary-text">/</span>
        <span class="text-foreground-secondary">opiniones</span>
      </nav>

      <CommonPageHeader title="Opiniones">
        <template v-if="course">
          Lo que dicen los estudiantes de {{ course.titulo }}
        </template>
        <template #actions>
          <NuxtLink :to="`/curso/${slug}`" class="bt-btn-secondary inline-flex items-center gap-2">
            <Icon name="lucide:arrow-left" class="size-4" />
            Volver al curso
          </NuxtLink>
        </template>
      </CommonPageHeader>

      <div v-if="status === 'pending'" class="mt-8 grid gap-5 md:grid-cols-2" aria-busy="true">
        <div v-for="n in 4" :key="n" class="bt-surface h-36 animate-pulse" />
      </div>

      <CommonStateCard
        v-else-if="error"
        class="mt-8"
        variant="error"
        title="No pudimos cargar las opiniones"
        text="Revisa tu conexión e inténtalo de nuevo."
      >
        <button type="button" class="bt-btn-secondary" @click="refresh()">
          Reintentar
        </button>
      </CommonStateCard>

      <CommonStateCard
        v-else-if="!opinions.length"
        class="mt-8"
        icon="lucide:message-square"
        title="Aún no hay opiniones"
        text="Sé el primero en opinar cuando termines el curso."
      />

      <template v-else>
        <p class="t-meta mt-6 flex flex-wrap items-center gap-x-3">
          <span class="flex items-center gap-1.5">
            <Icon name="lucide:star" class="size-4 fill-warning text-warning" />
            {{ average.toFixed(1) }} de 5
          </span>
          <span>·</span>
          <span>{{ total }} {{ total === 1 ? 'opinión' : 'opiniones' }}</span>
        </p>

        <ul class="mt-6 grid gap-5 md:grid-cols-2">
          <li v-for="(o, i) in opinions" :key="o.id ?? i">
            <article class="bt-surface flex h-full flex-col gap-4 p-5">
              <header class="flex items-center gap-3">
                <TeacherAvatar :src="o.user.avatar_url_small" :name="o.user.name || o.user.username || 'Usuario'" class="!size-11 text-base" />
                <div class="min-w-0 flex-1">
                  <h3 class="truncate font-oswald text-lg leading-tight text-foreground">
                    {{ o.user.name || o.user.username }}
                  </h3>
                  <p v-if="o.user.username" class="t-meta truncate">
                    @{{ o.user.username.replace(/^@/, '') }}
                  </p>
                </div>
                <span class="flex shrink-0" role="img" :aria-label="`${stars(o)} de 5 estrellas`">
                  <Icon
                    v-for="n in 5"
                    :key="n"
                    name="lucide:star"
                    class="size-4"
                    :class="n <= stars(o) ? 'fill-warning text-warning' : 'text-foreground/20'"
                  />
                </span>
              </header>
              <p class="leading-relaxed text-foreground-secondary">
                {{ o.opinion }}
              </p>
            </article>
          </li>
        </ul>

        <div v-if="page < totalPages" class="mt-8 flex flex-col items-center gap-3">
          <button type="button" class="bt-btn-secondary" :disabled="loadingMore" @click="loadMore">
            {{ loadingMore ? 'Cargando…' : 'Ver más opiniones' }}
          </button>
          <p v-if="moreError" class="t-small text-danger" role="alert">
            No pudimos cargar más opiniones.
          </p>
        </div>
      </template>
    </div>
  </div>
</template>
