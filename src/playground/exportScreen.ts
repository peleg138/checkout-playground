/**
 * Exports the device frame — just the checkout screen, not the surrounding
 * playground chrome — as a PNG.
 *
 * The frame on screen is a shrunk view: the checkout renders at its true
 * device size (375×812 in portrait) and is then scaled down to fit the canvas.
 * Capturing what you see would rasterise that shrunk version, so we capture the
 * unscaled element instead and multiply it up — the result is a real 3× device
 * render rather than an upscaled screenshot.
 */

import { toBlob } from 'html-to-image'

/** 3× puts a portrait frame at 1125×2436 — iPhone-native resolution. */
const PIXEL_RATIO = 3

type Restore = () => void

/**
 * html-to-image works from a deep clone, and a clone always starts at scroll
 * offset 0 — so a checkout the user has scrolled would export from the top
 * rather than from what's actually on screen. Convert each scroll offset into a
 * negative margin, which the clone does carry. The live frame looks identical
 * while this is in place, so nothing flickers during the capture.
 */
function freezeScroll(root: HTMLElement): Restore {
  const restores: Restore[] = []

  for (const el of [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]) {
    const offset = el.scrollTop
    const child = el.firstElementChild as HTMLElement | null
    if (offset <= 0 || !child) continue

    const prevMargin = child.style.marginTop
    const prevOverflow = el.style.overflowY
    child.style.marginTop = `${-offset}px`
    el.style.overflowY = 'hidden'
    el.scrollTop = 0

    restores.push(() => {
      child.style.marginTop = prevMargin
      el.style.overflowY = prevOverflow
      el.scrollTop = offset
    })
  }

  return () => restores.forEach(restore => restore())
}

/**
 * The frame's rounded corners live on the scaled-down outer element, so read
 * the radius back out in the inner element's own coordinates.
 */
function innerCornerRadius(inner: HTMLElement): number {
  const outer = inner.parentElement
  if (!outer || !inner.offsetWidth) return 0
  const scale = outer.offsetWidth / inner.offsetWidth
  const radius = parseFloat(getComputedStyle(outer).borderTopLeftRadius) || 0
  return scale > 0 ? radius / scale : radius
}

export interface ExportResult {
  width: number
  height: number
  filename: string
}

/**
 * `inner` is the unscaled element inside the device frame. Resolves once the
 * download has been handed to the browser.
 */
export async function exportScreenPng(inner: HTMLElement, label: string): Promise<ExportResult> {
  // offsetWidth/Height ignore transforms, so these are the true device pixels.
  const width = inner.offsetWidth
  const height = inner.offsetHeight
  const radius = innerCornerRadius(inner)

  const unfreeze = freezeScroll(inner)
  let blob: Blob | null
  try {
    // A blob rather than a data URL: a desktop frame at 3× runs to several
    // megabytes, and handing that to a download as base64 is needlessly fragile.
    blob = await toBlob(inner, {
      width,
      height,
      pixelRatio: PIXEL_RATIO,
      style: {
        // Undo the frame's display scaling and its absolute placement so the
        // clone renders at full size from the top-left of the capture area.
        transform: 'none',
        transformOrigin: 'top left',
        position: 'static',
        margin: '0',
        // Keep the frame's rounded corners; the outside stays transparent.
        borderRadius: `${radius}px`,
        overflow: 'hidden',
      },
    })
  } finally {
    unfreeze()
  }
  if (!blob) throw new Error('capture produced no image')

  const filename = `appcharge-checkout-${label}-${stamp()}.png`
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = filename
  link.href = url
  link.click()
  // Give the browser the tick it needs to start the download before the URL goes.
  setTimeout(() => URL.revokeObjectURL(url), 10_000)

  return { width: width * PIXEL_RATIO, height: height * PIXEL_RATIO, filename }
}

function stamp(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}
