import { useEffect } from 'react'
import type { RefObject } from 'react'

/** Nearest ancestor that actually scrolls, starting above `from`. */
function findScroller(from: HTMLElement | null): HTMLElement | null {
  let el = from?.parentElement ?? null
  while (el) {
    const overflowY = getComputedStyle(el).overflowY
    if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) return el
    el = el.parentElement
  }
  return null
}

/**
 * Bottom sheets live inside the device frame's scroll container. While a sheet
 * is open the content behind it must stay put — otherwise the frame scrolls
 * under the sheet and the Pay button and footer show through below it.
 *
 * Wheel/touch stopPropagation does not do this: the browser scrolls the nearest
 * scrollable ancestor of the event target no matter what the handler does. The
 * only reliable lock is taking the overflow away for as long as the sheet is up.
 */
export function useSheetScrollLock(active: boolean, ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!active) return
    const scroller = findScroller(ref.current)
    if (!scroller) return

    const top = scroller.scrollTop
    const previous = scroller.style.overflowY
    scroller.style.overflowY = 'hidden'
    scroller.scrollTop = top

    return () => {
      scroller.style.overflowY = previous
      scroller.scrollTop = top
    }
  }, [active, ref])
}
