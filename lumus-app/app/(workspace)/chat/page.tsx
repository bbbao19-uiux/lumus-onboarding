'use client'

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { GlassButton } from '@/components/glass/Glass'
import { WorkspaceShell } from '@/components/shell/WorkspaceShell'
import { useMascot } from '@/components/mascot/MascotContext'
import { useI18n } from '@/lib/i18n/I18nProvider'
import { CalendarIcon, GmailIcon, JiraIcon } from '@/lib/tools'
import { localize } from '@/lib/mock/data'
import { matchIntent, type MeetingProposal, type ToolRun } from '@/lib/mock/chatScript'
import { RichText } from './RichText'
import { ToolCallCard, type ToolStatus } from './ToolCallCard'
import styles from './chat.module.css'

type UserTurn = { id: string; role: 'user'; text: string }

type AssistantTurn = {
  id: string
  role: 'assistant'
  tools: Array<{ run: ToolRun; status: ToolStatus }>
  text: string
  streaming: boolean
  proposal?: MeetingProposal
  eventCreated: boolean
}

type Turn = UserTurn | AssistantTurn

const STREAM_CHUNK = 7
const STREAM_TICK_MS = 16

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
      <path
        d="M12 3.5c1.3 3.1 2 3.8 5.1 5.1-3.1 1.3-3.8 2-5.1 5.1-1.3-3.1-2-3.8-5.1-5.1 3.1-1.3 3.8-2 5.1-5.1Z"
        fill="currentColor"
      />
      <circle cx="17" cy="17" r="2.2" fill="currentColor" opacity="0.65" />
    </svg>
  )
}

function ComposeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path
        d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M13.6 6.4l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M4.5 12h13m0 0-5.2-5.2M17.5 12l-5.2 5.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChatView() {
  const { t, locale } = useI18n()
  const { setBaseMood, setActiveTool, pulse, say } = useMascot()
  const searchParams = useSearchParams()

  const [turns, setTurns] = useState<Turn[]>([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)

  const streamRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const aliveRef = useRef(true)
  const seqRef = useRef(0)
  const seededRef = useRef(false)

  useEffect(() => {
    aliveRef.current = true
    return () => {
      aliveRef.current = false
    }
  }, [])

  const suggestions = useMemo(
    () => [
      { label: t.dashboard.qaBriefPrompt, icon: <SparkIcon /> },
      { label: t.dashboard.qaSchedulePrompt, icon: <CalendarIcon width={15} height={15} /> },
      { label: t.dashboard.qaTriagePrompt, icon: <GmailIcon width={15} height={15} /> },
      { label: t.dashboard.qaStandupPrompt, icon: <JiraIcon width={15} height={15} /> },
    ],
    [t],
  )

  const scrollToEnd = useCallback(() => {
    const el = streamRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  useEffect(scrollToEnd, [turns, scrollToEnd])

  const patchAssistant = useCallback((id: string, patch: Partial<AssistantTurn>) => {
    setTurns((current) =>
      current.map((turn) =>
        turn.id === id && turn.role === 'assistant' ? { ...turn, ...patch } : turn,
      ),
    )
  }, [])

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, ms)
    })

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim()
      if (!text || busy) return

      seqRef.current += 1
      const userId = `u-${seqRef.current}`
      const replyId = `a-${seqRef.current}`
      const intent = matchIntent(text, locale)

      setBusy(true)
      setDraft('')
      setTurns((current) => [
        ...current,
        { id: userId, role: 'user', text },
        {
          id: replyId,
          role: 'assistant',
          tools: intent.tools.map((run) => ({ run, status: 'pending' as ToolStatus })),
          text: '',
          streaming: true,
          ...(intent.proposal ? { proposal: intent.proposal } : {}),
          eventCreated: false,
        },
      ])

      setBaseMood('thinking')
      await sleep(520)

      // Run each tool call in sequence so the mascot can colour-shift per tool.
      for (let index = 0; index < intent.tools.length; index += 1) {
        const entry = intent.tools[index]
        if (!entry || !aliveRef.current) break

        setActiveTool(entry.tool)
        setBaseMood('working')
        setTurns((current) =>
          current.map((turn) =>
            turn.id === replyId && turn.role === 'assistant'
              ? {
                  ...turn,
                  tools: turn.tools.map((item, i) =>
                    i === index ? { ...item, status: 'running' } : item,
                  ),
                }
              : turn,
          ),
        )

        await sleep(entry.runMs)
        if (!aliveRef.current) return

        setTurns((current) =>
          current.map((turn) =>
            turn.id === replyId && turn.role === 'assistant'
              ? {
                  ...turn,
                  tools: turn.tools.map((item, i) =>
                    i === index ? { ...item, status: 'done' } : item,
                  ),
                }
              : turn,
          ),
        )
      }

      setActiveTool(null)
      setBaseMood('thinking')
      await sleep(280)

      // Stream the reply in small chunks.
      const full = localize(intent.reply, locale)
      for (let cursor = 0; cursor < full.length; cursor += STREAM_CHUNK) {
        if (!aliveRef.current) return
        patchAssistant(replyId, { text: full.slice(0, cursor + STREAM_CHUNK) })
        scrollToEnd()
        await sleep(STREAM_TICK_MS)
      }

      if (!aliveRef.current) return
      patchAssistant(replyId, { text: full, streaming: false })
      setBaseMood('idle')
      setBusy(false)
    },
    [busy, locale, patchAssistant, scrollToEnd, setActiveTool, setBaseMood],
  )

  // A ?q= param (from the dashboard quick actions) auto-sends once.
  useEffect(() => {
    if (seededRef.current) return
    const seeded = searchParams.get('q')
    if (!seeded) return
    seededRef.current = true
    void send(seeded)
  }, [searchParams, send])

  const confirmEvent = (id: string) => {
    patchAssistant(id, { eventCreated: true })
    pulse('happy', 1700)
    say(t.chat.eventCreated)
  }

  return (
    <WorkspaceShell
      title={t.mascot.name}
      subtitle={t.chat.title}
      fill
      actions={
        <GlassButton
          size="sm"
          className={styles.newChatBtn}
          aria-label={t.chat.newChat}
          title={t.chat.newChat}
          onClick={() => {
            setTurns([])
            setBusy(false)
            setActiveTool(null)
            setBaseMood('idle')
          }}
        >
          <ComposeIcon />
        </GlassButton>
      }
    >
      <div className={styles.root}>
        <div className={styles.stream} ref={streamRef}>
            {turns.length === 0 ? (
              <div className={styles.empty}>
                <h2 className={styles.emptyTitle}>{t.chat.emptyTitle}</h2>
                <p className={styles.emptySub}>{t.chat.emptySub}</p>
                <p className={styles.suggestTitle}>{t.chat.suggestionsTitle}</p>
                <div className={styles.suggestions}>
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.label}
                      type="button"
                      className={styles.suggestion}
                      onClick={() => void send(suggestion.label)}
                    >
                      <span className={styles.suggestionIcon}>{suggestion.icon}</span>
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              turns.map((turn) =>
                turn.role === 'user' ? (
                  <div key={turn.id} className={styles.turn} data-role="user">
                    <span className={styles.who}>{t.chat.you}</span>
                    <div className={styles.userBubble}>{turn.text}</div>
                  </div>
                ) : (
                  <div key={turn.id} className={styles.turn} data-role="assistant">
                    <span className={styles.who}>
                      <span className={styles.whoMark} aria-hidden="true">
                        <SparkIcon />
                      </span>
                      {t.mascot.name}
                    </span>

                    {turn.tools.length > 0 ? (
                      <div className={styles.tools}>
                        {turn.tools.map((item) => (
                          <ToolCallCard key={item.run.id} run={item.run} status={item.status} />
                        ))}
                      </div>
                    ) : null}

                    {turn.text.length === 0 && turn.streaming ? (
                      <div className={styles.thinking}>
                        <span className={styles.dots}>
                          <span />
                          <span />
                          <span />
                        </span>
                        {t.chat.thinking}
                      </div>
                    ) : (
                      <RichText text={turn.text} caret={turn.streaming} />
                    )}

                    {turn.proposal && !turn.streaming ? (
                      <div className={styles.proposal}>
                        <div className={styles.proposalHead}>
                          <CalendarIcon width={15} height={15} />
                          {t.chat.createEvent}
                        </div>
                        <div className={styles.proposalTitle}>
                          {localize(turn.proposal.title, locale)}
                        </div>
                        <div className={styles.proposalRows}>
                          <div className={styles.proposalRow}>
                            <span className={styles.proposalLabel}>{t.chat.proposalWhen}</span>
                            <span className={styles.proposalValue}>
                              {localize(turn.proposal.when, locale)}
                            </span>
                          </div>
                          <div className={styles.proposalRow}>
                            <span className={styles.proposalLabel}>
                              {t.chat.proposalDuration}
                            </span>
                            <span className={styles.proposalValue}>
                              {localize(turn.proposal.duration, locale)}
                            </span>
                          </div>
                          <div className={styles.proposalRow}>
                            <span className={styles.proposalLabel}>
                              {t.chat.proposalAttendees}
                            </span>
                            <span className={styles.proposalValue}>
                              {turn.proposal.attendees.join(', ')}
                            </span>
                          </div>
                          <div className={styles.proposalRow}>
                            <span className={styles.proposalLabel}>{t.chat.proposalLocation}</span>
                            <span className={styles.proposalValue}>
                              {localize(turn.proposal.location, locale)}
                            </span>
                          </div>
                        </div>
                        <div className={styles.proposalActions}>
                          {turn.eventCreated ? (
                            <span className={styles.created}>
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                                <path
                                  d="M5 12.5 9.5 17 19 7.5"
                                  stroke="currentColor"
                                  strokeWidth="2.2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              {t.chat.eventCreated}
                            </span>
                          ) : (
                            <>
                              <GlassButton
                                variant="primary"
                                size="sm"
                                onClick={() => confirmEvent(turn.id)}
                              >
                                {t.chat.createEvent}
                              </GlassButton>
                              <GlassButton variant="ghost" size="sm">
                                {t.common.cancel}
                              </GlassButton>
                            </>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ),
              )
            )}
        </div>

        <form
          className={`${styles.composer} lg lgThick`}
          onSubmit={(event) => {
            event.preventDefault()
            void send(draft)
          }}
        >
          <div className={styles.composerRow}>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              placeholder={t.chat.placeholder}
              value={draft}
              rows={1}
              onChange={(event) => {
                setDraft(event.target.value)
                const el = event.target
                el.style.height = 'auto'
                el.style.height = `${Math.min(el.scrollHeight, 132)}px`
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  void send(draft)
                }
              }}
            />
            <GlassButton
              type="submit"
              variant="primary"
              className={styles.sendBtn}
              disabled={busy || draft.trim().length === 0}
              aria-label={t.chat.send}
            >
              <SendIcon />
            </GlassButton>
          </div>

          <div className={styles.chips}>
            {suggestions.slice(0, 3).map((suggestion) => (
              <button
                key={suggestion.label}
                type="button"
                className={styles.chip}
                onClick={() => void send(suggestion.label)}
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        </form>
      </div>
    </WorkspaceShell>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatView />
    </Suspense>
  )
}
