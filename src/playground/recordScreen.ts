/**
 * Records the device frame — just the checkout screen, not the surrounding
 * playground chrome — as a video, so an interaction can be demonstrated rather
 * than described: applying a promo code, opening the details, walking a sheet.
 *
 * The PNG export can't be reused frame by frame; a single capture there takes
 * the better part of a second. This instead captures the tab through
 * getDisplayMedia and copies only the frame's rectangle into a canvas each
 * frame, which the MediaRecorder encodes. The crop rectangle is re-measured
 * every frame, so scrolling the playground or resizing the window mid-take
 * doesn't slide the checkout out of shot.
 */

/** MP4 first: it drops straight into Keynote, Figma and Slack. WebM is the fallback. */
const MIME_CANDIDATES = [
  'video/mp4;codecs=avc1.4d002a',
  'video/mp4',
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
]

const FPS = 60
const BITRATE = 16_000_000

function pickMime(): string {
  return MIME_CANDIDATES.find(m => MediaRecorder.isTypeSupported(m)) ?? ''
}

function extensionFor(mime: string): string {
  return mime.startsWith('video/mp4') ? 'mp4' : 'webm'
}

export interface RecordingResult {
  filename: string
  width: number
  height: number
  seconds: number
  sizeBytes: number
}

export interface Recording {
  /** Finishes the take, downloads the file, and releases the capture. */
  stop: () => Promise<RecordingResult>
  /** Throws the take away and releases the capture. */
  cancel: () => void
  /** Fires if the capture ends on its own — e.g. the browser's own Stop sharing. */
  onEndedExternally: (cb: () => void) => void
}

/**
 * `inner` is the unscaled element inside the device frame — the same node the
 * PNG export captures. We record its parent, which is the frame exactly as it
 * appears on screen, rounded corners and all.
 *
 * Rejects if the user dismisses the screen-capture picker.
 */
export async function startScreenRecording(inner: HTMLElement, label: string): Promise<Recording> {
  const frame = inner.parentElement ?? inner

  // preferCurrentTab collapses Chrome's picker down to just this tab, so the
  // user confirms rather than hunts. It's Chromium-only and simply ignored
  // elsewhere, which is why it's cast rather than typed.
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { frameRate: FPS },
    audio: false,
    preferCurrentTab: true,
  } as DisplayMediaStreamOptions)

  // The crop maps CSS pixels onto the captured image by assuming the capture is
  // this tab's viewport. Share a whole screen or another window and that
  // assumption breaks — the crop would land somewhere arbitrary — so stop here
  // rather than hand back a video of the wrong thing.
  const surface = stream.getVideoTracks()[0]?.getSettings().displaySurface
  if (surface && surface !== 'browser') {
    stream.getTracks().forEach(t => t.stop())
    throw new Error('WRONG_SURFACE')
  }

  const video = document.createElement('video')
  video.srcObject = stream
  video.muted = true
  await video.play()

  // Ratio between the captured tab image and CSS pixels, so element rectangles
  // can be mapped into the video's coordinate space.
  const sourceScale = video.videoWidth / window.innerWidth

  // Output size is fixed for the whole take — MediaRecorder can't follow a
  // canvas that resizes. Measured once, at capture resolution, and rounded to
  // even numbers because H.264 requires it.
  const start = frame.getBoundingClientRect()
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(2, Math.round(start.width * sourceScale / 2) * 2)
  canvas.height = Math.max(2, Math.round(start.height * sourceScale / 2) * 2)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    stream.getTracks().forEach(t => t.stop())
    throw new Error('could not create a 2d context for the recording')
  }

  let running = true
  const drawFrame = () => {
    if (!running) return
    // Re-measured every frame so the crop tracks the frame if the page moves.
    const r = frame.getBoundingClientRect()
    ctx.drawImage(
      video,
      r.left * sourceScale, r.top * sourceScale,
      r.width * sourceScale, r.height * sourceScale,
      0, 0, canvas.width, canvas.height,
    )
    schedule()
  }

  // requestVideoFrameCallback fires once per captured frame, so the recording
  // tracks the real capture rate instead of guessing at it.
  const useRvfc = 'requestVideoFrameCallback' in video
  let rafId = 0
  const schedule = () => {
    if (useRvfc) (video as any).requestVideoFrameCallback(drawFrame)
    else rafId = requestAnimationFrame(drawFrame)
  }
  schedule()

  const mimeType = pickMime()
  const recorder = new MediaRecorder(canvas.captureStream(FPS), {
    ...(mimeType ? { mimeType } : {}),
    videoBitsPerSecond: BITRATE,
  })
  const chunks: Blob[] = []
  recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data) }
  recorder.start()
  const startedAt = performance.now()

  const release = () => {
    running = false
    if (!useRvfc) cancelAnimationFrame(rafId)
    stream.getTracks().forEach(t => t.stop())
    video.srcObject = null
  }

  return {
    onEndedExternally(cb) {
      stream.getVideoTracks()[0]?.addEventListener('ended', cb)
    },

    cancel() {
      if (recorder.state !== 'inactive') recorder.stop()
      release()
    },

    async stop() {
      const seconds = (performance.now() - startedAt) / 1000
      const done = new Promise<void>(resolve => { recorder.onstop = () => resolve() })
      if (recorder.state !== 'inactive') recorder.stop()
      await done
      release()

      const type = recorder.mimeType || mimeType || 'video/webm'
      const blob = new Blob(chunks, { type })
      const filename = `appcharge-checkout-${label}-${stamp()}.${extensionFor(type)}`

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = filename
      link.href = url
      link.click()
      // Give the browser its tick to start the download before the URL goes.
      setTimeout(() => URL.revokeObjectURL(url), 10_000)

      return { filename, width: canvas.width, height: canvas.height, seconds, sizeBytes: blob.size }
    },
  }
}

function stamp(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}
