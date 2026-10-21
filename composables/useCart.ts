interface CartState {
  plan: number | null
  addons: Record<number, number> // product_id -> cantidad
}

const STORAGE_KEY = 'bta-cart'
const MAX_QUANTITY = 20

// Carrito del usuario (suscripción + packs de oportunidades/vouchers). Vive en el navegador hasta pagar.
export function useCart() {
  const cart = useState<CartState>('cart', () => ({ plan: null, addons: {} }))
  const hydrated = useState('cart-hydrated', () => false)

  if (import.meta.client && !hydrated.value) {
    hydrated.value = true
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
      if (saved && typeof saved === 'object')
        cart.value = { plan: saved.plan ?? null, addons: saved.addons ?? {} }
    }
    catch {}
    watch(cart, (v) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(v))
      }
      catch {}
    }, { deep: true })
  }

  const addonCount = computed(() => Object.values(cart.value.addons).reduce((a, b) => a + b, 0))
  const count = computed(() => addonCount.value + (cart.value.plan ? 1 : 0))

  function setPlan(id: number | null) {
    cart.value.plan = id
  }
  function addAddon(id: number) {
    cart.value.addons = { ...cart.value.addons, [id]: Math.min((cart.value.addons[id] ?? 0) + 1, MAX_QUANTITY) }
  }
  function setQuantity(id: number, qty: number) {
    const { [id]: _, ...rest } = cart.value.addons
    cart.value.addons = qty > 0 ? { ...rest, [id]: Math.min(qty, MAX_QUANTITY) } : rest
  }
  function clearAddons() {
    cart.value.addons = {}
  }

  return { cart, count, addonCount, setPlan, addAddon, setQuantity, clearAddons, MAX_QUANTITY }
}
