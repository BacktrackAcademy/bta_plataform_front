// La app autenticada nunca se indexa: el contenido público (cursos, especialidades, artículos, debates)
// vive en backtrackacademy.com. Los perfiles públicos se indexan allí (canonical a ese dominio), no aquí.
export default defineEventHandler((event) => {
  setHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
})
