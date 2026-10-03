<script setup lang="ts">
// Decorative, simulated console session (no real network activity). Ends on the brand greeting.
type Line = { text: string, cls?: string, type?: boolean, wait?: number }
type Variant = 'login' | 'register' | 'recover' | 'resend'

const props = withDefaults(defineProps<{ variant?: Variant }>(), { variant: 'login' })

const PROMPT = 'msf6'

const scenes: Record<Variant, { mod: string, lines: Line[] }> = {
  login: {
    mod: 'exploit(academy/gateway_access)',
    lines: [
      { text: 'use exploit/academy/gateway_access', type: true, cls: 'p0', wait: 500 },
      { text: '[*] No payload configured, defaulting to academy/student/shell', cls: 'info', wait: 400 },
      { text: 'set RHOSTS backtrack.academy', type: true, cls: 'p1', wait: 450 },
      { text: 'RHOSTS => backtrack.academy', cls: 'out', wait: 400 },
      { text: 'exploit', type: true, cls: 'p1', wait: 600 },
      { text: '[*] Started reverse handler on 0.0.0.0:4444', cls: 'info', wait: 700 },
      { text: '[*] Fingerprinting target ...', cls: 'info', wait: 900 },
      { text: '[*] Negotiating encrypted channel (TLS 1.3)', cls: 'info', wait: 900 },
      { text: '[*] Sending stage (1/3) ...', cls: 'info', wait: 700 },
      { text: '[+] Credentials accepted', cls: 'ok', wait: 500 },
      { text: '[+] Session 1 opened: student@backtrack', cls: 'ok', wait: 900 },
    ],
  },
  register: {
    mod: 'auxiliary(academy/enroll)',
    lines: [
      { text: 'use auxiliary/academy/enroll', type: true, cls: 'p0', wait: 500 },
      { text: 'set ROLE student', type: true, cls: 'p1', wait: 450 },
      { text: 'ROLE => student', cls: 'out', wait: 400 },
      { text: 'run', type: true, cls: 'p1', wait: 600 },
      { text: '[*] Allocating workspace ...', cls: 'info', wait: 900 },
      { text: '[*] Provisioning lab environment', cls: 'info', wait: 900 },
      { text: '[*] Generating encrypted profile', cls: 'info', wait: 800 },
      { text: '[+] Enrollment slot reserved', cls: 'ok', wait: 500 },
      { text: '[+] Awaiting your credentials', cls: 'ok', wait: 900 },
    ],
  },
  recover: {
    mod: 'auxiliary(academy/credential_reset)',
    lines: [
      { text: 'use auxiliary/academy/credential_reset', type: true, cls: 'p0', wait: 500 },
      { text: 'set TARGET student', type: true, cls: 'p1', wait: 450 },
      { text: 'TARGET => student', cls: 'out', wait: 400 },
      { text: 'run', type: true, cls: 'p1', wait: 600 },
      { text: '[*] Verifying identity ...', cls: 'info', wait: 900 },
      { text: '[*] Generating one-time token', cls: 'info', wait: 900 },
      { text: '[*] Token expires in 60 minutes', cls: 'info', wait: 700 },
      { text: '[+] Ready to send recovery link', cls: 'ok', wait: 900 },
    ],
  },
  resend: {
    mod: 'auxiliary(academy/confirm_mailer)',
    lines: [
      { text: 'use auxiliary/academy/confirm_mailer', type: true, cls: 'p0', wait: 500 },
      { text: 'run', type: true, cls: 'p1', wait: 600 },
      { text: '[*] Looking up pending verification ...', cls: 'info', wait: 900 },
      { text: '[*] Queueing message', cls: 'info', wait: 800 },
      { text: '[+] Ready to dispatch confirmation', cls: 'ok', wait: 900 },
    ],
  },
}

const MOD = computed(() => scenes[props.variant].mod)
const script = scenes[props.variant].lines

const shown = ref<{ prefix: string, text: string, cls: string }[]>([])
const done = ref(false)
const timers: ReturnType<typeof setTimeout>[] = []

function prefixFor(cls?: string) {
  return cls === 'p0' || cls === 'p1' ? cls : ''
}

const sleep = (ms: number) => new Promise<void>(r => timers.push(setTimeout(r, ms)))
let cancelled = false

async function run() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  for (const line of script) {
    if (cancelled)
      return
    const entry = { prefix: prefixFor(line.cls), text: '', cls: line.cls ?? '' }
    shown.value.push(entry)
    const idx = shown.value.length - 1
    if (line.type && !reduce) {
      for (const ch of line.text) {
        if (cancelled)
          return
        shown.value[idx].text += ch
        await sleep(45 + Math.random() * 55)
      }
    }
    else {
      shown.value[idx].text = line.text
    }
    if (!reduce)
      await sleep(line.wait ?? 400)
  }
  done.value = true
}

onMounted(run)
onBeforeUnmount(() => {
  cancelled = true
  timers.forEach(clearTimeout)
})
</script>

<template>
  <div aria-hidden="true" class="term font-mono text-[13px] leading-6 text-foreground-muted min-h-[520px]">
    <div v-for="(l, i) in shown" :key="i" class="whitespace-pre-wrap" :class="`l-${l.cls}`">
      <template v-if="l.prefix">
        <span class="text-foreground-subtle">{{ PROMPT }}</span>
        <span v-if="l.cls === 'p1'" class="text-primary-text">{{ ' ' + MOD }}</span>
        <span class="text-foreground-subtle">{{ " > " }}</span>
      </template>
      <span :class="{ 'text-foreground': l.prefix }">{{ l.text }}</span><span v-if="i === shown.length - 1 && !done" class="term-cursor" />
    </div>

    <div v-if="done" class="term-final mt-10">
      <p class="font-oswald font-bold uppercase text-5xl xl:text-7xl leading-[0.95] text-foreground">
        Happy<br>Hacking<span class="term-cursor term-cursor--lg" />
      </p>
      <p class="mt-6 font-mono text-sm text-foreground-muted">
        Comienza tu carrera en Ciberseguridad
      </p>
    </div>
  </div>
</template>

<style scoped>
.l-info { color: hsl(var(--foreground-muted)); }
.l-ok { color: hsl(var(--primary-text)); }
.l-out { color: hsl(var(--foreground-subtle)); }

.term-cursor {
  display: inline-block;
  width: 0.55em;
  height: 1.05em;
  margin-left: 2px;
  vertical-align: text-bottom;
  background: hsl(var(--primary));
}
.term-cursor--lg {
  width: 0.3em;
  height: 0.75em;
  margin-left: 0.12em;
  vertical-align: baseline;
}
.term-final { animation: final-in 400ms var(--ease-out) both; }

@keyframes final-in { from { opacity: 0; transform: translateY(10px); } }
@media (prefers-reduced-motion: reduce) {
  .term-final { animation: none; }
}
</style>
