// URLs antiguas /perfil/:username[/seguidores|/siguiendo] -> /@username (301).
// /perfil y /perfil/editar siguen siendo páginas propias de la app.
const RESERVED = new Set(['editar'])

export default defineEventHandler((event) => {
  const path = event.path.split('?')[0]
  const match = path.match(/^\/perfil\/([^/]+)(\/(seguidores|siguiendo))?\/?$/)
  if (!match || RESERVED.has(match[1])) {
    return
  }
  return sendRedirect(event, `/@${match[1]}${match[2] ?? ''}`, 301)
})
