// Puntaje del usuario (reputación) para el chip del topbar. Se refresca al navegar: dar like, comentar o estudiar suma puntos.
interface ScoreState { score: number, position: number | null }

export function useScore() {
  const { $api } = useNuxtApp()
  const state = useState<ScoreState | null>('user-score', () => null)

  async function refresh() {
    try {
      const r = await $api<ScoreState>('/ranking/me')
      state.value = { score: r.score ?? 0, position: r.position ?? null }
    }
    catch {
      // El chip es decorativo: sin respuesta se queda con el último valor.
    }
  }

  return { score: state, refresh }
}
