// Escribir artículos: administradores, contenido, bloggers y docentes (la API vuelve a validarlo).
export default defineNuxtRouteMiddleware(async () => {
  const { canWrite } = await useUserRole()
  if (!canWrite.value)
    return navigateTo('/articulos')
})
