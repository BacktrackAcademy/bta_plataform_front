<script lang="ts" setup>
import { Button } from '~/components/ui/button'

definePageMeta({ layout: 'custom', auth: true })
useSeoMeta({ title: 'Editar perfil', robots: 'noindex, nofollow' })

interface UserInfo {
  name: string | null
  lastname: string | null
  username: string
  headline: string | null
  aboutme: string | null
  skills: string[] | null
  linkedin_url: string | null
  twitter_url: string | null
  public_profile: boolean | null
  allow_search: boolean | null
  avatar_url: string | null
}

const api = useNuxtApp().$api as typeof $fetch
const { getSession } = useAuth()
const siteUrl = useSiteUrl()

const { data: me } = await useAPI<UserInfo>('/user/info')

const BIO_MAX = 400
const SPECIALTY_MAX = 12
const form = reactive({
  name: me.value?.name ?? '',
  lastname: me.value?.lastname ?? '',
  username: me.value?.username ?? '',
  headline: me.value?.headline ?? '',
  aboutme: me.value?.aboutme ?? '',
  skills: [...(me.value?.skills ?? [])] as string[],
  linkedin_url: me.value?.linkedin_url ?? '',
  twitter_url: me.value?.twitter_url ?? '',
  public_profile: Boolean(me.value?.public_profile),
  allow_search: Boolean(me.value?.allow_search),
})
const savedUsername = ref(form.username)
const snapshot = ref(JSON.stringify(form))
const dirty = computed(() => JSON.stringify(form) !== snapshot.value)

// El consentimiento de buscadores depende del perfil público.
watch(() => form.public_profile, (on) => {
  if (!on) {
    form.allow_search = false
  }
})

