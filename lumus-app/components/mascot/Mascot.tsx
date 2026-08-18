'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useI18n } from '@/lib/i18n/I18nProvider'
import { TOOLS } from '@/lib/tools'
import { useMascot, type Mood } from './MascotContext'
import {
  MARK_BASE_BAR,
  MARK_BLADE_LEFT,
  MARK_BLADE_RIGHT,
  MARK_EYE,
  MARK_EYE_LEFT_X,
  MARK_EYE_RIGHT_X,
  MARK_PUPIL_L,
  MARK_PUPIL_R,
  MARK_VIEWBOX,
} from './markPaths'
import styles from './mascot.module.css'

/** Pupil travel, matching the reference: a capsule eye allows little sideways room. */
const MAX_X = 2.5
const MAX_Y = 4

const LONG_PRESS_MS = 850
const ANGER_MS = 2800

type Point = { x: number; y: number }

function pick<T>(list: readonly T[], previous?: T): T {
  const pool =
    list.length > 1 && previous !== undefined ? list.filter((item) => item !== previous) : list
  return pool[Math.floor(Math.random() * pool.length)] ?? (list[0] as T)
}

export type MascotProps = {
  size?: number
  interactive?: boolean
  bubbleAlign?: 'right' | 'center'
  className?: string
}

