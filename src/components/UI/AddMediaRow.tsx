import React, { useRef, useState } from 'react'

interface AddMediaRowProps {
  label: string
  value?: File | null
  previewUrl?: string
  onChange?: (file: File | null) => void
  accept?: string
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="7.5" stroke="#9CA3AF" />
      <text x="8" y="12" textAnchor="middle" fontSize="9" fill="#9CA3AF" fontFamily="sans-serif" fontWeight="600">i</text>
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 2l6 6M8 2l-6 6" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function isImageFile(file: File) {
  return file.type.startsWith('image/')
}

function FilePreview({ file, previewUrl }: { file: File; previewUrl?: string }) {
  const [imgSrc, setImgSrc] = useState<string | null>(previewUrl ?? null)

  React.useEffect(() => {
    if (previewUrl) { setImgSrc(previewUrl); return }
    if (!isImageFile(file)) { setImgSrc(null); return }
    const url = URL.createObjectURL(file)
    setImgSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [file, previewUrl])

  if (imgSrc) {
    return <img src={imgSrc} alt={file.name} className="w-full h-full object-cover" />
  }

  // Non-image file (e.g. JSON / Lottie) — show animation-style placeholder
  return (
    <div className="flex items-center justify-center w-full h-full">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" stroke="#F59E0B" strokeWidth="3" strokeDasharray="6 4" />
        <circle cx="16" cy="16" r="5" fill="#F59E0B" />
      </svg>
    </div>
  )
}

export function AddMediaRow({ label, value, previewUrl, onChange, accept }: AddMediaRowProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => inputRef.current?.click()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    onChange?.(file)
    e.target.value = ''
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(null)
  }

  return (
    <div
      className="flex items-center justify-between w-full bg-white"
      style={{
        height: 80,
        borderRadius: 12,
        border: '1px dashed #D1D5DB',
        paddingLeft: 22,
        paddingRight: 22,
      }}
    >
      {/* Left: info icon + label */}
      <div className="flex items-center gap-2">
        <InfoIcon />
        <span style={{ fontSize: 13, fontWeight: 500, color: '#111827', lineHeight: '16px' }}>
          {label}
        </span>
      </div>

      {/* Right: empty → Add Media button | filled → thumbnail */}
      {value ? (
        <div
          className="relative flex-shrink-0 overflow-hidden"
          style={{ width: 134, height: 52, borderRadius: 6, background: '#E5E7EB' }}
        >
          <FilePreview file={value} previewUrl={previewUrl} />

          {/* filename overlay */}
          <div
            className="absolute bottom-0 left-0 right-0 flex items-center"
            style={{ height: 20, background: 'rgba(0,0,0,0.45)', paddingLeft: 6, paddingRight: 22 }}
          >
            <span
              className="block truncate"
              style={{ fontSize: 9, color: '#fff', fontWeight: 500, lineHeight: '11px' }}
            >
              {value.name}
            </span>
          </div>

          {/* X button — top-right */}
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove"
            className="absolute flex items-center justify-center"
            style={{
              top: 6,
              right: 6,
              width: 26,
              height: 26,
              borderRadius: 8,
              background: 'rgba(30,30,30,0.75)',
            }}
          >
            <XIcon />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className="flex-shrink-0 inline-flex items-center justify-center gap-2 select-none transition-colors hover:bg-gray-50 active:bg-gray-100"
          style={{
            width: 128,
            height: 40,
            borderRadius: 8,
            border: '1px solid #111827',
            background: '#fff',
            fontSize: 13,
            fontWeight: 500,
            color: '#111827',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1, marginTop: -1 }}>+</span>
          <span>Add Media</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
