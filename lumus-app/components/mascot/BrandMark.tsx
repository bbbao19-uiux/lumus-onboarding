import type { SVGProps } from 'react'
import {
  MARK_BASE_BAR,
  MARK_BLADE_LEFT,
  MARK_BLADE_RIGHT,
  MARK_VIEWBOX,
} from './markPaths'

/**
 * The mark without a face: for lockups, favicons and anywhere the mascot itself
 * would be too much. Shares its geometry with <Mascot /> via markPaths.
 */
export function BrandMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox={MARK_VIEWBOX} fill="none" aria-hidden="true" {...props}>
      <path d={MARK_BLADE_RIGHT} fill="var(--mascot-a2)" />
      <path d={MARK_BLADE_LEFT} fill="var(--mascot-b1)" />
      <path d={MARK_BASE_BAR} fill="var(--mascot-c1)" />
    </svg>
  )
}
