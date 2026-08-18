'use client'

import { useCallback, useRef, useState } from 'react'
import { Badge, GlassButton, GlassCard } from '@/components/glass/Glass'
import { ConnectionBeam } from '@/components/mascot/ConnectionBeam'
import { useMascot } from '@/components/mascot/MascotContext'
import { WorkspaceShell } from '@/components/shell/WorkspaceShell'
import { useI18n } from '@/lib/i18n/I18nProvider'
import { TOOLS, TOOL_ICON, TOOL_KEYS, type ToolKey } from '@/lib/tools'
import { INTEGRATION_DEFAULTS, localize, type IntegrationState } from '@/lib/mock/data'
import styles from './integrations.module.css'

const CONNECT_MS = 2200

function TickIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
      <path
        d="M5 12.5 9.5 17 19 7.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M12 3l7 2.6v5.6c0 4.3-2.9 7.7-7 9.2-4.1-1.5-7-4.9-7-9.2V5.6L12 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9 12.2l2.2 2.2L15.4 10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function IntegrationsPage() {
  const { t, locale } = useI18n()
  const { setBaseMood, setActiveTool, pulse, say } = useMascot()

  const [states, setStates] = useState<Record<ToolKey, IntegrationState>>(INTEGRATION_DEFAULTS)
  const [connecting, setConnecting] = useState<ToolKey | null>(null)

  const calendarRef = useRef<HTMLDivElement | null>(null)
  const gmailRef = useRef<HTMLDivElement | null>(null)
  const jiraRef = useRef<HTMLDivElement | null>(null)
  const cardRefs: Record<ToolKey, React.RefObject<HTMLDivElement | null>> = {
    calendar: calendarRef,
    gmail: gmailRef,
    jira: jiraRef,
  }

  const description: Record<ToolKey, string> = {
    calendar: t.integrations.calendarDesc,
    gmail: t.integrations.gmailDesc,
    jira: t.integrations.jiraDesc,
  }

  const connect = useCallback(
    (key: ToolKey) => {
      if (connecting) return
      setConnecting(key)
      setActiveTool(key)
      setBaseMood('working')
      say(`${t.integrations.handshake} ${TOOLS[key].name}`, CONNECT_MS)

      window.setTimeout(() => {
        setStates((current) => ({
          ...current,
          [key]: {
            ...(current[key] as IntegrationState),
            connected: true,
            lastSync: { vi: 'vừa xong', en: 'just now' },
          },
        }))
        setConnecting(null)
        setActiveTool(null)
        setBaseMood('idle')
        pulse('happy', 1600)
      }, CONNECT_MS)
    },
    [connecting, pulse, say, setActiveTool, setBaseMood, t.integrations.handshake],
  )

  const disconnect = useCallback((key: ToolKey) => {
    setStates((current) => ({
      ...current,
      [key]: {
        ...(current[key] as IntegrationState),
        connected: false,
        lastSync: { vi: 'chưa đồng bộ', en: 'never' },
      },
    }))
  }, [])

  const connectedCount = TOOL_KEYS.filter((key) => states[key].connected).length
  const beamTarget = connecting ? cardRefs[connecting] : null

  return (
    <WorkspaceShell
      title={t.nav.integrations}
      subtitle={`${connectedCount}/${TOOL_KEYS.length} ${t.integrations.connectedCount}`}
    >
      <div className={styles.page}>
        <section>
          <h1 className={styles.title}>{t.integrations.title}</h1>
          <p className={styles.subtitle}>{t.integrations.subtitle}</p>
          <div className={styles.countChip}>
            <Badge tone={connectedCount === TOOL_KEYS.length ? 'success' : 'default'} dot>
              {connectedCount}/{TOOL_KEYS.length} {t.integrations.connectedCount}
            </Badge>
          </div>
        </section>

        <div className={styles.list}>
          {TOOL_KEYS.map((key) => {
            const meta = TOOLS[key]
            const state = states[key]
            const Icon = TOOL_ICON[key]
            const isConnecting = connecting === key

            return (
              <GlassCard
                key={key}
                ref={cardRefs[key]}
                className={styles.card}
                data-connecting={isConnecting}
                style={
                  {
                    '--tool-accent': meta.accent,
                    '--tool-accent-soft': meta.accentSoft,
                  } as React.CSSProperties
                }
              >
                <div className={styles.head}>
                  <span className={styles.logo}>
                    <Icon width={20} height={20} />
                  </span>
                  <span>
                    <span className={styles.name}>{meta.name}</span>
                    <span className={styles.account}>{state.account}</span>
                  </span>
                  {state.connected ? (
                    <Badge tone="success" dot>
                      {t.common.connected}
                    </Badge>
                  ) : (
                    <Badge>{t.common.notConnected}</Badge>
                  )}
                </div>

                <p className={styles.desc}>{description[key]}</p>

                <div>
                  <div className={styles.scopeTitle}>{t.integrations.scopes}</div>
                  <ul className={styles.scopes}>
                    {state.scopes.map((scope, index) => (
                      <li
                        key={index}
                        className={`${styles.scope} ${state.connected ? '' : styles.scopeOff}`}
                      >
                        <span className={styles.scopeTick}>
                          <TickIcon />
                        </span>
                        {localize(scope, locale)}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.footRow}>
                  {isConnecting ? (
                    <span className={styles.handshake}>
                      {t.integrations.handshake} {meta.name}
                    </span>
                  ) : (
                    <span className={styles.sync}>
                      {t.integrations.lastSync}: {localize(state.lastSync, locale)}
                    </span>
                  )}
                  <span className={styles.footSpacer} />
                  {state.connected ? (
                    <GlassButton variant="danger" size="sm" onClick={() => disconnect(key)}>
                      {t.common.disconnect}
                    </GlassButton>
                  ) : (
                    <GlassButton
                      variant="primary"
                      size="sm"
                      disabled={Boolean(connecting)}
                      onClick={() => connect(key)}
                    >
                      {isConnecting ? t.common.connecting : t.common.connect}
                    </GlassButton>
                  )}
                </div>
              </GlassCard>
            )
          })}
        </div>

        <div className={styles.note}>
          <span className={styles.noteIcon}>
            <ShieldIcon />
          </span>
          {t.integrations.disconnectHint}
        </div>
      </div>

      {beamTarget && connecting ? (
        <ConnectionBeam target={beamTarget} active color={TOOLS[connecting].accent} />
      ) : null}
    </WorkspaceShell>
  )
}
