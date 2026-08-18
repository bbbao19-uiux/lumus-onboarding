'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import type { ToolKey } from '@/lib/tools'

/**
 * Moods split into two layers:
 *  - base:     driven by what the app is doing (idle, watching a field, working)
 *  - override: a short-lived reaction (happy, angry) that wins while it lasts
 */
export const BASE_MOODS = ['idle', 'watching', 'shy', 'thinking', 'working', 'sleeping'] as const
export const OVERRIDE_MOODS = ['happy', 'angry'] as const

export type BaseMood = (typeof BASE_MOODS)[number]
export type OverrideMood = (typeof OVERRIDE_MOODS)[number]
export type Mood = BaseMood | OverrideMood

export type LookPoint = { x: number; y: number }

type MascotValue = {
  mood: Mood
  baseMood: BaseMood
  setBaseMood: (mood: BaseMood) => void
  /** Show a reaction for `ms`, then fall back to the base mood. */
  pulse: (mood: OverrideMood, ms?: number) => void
  /** Viewport-space point the mascot should look at; null means "follow the cursor". */
  lookPoint: LookPoint | null
  setLookPoint: (point: LookPoint | null) => void
  activeTool: ToolKey | null
  setActiveTool: (tool: ToolKey | null) => void
  speech: string | null
  say: (line: string, ms?: number) => void
  /** Live viewport centre of the rendered mascot — used to draw connection beams. */
  anchorRef: React.RefObject<LookPoint | null>
  reportAnchor: (point: LookPoint | null) => void
}

const MascotContext = createContext<MascotValue | null>(null)

const SECRET_TYPES = new Set(['password'])

function isSecretField(el: Element): boolean {
  if (!(el instanceof HTMLInputElement)) return false
  if (SECRET_TYPES.has(el.type)) return true
  return el.dataset['secret'] === 'true'
}

function isTextField(el: Element): el is HTMLInputElement | HTMLTextAreaElement {
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
}

let measureCanvas: HTMLCanvasElement | null = null

/**
 * Best-effort viewport position of the caret inside a text field, so the eyes
 * track the text being typed rather than the middle of the box.
 */
function caretPoint(el: HTMLInputElement | HTMLTextAreaElement): LookPoint {
  const rect = el.getBoundingClientRect()
  const fallback = { x: rect.left + Math.min(24, rect.width / 2), y: rect.top + rect.height / 2 }

  measureCanvas ??= document.createElement('canvas')
  const ctx = measureCanvas.getContext('2d')
  if (!ctx) return fallback

  let caret: number
  try {
    // selectionStart throws on input types that do not support selection.
    caret = el.selectionStart ?? el.value.length
  } catch {
    caret = el.value.length
  }

  const style = window.getComputedStyle(el)
  ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
  const visible =
    el instanceof HTMLInputElement && el.type === 'password'
      ? '•'.repeat(caret)
      : el.value.slice(0, caret)

  const left = rect.left + (parseFloat(style.borderLeftWidth) || 0) + (parseFloat(style.paddingLeft) || 0)
  const right = rect.right - (parseFloat(style.paddingRight) || 0)
  const x = Math.min(left + ctx.measureText(visible).width - el.scrollLeft, right)

  return { x, y: rect.top + rect.height / 2 }
}

export function MascotProvider({ children }: { children: ReactNode }) {
  const [baseMood, setBaseMoodState] = useState<BaseMood>('idle')
  const [override, setOverride] = useState<OverrideMood | null>(null)
  const [lookPoint, setLookPoint] = useState<LookPoint | null>(null)
  const [activeTool, setActiveTool] = useState<ToolKey | null>(null)
  const [speech, setSpeech] = useState<string | null>(null)

  const anchorRef = useRef<LookPoint | null>(null)
  const overrideTimer = useRef<number | null>(null)
  const speechTimer = useRef<number | null>(null)
  /** Base mood the focus watcher owns, so app-driven moods are not clobbered. */
  const focusOwned = useRef(false)

  const setBaseMood = useCallback((mood: BaseMood) => {
    focusOwned.current = false
    setBaseMoodState(mood)
  }, [])

  const pulse = useCallback((mood: OverrideMood, ms = 1600) => {
    if (overrideTimer.current !== null) window.clearTimeout(overrideTimer.current)
    setOverride(mood)
    overrideTimer.current = window.setTimeout(() => {
      setOverride(null)
      overrideTimer.current = null
    }, ms)
  }, [])

  const say = useCallback((line: string, ms = 2200) => {
    if (speechTimer.current !== null) window.clearTimeout(speechTimer.current)
    setSpeech(line)
    speechTimer.current = window.setTimeout(() => {
      setSpeech(null)
      speechTimer.current = null
    }, ms)
  }, [])

  const reportAnchor = useCallback((point: LookPoint | null) => {
    anchorRef.current = point
  }, [])

  useEffect(
    () => () => {
      if (overrideTimer.current !== null) window.clearTimeout(overrideTimer.current)
      if (speechTimer.current !== null) window.clearTimeout(speechTimer.current)
    },
    [],
  )

  // --- Focus watcher: the mascot reacts to whatever field you are in ---------
  useEffect(() => {
    let tracked: HTMLInputElement | HTMLTextAreaElement | null = null

    const track = () => {
      if (!tracked) return
      setLookPoint(caretPoint(tracked))
    }

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return

      if (isSecretField(target)) {
        tracked = null
        focusOwned.current = true
        setBaseMoodState('shy')
        setLookPoint(null)
        return
      }

      if (isTextField(target)) {
        tracked = target
        focusOwned.current = true
        setBaseMoodState('watching')
        track()
        return
      }

      if (focusOwned.current) {
        focusOwned.current = false
        setBaseMoodState('idle')
        setLookPoint(null)
      }
    }

    const onFocusOut = () => {
      tracked = null
      // Let the next focusin (if any) win before falling back to idle.
      window.setTimeout(() => {
        const active = document.activeElement
        if (active && (isSecretField(active) || isTextField(active))) return
        if (!focusOwned.current) return
        focusOwned.current = false
        setBaseMoodState('idle')
        setLookPoint(null)
      }, 0)
    }

    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    document.addEventListener('input', track, true)
    document.addEventListener('keyup', track, true)
    document.addEventListener('click', track, true)
    window.addEventListener('scroll', track, true)
    window.addEventListener('resize', track)

    return () => {
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
      document.removeEventListener('input', track, true)
      document.removeEventListener('keyup', track, true)
      document.removeEventListener('click', track, true)
      window.removeEventListener('scroll', track, true)
      window.removeEventListener('resize', track)
    }
  }, [])

  const value = useMemo<MascotValue>(
    () => ({
      mood: override ?? baseMood,
      baseMood,
      setBaseMood,
      pulse,
      lookPoint,
      setLookPoint,
      activeTool,
      setActiveTool,
      speech,
      say,
      anchorRef,
      reportAnchor,
    }),
    [override, baseMood, setBaseMood, pulse, lookPoint, activeTool, speech, say, reportAnchor],
  )

  return <MascotContext.Provider value={value}>{children}</MascotContext.Provider>
}

export function useMascot(): MascotValue {
  const ctx = useContext(MascotContext)
  if (!ctx) throw new Error('useMascot must be used inside <MascotProvider>')
  return ctx
}
