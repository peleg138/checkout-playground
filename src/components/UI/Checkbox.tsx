import React from 'react'

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}

export function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-start gap-2 text-left">
      <div className={[
        'w-4 h-4 rounded-[4px] flex items-center justify-center flex-shrink-0 transition-all shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]',
        checked ? 'bg-[#448ae3]' : 'bg-white border border-[#e4e4e7]',
      ].join(' ')}>
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <span className="text-[12px] font-medium text-black leading-normal">{label}</span>
    </button>
  )
}
