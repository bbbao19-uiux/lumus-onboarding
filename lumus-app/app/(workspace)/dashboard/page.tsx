'use client'

import Link from 'next/link'
import { Badge, GlassButton, GlassCard } from '@/components/glass/Glass'
import { WorkspaceShell } from '@/components/shell/WorkspaceShell'
import { useI18n } from '@/lib/i18n/I18nProvider'
import { CalendarIcon, GmailIcon, JiraIcon } from '@/lib/tools'
import {
  AGENDA,
  FOCUS_SERIES,
  MAILBOX,
  SPRINT,
  SPRINT_SUMMARY,
  WEEKDAYS,
  WEEK_STATS,
  localize,
  type Priority,
  type TicketStatus,
} from '@/lib/mock/data'
import styles from './dashboard.module.css'

const PRIORITY_TONE: Record<Priority, 'error' | 'warning' | 'default'> = {
  high: 'error',
  medium: 'warning',
  low: 'default',
}

const STATUS_TONE: Record<TicketStatus, 'brand' | 'warning' | 'error' | 'default'> = {
  inProgress: 'brand',
  inReview: 'warning',
  blocked: 'error',
  todo: 'default',
}

function SparkIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <path
        d="M12 3.5c1.3 3.1 2 3.8 5.1 5.1-3.1 1.3-3.8 2-5.1 5.1-1.3-3.1-2-3.8-5.1-5.1 3.1-1.3 3.8-2 5.1-5.1Z"
        fill="currentColor"
      />
      <circle cx="17" cy="17" r="2.2" fill="currentColor" opacity="0.65" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg
      className={styles.chevron}
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9.5 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function DashboardPage() {
  const { t, locale } = useI18n()

  const priorityLabel: Record<Priority, string> = {
    high: t.dashboard.priorityHigh,
    medium: t.dashboard.priorityMedium,
    low: t.dashboard.priorityLow,
  }

  const statusLabel: Record<TicketStatus, string> = {
    todo: t.dashboard.todo,
    inProgress: t.dashboard.inProgress,
    inReview: t.dashboard.inReview,
    blocked: t.dashboard.blocked,
  }

  const statLabel = {
    statMeetings: t.dashboard.statMeetings,
    statFocus: t.dashboard.statFocus,
    statTickets: t.dashboard.statTickets,
    statUnread: t.dashboard.statUnread,
  } as const

  const quickActions = [
    { label: t.dashboard.qaBrief, prompt: t.dashboard.qaBriefPrompt, icon: <SparkIcon /> },
    {
      label: t.dashboard.qaSchedule,
      prompt: t.dashboard.qaSchedulePrompt,
      icon: <CalendarIcon width={16} height={16} />,
    },
    {
      label: t.dashboard.qaTriage,
      prompt: t.dashboard.qaTriagePrompt,
      icon: <GmailIcon width={16} height={16} />,
    },
    {
      label: t.dashboard.qaStandup,
      prompt: t.dashboard.qaStandupPrompt,
      icon: <JiraIcon width={16} height={16} />,
    },
  ]

  const sprintPercent = Math.round((SPRINT_SUMMARY.completed / SPRINT_SUMMARY.total) * 100)
  const peakFocus = Math.max(...FOCUS_SERIES)
  const highPriorityMail = MAILBOX.filter((mail) => mail.priority === 'high').length

  return (
    <WorkspaceShell title={t.nav.dashboard} subtitle={t.common.today}>
      <div className={styles.page}>
        <section>
          <h1 className={styles.greeting}>{t.dashboard.greeting}</h1>
          <p className={styles.greetingSub}>{t.dashboard.greetingSub}</p>
          <div className={styles.heroChips}>
            <Badge dot>{t.common.connected} 2/3</Badge>
            <Badge tone="error" dot>
              {highPriorityMail} {t.dashboard.priorityHigh}
            </Badge>
          </div>
          <Link href={`/chat?q=${encodeURIComponent(t.dashboard.qaBriefPrompt)}`}>
            <GlassButton variant="primary" full className={styles.briefBtn}>
              <SparkIcon size={17} />
              {t.dashboard.briefCta}
            </GlassButton>
          </Link>
        </section>

        <div className={styles.stats}>
          {WEEK_STATS.map((stat) => (
            <GlassCard key={stat.id} pad="sm">
              <div className={styles.stat}>
                <span className={styles.statLabel}>{statLabel[stat.labelKey]}</span>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statDelta} data-negative={stat.delta < 0}>
                  {stat.delta > 0 ? '+' : ''}
                  {stat.delta}
                </span>
              </div>
            </GlassCard>
          ))}
        </div>

        <GlassCard>
          <div className={styles.sectionHead}>
            <span className={styles.sectionIcon}>
              <CalendarIcon width={16} height={16} />
            </span>
            <div>
              <div className={styles.sectionTitle}>{t.dashboard.schedule}</div>
              <div className={styles.sectionSub}>
                {AGENDA.length} · {t.common.today}
              </div>
            </div>
            <span className={styles.headSpacer} />
            <Badge tone="brand">{t.dashboard.nextUp} 11:00</Badge>
          </div>

          <div className={styles.agenda}>
            {AGENDA.map((event) => (
              <div
                key={event.id}
                className={`${styles.event} ${event.live ? styles.eventLive : ''}`}
              >
                <span>
                  <span className={styles.eventTime}>{event.start}</span>
                  <span className={styles.eventTimeEnd}>{event.end}</span>
                </span>
                <span>
                  <span className={styles.eventTitle}>{localize(event.title, locale)}</span>
                  <span className={styles.eventMeta}>
                    {localize(event.location, locale)} · {event.attendees.join(', ')}
                  </span>
                </span>
                {event.live ? (
                  <GlassButton size="sm" variant="primary">
                    {t.dashboard.joinCall}
                  </GlassButton>
                ) : (
                  <span className={styles.minutes}>
                    {event.minutes} {t.common.minutesShort}
                  </span>
                )}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className={styles.sectionHead}>
            <span className={styles.sectionIcon}>
              <GmailIcon width={16} height={16} />
            </span>
            <div>
              <div className={styles.sectionTitle}>{t.dashboard.inbox}</div>
              <div className={styles.sectionSub}>
                {MAILBOX.length} {t.dashboard.inboxSub}
              </div>
            </div>
          </div>

          <div className={styles.mailList}>
            {MAILBOX.map((mail) => (
              <button key={mail.id} type="button" className={styles.mail}>
                <span className={styles.mailAvatar} aria-hidden="true">
                  {mail.senderInitials}
                </span>
                <span>
                  <span className={styles.mailSender}>{mail.sender}</span>
                  <span className={styles.mailSubject}>{localize(mail.subject, locale)}</span>
                  <span className={styles.mailPreview}>{localize(mail.preview, locale)}</span>
                </span>
                <span className={styles.mailTrail}>
                  <span className={styles.mailTime}>{localize(mail.receivedAt, locale)}</span>
                  <Badge tone={PRIORITY_TONE[mail.priority]}>{priorityLabel[mail.priority]}</Badge>
                </span>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className={styles.sectionHead}>
            <span className={styles.sectionIcon}>
              <JiraIcon width={16} height={16} />
            </span>
            <div>
              <div className={styles.sectionTitle}>{t.dashboard.jira}</div>
              <div className={styles.sectionSub}>{t.dashboard.jiraSub}</div>
            </div>
            <span className={styles.headSpacer} />
            <Badge tone="brand">
              {SPRINT_SUMMARY.completed}/{SPRINT_SUMMARY.total}
            </Badge>
          </div>

          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${sprintPercent}%` }} />
          </div>

          <div className={styles.tickets}>
            {SPRINT.map((ticket) => (
              <div key={ticket.id} className={styles.ticket}>
                <span>
                  <span className={styles.ticketId}>{ticket.id}</span>
                  <span className={styles.ticketTitle}>{localize(ticket.title, locale)}</span>
                </span>
                <Badge tone={STATUS_TONE[ticket.status]}>{statusLabel[ticket.status]}</Badge>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className={styles.sectionHead}>
            <span className={styles.sectionIcon}>
              <SparkIcon />
            </span>
            <div>
              <div className={styles.sectionTitle}>{t.dashboard.report}</div>
              <div className={styles.sectionSub}>{t.dashboard.statFocus}</div>
            </div>
          </div>

          <div className={styles.chart}>
            {FOCUS_SERIES.map((hours, index) => (
              <div key={index} className={styles.bar}>
                <span className={styles.barValue}>{hours}</span>
                <span
                  className={styles.barFill}
                  style={{
                    height: `${(hours / peakFocus) * 100}%`,
                    animationDelay: `${index * 70}ms`,
                  }}
                />
                <span className={styles.barLabel}>
                  {localize(WEEKDAYS[index] ?? { vi: '', en: '' }, locale)}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className={styles.sectionHead}>
            <div className={styles.sectionTitle}>{t.dashboard.quickActions}</div>
          </div>
          <div className={styles.quickList}>
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={`/chat?q=${encodeURIComponent(action.prompt)}`}
                className={styles.quick}
              >
                <span className={styles.quickIcon}>{action.icon}</span>
                <span>
                  <span className={styles.quickLabel}>{action.label}</span>
                  <span className={styles.quickPrompt}>{action.prompt}</span>
                </span>
                <ChevronIcon />
              </Link>
            ))}
          </div>
        </GlassCard>
      </div>
    </WorkspaceShell>
  )
}
