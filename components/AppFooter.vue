<script setup lang="ts">
import BTALogo from './icons/BTALogo.vue'
import Mail from './icons/Mail.vue'

const landingUrl = useLandingUrl()
</script>

<template>
  <footer
    class="border-t-2 border-bta-blue py-16 flex flex-col bg-bta-dark-blue"
  >
    <div
      class="flex flex-grow-0 flex-col md:flex-row text-center mb-16 space-y-8 md:space-y-0 sm:space-x-6 justify-center md:justify-around items-center md:items-stretch"
    >
      <NuxtLink class="md:self-start items-center" to="/">
        <div class="flex justify-center items-center mb-8 md:my-0">
          <div class="flex justify-center">
            <BTALogo />
          </div>
        </div>
      </NuxtLink>
      <div class="font-inconsolata text-lg md:text-left">
        <h3 class="font-oswald mb-6 text-2xl font-normal text-gray-200 uppercase">
          Recursos
        </h3>
        <ul>
          <li class="mb-4">
            <NuxtLink to="/" class="foot__link">
              Empresas
            </NuxtLink>
          </li>
          <li class="mb-4">
            <NuxtLink to="/" class="foot__link">
              Usuarios
            </NuxtLink>
          </li>
          <li class="mb-4">
            <NuxtLink to="/" class="foot__link">
              Cursos Gratis
            </NuxtLink>
          </li>
          <li class="mb-4">
            <NuxtLink :to="landingUrl('/team')" class="foot__link">
              Nosotros
            </NuxtLink>
          </li>
          <li class="mb-4">
            <NuxtLink :to="landingUrl('/sponsorship')" class="foot__link">
              Patrocinios
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/" class="foot__link">
              Catálogo de Cursos
            </NuxtLink>
          </li>
        </ul>
      </div>
      <div class="font-inconsolata text-lg md:text-left">
        <h3 class="font-oswald mb-6 text-2xl font-normal text-gray-200 uppercase">
          Legal
        </h3>
        <ul>
          <li class="mb-4">
            <NuxtLink :to="landingUrl('/privacy_policy')" class="foot__link">
              Políticas de Privacidad
            </NuxtLink>
          </li>
          <li class="mb-8">
            <NuxtLink :to="landingUrl('/terms_of_use')" class="foot__link">
              Términos de servicio
            </NuxtLink>
          </li>
        </ul>
        <ul>
          <li class="mb-4">
            <NuxtLink to="/" class="foot__link">
              Ranking
            </NuxtLink>
          </li>
          <li class="mb-4">
            <NuxtLink :to="landingUrl('/preguntas-frecuentes')" class="foot__link">
              Preguntas Frecuentes
            </NuxtLink>
          </li>
          <li>
            <NuxtLink :to="landingUrl('/validate_certificate')" class="foot__link">
              Valida tus certificado
            </NuxtLink>
          </li>
        </ul>
      </div>
      <div class="font-inconsolata text-lg md:text-left">
        <h3 class="font-oswald mb-6 text-2xl font-normal text-gray-200 uppercase">
          Hablemos
        </h3>
        <ul>
          <li class="mb-4">
            <a href="mailto:contacto@backtrackacademy.com" class="foot__link flex items-center gap-2">
              <span>
                <Mail />
              </span>
              <span>contacto@backtrackacademy.com</span></a>
          </li>
          <li>
            <a href="mailto:ventas@backtrackacademy.com" class="foot__link flex items-center gap-2">
              <span>
                <Mail />
              </span>
              <span>ventas@backtrackacademy.com</span></a>
          </li>
        </ul>
      </div>
      <!-- <div>
        <h1 class="text-2xl font-semibold mb-8 tracking-wide text-white">Únetenos</h1>
        <form action="">
          <div class="flex  flex-col">
            <label for="input_email" class="text-left text-bta-pink">Email*</label><input type="email" name="email" id="input_email" class="leading-none focus:outline-none border-b-2 hover:border-b-3 border-bta-pink"></div>
            <div class="flex justify-center mt-8">
              <input type="submit" class="px-20 py-3 border text-white border-bta-pink" value="send"></div>
        </form>
      </div> -->
    </div>
    <hr class="border-bta-section sm:mx-auto">
    <div class="flex flex-col items-center justify-around">
      <div class="mt-2 md:mt-0">
        <h3 class="text-gray-400 font-oswald uppercase">
          Síguenos
        </h3>
      </div>
      <div class="flex my-4 space-x-6 sm:justify-center">
        <a href="https://www.facebook.com/BackTrackAcademy/" target="_blank" class="text-gray-500 hover:text-bta-pink">
          <Icon name="lucide:facebook" class="size-5" />
        </a>
        <a href="https://www.instagram.com/backtrackacademy/" target="_blank" class="text-gray-500 hover:text-bta-pink">
          <Icon name="lucide:instagram" class="size-5" />
        </a>
        <a
          href="https://www.linkedin.com/company/backtrack-academy/" target="_blank"
          class="text-gray-500 hover:text-bta-pink"
        >
          <Icon name="lucide:linkedin" class="size-5" />
        </a>
      </div>
      <span class="text-sm text-gray-500 text-center">
        <a href="#" class="">
          © 2025 Backtrack Academy. · Av. Lib. O’Higgis #1302 70,
          Santiago,Chile. <br>
          Todos los Derechos Reservados.
        </a>
      </span>
    </div>
  </footer>
</template>

<style>
.foot__link {
  @apply text-gray-500 relative before:block before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-full before:bg-bta-pink before:scale-x-0 before:transition-all hover:before:scale-x-100;
}
</style>
