<script setup lang="ts">
import { BarChart } from '@/components/ui/chart-bar'
import Player from '@vimeo/player'
import ArrowToRight from '../../components/icons/arrow-to-right.vue'

definePageMeta({
  layout: 'custom',
  auth: true,
})

interface Teacher {
  id: number
  name: string
  lastname: string
  avatar_url: string
}

interface Video {
  id: number
  titlevideo: string
  url: string
  slug: string
  is_free: boolean
}

interface Theme {
  id: number
  titulo: string
  videos: Video[]
}

interface Course {
  id: number
  titulo: string
  slug: string
  descripcion: string
  image_thumb: string
  teacher: Teacher
  syllabus: Theme[]
}
const vimeoPlayer = ref<HTMLIFrameElement | null>(null)
let player: Player | null = null
const videoDuration = ref<number>(0)

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  return [
    hours > 0 ? String(hours).padStart(2, '0') : '00',
    String(minutes).padStart(2, '0'),
    String(remainingSeconds).padStart(2, '0'),
  ].join(':')
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}
function initVimeoPlayer() {
  if (!vimeoPlayer.value)
    return
  player = new Player(vimeoPlayer.value)
  player.getDuration().then((duration: number) => {
    videoDuration.value = duration
  }).catch((error: any) => {
    console.error('Error getting video duration:', error)
  })
  player.on('progress', (data: any) => {
    addPercentage(data.percent)
  })
}

// Initialize player after component is mounted
onMounted(() => {
  initVimeoPlayer()
})

// Route
const route = useRoute()

// Estados reactivos
const video = ref<Video | null>(null)
const course = ref<Course | null>(null)
const teacher = ref<Teacher | null>(null)
const syllabus = ref<Theme[]>([])
const data = ref<any>([])

// Cargar datos del video
const { data: Video, status: VideoStatus } = await useAPI<Video>(`/video/${route.params.slug}`)

// Cargar datos del curso
if (Video) {
  video.value = Video.value
  data.value = Video.value.video_details_in_seconds
  course.value = Video.value.course
  teacher.value = Video.value.course.teacher
  syllabus.value = Video.value.course.syllabus
}
function addPercentage(percentage: number) {
  useAPI('/details/add_percentage', {
    method: 'POST',
    body: {
      detail_id: video.value?.id,
      percent: percentage * 100,
    },
  })
}
</script>

