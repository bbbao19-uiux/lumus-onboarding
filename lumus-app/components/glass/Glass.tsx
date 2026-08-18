'use client'

import { useId } from 'react'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import styles from './glass.module.css'

function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}

/* --- Card -----------------------------------------------------------------
 * The glass material itself lives in the global `lg` recipe (styles/glass.css)
 * so the specular rim and edge lensing are defined in exactly one place.
 * ------------------------------------------------------------------------- */

export type GlassCardProps = ComponentPropsWithRef<'div'> & {
  tone?: 'default' | 'thin' | 'thick'
  pad?: 'none' | 'sm' | 'md' | 'lg'
  press?: boolean
}

export function GlassCard({
  tone = 'default',
  pad = 'md',
  press = false,
  className,
  children,
  ...rest
}: GlassCardProps) {
  return (
    <div
      className={cx(
        'lg',
        tone === 'thin' && 'lgThin',
        tone === 'thick' && 'lgThick',
        press && 'lgPress',
        styles.card,
        className,
      )}
      data-pad={pad}
      {...rest}
    >
      {children}
    </div>
  )
}

/* --- Button --------------------------------------------------------------- */

export type GlassButtonProps = ComponentPropsWithRef<'button'> & {
  variant?: 'primary' | 'glass' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  full?: boolean
}

export function GlassButton({
  variant = 'glass',
  size = 'md',
  full = false,
  className,
  type = 'button',
  ...rest
}: GlassButtonProps) {
  return (
    <button
      type={type}
      className={cx(styles.button, className)}
      data-variant={variant}
      data-size={size}
      data-full={full}
      {...rest}
    />
  )
}

/* --- Field ---------------------------------------------------------------- */

export type GlassFieldProps = Omit<ComponentPropsWithRef<'input'>, 'size'> & {
  label?: string
  hint?: string
  error?: string
  adornment?: ReactNode
}

export function GlassField({
  label,
  hint,
  error,
  adornment,
  className,
  id,
  ...rest
}: GlassFieldProps) {
  const generated = useId()
  const inputId = id ?? generated
  const describedBy = error || hint ? `${inputId}-hint` : undefined

  return (
    <div className={cx(styles.field, className)}>
      {label ? (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <div className={styles.inputWrap} data-invalid={Boolean(error)}>
        <input
          id={inputId}
          className={styles.input}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...rest}
        />
        {adornment}
      </div>
      {error || hint ? (
        <span id={describedBy} className={styles.hint} data-tone={error ? 'error' : 'default'}>
          {error ?? hint}
        </span>
      ) : null}
    </div>
  )
}

export function FieldAdornment({
  className,
  type = 'button',
  ...rest
}: ComponentPropsWithRef<'button'>) {
  return <button type={type} className={cx(styles.adornment, className)} {...rest} />
}

/* --- Segmented control ---------------------------------------------------- */

export type SegmentedOption<T extends string> = {
  value: T
  label: ReactNode
  title?: string
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: ReadonlyArray<SegmentedOption<T>>
  value: T
  onChange: (next: T) => void
  ariaLabel: string
}) {
  return (
    <div className={styles.segmented} role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={styles.segment}
          data-active={option.value === value}
          aria-pressed={option.value === value}
          title={option.title}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

/* --- Badge ---------------------------------------------------------------- */

export function Badge({
  tone = 'default',
  dot = false,
  children,
  className,
}: {
  tone?: 'default' | 'brand' | 'success' | 'warning' | 'error'
  dot?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <span className={cx(styles.badge, className)} data-tone={tone}>
      {dot ? <span className={styles.dot} /> : null}
      {children}
    </span>
  )
}
