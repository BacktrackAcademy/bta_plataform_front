<script lang="ts" setup>
import { Button } from '~/components/ui/button'

definePageMeta({ layout: 'custom', auth: true })
useSeoMeta({ title: 'Configuración', robots: 'noindex, nofollow' })

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

interface EducationRow {
  id?: number
  institution_id: number | string | null
  education_degree_id: number | string | null
  start_month: number
  start_year: number
  end_month: number
  end_year: number
  _destroy?: boolean
}

interface SettingsResponse {
  email: string
  verified: boolean
  birthdate: string | null
  country_id: number | null
  user_type: string | null
  education_type: string | null
  studies: string | null
  rut: string | null
  city: string | null
  postal_code: string | null
  contact: string | null
  address: string | null
  facebook_url: string | null
  user_types: string[]
  education_types: string[]
  area_codes: [string, string][]
  institutions: { id: number, name: string }[]
  educations: { id: number, institution_id: number, education_degree_id: number, start_date: string | null, end_date: string | null }[]
  notifications: Record<string, boolean>
  payments: { id: number, paid_at: string | null, expires_at: string | null, recurring: boolean, name: string | null, quantity: number | null, price: number | null }[]
}

const api = useNuxtApp().$api as typeof $fetch
const { getSession, signOut } = useAuth()
const siteUrl = useSiteUrl()
const route = useRoute()

const [{ data: me }, { data: settings }, { data: countries }] = await Promise.all([
  useAPI<UserInfo>('/user/info'),
  useAPI<SettingsResponse>('/settings'),
  useAPI<{ id: number, name: string }[]>('/countries'),
])

// ---- Secciones ---------------------------------------------------------------------------
const sections = [
  { key: 'personal', label: 'Datos personales', icon: 'lucide:user', save: true },
  { key: 'formacion', label: 'Formación profesional', icon: 'lucide:graduation-cap', save: true },
  { key: 'imagenes', label: 'Imágenes', icon: 'lucide:camera', save: false },
  { key: 'redes', label: 'Redes sociales', icon: 'lucide:share-2', save: true },
  { key: 'facturacion', label: 'Datos de facturación', icon: 'lucide:receipt', save: true },
  { key: 'pagos', label: 'Historial de pagos', icon: 'lucide:wallet', save: false },
  { key: 'notificaciones', label: 'Notificaciones', icon: 'lucide:bell', save: false },
  { key: 'password', label: 'Contraseña', icon: 'lucide:key-round', save: false },
] as const
type SectionKey = typeof sections[number]['key']

const initial = String(route.query.tab || route.hash.replace('#', ''))
const active = ref<SectionKey>(sections.some(s => s.key === initial) ? initial as SectionKey : 'personal')
const activeSection = computed(() => sections.find(s => s.key === active.value)!)
function go(key: SectionKey) {
  active.value = key
  navigateTo({ query: key === 'personal' ? {} : { tab: key } }, { replace: true })
}

// ---- Formulario principal ----------------------------------------------------------------
const BIO_MAX = 400
const SPECIALTY_MAX = 12
const locked = computed(() => Boolean(settings.value?.verified))

function toRow(e: SettingsResponse['educations'][number]): EducationRow {
  const start = e.start_date ? new Date(`${e.start_date}T00:00:00`) : new Date()
  const end = e.end_date ? new Date(`${e.end_date}T00:00:00`) : new Date()
  return {
    id: e.id,
    institution_id: e.institution_id,
    education_degree_id: e.education_degree_id,
    start_month: start.getMonth() + 1,
    start_year: start.getFullYear(),
    end_month: end.getMonth() + 1,
    end_year: end.getFullYear(),
  }
}

