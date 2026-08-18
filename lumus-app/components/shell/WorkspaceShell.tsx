'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { Mascot } from '@/components/mascot/Mascot'
import { useI18n } from '@/lib/i18n/I18nProvider'
import { LanguageControl, ThemeControl } from './PreferenceControls'
import styles from './shell.module.css'

function GridIcon() {
  return (
    <svg className={styles.tabIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.4" y="3.4" width="7.4" height="7.4" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13.2" y="3.4" width="7.4" height="7.4" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3.4" y="13.2" width="7.4" height="7.4" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13.2" y="13.2" width="7.4" height="7.4" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg className={styles.tabIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 6.6A3.6 3.6 0 0 1 7.6 3h8.8A3.6 3.6 0 0 1 20 6.6v5.8a3.6 3.6 0 0 1-3.6 3.6H11l-4.3 3.3a.6.6 0 0 1-1-.48V16A3.6 3.6 0 0 1 4 12.4V6.6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PlugIcon() {
  return (
    <svg className={styles.tabIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 3v5M15 3v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M6.6 8h10.8v3.5a5.4 5.4 0 0 1-10.8 0V8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function SlidersIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path d="M4 8h11M19 8h1M4 16h4M12 16h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="17" cy="8" r="2.3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="10" cy="16" r="2.3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

export function WorkspaceShell({
  title,
  subtitle,
  /** `fill` locks the shell to the viewport, for screens that scroll internally. */
  fill = false,
  actions,
  children,
}: {
  title: string
  subtitle?: string
  fill?: boolean
  actions?: ReactNode
  children: ReactNode
}) {
  const pathname = usePathname()
  const { t } = useI18n()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const tabs = [
    { href: '/dashboard', label: t.nav.dashboard, icon: <GridIcon /> },
    { href: '/chat', label: t.nav.chat, icon: <ChatIcon /> },
    { href: '/integrations', label: t.nav.integrations, icon: <PlugIcon /> },
  ]

  return (
    <div className={`phone ${styles.shell}`} data-fill={fill}>
      <header className={styles.header}>
        <div>
          <div className={styles.headTitle}>{title}</div>
          {subtitle ? <div className={styles.headSub}>{subtitle}</div> : null}
        </div>

        <div className={styles.headTrail}>
          {actions}
          <button
            type="button"
            className={`${styles.iconButton} lgPress`}
            onClick={() => setSettingsOpen(true)}
            aria-label={t.nav.settings}
          >
            <SlidersIcon />
          </button>
          <div className={styles.mascotSlot}>
            <Mascot size={54} />
          </div>
        </div>
      </header>

      <div className={styles.content}>{children}</div>

      <div className={styles.tabbarWrap}>
        <nav className={`${styles.tabbar} lg lgChrome`} aria-label={t.nav.workspace}>
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`${styles.tab} lgPress`}
              data-active={pathname === tab.href}
              aria-current={pathname === tab.href ? 'page' : undefined}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {settingsOpen ? (
        <>
          <button
            type="button"
            className={styles.scrim}
            aria-label={t.common.cancel}
            onClick={() => setSettingsOpen(false)}
          />
          <div className={`${styles.sheet} lg lgThick`} role="dialog" aria-modal="true">
            <div className={styles.grabber} />
            <div className={styles.sheetUser}>
              <span className={styles.avatar} aria-hidden="true">
                BR
              </span>
              <span>
                <span className={styles.userName}>Bryan</span>
                <br />
                <span className={styles.userMail}>bryan@savameta.com</span>
              </span>
            </div>
            <div className={styles.sheetRow}>
              <span className={styles.sheetLabel}>{t.common.language}</span>
              <LanguageControl />
            </div>
            <div className={styles.sheetRow}>
              <span className={styles.sheetLabel}>{t.common.theme}</span>
              <ThemeControl />
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
