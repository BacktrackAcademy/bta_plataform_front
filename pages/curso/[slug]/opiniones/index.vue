<template>
  <div class="bg-surface-1">
    <nav class="text-foreground font-bold my-8 mx-auto max-w-[1200px]" aria-label="Breadcrumb">
      <ol class="list-none p-0 inline-flex">
        <li class="flex items-center">
          <NuxtLink to='/cursos'>Cursos</NuxtLink>
          <svg class="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
            <path
              d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
          </svg>
        </li>
        <li class="flex items-center">
          <NuxtLink :to="'/curso/' + course.slug +'/'">{{ course.titulo }}</NuxtLink>
          <svg class="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
            <path
              d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
          </svg>
        </li>
        <li>
          <p class="text-foreground-subtle" aria-current="page">comentarios</p>
        </li>
      </ol>
    </nav>
    <section class="bg-surface-1 pt-0">
        <!-- comentarios -->
        <div class="flex flex-wrap max-w-[1200px] mx-auto gap-5 py-7 px-2 relative" >
          <article v-for="(opinion, i) in opinions" :key="opinion.i + i" class="bg-surface-2 w-[calc(50%-1.5rem)] flex flex-col py-4 px-5 mb-6 rounded-xl">
            <header class="flex mb-4">
              <figure class="inline-block h-11 w-11 mr-4">
                <img :src="opinion.user.avatar_url_small" class="rounded-full" :alt="opinion.user.name" />
              </figure>
              <div class="flex flex-col">
                <h3 class="text-foreground-subtle font-normal">{{opinion.user.name}}</h3>
                <p class="font-medium mb-2 no-underline text-info inline-block ">{{opinion.user.username}}</p>
                <div class="flex">
                  <svg v-for="(star,i) in opinion.evaluation" :key="i" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="star"
                    class="inline-block h-4 overflow-visible mr-2 fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 576 512">
                    <path fill="#fddd5b"
                      d="M381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.2 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.954 275.9-.0391 288.1-.0391C300.4-.0391 311.6 6.954 316.9 17.97L381.2 150.3z">
                    </path>
                  </svg>
                  <svg v-for="(star,i) in (5 - opinion.evaluation)" :key="i" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="star"
                    class="inline-block h-4 overflow-visible mr-2 fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 576 512">
                    <path fill="currentColor"
                      d="M381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.2 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.954 275.9-.0391 288.1-.0391C300.4-.0391 311.6 6.954 316.9 17.97L381.2 150.3z">
                    </path>
                  </svg>
                </div>
              </div>
            </header>
            <div class="flex">
              <div class="ml-3">
                <p class="text-foreground">{{opinion.opinion}}</p>
              </div>
            </div>
          </article>
        </div>
        <!-- <article class="bg-surface-2 w-[calc(50%-1.5rem)] flex flex-col py-4 px-5 mb-6 rounded-xl">
          <header class="flex mb-4">
            <figure class="inline-block h-11 w-11 mr-4">
              <img src="https://api.lorem.space/image/face?w=44&h=44&hash=rrlz2me2" class="rounded-full" alt="avatar" />
            </figure>
            <div class="flex flex-col">
              <h3 class="text-foreground-subtle font-normal">Enzo Gianolli</h3>
              <p class="font-medium mb-2 no-underline text-info inline-block ">@eoooo</p>
              <div class="flex">
                <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="star"
                  class="inline-block h-4 overflow-visible mr-2 fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 576 512">
                  <path fill="#fddd5b"
                    d="M381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.2 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.954 275.9-.0391 288.1-.0391C300.4-.0391 311.6 6.954 316.9 17.97L381.2 150.3z">
                  </path>
                </svg>
                <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="star"
                  class="inline-block h-4 overflow-visible mr-2 fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 576 512">
                  <path fill="#fddd5b"
                    d="M381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.2 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.954 275.9-.0391 288.1-.0391C300.4-.0391 311.6 6.954 316.9 17.97L381.2 150.3z">
                  </path>
                </svg>
                <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="star"
                  class="inline-block h-4 overflow-visible mr-2 fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 576 512">
                  <path fill="#fddd5b"
                    d="M381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.2 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.954 275.9-.0391 288.1-.0391C300.4-.0391 311.6 6.954 316.9 17.97L381.2 150.3z">
                  </path>
                </svg>
                <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="star"
                  class="inline-block h-4 overflow-visible mr-2 fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 576 512">
                  <path fill="#fddd5b"
                    d="M381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.2 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.954 275.9-.0391 288.1-.0391C300.4-.0391 311.6 6.954 316.9 17.97L381.2 150.3z">
                  </path>
                </svg>
              </div>
            </div>
          </header>
          <div class="flex">
            <div class="ml-3">
              <p class="text-foreground">muy bien explicado entendi casi todo solo tengo que repasar y poner todo en practica
                poco a poco</p>
            </div>
          </div>
        </article> -->
    </section>
  </div>
</template>

<script>
export default {
  name: 'comentario',
  data() {
    return {
      course: [],
      opinions: [],

    }
  },
  created() {
    this.getCourse();
    this.getOpinions();
  },
  methods: {
    getCourse() {
      this.$axios.get(`api/v1/course/${this.$route.params.slug}`).then((response) => {
        this.course = response.data;
      })
    },
    getOpinions() {
      this.$axios.get(`api/v1/course/${this.$route.params.slug}/opinions`).then((response) => {
        this.opinions = response.data;
      })
    }
  }
}
</script>

<style>
</style>