const usernameValid = computed(() => /^[A-Z0-9][\w-]{2,39}$/i.test(form.username))
const usernameChanged = computed(() => form.username !== savedUsername.value)
const thinProfile = computed(() => form.aboutme.trim().length < 40 && !form.headline.trim())
const publicPath = computed(() => `/@${savedUsername.value}`)
const publicLabel = computed(() => siteUrl(publicPath.value).replace(/^https?:\/\//, ''))

// ---- Especialidades ----------------------------------------------------------------------
const skillDraft = ref('')
function addSkill() {
  const value = skillDraft.value.replace(/,/g, '').trim().slice(0, 30)
  skillDraft.value = ''
  if (!value || form.skills.length >= SPECIALTY_MAX) {
    return
  }
  if (!form.skills.some(s => s.toLowerCase() === value.toLowerCase())) {
    form.skills.push(value)
  }
}
function removeSkill(index: number) {
  form.skills.splice(index, 1)
}

// ---- Avatar ------------------------------------------------------------------------------
const avatarUrl = ref(me.value?.avatar_url && me.value.avatar_url.startsWith('http') ? me.value.avatar_url : null)
const avatarBusy = ref(false)
const avatarError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

async function onAvatarChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) {
    return
  }
  avatarError.value = ''
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 3 * 1024 * 1024) {
    avatarError.value = 'Usa una imagen JPG, PNG, WEBP o GIF de máximo 3 MB.'
    return
  }
  avatarBusy.value = true
  try {
    const body = new FormData()
    body.append('avatar', file)
    const res = await api<{ avatar_url: string }>('/user/avatar', { method: 'PATCH', body })
    avatarUrl.value = res.avatar_url
    await getSession()
  }
  catch {
    avatarError.value = 'No pudimos subir la imagen. Intenta de nuevo.'
  }
  finally {
    avatarBusy.value = false
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

async function removeAvatar() {
  avatarBusy.value = true
  try {
    await api('/user/avatar', { method: 'DELETE' })
    avatarUrl.value = null
    await getSession()
  }
  finally {
    avatarBusy.value = false
  }
}

// ---- Guardar -----------------------------------------------------------------------------
const saving = ref(false)
const saved = ref(false)
const errors = ref<Record<string, string[]>>({})

async function save() {
  if (!usernameValid.value) {
    errors.value = { username: ['Usa de 3 a 40 caracteres: letras, números, guion o guion bajo.'] }
    return
  }
  saving.value = true
  saved.value = false
  errors.value = {}
  try {
    await api('/user/update', { method: 'PATCH', body: { user: { ...form } } })
    savedUsername.value = form.username
    snapshot.value = JSON.stringify(form)
    saved.value = true
    await getSession()
  }
  catch (e: any) {
    errors.value = e?.data && typeof e.data === 'object' ? e.data : { base: ['No pudimos guardar los cambios.'] }
  }
  finally {
    saving.value = false
  }
}

const field = 'w-full rounded-lg border border-white/10 bg-bta-bg px-3.5 py-2.5 font-sans text-[15px] text-white placeholder:text-gray-muted transition-colors hover:border-white/20 focus:border-bta-pink/60 focus:outline-none focus:ring-2 focus:ring-bta-pink/30'
const labelCls = 'mb-1.5 block font-inconsolata text-xs font-bold uppercase tracking-[0.14em] text-white/80'
const sectionTitle = 'flex items-center gap-3 font-inconsolata text-xs font-bold uppercase tracking-[0.2em] text-white/80 after:h-px after:flex-1 after:bg-gradient-to-r after:from-white/10 after:to-transparent'
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-4 py-6 pb-28 sm:px-6 sm:py-10">
    <NuxtLink :to="publicPath" class="bt-focus inline-flex items-center gap-2 rounded font-inconsolata text-sm text-bta-text-2 transition-colors hover:text-white">
      <Icon name="lucide:arrow-left" class="size-4" aria-hidden="true" /> @{{ savedUsername }}
    </NuxtLink>
    <h1 class="mt-3 font-oswald text-3xl font-semibold leading-none tracking-tight text-white sm:text-4xl">
      Editar perfil
    </h1>
    <p class="mt-2 font-inconsolata text-sm text-bta-text-2">
      <span class="text-bta-pink">$</span> Así te ven las demás personas en Backtrack Academy.
    </p>

    <form class="mt-6 space-y-6" novalidate @submit.prevent="save">
      <!-- MI PERFIL -->
      <section class="bt-surface overflow-hidden" aria-labelledby="mi-perfil">
        <div class="relative h-20 overflow-hidden sm:h-24" aria-hidden="true">
          <div class="absolute inset-0 bg-[radial-gradient(120%_160%_at_0%_0%,rgba(236,16,117,0.34),transparent_55%),radial-gradient(90%_140%_at_100%_100%,rgba(88,64,255,0.2),transparent_60%)]" />
          <div class="bt-tech-grid absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        </div>
        <div class="p-5 pt-0 sm:p-6 sm:pt-0">
          <h2 id="mi-perfil" class="sr-only">
            Mi perfil
          </h2>

          <div class="-mt-10 flex items-end gap-4 sm:-mt-12">
            <ProfileAvatar :src="avatarUrl" :name="`${form.name} ${form.lastname}`.trim() || form.username" size="lg" />
            <div class="space-y-2">
              <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="sr-only" aria-label="Subir foto de perfil" @change="onAvatarChange">
              <div class="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" class="bt-focus border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white" :disabled="avatarBusy" @click="fileInput?.click()">
                  <Icon name="lucide:upload" /> {{ avatarUrl ? 'Cambiar foto' : 'Subir foto' }}
                </Button>
                <Button v-if="avatarUrl" type="button" variant="ghost" size="sm" class="bt-focus text-bta-text-2 hover:bg-white/10 hover:text-white" :disabled="avatarBusy" @click="removeAvatar">
                  Quitar
                </Button>
              </div>
              <p class="font-inconsolata text-xs text-gray-muted">
                JPG, PNG, WEBP o GIF · máx. 3 MB
              </p>
              <p v-if="avatarError" class="font-inconsolata text-xs text-red-400" role="alert">
                {{ avatarError }}
              </p>
            </div>
          </div>

          <div class="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label for="name" :class="labelCls">Nombre</label>
              <input id="name" v-model="form.name" :class="field" type="text" maxlength="35" autocomplete="given-name">
            </div>
            <div>
              <label for="lastname" :class="labelCls">Apellidos</label>
              <input id="lastname" v-model="form.lastname" :class="field" type="text" maxlength="50" autocomplete="family-name">
            </div>
            <div class="sm:col-span-2">
              <label for="username" :class="labelCls">Nombre de usuario</label>
              <div class="flex items-center rounded-lg border border-white/10 bg-bta-bg transition-colors hover:border-white/20 focus-within:border-bta-pink/60 focus-within:ring-2 focus-within:ring-bta-pink/30">
                <span class="pl-3 font-inconsolata text-sm text-bta-pink" aria-hidden="true">@</span>
                <input id="username" v-model="form.username" class="w-full bg-transparent px-2 py-2.5 font-inconsolata text-sm text-white focus:outline-none" type="text" maxlength="40" autocomplete="username" :aria-invalid="!usernameValid" aria-describedby="username-hint">
              </div>
              <p id="username-hint" class="mt-1.5 font-inconsolata text-xs" :class="usernameValid ? 'text-gray-muted' : 'text-red-400'">
                <template v-if="!usernameValid">
                  De 3 a 40 caracteres: letras, números, guion o guion bajo.
                </template>
                <template v-else-if="usernameChanged">
                  Al cambiarlo, tu URL pública será /@{{ form.username }} y la anterior dejará de funcionar.
                </template>
                <template v-else>
                  Es la dirección de tu perfil.
                </template>
              </p>
              <p v-for="m in errors.username" :key="m" class="mt-1 font-inconsolata text-xs text-red-400" role="alert">
                {{ m }}
              </p>
            </div>
            <div class="sm:col-span-2">
              <label for="headline" :class="labelCls">Titular</label>
              <input id="headline" v-model="form.headline" :class="field" type="text" maxlength="80" placeholder="Pentester web · Content Dev">
            </div>
            <div class="sm:col-span-2">
              <label for="aboutme" :class="labelCls">Bio</label>
              <textarea id="aboutme" v-model="form.aboutme" :class="field" rows="4" :maxlength="BIO_MAX" placeholder="Qué haces y en qué te especializas." />
              <p class="mt-1 text-right font-inconsolata text-xs text-gray-muted">
                {{ form.aboutme.length }}/{{ BIO_MAX }}
              </p>
            </div>

            <div class="sm:col-span-2">
              <label for="skill" :class="labelCls">Especialidades</label>
              <div class="flex flex-wrap gap-2 rounded-lg border border-white/10 bg-bta-bg p-2 transition-colors hover:border-white/20 focus-within:border-bta-pink/60 focus-within:ring-2 focus-within:ring-bta-pink/30">
                <span v-for="(s, i) in form.skills" :key="s" class="inline-flex items-center gap-1 rounded-md border border-bta-pink/20 bg-bta-pink/[0.07] py-0.5 pl-2 pr-1 font-inconsolata text-xs text-white">
                  {{ s }}
                  <button type="button" class="bt-focus rounded p-0.5 text-bta-text-2 hover:text-bta-pink" :aria-label="`Quitar ${s}`" @click="removeSkill(i)">
                    <Icon name="lucide:x" class="size-3" />
                  </button>
                </span>
                <input
                  id="skill"
                  v-model="skillDraft"
                  class="min-w-[8rem] flex-1 bg-transparent px-1 py-1 font-inconsolata text-sm text-white placeholder:text-gray-muted focus:outline-none"
                  type="text"
                  maxlength="30"
                  :disabled="form.skills.length >= SPECIALTY_MAX"
                  placeholder="Web Security, OSINT…"
                  @keydown.enter.prevent="addSkill"
                  @keydown.,.prevent="addSkill"
                  @keydown.backspace="!skillDraft && form.skills.pop()"
                  @blur="addSkill"
                >
              </div>
              <p class="mt-1.5 font-inconsolata text-xs text-gray-muted">
                Enter para agregar · hasta {{ SPECIALTY_MAX }}
              </p>
            </div>

            <div>
              <label for="linkedin" :class="labelCls">LinkedIn</label>
              <input id="linkedin" v-model="form.linkedin_url" :class="field" type="text" maxlength="200" placeholder="tu-usuario o URL del perfil">
            </div>
            <div>
              <label for="twitter" :class="labelCls">X (Twitter)</label>
              <input id="twitter" v-model="form.twitter_url" :class="field" type="text" maxlength="200" placeholder="tu-usuario o URL del perfil">
            </div>
          </div>
        </div>
      </section>

      <!-- PRIVACIDAD -->
      <section id="privacidad" class="bt-surface scroll-mt-24 p-5 sm:p-6" aria-labelledby="privacidad-title">
        <h2 id="privacidad-title" :class="sectionTitle">
          <span><span class="text-bta-pink/70" aria-hidden="true">//</span> Privacidad</span>
        </h2>

        <div class="mt-5 space-y-6">
          <ProfileToggle
            id="public_profile"
            v-model="form.public_profile"
            label="Perfil público"
            description="Permite que otras personas encuentren tu perfil, cursos, artículos y actividad pública en Backtrack Academy."
          />
          <ProfileToggle
            id="allow_search"
            v-model="form.allow_search"
            :disabled="!form.public_profile"
            label="Aparecer en Google y otros buscadores"
            :description="form.public_profile ? 'Tu perfil público puede aparecer en buscadores como Google.' : 'Activa primero tu perfil público.'"
          />
          <p v-if="form.public_profile && form.allow_search && thinProfile" class="font-inconsolata text-xs text-amber-300" role="status">
            Para que Google lo indexe, agrega una bio (40+ caracteres) o un titular.
          </p>
        </div>

        <div class="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-bta-bg px-4 py-3">
          <div class="min-w-0">
            <p class="font-inconsolata text-xs text-gray-muted">
              {{ me?.public_profile ? 'Tu perfil público:' : 'Vista previa (solo tú):' }}
            </p>
            <p class="truncate font-inconsolata text-sm text-white">
              {{ publicLabel }}
            </p>
          </div>
          <Button as-child variant="outline" size="sm" class="bt-focus border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white">
            <NuxtLink :to="publicPath">
              Ver perfil <Icon name="lucide:arrow-up-right" />
            </NuxtLink>
          </Button>
        </div>
      </section>

      <p v-for="m in errors.base" :key="m" class="font-inconsolata text-sm text-red-400" role="alert">
        {{ m }}
      </p>

      <div class="fixed inset-x-0 bottom-[68px] z-30 border-t border-white/[0.06] bg-bta-bg/90 px-4 py-3 backdrop-blur md:bottom-0 md:left-[64px] lg:left-[232px]">
        <div class="mx-auto flex max-w-3xl items-center justify-end gap-4">
          <p class="font-inconsolata text-xs" :class="saved && !dirty ? 'text-emerald-400' : 'text-gray-muted'" role="status">
            {{ saved && !dirty ? 'Cambios guardados' : dirty ? 'Cambios sin guardar' : '' }}
          </p>
          <Button type="submit" class="bt-focus rounded-lg bg-bta-pink px-5 font-semibold text-white shadow-[0_8px_24px_-10px_rgba(236,16,117,0.9)] hover:bg-bta-pink/90 disabled:shadow-none" :disabled="saving || !dirty">
            {{ saving ? 'Guardando…' : 'Guardar cambios' }}
          </Button>
        </div>
      </div>
    </form>
  </div>
</template>
