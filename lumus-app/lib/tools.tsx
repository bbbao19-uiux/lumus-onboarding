import type { SVGProps } from 'react'

export const TOOL_KEYS = ['calendar', 'gmail', 'jira'] as const
export type ToolKey = (typeof TOOL_KEYS)[number]

export type ToolMeta = {
  key: ToolKey
  name: string
  /** Brand accent used for beams, glows and tool-call chrome. */
  accent: string
  accentSoft: string
}

export const TOOLS: Record<ToolKey, ToolMeta> = {
  calendar: {
    key: 'calendar',
    name: 'Google Calendar',
    accent: '#1b5ee4',
    accentSoft: 'rgba(27, 94, 228, 0.16)',
  },
  gmail: {
    key: 'gmail',
    name: 'Gmail',
    accent: '#d92d20',
    accentSoft: 'rgba(217, 45, 32, 0.14)',
  },
  jira: {
    key: 'jira',
    name: 'Jira',
    accent: '#0ba5ec',
    accentSoft: 'rgba(11, 165, 236, 0.16)',
  },
}

export function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="3" y="5" width="18" height="16" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="7" y="13" width="4" height="4" rx="1" fill="currentColor" />
    </svg>
  )
}

export function GmailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="2.5" y="5" width="19" height="14" rx="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3.5 7.5 12 13.5l8.5-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function JiraIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 2.5 20 10a2 2 0 0 1 0 2.8l-8 7.7-3.2-3.1 6.3-6-6.3-6L12 2.5Z"
        fill="currentColor"
        opacity="0.55"
      />
      <path
        d="M12 2.5 4 10a2 2 0 0 0 0 2.8l3.2 3.1L13.5 10 7.2 4 12 2.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

export const TOOL_ICON: Record<ToolKey, (props: SVGProps<SVGSVGElement>) => React.JSX.Element> = {
  calendar: CalendarIcon,
  gmail: GmailIcon,
  jira: JiraIcon,
}
