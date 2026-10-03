<script lang="ts" setup>
</script>

<script setup>
import { loadMercadoPago } from '@mercadopago/sdk-js'

import { computed, ref } from 'vue'

definePageMeta({
  layout: 'custom',
  auth: true,
})

const cardNumber = ref('')

// **Expresiones regulares para detectar tipo de tarjeta**
const cardTypes = {
  visa: /^4\d{12}(?:\d{3})?$/,
  mastercard: /^5[1-5]\d{14}$/,
  amex: /^3[47]\d{13}$/,
  diners: /^3(?:0[0-5]|[68]\d)\d{11}$/,
  discover: /^6(?:011|5\d{2})\d{12}$/,
  jcb: /^(?:2131|1800|35\d{3})\d{11}$/,
}

// **Detecta el tipo de tarjeta basado en el número ingresado**
const cardType = computed(() => {
  const number = cardNumber.value.replace(/\s+/g, '') // Eliminar espacios
  for (const [type, regex] of Object.entries(cardTypes)) {
    if (regex.test(number))
      return type
  }
  return null
})

// **Algoritmo de Luhn para validar tarjeta**
const isValidCard = computed(() => {
  const number = cardNumber.value.replace(/\D/g, '') // Solo números
  let sum = 0
  let alternate = false

  for (let i = number.length - 1; i >= 0; i--) {
    let n = Number.parseInt(number[i], 10)
    if (alternate) {
      n *= 2
      if (n > 9)
        n -= 9
    }
    sum += n
    alternate = !alternate
  }

  return sum % 10 === 0 // Es válido si el total es múltiplo de 10
})

// **Formatear el número de tarjeta en bloques de 4 dígitos**
function formatCardNumber(event) {
  let value = event.target.value.replace(/\D/g, '') // Solo números
  value = value.replace(/(.{4})/g, '$1 ').trim() // Agregar espacios cada 4 caracteres
  cardNumber.value = value
}

// **Asignar Icono según el tipo de tarjeta**
const cardIcon = computed(() => {
  switch (cardType.value) {
    case 'visa': return 'bx:bxl-visa'
    case 'mastercard': return 'lineicons:mastercard'
    case 'amex': return 'lucide:shield'
    case 'discover': return 'lucide:badge-check'
    default: return 'lucide:credit-card-icon'
  }
})

const cardHolderName = ref('')
const cardExpirationMonth = ref('')
const cardExpirationYear = ref('')
const securityCode = ref('')

async function submitPayment() {
  const mp = await loadMercadoPago()
  const cardToken = await mp.cards.createCardToken({
    card_number: cardNumber.value,
    cardholder: {
      name: cardHolderName.value,
    },
    expiration_month: cardExpirationMonth.value,
    expiration_year: cardExpirationYear.value,
    security_code: securityCode.value,
  })

  // Enviar el token al backend
  await useFetch('/api/save_card', {
    method: 'POST',
    body: { cardToken: cardToken.id, email: 'cliente@example.com' },
  })

  console.log('Tarjeta guardada:', cardToken.id)
}
</script>

<template>
  <div class="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8 lg:px-10">
    <div class="lg:h-full">
      <!-- Título -->
      <div class="w-full pt-7 pb-12">
        <h3 class="t-h1 uppercase">
          Suscripciones
        </h3>
      </div>

      <!-- Formulario -->
      <div class="flex flex-col gap-8 lg:flex-row">
        <div class="lg:w-2/3">
          <div class="bt-surface p-6 text-foreground">
            <!-- Título -->
            <h2 class="text-2xl font-semibold font-oswald uppercase text-center">
              Resumen de tu Compra
            </h2>
            <p class="text-foreground-subtle text-sm text-center mt-2">
              Estás a un paso de acceder a todo el contenido exclusivo.
            </p>

            <!-- Información del Plan -->
            <div class="mt-6 space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-lg font-semibold">Plan mensual</span>
                <span class="text-primary-text text-xl font-bold">100 USD</span>
              </div>
              <div class="border-t border-subtle pt-4">
                <p class="text-foreground-subtle text-sm">
                  • Acceso por <strong>2 {{ 2 > 1 ? 'meses' : 'mes' }}</strong>
                </p>
                <p class="text-foreground-subtle text-sm">
                  • 10 oportunidades de examen
                </p>
                <p class="text-foreground-subtle text-sm">
                  • 2 especialida d{{ 2 > 1 ? 'es' : '' }} a elección
                </p>
                <p class="text-foreground-subtle text-sm">
                  • 2 voucher{{ 2 > 1 ? 's' : '' }} de especialidad
                </p>
                <p class="text-foreground-subtle text-sm">
                  • Certificados de aprobación incluidos
                </p>
              </div>
            </div>

            <!-- Mensaje de pago seguro -->
            <div class="mt-6 flex items-center space-x-2 text-success">
              <Icon name="lucide:shield-check" class="size-5" />
              <span class="text-sm">Pago 100% seguro con cifrado SSL</span>
            </div>

            <!-- Botón para continuar -->
            <button
              class="bt-btn-primary bt-btn-lg mt-6 w-full"
              @click="goToPayment"
            >
              Continuar con el Pago
            </button>
          </div>
        </div>
        <div class="bt-surface p-6">
          <h2 class="text-foreground font-oswald text-xl mb-4">
            Ingresa los datos de tu tarjeta
          </h2>

          <form class="space-y-4" @submit.prevent="submitPayment">
            <div>
              <label class="text-foreground-subtle text-sm">Número de tarjeta</label>
              <div class="relative">
                <input
                  v-model="cardNumber"
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  maxlength="19"
                  class="bt-input tracking-widest"
                  @input="formatCardNumber"
                >

                <!-- Icono del tipo de tarjeta detectado -->
                <div class="absolute right-3 top-2">
                  <Icon v-if="cardType" :name="cardIcon" class="text-primary-text size-6" />
                </div>
              </div>

              <!-- Mensaje de validación -->
              <p v-if="cardNumber && !isValidCard" class="text-danger text-sm mt-1">
                Número de tarjeta inválido
              </p>
            </div>

            <div>
              <label class="text-foreground-subtle text-sm">Nombre del titular</label>
              <input
                v-model="cardHolderName"
                type="text"
                placeholder="Nombre en la tarjeta"
                class="bt-input"
              >
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-foreground-subtle text-sm">Mes de vencimiento</label>
                <input
                  v-model="cardExpirationMonth"
                  type="text"
                  placeholder="MM"
                  class="bt-input"
                >
              </div>

              <div>
                <label class="text-foreground-subtle text-sm">Año de vencimiento</label>
                <input
                  v-model="cardExpirationYear"
                  type="text"
                  placeholder="YYYY"
                  class="bt-input"
                >
              </div>
            </div>

            <div>
              <label class="text-foreground-subtle text-sm">Código de seguridad (CVV)</label>
              <input
                v-model="securityCode"
                type="text"
                placeholder="•••"
                class="bt-input"
              >
            </div>

            <!-- Botón -->
            <button
              type="submit"
              class="bt-btn-primary w-full"
            >
              Guardar tarjeta
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