export function Mascot({
  size = 160,
  interactive = true,
  bubbleAlign = 'right',
  className,
}: MascotProps) {
  const { t } = useI18n()
  const { mood, lookPoint, activeTool, speech, say, pulse, reportAnchor } = useMascot()

  const uid = useId().replace(/:/g, '')
  const rootRef = useRef<HTMLDivElement>(null)
  const leftPupilRef = useRef<SVGEllipseElement>(null)
  const rightPupilRef = useRef<SVGEllipseElement>(null)

  const pointerRef = useRef<Point | null>(null)
  const lookRef = useRef<Point | null>(null)
  const boxRef = useRef<DOMRect | null>(null)
  const currentRef = useRef<Point>({ x: 0, y: 0 })
  const moodRef = useRef<Mood>(mood)

  const [pressed, setPressed] = useState(false)
  const pressTimer = useRef<number | null>(null)
  const angerFired = useRef(false)
  const lastLine = useRef<string>('')

  lookRef.current = lookPoint
  moodRef.current = mood

  // --- Gaze loop ------------------------------------------------------------
  useEffect(() => {
    let frame = 0
    let tick = 0

    const measure = () => {
      const el = rootRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      boxRef.current = rect
      reportAnchor({ x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.55 })
    }

    const paint = () => {
      const rect = boxRef.current
      if (!rect || rect.width === 0) return

      const blind = moodRef.current === 'shy' || moodRef.current === 'sleeping'
      const target = blind ? null : (lookRef.current ?? pointerRef.current)

      // Work in the SVG's own user units, the way the reference does.
      const desired: Point = { x: 0, y: 0 }
      if (target) {
        desired.x = ((target.x - rect.left) / rect.width) * 161
        desired.y = ((target.y - rect.top) / rect.height) * 144
      }

      const current = currentRef.current
      if (target) {
        current.x += (desired.x - current.x) * 0.15
        current.y += (desired.y - current.y) * 0.15
      }

      const apply = (
        node: SVGEllipseElement | null,
        centre: Point,
      ) => {
        if (!node) return
        if (!target) {
          node.setAttribute('cx', String(centre.x))
          node.setAttribute('cy', String(centre.y))
          return
        }
        const dx = current.x - centre.x
        const dy = current.y - centre.y
        const angle = Math.atan2(dy, dx)
        const reach = Math.min(Math.hypot(dx, dy) / 60, 1)
        node.setAttribute('cx', (centre.x + Math.cos(angle) * MAX_X * reach).toFixed(2))
        node.setAttribute('cy', (centre.y + Math.sin(angle) * MAX_Y * reach).toFixed(2))
      }

      apply(leftPupilRef.current, MARK_PUPIL_L)
      apply(rightPupilRef.current, MARK_PUPIL_R)
    }

    const loop = () => {
      if (tick % 12 === 0) measure()
      tick += 1
      paint()
      frame = requestAnimationFrame(loop)
    }

    const onPointerMove = (event: PointerEvent) => {
      pointerRef.current = { x: event.clientX, y: event.clientY }
    }

    measure()
    paint()
    frame = requestAnimationFrame(loop)
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onPointerMove)
      reportAnchor(null)
    }
  }, [reportAnchor])

  // --- Press interactions ---------------------------------------------------
  const clearPress = useCallback(() => {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }, [])

  useEffect(() => clearPress, [clearPress])

  const speak = useCallback(
    (lines: readonly string[]) => {
      const line = pick(lines, lastLine.current)
      lastLine.current = line
      say(line)
    },
    [say],
  )

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive) return
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // Synthetic or already-released pointers cannot be captured; harmless.
      }
      setPressed(true)
      angerFired.current = false
      clearPress()
      pressTimer.current = window.setTimeout(() => {
        angerFired.current = true
        pulse('angry', ANGER_MS)
        speak(t.mascot.angry)
        // A held press is the one interaction worth a haptic tick on mobile.
        navigator.vibrate?.(35)
      }, LONG_PRESS_MS)
    },
    [clearPress, interactive, pulse, speak, t.mascot.angry],
  )

  const onPointerUp = useCallback(() => {
    if (!interactive) return
    setPressed(false)
    clearPress()
    if (!angerFired.current) {
      pulse('happy', 1500)
      speak(t.mascot.happy)
    }
  }, [clearPress, interactive, pulse, speak, t.mascot.happy])

  const onPointerCancel = useCallback(() => {
    setPressed(false)
    clearPress()
  }, [clearPress])

  const accent = activeTool ? TOOLS[activeTool].accent : undefined

  return (
    <div
      ref={rootRef}
      className={[styles.root, className].filter(Boolean).join(' ')}
      style={
        {
          '--mascot-size': `${size}px`,
          ...(accent ? { '--tool-accent': accent } : {}),
        } as React.CSSProperties
      }
      data-mood={mood}
      data-pressed={pressed}
      data-interactive={interactive}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onPointerLeave={onPointerCancel}
      role={interactive ? 'button' : 'img'}
      tabIndex={interactive ? 0 : undefined}
      aria-label={`${t.mascot.name} — ${mood}`}
      onKeyDown={(event) => {
        if (!interactive) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          pulse('happy', 1500)
          speak(t.mascot.happy)
        }
      }}
    >
      {speech ? (
        <div className={styles.bubble} data-align={bubbleAlign} role="status">
          {speech}
        </div>
      ) : null}

      <svg className={styles.svg} viewBox={MARK_VIEWBOX} fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={`a-${uid}`} x1="88" y1="22" x2="148" y2="138" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--mascot-a1)" />
            <stop offset="1" stopColor="var(--mascot-a2)" />
          </linearGradient>
          <linearGradient id={`b-${uid}`} x1="68" y1="0" x2="10" y2="126" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--mascot-b1)" />
            <stop offset="1" stopColor="var(--mascot-b2)" />
          </linearGradient>
          <linearGradient id={`c-${uid}`} x1="33" y1="136" x2="161" y2="136" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--mascot-c1)" />
            <stop offset="1" stopColor="var(--mascot-c2)" />
          </linearGradient>

          <radialGradient id={`aura-${uid}`} cx="50%" cy="55%" r="52%">
            <stop offset="0%" stopColor="var(--tool-accent, var(--mascot-c2))" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--tool-accent, var(--mascot-c2))" stopOpacity="0" />
          </radialGradient>

          <linearGradient id={`sheen-${uid}`} x1="0" y1="0" x2="1" y2="0.6">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          <filter id={`eyeGlow-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" />
          </filter>

          {/* Clip the sheen and tint to the silhouette. */}
          <clipPath id={`mark-${uid}`}>
            <path d={MARK_BLADE_RIGHT} />
            <path d={MARK_BLADE_LEFT} />
            <path d={MARK_BASE_BAR} />
          </clipPath>
        </defs>

        <g className={styles.float}>
          <g className={styles.react}>
            <ellipse
              className={styles.aura}
              cx="80"
              cy="80"
              rx="86"
              ry="76"
              fill={`url(#aura-${uid})`}
            />

            {/* Body */}
            <path d={MARK_BLADE_RIGHT} fill={`url(#a-${uid})`} />
            <path d={MARK_BLADE_LEFT} fill={`url(#b-${uid})`} />
            <path d={MARK_BASE_BAR} fill={`url(#c-${uid})`} />

            <g clipPath={`url(#mark-${uid})`}>
              <g transform="rotate(18 80 72)">
                <rect
                  className={styles.sheen}
                  x="58"
                  y="-30"
                  width="44"
                  height="210"
                  fill={`url(#sheen-${uid})`}
                />
              </g>
              <rect className={styles.tint} x="0" y="0" width="161" height="144" fill="#f04438" />
            </g>

            {/* Angry brows, angled in over each eye */}
            <g className={styles.brows}>
              <path d="M64 66 L82 71" />
              <path d="M115 66 L97 71" />
            </g>

            {/* Eyes — capsule shaped, with the reference glow */}
            <g className={styles.eye}>
              <rect
                x={MARK_EYE_LEFT_X}
                y={MARK_EYE.y}
                width={MARK_EYE.w}
                height={MARK_EYE.h}
                rx={MARK_EYE.r}
                fill="var(--mascot-eye-glow)"
                filter={`url(#eyeGlow-${uid})`}
              />
              <rect
                x={MARK_EYE_LEFT_X}
                y={MARK_EYE.y}
                width={MARK_EYE.w}
                height={MARK_EYE.h}
                rx={MARK_EYE.r}
                fill="var(--mascot-eye)"
              />
              <g className={styles.pupils}>
                <ellipse
                  ref={leftPupilRef}
                  cx={MARK_PUPIL_L.x}
                  cy={MARK_PUPIL_L.y}
                  rx="3.5"
                  ry="5"
                  fill="var(--mascot-pupil)"
                />
              </g>
              <path className={styles.lids} d="M69.6 86.4 Q74.1 90.4 78.6 86.4" />
            </g>

            <g className={`${styles.eye} ${styles.eyeRight}`}>
              <rect
                x={MARK_EYE_RIGHT_X}
                y={MARK_EYE.y}
                width={MARK_EYE.w}
                height={MARK_EYE.h}
                rx={MARK_EYE.r}
                fill="var(--mascot-eye-glow)"
                filter={`url(#eyeGlow-${uid})`}
              />
              <rect
                x={MARK_EYE_RIGHT_X}
                y={MARK_EYE.y}
                width={MARK_EYE.w}
                height={MARK_EYE.h}
                rx={MARK_EYE.r}
                fill="var(--mascot-eye)"
              />
              <g className={styles.pupils}>
                <ellipse
                  ref={rightPupilRef}
                  cx={MARK_PUPIL_R.x}
                  cy={MARK_PUPIL_R.y}
                  rx="3.5"
                  ry="5"
                  fill="var(--mascot-pupil)"
                />
              </g>
              <path className={styles.lids} d="M100.2 86.4 Q104.7 90.4 109.2 86.4" />
            </g>

            {/* Shutters slide in over the eyes on secret fields */}
            <rect
              className={`${styles.shutter} ${styles.shutterLeft}`}
              x={MARK_EYE_LEFT_X - 4.2}
              y="81.8"
              width={MARK_EYE.w + 8.4}
              height="9.6"
              rx="4.8"
              fill={`url(#c-${uid})`}
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="0.9"
            />
            <rect
              className={`${styles.shutter} ${styles.shutterRight}`}
              x={MARK_EYE_RIGHT_X - 4.2}
              y="81.8"
              width={MARK_EYE.w + 8.4}
              height="9.6"
              rx="4.8"
              fill={`url(#c-${uid})`}
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="0.9"
            />

            {/* Working orbit */}
            <g className={styles.orbit}>
              <circle className={styles.orbitDot} cx="80" cy="-4" r="4.6" />
              <circle className={styles.orbitDot} cx="80" cy="150" r="3" opacity="0.5" />
            </g>

            {/* Anger steam */}
            <circle className={styles.steam} cx="46" cy="52" r="4.4" />
            <circle className={styles.steam} cx="120" cy="34" r="5.2" />
            <circle className={styles.steam} cx="82" cy="18" r="4" />

            {/* Sleep */}
            <text className={styles.zzz} x="118" y="52">
              z
            </text>
            <text className={styles.zzz} x="130" y="38">
              z
            </text>
          </g>
        </g>
      </svg>
    </div>
  )
}