const form = reactive({
  name: me.value?.name ?? '',
  lastname: me.value?.lastname ?? '',
  username: me.value?.username ?? '',
  headline: me.value?.headline ?? '',
  aboutme: me.value?.aboutme ?? '',
  birthdate: settings.value?.birthdate ?? '',
  country_id: settings.value?.country_id ?? ('' as number | ''),
  user_type: settings.value?.user_type ?? '',
  education_type: settings.value?.education_type ?? '',
  studies: settings.value?.studies ?? '',
  skills: [...(me.value?.skills ?? [])] as string[],
  educations: (settings.value?.educations ?? []).map(toRow) as EducationRow[],
  facebook_url: settings.value?.facebook_url ?? '',
  linkedin_url: me.value?.linkedin_url ?? '',
  twitter_url: me.value?.twitter_url ?? '',
  rut: settings.value?.rut ?? '',
  city: settings.value?.city ?? '',
  postal_code: settings.value?.postal_code ?? '',
  contact: settings.value?.contact ?? '',
  address: settings.value?.address ?? '',
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

const userTypeLabels: Record<string, string> = {
  people: 'Soy estudiante universitario',
  professional: 'Soy profesional',
  enterprise: 'Soy dueño de empresa',
}
const educationTypeLabels: Record<string, string> = { high_school: 'Secundaria', university: 'Universidad' }

// ---- Habilidades -------------------------------------------------------------------------
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

// ---- Educación ---------------------------------------------------------------------------
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const thisYear = new Date().getFullYear()
const YEARS = Array.from({ length: 71 }, (_, i) => thisYear - i)
const visibleEducations = computed(() => form.educations.filter(e => !e._destroy))

const degreesByInstitution = reactive<Record<string, { id: number, name: string }[]>>({})
async function loadDegrees(institutionId: number | string | null) {
  if (!institutionId || degreesByInstitution[String(institutionId)]) {
    return
  }
  degreesByInstitution[String(institutionId)] = await api<{ id: number, name: string }[]>('/settings/degrees', { query: { institution_id: institutionId } })
}
form.educations.forEach(e => loadDegrees(e.institution_id))

function addEducation() {
  const now = new Date()
  form.educations.push({
    institution_id: '',
    education_degree_id: '',
    start_month: now.getMonth() + 1,
    start_year: now.getFullYear(),
    end_month: now.getMonth() + 1,
    end_year: now.getFullYear(),
  })
}
async function onInstitutionChange(row: EducationRow) {
  row.education_degree_id = ''
  await loadDegrees(row.institution_id)
}
function removeEducation(row: EducationRow) {
  if (row.id) {
    row._destroy = true
  }
  else {
    form.educations.splice(form.educations.indexOf(row), 1)
  }
}
const iso = (y: number, m: number) => `${y}-${String(m).padStart(2, '0')}-01`

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

// ---- Guardar (secciones con barra de guardado) -------------------------------------------
const saving = ref(false)
const saved = ref(false)
const errors = ref<Record<string, string[]>>({})

async function save() {
  if (!usernameValid.value) {
    errors.value = { username: ['Usa de 3 a 40 caracteres: letras, números, guion o guion bajo.'] }
    go('personal')
    return
  }
  saving.value = true
  saved.value = false
  errors.value = {}
  try {
    const { educations, ...rest } = form
    const body: Record<string, unknown> = { ...rest }
    if (form.education_type === 'university') {
      body.educations_attributes = educations.map(e => ({
        id: e.id,
        institution_id: e.institution_id,
        education_degree_id: e.education_degree_id,
        start_date: iso(e.start_year, e.start_month),
        end_date: iso(e.end_year, e.end_month),
        _destroy: e._destroy ? 1 : undefined,
      }))
    }
    await api('/user/update', { method: 'PATCH', body: { user: body } })
    // Las filas eliminadas dejan de existir; las nuevas se recargan con su id.
    const fresh = await api<SettingsResponse>('/settings')
    form.educations = fresh.educations.map(toRow)
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

// ---- Notificaciones ----------------------------------------------------------------------
const notificationGroups = [
  {
    title: 'Notificaciones',
    items: [
      ['notification_new_course', 'Nuevo curso'],
      ['notification_new_post', 'Nuevo artículo de blog'],
      ['notification_new_comment', 'Comentario en debate'],
      ['notification_new_follow', 'Alguien me ha seguido'],
    ],
  },
  {
    title: 'Email',
    items: [
      ['disable_email', 'No quiero recibir correos'],
      ['email_new_letter', 'Quiero recibir Newsletter'],
      ['email_new_course', 'Quiero recibir cuando se lance un curso'],
      ['email_new_promotion', 'Quiero recibir promociones y descuentos'],
      ['email_new_comment', 'Quiero recibir cuando un usuario comente'],
    ],
  },
] as const
const notifications = reactive<Record<string, boolean>>({ ...(settings.value?.notifications ?? {}) })
const notifStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
// "No quiero recibir correos" apaga el resto de opciones de email.
watch(() => notifications.disable_email, (off) => {
  if (off) {
    ['email_new_letter', 'email_new_course', 'email_new_promotion', 'email_new_comment'].forEach(k => (notifications[k] = false))
  }
})
async function saveNotifications() {
  notifStatus.value = 'saving'
  try {
    Object.assign(notifications, await api<Record<string, boolean>>('/settings/notifications', { method: 'PATCH', body: { notifications } }))
    notifStatus.value = 'saved'
  }
  catch {
    notifStatus.value = 'error'
  }
}

// ---- Contraseña --------------------------------------------------------------------------
const pw = reactive({ current_password: '', password: '', password_confirmation: '' })
const pwBusy = ref(false)
const pwDone = ref(false)
const pwErrors = ref<Record<string, string[]>>({})
async function savePassword() {
  pwBusy.value = true
  pwDone.value = false
  pwErrors.value = {}
  try {
    await api('/settings/password', { method: 'PATCH', body: { user: { ...pw } } })
    Object.assign(pw, { current_password: '', password: '', password_confirmation: '' })
    pwDone.value = true
  }
  catch (e: any) {
    pwErrors.value = e?.data && typeof e.data === 'object' ? e.data : { base: ['No pudimos cambiar la contraseña.'] }
  }
  finally {
    pwBusy.value = false
  }
}

// ---- Eliminar cuenta ---------------------------------------------------------------------
const deleteOpen = ref(false)
const deleteConfirm = ref('')
const deleteBusy = ref(false)
const deleteError = ref('')
async function deleteAccount() {
  deleteBusy.value = true
  deleteError.value = ''
  try {
    await api('/user', { method: 'DELETE', body: { confirm: deleteConfirm.value } })
    await signOut({ callbackUrl: '/login' })
  }
  catch {
    deleteError.value = 'No pudimos eliminar la cuenta. Revisa el nombre de usuario.'
  }
  finally {
    deleteBusy.value = false
  }
}

// ---- Presentación ------------------------------------------------------------------------
const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('es-CL') : '—')
const fmtPrice = (n: number | null) => (n == null ? '—' : `$${Number(n).toFixed(2).replace(/\.00$/, '')}`)
const field = 'w-full rounded-lg border border-white/10 bg-bta-bg px-3.5 py-2.5 font-sans text-base text-white placeholder:text-white/30 transition-colors hover:border-white/20 focus:border-bta-pink/60 focus:outline-none focus:ring-2 focus:ring-bta-pink/30 disabled:cursor-not-allowed disabled:opacity-50'
const labelCls = 'mb-1.5 block font-inconsolata text-[13px] font-bold uppercase tracking-[0.12em] text-white/85'
const sectionTitle = 'flex items-center gap-3 font-inconsolata text-[13px] font-bold uppercase tracking-[0.18em] text-white/85 after:h-px after:flex-1 after:bg-gradient-to-r after:from-white/10 after:to-transparent'
const primaryBtn = 'bt-focus rounded-lg bg-bta-pink px-5 font-semibold text-white shadow-[0_8px_24px_-10px_rgba(236,16,117,0.9)] hover:bg-bta-pink/90 disabled:shadow-none'
</script>

<template>
  <div class="mx-auto w-full max-w-6xl px-4 py-6 pb-28 sm:px-6 sm:py-10">
    <NuxtLink :to="publicPath" class="bt-focus inline-flex items-center gap-2 rounded font-inconsolata text-sm text-bta-text-2 transition-colors hover:text-white">
      <Icon name="lucide:arrow-left" class="size-4" aria-hidden="true" /> @{{ savedUsername }}
    </NuxtLink>
    <h1 class="mt-3 font-oswald text-3xl font-semibold leading-none tracking-tight text-white sm:text-4xl">
      Configuración
    </h1>
    <p class="mt-2 font-inconsolata text-sm text-bta-text-2">
      <span class="text-bta-pink">$</span> Tu cuenta, tu perfil y tus preferencias.
    </p>

    <div class="mt-8 grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <!-- Navegación de secciones -->
      <nav aria-label="Secciones de configuración" class="-mx-4 overflow-x-auto px-4 lg:sticky lg:top-24 lg:mx-0 lg:self-start lg:overflow-visible lg:px-0">
        <ul class="flex gap-1 lg:flex-col">
          <li v-for="s in sections" :key="s.key" class="shrink-0">
            <button
              type="button"
              class="bt-focus flex w-full items-center gap-3 whitespace-nowrap rounded-lg border px-3.5 py-2.5 text-left font-sans text-sm font-medium transition-colors"
              :class="active === s.key ? 'border-bta-pink/40 bg-bta-pink/10 text-white' : 'border-transparent text-bta-text-2 hover:bg-white/[0.04] hover:text-white'"
              :aria-current="active === s.key ? 'page' : undefined"
              @click="go(s.key)"
            >
              <Icon :name="s.icon" class="size-4 shrink-0" :class="active === s.key ? 'text-bta-pink' : ''" aria-hidden="true" />
              {{ s.label }}
            </button>
          </li>
        </ul>
      </nav>

      <form class="min-w-0 space-y-6" novalidate @submit.prevent="save">
        <!-- DATOS PERSONALES -->
        <template v-if="active === 'personal'">
          <section class="bt-surface p-5 sm:p-6" aria-labelledby="personal-title">
            <h2 id="personal-title" :class="sectionTitle">
              <span><span class="text-bta-pink/70" aria-hidden="true">//</span> Datos personales</span>
            </h2>
            <p v-if="locked" class="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/[0.06] px-3 py-2 font-inconsolata text-xs text-amber-200">
              Tu cuenta está verificada: algunos datos no se pueden editar.
            </p>

            <div class="mt-5 grid gap-5 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <label for="username" :class="labelCls">Nombre de usuario</label>
                <div class="flex items-center rounded-lg border border-white/10 bg-bta-bg transition-colors hover:border-white/20 focus-within:border-bta-pink/60 focus-within:ring-2 focus-within:ring-bta-pink/30">
                  <span class="pl-3.5 font-inconsolata text-sm text-bta-pink" aria-hidden="true">@</span>
                  <input id="username" v-model="form.username" class="w-full bg-transparent px-2 py-2.5 font-inconsolata text-sm text-white focus:outline-none disabled:opacity-50" type="text" maxlength="40" autocomplete="username" :disabled="locked" :aria-invalid="!usernameValid" aria-describedby="username-hint">
                </div>
                <p id="username-hint" class="mt-1.5 font-inconsolata text-xs" :class="usernameValid ? 'text-bta-text-2' : 'text-red-400'">
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

              <div>
                <label for="name" :class="labelCls">Nombre</label>
                <input id="name" v-model="form.name" :class="field" type="text" maxlength="100" autocomplete="given-name" :disabled="locked">
              </div>
              <div>
                <label for="lastname" :class="labelCls">Apellidos</label>
                <input id="lastname" v-model="form.lastname" :class="field" type="text" maxlength="100" autocomplete="family-name" :disabled="locked">
              </div>

              <div>
                <label for="email" :class="labelCls">Correo electrónico</label>
                <input id="email" :value="settings?.email" :class="field" type="email" readonly disabled aria-describedby="email-hint">
                <p id="email-hint" class="mt-1.5 font-inconsolata text-xs text-bta-text-2">
                  Para cambiarlo, escríbenos a contacto@backtrackacademy.com.
                </p>
              </div>
              <div>
                <label for="birthdate" :class="labelCls">Fecha de nacimiento</label>
                <input id="birthdate" v-model="form.birthdate" :class="field" type="date" autocomplete="bday" :disabled="locked">
              </div>

              <div>
                <label for="country" :class="labelCls">Nacionalidad</label>
                <select id="country" v-model="form.country_id" :class="field" :disabled="locked">
                  <option value="">
                    Seleccionar país
                  </option>
                  <option v-for="c in countries" :key="c.id" :value="c.id">
                    {{ c.name }}
                  </option>
                </select>
              </div>

              <fieldset class="sm:col-span-2">
                <legend :class="labelCls">
                  Perfil de usuario
                </legend>
                <div class="flex flex-wrap gap-2">
                  <label v-for="t in settings?.user_types" :key="t" class="flex cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2.5 font-sans text-sm transition-colors" :class="[form.user_type === t ? 'border-bta-pink/50 bg-bta-pink/10 text-white' : 'border-white/10 text-bta-text-2 hover:border-white/20 hover:text-white', locked ? 'cursor-not-allowed opacity-50' : '']">
                    <input v-model="form.user_type" type="radio" name="user_type" :value="t" :disabled="locked" class="accent-[#EC1075]">
                    {{ userTypeLabels[t] || t }}
                  </label>
                </div>
              </fieldset>

              <div class="sm:col-span-2">
                <label for="aboutme" :class="labelCls">Acerca de mí</label>
                <textarea id="aboutme" v-model="form.aboutme" :class="field" rows="5" :maxlength="BIO_MAX" placeholder="Qué haces y en qué te especializas." />
                <p class="mt-1 text-right font-inconsolata text-xs text-bta-text-2">
                  {{ form.aboutme.length }}/{{ BIO_MAX }}
                </p>
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
                <p class="font-inconsolata text-xs text-bta-text-2">
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

          <!-- ZONA DE PELIGRO -->
          <section class="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-5 sm:p-6" aria-labelledby="danger-title">
            <h2 id="danger-title" class="font-inconsolata text-xs font-bold uppercase tracking-[0.2em] text-red-300">
              <span aria-hidden="true">//</span> Eliminar cuenta
            </h2>
            <p class="mt-3 font-sans text-sm text-bta-text-2">
              Se borrará tu cuenta y tus datos de forma permanente. Esta acción no se puede deshacer.
            </p>
            <Button v-if="!deleteOpen" type="button" variant="outline" class="bt-focus mt-4 border-red-400/40 bg-transparent text-red-300 hover:bg-red-500/10 hover:text-red-200" @click="deleteOpen = true">
              Eliminar mi cuenta
            </Button>
            <div v-else class="mt-4 space-y-3">
              <label for="delete-confirm" class="block font-sans text-sm text-white">Escribe tu nombre de usuario (<span class="font-inconsolata text-red-300">{{ savedUsername }}</span>) para confirmar</label>
              <input id="delete-confirm" v-model="deleteConfirm" :class="field" type="text" autocomplete="off">
              <p v-if="deleteError" class="font-inconsolata text-xs text-red-400" role="alert">
                {{ deleteError }}
              </p>
              <div class="flex gap-2">
                <Button type="button" class="bt-focus bg-red-500 text-white hover:bg-red-500/85" :disabled="deleteBusy || deleteConfirm.toLowerCase() !== savedUsername.toLowerCase()" @click="deleteAccount">
                  {{ deleteBusy ? 'Eliminando…' : 'Eliminar definitivamente' }}
                </Button>
                <Button type="button" variant="ghost" class="bt-focus text-bta-text-2 hover:bg-white/10 hover:text-white" @click="deleteOpen = false; deleteConfirm = ''">
                  Cancelar
                </Button>
              </div>
            </div>
          </section>
        </template>

        <!-- FORMACIÓN PROFESIONAL -->
        <template v-else-if="active === 'formacion'">
          <section class="bt-surface p-5 sm:p-6" aria-labelledby="formacion-title">
            <h2 id="formacion-title" :class="sectionTitle">
              <span><span class="text-bta-pink/70" aria-hidden="true">//</span> Formación profesional</span>
            </h2>

            <fieldset class="mt-5">
              <legend :class="labelCls">
                Nivel de estudios
              </legend>
              <div class="flex flex-wrap gap-2">
                <label v-for="t in settings?.education_types" :key="t" class="flex cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2.5 font-sans text-sm transition-colors" :class="form.education_type === t ? 'border-bta-pink/50 bg-bta-pink/10 text-white' : 'border-white/10 text-bta-text-2 hover:border-white/20 hover:text-white'">
                  <input v-model="form.education_type" type="radio" name="education_type" :value="t" class="accent-[#EC1075]">
                  {{ educationTypeLabels[t] || t }}
                </label>
              </div>
            </fieldset>

            <div class="mt-6">
              <label for="skill" :class="labelCls">Habilidades</label>
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
                  class="min-w-[8rem] flex-1 bg-transparent px-1 py-1 font-inconsolata text-sm text-white placeholder:text-bta-text-2 focus:outline-none"
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
              <p class="mt-1.5 font-inconsolata text-xs text-bta-text-2">
                Enter para agregar · hasta {{ SPECIALTY_MAX }}. Se muestran en tu perfil como especialidades.
              </p>
            </div>

            <!-- Secundaria -->
            <div v-if="form.education_type === 'high_school'" class="mt-6">
              <label for="studies" :class="labelCls">Educación</label>
              <textarea id="studies" v-model="form.studies" :class="field" rows="6" />
            </div>

            <!-- Universidad -->
            <div v-else-if="form.education_type === 'university'" class="mt-8 space-y-4">
              <article v-for="(row, i) in visibleEducations" :key="row.id ?? `new-${i}`" class="rounded-xl border border-white/[0.08] bg-bta-bg p-4 sm:p-5">
                <header class="flex items-center justify-between">
                  <h3 class="font-oswald text-lg text-white">
                    Educación {{ i + 1 }}
                  </h3>
                  <button type="button" class="bt-focus rounded px-2 py-1 font-inconsolata text-xs text-red-300 transition-colors hover:bg-red-500/10" @click="removeEducation(row)">
                    Eliminar
                  </button>
                </header>
                <div class="mt-4 grid gap-4 sm:grid-cols-2">
                  <div class="sm:col-span-2">
                    <label :for="`inst-${i}`" :class="labelCls">Universidad, instituto u otra academia</label>
                    <select :id="`inst-${i}`" v-model="row.institution_id" :class="field" @change="onInstitutionChange(row)">
                      <option value="">
                        Seleccionar
                      </option>
                      <option v-for="inst in settings?.institutions" :key="inst.id" :value="inst.id">
                        {{ inst.name }}
                      </option>
                    </select>
                  </div>
                  <div class="sm:col-span-2">
                    <label :for="`degree-${i}`" :class="labelCls">Grado, licenciatura o diplomado</label>
                    <select :id="`degree-${i}`" v-model="row.education_degree_id" :class="field" :disabled="!row.institution_id">
                      <option value="">
                        {{ row.institution_id ? 'Seleccionar' : 'Elige primero una institución' }}
                      </option>
                      <option v-for="d in degreesByInstitution[String(row.institution_id)] ?? []" :key="d.id" :value="d.id">
                        {{ d.name }}
                      </option>
                    </select>
                  </div>
                  <fieldset>
                    <legend :class="labelCls">
                      Ingreso
                    </legend>
                    <div class="grid grid-cols-[1fr_6rem] gap-2">
                      <select v-model.number="row.start_month" :class="field" aria-label="Mes de ingreso">
                        <option v-for="(m, mi) in MONTHS" :key="m" :value="mi + 1">
                          {{ m }}
                        </option>
                      </select>
                      <select v-model.number="row.start_year" :class="field" aria-label="Año de ingreso">
                        <option v-for="y in YEARS" :key="y" :value="y">
                          {{ y }}
                        </option>
                      </select>
                    </div>
                  </fieldset>
                  <fieldset>
                    <legend :class="labelCls">
                      Egreso
                    </legend>
                    <div class="grid grid-cols-[1fr_6rem] gap-2">
                      <select v-model.number="row.end_month" :class="field" aria-label="Mes de egreso">
                        <option v-for="(m, mi) in MONTHS" :key="m" :value="mi + 1">
                          {{ m }}
                        </option>
                      </select>
                      <select v-model.number="row.end_year" :class="field" aria-label="Año de egreso">
                        <option v-for="y in YEARS" :key="y" :value="y">
                          {{ y }}
                        </option>
                      </select>
                    </div>
                  </fieldset>
                </div>
              </article>
              <p v-if="!visibleEducations.length" class="rounded-lg border border-dashed border-white/10 p-5 text-center font-inconsolata text-sm text-bta-text-2">
                <span class="text-bta-pink">$</span> Aún no agregas estudios universitarios.
              </p>
              <Button type="button" variant="outline" class="bt-focus border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white" @click="addEducation">
                <Icon name="lucide:plus" /> Agregar educación
              </Button>
            </div>
          </section>
        </template>

        <!-- IMÁGENES -->
        <template v-else-if="active === 'imagenes'">
          <section class="bt-surface overflow-hidden" aria-labelledby="imagenes-title">
            <div class="relative h-24 overflow-hidden sm:h-28" aria-hidden="true">
              <div class="absolute inset-0 bg-[radial-gradient(120%_160%_at_0%_0%,rgba(236,16,117,0.34),transparent_55%),radial-gradient(90%_140%_at_100%_100%,rgba(88,64,255,0.2),transparent_60%)]" />
              <div class="bt-tech-grid absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
            </div>
            <div class="p-5 pt-0 sm:p-6 sm:pt-0">
              <h2 id="imagenes-title" class="sr-only">
                Imágenes
              </h2>
              <div class="-mt-12 flex flex-wrap items-end gap-5">
                <ProfileAvatar :src="avatarUrl" :name="`${form.name} ${form.lastname}`.trim() || form.username" size="lg" />
                <div class="space-y-2 pb-1">
                  <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="sr-only" aria-label="Subir foto de perfil" @change="onAvatarChange">
                  <div class="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" class="bt-focus border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white" :disabled="avatarBusy" @click="fileInput?.click()">
                      <Icon name="lucide:upload" /> {{ avatarUrl ? 'Cambiar foto' : 'Subir foto' }}
                    </Button>
                    <Button v-if="avatarUrl" type="button" variant="ghost" size="sm" class="bt-focus text-bta-text-2 hover:bg-white/10 hover:text-white" :disabled="avatarBusy" @click="removeAvatar">
                      Quitar
                    </Button>
                  </div>
                  <p class="font-inconsolata text-xs text-bta-text-2">
                    JPG, PNG, WEBP o GIF · máx. 3 MB · se guarda al instante
                  </p>
                  <p v-if="avatarError" class="font-inconsolata text-xs text-red-400" role="alert">
                    {{ avatarError }}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </template>

        <!-- REDES SOCIALES -->
        <template v-else-if="active === 'redes'">
          <section class="bt-surface p-5 sm:p-6" aria-labelledby="redes-title">
            <h2 id="redes-title" :class="sectionTitle">
              <span><span class="text-bta-pink/70" aria-hidden="true">//</span> Redes sociales</span>
            </h2>
            <p class="mt-4 font-sans text-sm text-bta-text-2">
              Puedes ingresar solo tu nombre de usuario o la URL de tu perfil.
            </p>
            <div class="mt-5 space-y-5">
              <div v-for="net in [{ key: 'facebook_url', label: 'Facebook', icon: 'lucide:facebook' }, { key: 'twitter_url', label: 'X (Twitter)', icon: 'lucide:twitter' }, { key: 'linkedin_url', label: 'LinkedIn', icon: 'lucide:linkedin' }] as const" :key="net.key">
                <label :for="net.key" :class="labelCls">{{ net.label }}</label>
                <div class="flex items-center rounded-lg border border-white/10 bg-bta-bg transition-colors hover:border-white/20 focus-within:border-bta-pink/60 focus-within:ring-2 focus-within:ring-bta-pink/30">
                  <span class="flex items-center border-r border-white/10 px-3.5 py-3 text-bta-text-2"><Icon :name="net.icon" class="size-4" aria-hidden="true" /></span>
                  <input :id="net.key" v-model="form[net.key]" class="w-full bg-transparent px-3 py-2.5 font-inconsolata text-sm text-white placeholder:text-bta-text-2 focus:outline-none" type="text" maxlength="200" placeholder="tu-usuario o URL del perfil">
                </div>
              </div>
            </div>
          </section>
        </template>

        <!-- FACTURACIÓN -->
        <template v-else-if="active === 'facturacion'">
          <section class="bt-surface p-5 sm:p-6" aria-labelledby="facturacion-title">
            <h2 id="facturacion-title" :class="sectionTitle">
              <span><span class="text-bta-pink/70" aria-hidden="true">//</span> Datos de facturación</span>
            </h2>
            <div class="mt-5 grid gap-5 sm:grid-cols-2">
              <div class="sm:col-span-2 sm:max-w-md">
                <label for="rut" :class="labelCls">Cédula de identidad</label>
                <input id="rut" v-model="form.rut" :class="field" type="text" maxlength="20" :disabled="locked">
              </div>
              <div>
                <label for="residence" :class="labelCls">País de residencia</label>
                <select id="residence" v-model="form.country_id" :class="field" :disabled="locked">
                  <option value="">
                    Seleccionar país
                  </option>
                  <option v-for="c in countries" :key="c.id" :value="c.id">
                    {{ c.name }}
                  </option>
                </select>
              </div>
              <div>
                <label for="city" :class="labelCls">Ciudad</label>
                <input id="city" v-model="form.city" :class="field" type="text" maxlength="300" autocomplete="address-level2" :disabled="locked">
              </div>
              <div>
                <label for="area" :class="labelCls">Código de área</label>
                <select id="area" v-model="form.postal_code" :class="field" :disabled="locked">
                  <option value="">
                    Seleccionar código de área
                  </option>
                  <option v-for="[label, value] in settings?.area_codes" :key="label" :value="value">
                    {{ label }}
                  </option>
                </select>
              </div>
              <div>
                <label for="contact" :class="labelCls">Teléfono</label>
                <input id="contact" v-model="form.contact" :class="field" type="tel" inputmode="numeric" maxlength="100" autocomplete="tel-national" :disabled="locked">
              </div>
              <div class="sm:col-span-2">
                <label for="address" :class="labelCls">Dirección</label>
                <input id="address" v-model="form.address" :class="field" type="text" maxlength="300" placeholder="Calle, número, piso, puerta" autocomplete="street-address" :disabled="locked">
              </div>
            </div>
          </section>
        </template>

        <!-- HISTORIAL DE PAGOS -->
        <template v-else-if="active === 'pagos'">
          <section class="bt-surface p-5 sm:p-6" aria-labelledby="pagos-title">
            <h2 id="pagos-title" :class="sectionTitle">
              <span><span class="text-bta-pink/70" aria-hidden="true">//</span> Historial de pagos</span>
            </h2>
            <div v-if="settings?.payments.length" class="mt-5 overflow-x-auto">
              <table class="w-full text-left font-sans text-sm text-white">
                <thead>
                  <tr class="border-b border-white/10 font-inconsolata text-[11px] uppercase tracking-[0.16em] text-bta-text-2">
                    <th class="py-3 pr-4 font-normal">
                      Fecha de pago
                    </th>
                    <th class="py-3 pr-4 font-normal">
                      Vencimiento
                    </th>
                    <th class="py-3 pr-4 font-normal">
                      Pago recurrente
                    </th>
                    <th class="py-3 pr-4 font-normal">
                      Detalle
                    </th>
                    <th class="py-3 text-right font-normal">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in settings.payments" :key="p.id" class="border-b border-white/[0.06]">
                    <td class="py-3.5 pr-4 tabular-nums">
                      {{ fmtDate(p.paid_at) }}
                    </td>
                    <td class="py-3.5 pr-4 tabular-nums">
                      {{ fmtDate(p.expires_at) }}
                    </td>
                    <td class="py-3.5 pr-4">
                      <span class="rounded-full border px-2 py-0.5 font-inconsolata text-xs" :class="p.recurring ? 'border-emerald-400/30 text-emerald-300' : 'border-white/10 text-bta-text-2'">{{ p.recurring ? 'Activado' : 'Desactivado' }}</span>
                    </td>
                    <td class="py-3.5 pr-4">
                      {{ p.name || '—' }}
                    </td>
                    <td class="py-3.5 text-right font-semibold tabular-nums">
                      {{ fmtPrice(p.price) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="mt-6 rounded-lg border border-dashed border-white/10 p-8 text-center">
              <p class="font-oswald text-xl text-white">
                No tienes detalles de pago
              </p>
              <Button as-child :class="`mt-4 ${primaryBtn}`">
                <NuxtLink to="/suscripciones">
                  Quiero una cuenta premium
                </NuxtLink>
              </Button>
            </div>
          </section>
        </template>

        <!-- NOTIFICACIONES -->
        <template v-else-if="active === 'notificaciones'">
          <section class="bt-surface p-5 sm:p-6" aria-labelledby="notif-title">
            <h2 id="notif-title" :class="sectionTitle">
              <span><span class="text-bta-pink/70" aria-hidden="true">//</span> Notificaciones</span>
            </h2>
            <div v-for="group in notificationGroups" :key="group.title" class="mt-6">
              <h3 :class="labelCls">
                {{ group.title }}
              </h3>
              <div class="space-y-4">
                <ProfileToggle
                  v-for="[key, label] in group.items"
                  :id="key"
                  :key="key"
                  v-model="notifications[key]"
                  :label="label"
                  description=""
                  :disabled="key !== 'disable_email' && key.startsWith('email_') && notifications.disable_email"
                />
              </div>
            </div>
            <div class="mt-6 flex items-center justify-end gap-4">
              <p class="font-inconsolata text-xs" :class="notifStatus === 'error' ? 'text-red-400' : 'text-emerald-400'" role="status">
                {{ notifStatus === 'saved' ? 'Preferencias guardadas' : notifStatus === 'error' ? 'No pudimos guardar' : '' }}
              </p>
              <Button type="button" :class="primaryBtn" :disabled="notifStatus === 'saving'" @click="saveNotifications">
                {{ notifStatus === 'saving' ? 'Guardando…' : 'Guardar preferencias' }}
              </Button>
            </div>
          </section>
        </template>

        <!-- CONTRASEÑA -->
        <template v-else-if="active === 'password'">
          <section class="bt-surface p-5 sm:p-6" aria-labelledby="password-title">
            <h2 id="password-title" :class="sectionTitle">
              <span><span class="text-bta-pink/70" aria-hidden="true">//</span> Contraseña</span>
            </h2>
            <div class="mt-5 max-w-md space-y-5">
              <div>
                <label for="current_password" :class="labelCls">Contraseña actual</label>
                <input id="current_password" v-model="pw.current_password" :class="field" type="password" autocomplete="current-password">
                <p v-for="m in pwErrors.current_password" :key="m" class="mt-1 font-inconsolata text-xs text-red-400" role="alert">
                  {{ m }}
                </p>
              </div>
              <div>
                <label for="new_password" :class="labelCls">Nueva contraseña</label>
                <input id="new_password" v-model="pw.password" :class="field" type="password" autocomplete="new-password">
                <p v-for="m in pwErrors.password" :key="m" class="mt-1 font-inconsolata text-xs text-red-400" role="alert">
                  {{ m }}
                </p>
              </div>
              <div>
                <label for="password_confirmation" :class="labelCls">Repite la nueva contraseña</label>
                <input id="password_confirmation" v-model="pw.password_confirmation" :class="field" type="password" autocomplete="new-password">
                <p v-for="m in pwErrors.password_confirmation" :key="m" class="mt-1 font-inconsolata text-xs text-red-400" role="alert">
                  {{ m }}
                </p>
              </div>
              <p v-for="m in pwErrors.base" :key="m" class="font-inconsolata text-xs text-red-400" role="alert">
                {{ m }}
              </p>
              <div class="flex items-center justify-end gap-4">
                <p v-if="pwDone" class="font-inconsolata text-xs text-emerald-400" role="status">
                  Contraseña actualizada
                </p>
                <Button type="button" :class="primaryBtn" :disabled="pwBusy || !pw.current_password || !pw.password" @click="savePassword">
                  {{ pwBusy ? 'Guardando…' : 'Cambiar contraseña' }}
                </Button>
              </div>
            </div>
          </section>
        </template>

        <p v-for="m in errors.base" :key="m" class="font-inconsolata text-sm text-red-400" role="alert">
          {{ m }}
        </p>
        <template v-for="(msgs, key) in errors" :key="key">
          <p v-for="m in (key === 'base' || key === 'username' ? [] : msgs)" :key="m" class="font-inconsolata text-sm text-red-400" role="alert">
            {{ key }}: {{ m }}
          </p>
        </template>

        <div v-if="activeSection.save" class="fixed inset-x-0 bottom-[68px] z-30 border-t border-white/[0.06] bg-bta-bg/90 px-4 py-3 backdrop-blur md:bottom-0 md:left-[64px] lg:left-[232px]">
          <div class="mx-auto flex max-w-6xl items-center justify-end gap-4">
            <p class="font-inconsolata text-xs" :class="saved && !dirty ? 'text-emerald-400' : 'text-bta-text-2'" role="status">
              {{ saved && !dirty ? 'Cambios guardados' : dirty ? 'Cambios sin guardar' : '' }}
            </p>
            <Button type="submit" :class="primaryBtn" :disabled="saving || !dirty">
              {{ saving ? 'Guardando…' : 'Guardar cambios' }}
            </Button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
