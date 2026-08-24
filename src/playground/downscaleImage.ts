/**
 * Uploaded assets are held in the config as base64 data URLs and persisted to
 * localStorage, so a phone photo can be tens of megabytes once encoded and blow
 * the storage quota. Nothing in the checkout renders wider than the device
 * frame, so a full-resolution original buys no fidelity — shrink it on the way in.
 *
 * Falls back to the untouched data URL whenever anything goes wrong; a slightly
 * too-large image is a much better outcome than a failed upload.
 */

const MAX_EDGE = 1600
const MAX_BYTES = 1_500_000

export function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error ?? new Error('read failed'))
    reader.onload = ev => {
      const original = ev.target?.result
      if (typeof original !== 'string') { reject(new Error('unexpected reader result')); return }
      downscale(original).then(resolve).catch(() => resolve(original))
    }
    reader.readAsDataURL(file)
  })
}

function downscale(dataUrl: string): Promise<string> {
  // SVG is already tiny and rasterising it would throw away its scalability.
  if (dataUrl.startsWith('data:image/svg')) return Promise.resolve(dataUrl)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onerror = () => reject(new Error('decode failed'))
    img.onload = () => {
      const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height))
      if (scale === 1 && dataUrl.length <= MAX_BYTES) { resolve(dataUrl); return }

      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(img.width * scale))
      canvas.height = Math.max(1, Math.round(img.height * scale))
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('no 2d context')); return }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // WebP keeps transparency (logos and item icons need it) and is far
      // smaller than PNG for photographic backgrounds.
      const encoded = canvas.toDataURL('image/webp', 0.9)
      resolve(encoded.startsWith('data:image/webp') && encoded.length < dataUrl.length ? encoded : dataUrl)
    }
    img.src = dataUrl
  })
}
