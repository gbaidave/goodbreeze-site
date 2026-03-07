'use client'

import { useEffect, useRef, useState } from 'react'

interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: Option[]
  /** Classes applied to the trigger button — controls size, border, background, text color */
  className?: string
  /** Minimum width of the dropdown panel. Defaults to 'min-w-full'. */
  dropdownMinWidth?: string
  id?: string
}

/**
 * Custom dropdown that matches the Services nav dropdown style:
 * dark bg-[#2a2a2a] panel with border-primary/50, white text, hover:bg-primary/30 items.
 *
 * Replaces native <select> which cannot be styled in most browsers.
 */
export function CustomSelect({
  value,
  onChange,
  options,
  className = '',
  dropdownMinWidth = 'min-w-full',
  id,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selectedLabel = options.find((o) => o.value === value)?.label ?? value

  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  return (
    <div ref={ref} className="relative" id={id}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center justify-between gap-2 ${className}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{selectedLabel}</span>
        <svg
          className={`w-3.5 h-3.5 shrink-0 opacity-60 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className={`absolute top-full mt-1 left-0 bg-[#2a2a2a] border-2 border-primary/50 rounded-lg shadow-2xl shadow-primary/30 overflow-hidden z-50 ${dropdownMinWidth}`}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              className={`block w-full text-left px-4 py-2.5 text-sm font-medium transition-all duration-150 whitespace-nowrap ${
                opt.value === value
                  ? 'bg-primary/30 text-white'
                  : 'text-white hover:bg-primary/20'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
