// Pantallas de revisión editorial: solo administradores (la API vuelve a validarlo).
export default defineNuxtRouteMiddleware(async () => {
  const { isAdmin } = await useUserRole()
  if (!isAdmin.value)
    return navigateTo('/dashboard')
})
