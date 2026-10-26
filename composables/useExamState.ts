import type { ExamEntry, ExamState } from '~/interfaces/specialties'

interface ExamView {
  label: string
  /** Texto del botón; sin él la fila no tiene acción (examen bloqueado). */
  action?: string
  icon: string
  tone: 'muted' | 'primary' | 'success' | 'warning'
}

const VIEWS: Record<ExamState, ExamView> = {
  locked: { label: 'Completa el curso para habilitarlo', icon: 'lucide:lock', tone: 'muted' },
  ready: { label: 'Listo para rendir', action: 'Rendir examen', icon: 'lucide:file-check-2', tone: 'primary' },
  in_progress: { label: 'Examen en curso', action: 'Continuar examen', icon: 'lucide:timer', tone: 'warning' },
  finished: { label: 'No aprobado', action: 'Ver resultado', icon: 'lucide:file-text', tone: 'warning' },
  approved: { label: 'Aprobado', action: 'Ver resultado', icon: 'lucide:badge-check', tone: 'success' },
  no_opportunities: { label: 'Sin oportunidades disponibles', action: 'Ver planes', icon: 'lucide:ticket-x', tone: 'muted' },
}

// Una sola lectura del estado de un examen (curso o especialidad) para listados, fichas y el hub de exámenes.
export function useExamState() {
  const viewOf = (exam: ExamEntry): ExamView => VIEWS[exam.state]

  // El examen completo se rinde en /examen/:id; sin oportunidades, la salida es la compra.
  function hrefOf(exam: ExamEntry): string | null {
    if (exam.state === 'locked')
      return null
    return exam.state === 'no_opportunities' ? '/suscripciones/extras' : `/examen/${exam.id}`
  }

  return { viewOf, hrefOf }
}