<template>
  <section class="bg-surface-1 px-4 sm:px-6 xl:px-8">
    <div class="lg:flex gap-6 xl:gap-8">
      <div class="lg:w-[70%]">
        <!-- Video player -->
        <div class="relative top-0 max-h-[calc(100vh - 52px)] mx-auto">
          <div style="padding: 56.25% 0 0 0; position: relative">
            <iframe
              v-if="video?.url"
              ref="vimeoPlayer"
              :src="`https://player.vimeo.com/video/${video.url}?h=0eb117b38a&title=0&byline=0&portrait=0&badge=0`"
              class="absolute top-0 left-0 w-full h-full"
              frameborder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowfullscreen
            />
          </div>
        </div>
        <div>
          <!-- curso Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center pt-4">
              <!-- Curso image thumb -->
              <img
                v-if="course?.image_thumb"
                :src="course.image_thumb"
                alt=""
                class="mr-3 w-12 h-12 rounded-full"
              >
              <!-- header content -->
              <div class="flex flex-wrap">
                <NuxtLink
                  v-if="video?.slug"
                  :to="`/curso/${video.slug}`"
                  class="block w-full"
                >
                  <h2 class="text-foreground text-2xl font-oswald font-bold">
                    {{ video?.titlevideo }}
                  </h2>
                </NuxtLink>
                <img
                  v-if="teacher?.avatar_url"
                  :src="teacher.avatar_url"
                  alt=""
                  class="w-6 h-6 rounded-full mr-1"
                >
                <p class="text-foreground-subtle font-inconsolata">
                  {{ teacher?.name }} {{ teacher?.lastname }}
                </p>
              </div>
            </div>

            <div class="flex items-center">
              <NuxtLink
                v-if="video?.prev"
                :to="`/video/${video.prev.slug}`"
                class="flex items-center bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 w-[144px] rounded-[8px] mr-2"
              >
                <ArrowToRight class="mr-3 rotate-180" />
                <span
                  class="uppercase text-left text-sm font-bold w-[137px] text-ellipsis whitespace-nowrap overflow-hidden"
                  title="Definición y características de Cobalt Strike"
                >
                  {{ video?.prev.titlevideo }}
                </span>
              </NuxtLink>

              <NuxtLink
                v-if="video?.next"
                :to="`/video/${video.next.slug}`"
                class="flex items-center bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 w-[144px] rounded-[8px] mr-2"
              >
                <span
                  class="uppercase text-left text-sm font-bold w-[137px] text-ellipsis whitespace-nowrap overflow-hidden"
                  title="Definición y características de Cobalt Strike"
                >
                  {{ video?.next.titlevideo }}
                </span>
                <ArrowToRight class="mr-3" />
              </NuxtLink>
            </div>
          </div>

          <div class="text-foreground font-inconsolata">
            <h3 class="text-xl text-foreground leading-9 my-4 font-oswald">
              Resumen del curso
            </h3>
            <div>
              <p>
                {{ course?.descripcion }}
              </p>
              <div class="flex flex-1 gap-4 mt-2">
                <p>
                  Duración del curso {{ formatTime(course?.total_duration_seconds) }}
                </p>
                <p>
                  Tiempo estudiado {{ video?.time_studied_text }}
                </p>
                <p>{{ video?.videos_finish }} / {{ video?.number_videos }} videos completados</p>
                <div>
                  <p v-if="course?.students > 1">
                    {{ formatNumber(course?.students) }} personas han estudiado este curso.
                  </p>
                  <p v-else-if="course?.students === 1">
                    {{ course?.students }} persona ha estudiado este curso.
                  </p>
                  <p v-else>
                    Sé el primero en estudiar este curso.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <h3 class="text-xl text-foreground leading-9 my-4 font-oswald">
            Tu avance
          </h3>
          <BarChart
            :data="data"
            index="name"
            :categories="['total', 'predicted']"
            :colors="['#141224', 'hsl(var(--primary))']"
            :y-formatter="(tick) => {
              if (typeof tick === 'number') {
                const minutes = Math.floor(tick / 60);
                const seconds = tick % 60;
                return `${minutes}:${seconds.toString().padStart(2, '0')}`;
              }
              return '';
            }"
          />
        </div>
      </div>

      <div class="lg:w-[30%]">
        <!-- badge -->
        <div class="text-foreground text-center my-8">
          <p class="font-inconsolata">
            Has estudiado
          </p>
          <p class="font-oswald font-medium text-6xl mb-3">
            {{ video?.course_advance }} %
          </p>
          <p class="font-inconsolata">
            del curso <span class="text-foreground">{{ course?.titulo }}</span>
          </p>
          <br>
          <p class="font-inconsolata">
            Tienes 0 oportunidades
          </p>
        </div>
        <!-- Temario -->
        <div>
          <h4 class="text-2xl text-foreground font-oswald font-medium mt-5 mb-2">
            Temario
          </h4>
          <div
            v-for="(theme, i) in syllabus"
            :key="theme.titulo + i"
            class="mb-3"
          >
            <h3 class="text-foreground-subtle font-inconsolata py-2">
              {{ theme.titulo }}
            </h3>
            <div v-for="(video, i) in theme.videos" :key="video.slug + i">
              <NuxtLink
                v-if="video.is_free"
                class="flex gap-x-3 p-2 rounded hover:bg-surface-2"
                :to="`/video/${video.slug}`"
              >
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="text-foreground h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
                <div>
                  <span class="text-foreground font-inconsolata">{{ video.titlevideo }}</span>
                </div>
              </NuxtLink>
              <div v-else class="flex gap-x-3 p-2 rounded hover:bg-surface-2">
                <span>
                  <!-- Lock icon -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="text-foreground h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </span>
                <div>
                  <span class="text-foreground font-inconsolata">
                    {{ video.titlevideo }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
