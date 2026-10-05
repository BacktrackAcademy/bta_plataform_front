import type { DiscussionKind } from '@/interfaces/discussion.response'

// Tipos de debate con foco comunitario: no solo preguntar, también compartir y colaborar.
export const DISCUSSION_KINDS: { value: DiscussionKind, label: string, icon: string, hint: string, titlePlaceholder: string, bodyPlaceholder: string }[] = [
  { value: 'question', label: 'Pregunta', icon: 'lucide:circle-help', hint: 'Pide ayuda a la comunidad', titlePlaceholder: 'Ej: ¿Cómo instalar nmap en Windows 10?', bodyPlaceholder: '¿Qué intentaste? ¿Qué resultado esperabas y cuál obtuviste?' },
  { value: 'finding', label: 'Hallazgo', icon: 'lucide:lightbulb', hint: 'Comparte algo que descubriste', titlePlaceholder: 'Ej: Descubrí un bypass en el login de una máquina de práctica', bodyPlaceholder: 'Cuenta qué encontraste, cómo lo reproduces y qué aprendiste.' },
  { value: 'resource', label: 'Recurso', icon: 'lucide:bookmark', hint: 'Una herramienta, lectura o guía útil', titlePlaceholder: 'Ej: Guía práctica para enumerar SMB paso a paso', bodyPlaceholder: '¿Por qué lo recomiendas y a quién le sirve?' },
  { value: 'challenge', label: 'Reto / CTF', icon: 'lucide:flag', hint: 'Resolvamos algo en comunidad', titlePlaceholder: 'Ej: Writeup de la máquina «Blue» — ¿otros caminos?', bodyPlaceholder: 'Describe el reto, qué has avanzado y dónde estás atascado (sin spoilers si es posible).' },
  { value: 'bug', label: 'Error de herramienta', icon: 'lucide:bug', hint: 'Reporta un fallo con su log', titlePlaceholder: 'Ej: Metasploit falla al iniciar msfdb en Kali 2025', bodyPlaceholder: 'Pega el log del error y explica cómo te ocurrió.' },
]

export const kindMeta = (kind?: string) => DISCUSSION_KINDS.find(k => k.value === kind) ?? DISCUSSION_KINDS[0]
