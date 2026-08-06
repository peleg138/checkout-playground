import { useCallback, useEffect, useRef, useState } from 'react'

const fadeMask = (px: number) =>
  `linear-gradient(to bottom, #000 calc(100% - ${px}px), transparent 100%)`

/**
 * Bottom fade for a scrollable list. Applied as a mask rather than a gradient
 * overlay so it works over both the game background and white, and dropped once
 * scrolled to the end so the last row renders at full opacity.
 *
 * Spread `maskStyle` into the scroll container's style and pass `ref`/`onScroll`
 * to it. `deps` re-measures when the content or its visibility changes, and
 * `fadePx` tunes how far the fade reaches — shorter reads gentler.
 */
export function useScrollFade(deps: unknown[] = [], fadePx = 18) {
  const ref = useRef<HTMLDivElement>(null)
  const [faded, setFaded] = useState(false)

  const onScroll = useCallback(() => {
    const el = ref.current
    if (!el) return
    setFaded(el.scrollHeight - el.clientHeight - el.scrollTop > 4)
  }, [])

  useEffect(() => {
    const raf = requestAnimationFrame(onScroll)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onScroll, ...deps])

  return {
    ref,
    onScroll,
    maskStyle: faded
      ? { maskImage: fadeMask(fadePx), WebkitMaskImage: fadeMask(fadePx) }
      : undefined,
  }
}
