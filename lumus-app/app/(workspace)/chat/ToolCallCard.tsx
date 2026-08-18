'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n/I18nProvider'
import { TOOLS, TOOL_ICON } from '@/lib/tools'
import { localize } from '@/lib/mock/data'
import type { ToolRun } from '@/lib/mock/chatScript'
import styles from './chat.module.css'

export type ToolStatus = 'pending' | 'running' | 'done'

export function ToolCallCard({ run, status }: { run: ToolRun; status: ToolStatus }) {
  const { t, locale } = useI18n()
  const [open, setOpen] = useState(false)
  const meta = TOOLS[run.tool]
  const Icon = TOOL_ICON[run.tool]

  // Reveal the payload the moment the call finishes, then leave it to the user.
  useEffect(() => {
    if (status === 'done') setOpen(true)
  }, [status])

  if (status === 'pending') return null

  return (
    <div
      className={styles.tool}
      data-status={status}
      style={
        {
          '--tool-accent': meta.accent,
          '--tool-accent-soft': meta.accentSoft,
        } as React.CSSProperties
      }
    >
      <button
        type="button"
        className={styles.toolHead}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <span className={styles.toolIcon}>
          <Icon width={16} height={16} />
        </span>
        <span>
          <span className={styles.toolTitle}>{localize(run.title, locale)}</span>
          <span className={styles.toolName}>{meta.name}</span>
        </span>
        {status === 'running' ? (
          <span className={styles.spinner} aria-label={t.chat.running} />
        ) : (
          <svg
            className={styles.check}
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            aria-label={t.chat.finished}
          >
            <path
              d="M5 12.5 9.5 17 19 7.5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        <svg
          className={styles.chevron}
          data-open={open}
          viewBox="0 0 24 24"
          width="15"
          height="15"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 9.5l6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && status === 'done' ? (
        <div className={styles.toolBody}>
          {run.rows.map((row, index) => (
            <div key={index} className={styles.toolRow}>
              <span className={styles.toolRowLabel}>{localize(row.label, locale)}</span>
              <span className={styles.toolRowValue}>{localize(row.value, locale)}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
