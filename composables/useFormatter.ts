export function useFormatter() {
  function convertToHours(duration: string): string {
    // Si no hay duración, retornar un valor por defecto
    if (!duration)
      return '0h 0m'

    // Extraer los números de la cadena y convertirlos a números
    const numbers = (duration.match(/\d+/g) || [])
    const totalMinutes = numbers.reduce((acc, curr) => acc + Number(curr), 0)

    // Convertir minutos a horas y minutos
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return `${hours ? `${hours}h` : ''} ${minutes ? `${minutes}m` : ''}`.trim() || '0h 0m'
  }

  function timeAgo(date: string): string {
    const now = new Date()
    const past = new Date(date)
    const diff = now.getTime() - past.getTime()

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30)
    const years = Math.floor(months / 12)

    if (years > 0)
      return `hace ${years} ${years === 1 ? 'año' : 'años'}`
    if (months > 0)
      return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`
    if (days > 0)
      return `hace ${days} ${days === 1 ? 'día' : 'días'}`
    if (hours > 0)
      return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`
    if (minutes > 0)
      return `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
    return 'hace unos segundos'
  }

  // Fecha para notificaciones: relativa hasta una semana ("Hace 5 min", "Ayer"), luego absoluta ("12 sep 2021").
  function notificationDate(date: string): string {
    const past = new Date(date)
    if (Number.isNaN(past.getTime()))
      return ''
    const now = new Date()
    const minutes = Math.floor((now.getTime() - past.getTime()) / 60000)
    if (minutes < 1)
      return 'Ahora'
    if (minutes < 60)
      return `Hace ${minutes} min`
    if (minutes < 60 * 24)
      return `Hace ${Math.floor(minutes / 60)} h`
    const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    const days = Math.round((startOf(now) - startOf(past)) / 86400000)
    if (days === 1)
      return 'Ayer'
    if (days < 7)
      return `Hace ${days} días`
    const text = past.toLocaleDateString('es', {
      day: 'numeric',
      month: 'short',
      ...(past.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
    })
    return text.replace(/\./g, '').replace(/ de /g, ' ')
  }

  // "HH:MM:SS" -> whole hours (rounded). Empty/invalid -> 0.
  function clockToHours(clock?: string | null): number {
    if (!clock)
      return 0
    const [h = '0', m = '0'] = clock.split(':')
    return Math.round((Number.parseInt(h) || 0) + (Number.parseInt(m) || 0) / 60)
  }

  // Seconds -> "2h 15m" / "40m"
  function secondsToHM(seconds: number): string {
    if (!seconds || seconds <= 0)
      return '0m'
    const h = Math.floor(seconds / 3600)
    const m = Math.round((seconds % 3600) / 60)
    return [h ? `${h}h` : '', m || !h ? `${m}m` : ''].filter(Boolean).join(' ')
  }

  return {
    clockToHours,
    secondsToHM,
    convertToHours,
    timeAgo,
    notificationDate,
  }
}
