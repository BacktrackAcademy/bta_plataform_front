// Muchos títulos de clase ya vienen numerados ("01.- Introducción"); la interfaz agrega su propio número, así que se quita el prefijo.
export function lessonTitle(title?: string | null): string {
  const clean = (title ?? '').replace(/^\s*\d+\s*[.\-–—)]+\s*/, '').trim()
  return clean || (title ?? '').trim()
}
