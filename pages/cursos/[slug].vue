<script setup lang="ts">
import type { Course, Syllabus, Teacher } from '~/interfaces/course'

import { Star } from 'lucide-vue-next'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'

const route = useRoute('')

const course = ref<Course>()
const teacher = ref<Teacher>()
const syllabus = ref<Syllabus[]>()

const { data } = await useAPI<Course>(`course/${route.params.slug}`)

if (data.value) {
  course.value = data.value
  teacher.value = data.value.teacher
  syllabus.value = data.value.syllabus
}
</script>

<template>
  <div class="min-h-screen bg-bta-bg text-white">
    <div class="container mx-auto px-4 py-8">
      <NuxtLink to="/dashboard" class="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors mb-8">
        <Icon name="lucide:arrow-left" class="size-4 mr-2" />
        Regresar a cursos
      </NuxtLink>

      <div class="grid lg:grid-cols-[2fr,1fr] gap-8">
        <div>
          <!-- Course Title and Info -->
          <h1 class="text-4xl font-bold mb-4">
            {{ course?.titulo }}
          </h1>
          <div class="flex items-center gap-4 mb-6">
            <div class="flex">
              <Star v-for="(star, index) in 4" :key="index" name="lucide:star" class="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
            <span class="text-blue-400">{{ course?.count_evaluation }} Opiniones</span>
            <Badge variant="secondary" class="bg-blue-900 hover:bg-blue-800 text-blue-100">
              {{ course?.level_name }}
            </Badge>
          </div>
          <div class="text-gray-300 mb-8">
            <h2 class="text-xl font-semibold text-white mb-2">
              Instructor: {{ teacher?.name }} {{ teacher?.lastname }}
            </h2>
            <p class="leading-relaxed">
              {{ course?.descripcion }}
            </p>
          </div>
          <!-- Course Content -->
          <div class="space-y-8">
            <div v-for="(module, idx) in syllabus" :key="idx">
              <h3 class="text-xl font-semibold text-white mb-4">
                {{ module.titulo }}
              </h3>
              <div class="space-y-3">
                <NuxtLink v-for="lesson in module.videos" :key="lesson.id" :to="`/curso/leccion/${lesson.slug}`">
                  <Card class="bg-bta-surface border-white/[0.06] hover:bg-bta-elevated transition-colors cursor-pointer">
                    <CardContent class="flex items-center justify-between p-4">
                      <div class="flex items-center gap-3">
                        <!-- <div class="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white">
                          {{ lesson }}
                        </div> -->
                        <span class="text-gray-100">{{ lesson.titlevideo }}</span>
                      </div>
                      <div class="flex items-center text-gray-400">
                        <Icon name="lucide:clock" class="w-4 h-4 mr-2" />
                        <span>{{ lesson.total }}</span>
                        <Icon name="lucide:chevron-right" class="w-4 h-4 ml-2" />
                      </div>
                    </CardContent>
                  </Card>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
        <!-- Pricing Card -->
        <div class="lg:sticky lg:top-20 h-fit">
          <Card class="bg-bta-surface border-white/[0.06]">
            <CardContent class="p-6">
              <div class="text-center mb-6">
                <div class="text-gray-300 mb-2">
                  Consíguelo
                </div>
                <div class="text-4xl font-bold text-white">
                  {{ course?.price }} USD
                </div>
              </div>
              <Button class="w-full uppercase bg-pink-600 hover:bg-pink-700 text-white mb-4">
                Comprar suscripción mensual
              </Button>
              <p class="text-sm text-center text-gray-300">
                Puedes comprar el curso por: {{ course?.price }} USD
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>
