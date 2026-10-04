// Muchos títulos de clase ya vienen numerados ("01.- Introducción"); la interfaz agrega su propio número, así que se quita el prefijo.
export function lessonTitle(title?: string | null): string {
  const clean = (title ?? '').replace(/^\s*\d+\s*[.\-–—)]+\s*/, '').trim()
  return capitalizeFirst(clean || (title ?? '').trim())
}

// Los títulos llegan tal como se cargaron ("desarrollo de IAC avanzado"): la primera letra siempre en mayúscula.
export function capitalizeFirst(text?: string | null): string {
  const value = (text ?? '').trim()
  return value.charAt(0).toLocaleUpperCase('es') + value.slice(1)
}
