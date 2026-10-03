/** Pointer handler for cards with a cursor-following spotlight (exposes --mx / --my on the element). */
export function useSpotlight() {
  function onPointerMove(e: PointerEvent) {
    const el = e.currentTarget as HTMLElement
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return { onPointerMove }
}
