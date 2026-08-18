'use client'

import { useRef } from 'react'
import styles from './login.module.css'

export type OtpInputProps = {
  value: string
  onChange: (next: string) => void
  length?: number
  invalid?: boolean
  autoFocus?: boolean
  label: string
}

/**
 * Six single-character boxes. Each box carries data-secret so the mascot
 * treats the whole group the way it treats a password field.
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  invalid = false,
  autoFocus = false,
  label,
}: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([])

  const focusBox = (index: number) => {
    refs.current[Math.max(0, Math.min(length - 1, index))]?.focus()
  }

  const setChar = (index: number, char: string) => {
    const chars = value.padEnd(length, ' ').split('')
    chars[index] = char || ' '
    onChange(chars.join('').replace(/\s+$/, ''))
  }

  return (
    <div className={styles.otpGrid} role="group" aria-label={label}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el
          }}
          className={styles.otpBox}
          data-secret="true"
          data-invalid={invalid}
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          aria-label={`${label} ${index + 1}`}
          autoFocus={autoFocus && index === 0}
          value={value[index] ?? ''}
          onChange={(event) => {
            const digit = event.target.value.replace(/\D/g, '').slice(-1)
            setChar(index, digit)
            if (digit) focusBox(index + 1)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Backspace' && !value[index]) {
              event.preventDefault()
              setChar(index - 1, '')
              focusBox(index - 1)
            }
            if (event.key === 'ArrowLeft') {
              event.preventDefault()
              focusBox(index - 1)
            }
            if (event.key === 'ArrowRight') {
              event.preventDefault()
              focusBox(index + 1)
            }
          }}
          onPaste={(event) => {
            event.preventDefault()
            const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
            if (!pasted) return
            onChange(pasted)
            focusBox(pasted.length)
          }}
        />
      ))}
    </div>
  )
}
