'use client'

import { useEffect, useRef, useState } from 'react'
import { useMascot } from './MascotContext'
import styles from './beam.module.css'

export type ConnectionBeamProps = {
  /** Element the beam should reach — usually the card being connected. */
  target: React.RefObject<HTMLElement | null>
  active: boolean
  color: string
}

/**
 * A fixed-position overlay that draws a travelling light beam from the mascot
 * to a target element, so "Lumi is wiring itself to this tool" reads literally.
 */
export function ConnectionBeam({ target, active, color }: ConnectionBeamProps) {
  const { anchorRef } = useMascot()
  const [path, setPath] = useState<string | null>(null)

  useEffect(() => {
    if (!active) {
      setPath(null)
      return
    }

    let frame = 0
    const measure = () => {
      const el = target.current
      if (!el) return
      // Fall back to the mascot dock's usual corner if it has not reported yet,
      // so the beam is drawn on the very first paint instead of a frame later.
      const from = anchorRef.current ?? {
        x: window.innerWidth - 74,
        y: window.innerHeight - 70,
      }
      const rect = el.getBoundingClientRect()
      const to = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      const midX = (from.x + to.x) / 2
      const midY = (from.y + to.y) / 2 - Math.abs(to.x - from.x) * 0.22 - 40
      setPath(`M${from.x} ${from.y} Q${midX} ${midY} ${to.x} ${to.y}`)
    }

    const loop = () => {
      measure()
      frame = requestAnimationFrame(loop)
    }

    measure()
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [active, anchorRef, target])

  if (!active || !path) return null

  return (
    <svg className={styles.layer} aria-hidden="true">
      <path className={styles.halo} d={path} stroke={color} />
      <path className={styles.core} d={path} stroke={color} />
      <circle r="4.5" fill={color} className={styles.spark}>
        <animateMotion dur="1.1s" repeatCount="indefinite" path={path} />
      </circle>
    </svg>
  )
}
