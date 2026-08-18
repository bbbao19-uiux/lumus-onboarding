import type { Locale } from '@/lib/i18n/dictionary'

export type Localized = Record<Locale, string>

export const localize = (value: Localized, locale: Locale): string => value[locale]

export type Priority = 'high' | 'medium' | 'low'
export type TicketStatus = 'todo' | 'inProgress' | 'inReview' | 'blocked'

export type MeetingEvent = {
  id: string
  title: Localized
  start: string
  end: string
  minutes: number
  attendees: string[]
  location: Localized
  live?: boolean
}

export type MailItem = {
  id: string
  sender: string
  senderInitials: string
  subject: Localized
  preview: Localized
  priority: Priority
  receivedAt: Localized
}

export type JiraTicket = {
  id: string
  title: Localized
  status: TicketStatus
  points: number
  assignee: string
}

export const AGENDA: readonly MeetingEvent[] = [
  {
    id: 'evt-1',
    title: { vi: 'Standup nhóm Platform', en: 'Platform team standup' },
    start: '09:15',
    end: '09:30',
    minutes: 15,
    attendees: ['Mai', 'Khanh', 'Duy', 'Trang'],
    location: { vi: 'Google Meet', en: 'Google Meet' },
  },
  {
    id: 'evt-2',
    title: { vi: 'Review thiết kế · Lumus v2', en: 'Design review · Lumus v2' },
    start: '11:00',
    end: '12:00',
    minutes: 60,
    attendees: ['Linh', 'Bryan', 'Hòa'],
    location: { vi: 'Phòng họp Aurora', en: 'Aurora meeting room' },
    live: true,
  },
  {
    id: 'evt-3',
    title: { vi: '1:1 với Quản lý sản phẩm', en: '1:1 with Product Manager' },
    start: '14:30',
    end: '15:00',
    minutes: 30,
    attendees: ['Ngọc'],
    location: { vi: 'Google Meet', en: 'Google Meet' },
  },
  {
    id: 'evt-4',
    title: { vi: 'Chốt phạm vi sprint 25', en: 'Sprint 25 scoping' },
    start: '16:00',
    end: '17:00',
    minutes: 60,
    attendees: ['Mai', 'Ngọc', 'Duy'],
    location: { vi: 'Phòng họp Nebula', en: 'Nebula meeting room' },
  },
]

export const MAILBOX: readonly MailItem[] = [
  {
    id: 'mail-1',
    sender: 'Ngọc Trần',
    senderInitials: 'NT',
    subject: { vi: 'Duyệt ngân sách Q4 — cần trả lời hôm nay', en: 'Q4 budget approval — needs a reply today' },
    preview: {
      vi: 'Tài chính cần xác nhận của bạn trước 17:00 để kịp chốt sổ.',
      en: 'Finance needs your sign-off before 5pm to close the books.',
    },
    priority: 'high',
    receivedAt: { vi: '08:12', en: '8:12 AM' },
  },
  {
    id: 'mail-2',
    sender: 'Linh Phạm',
    senderInitials: 'LP',
    subject: { vi: 'Bản mockup mới cho màn hình onboarding', en: 'New mockups for the onboarding screen' },
    preview: {
      vi: 'Mình đã cập nhật flow theo góp ý hôm qua, bạn xem giúp nhé.',
      en: 'Updated the flow with yesterday’s notes — take a look when you can.',
    },
    priority: 'medium',
    receivedAt: { vi: '09:40', en: '9:40 AM' },
  },
  {
    id: 'mail-3',
    sender: 'Vercel',
    senderInitials: 'VC',
    subject: { vi: 'Deploy production đã thành công', en: 'Production deploy succeeded' },
    preview: {
      vi: 'lumus-web · main · 2 phút 14 giây.',
      en: 'lumus-web · main · 2m 14s.',
    },
    priority: 'low',
    receivedAt: { vi: '10:05', en: '10:05 AM' },
  },
  {
    id: 'mail-4',
    sender: 'Hòa Nguyễn',
    senderInitials: 'HN',
    subject: { vi: 'Khách hàng hỏi về lộ trình tích hợp Jira', en: 'Customer asking about the Jira integration roadmap' },
    preview: {
      vi: 'Bên Acme muốn biết khi nào có tính năng đồng bộ hai chiều.',
      en: 'Acme wants to know when two-way sync lands.',
    },
    priority: 'high',
    receivedAt: { vi: '10:32', en: '10:32 AM' },
  },
]

export const SPRINT: readonly JiraTicket[] = [
  {
    id: 'LUM-142',
    title: { vi: 'Luồng OAuth cho Google Calendar', en: 'OAuth flow for Google Calendar' },
    status: 'inReview',
    points: 5,
    assignee: 'Bryan',
  },
  {
    id: 'LUM-146',
    title: { vi: 'Bộ máy trạng thái của mascot', en: 'Mascot state machine' },
    status: 'inProgress',
    points: 8,
    assignee: 'Bryan',
  },
  {
    id: 'LUM-151',
    title: { vi: 'Phân loại hộp thư theo mức ưu tiên', en: 'Inbox triage by priority' },
    status: 'todo',
    points: 3,
    assignee: 'Mai',
  },
  {
    id: 'LUM-153',
    title: { vi: 'Chờ khoá API từ phía Jira Cloud', en: 'Blocked on Jira Cloud API key' },
    status: 'blocked',
    points: 2,
    assignee: 'Duy',
  },
]

export const SPRINT_SUMMARY = {
  completed: 21,
  total: 34,
  daysLeft: 3,
}

export type Stat = {
  id: string
  labelKey: 'statMeetings' | 'statFocus' | 'statTickets' | 'statUnread'
  value: string
  delta: number
}

export const WEEK_STATS: readonly Stat[] = [
  { id: 'meetings', labelKey: 'statMeetings', value: '12', delta: -3 },
  { id: 'focus', labelKey: 'statFocus', value: '18.5', delta: 4 },
  { id: 'tickets', labelKey: 'statTickets', value: '9', delta: 2 },
  { id: 'unread', labelKey: 'statUnread', value: '24', delta: -11 },
]

/** Focus hours per weekday, used by the weekly report sparkline. */
export const FOCUS_SERIES: readonly number[] = [2.5, 4.1, 3.2, 5.0, 3.7]
export const WEEKDAYS: readonly Localized[] = [
  { vi: 'T2', en: 'Mon' },
  { vi: 'T3', en: 'Tue' },
  { vi: 'T4', en: 'Wed' },
  { vi: 'T5', en: 'Thu' },
  { vi: 'T6', en: 'Fri' },
]

export type IntegrationState = {
  connected: boolean
  account: string
  lastSync: Localized
  scopes: readonly Localized[]
}

export const INTEGRATION_DEFAULTS: Record<'calendar' | 'gmail' | 'jira', IntegrationState> = {
  calendar: {
    connected: true,
    account: 'bryan@savameta.com',
    lastSync: { vi: '2 phút trước', en: '2 minutes ago' },
    scopes: [
      { vi: 'Đọc lịch và người tham dự', en: 'Read events and attendees' },
      { vi: 'Tạo và sửa sự kiện', en: 'Create and edit events' },
      { vi: 'Xem trạng thái rảnh/bận', en: 'See free/busy status' },
    ],
  },
  gmail: {
    connected: true,
    account: 'bryan@savameta.com',
    lastSync: { vi: '6 phút trước', en: '6 minutes ago' },
    scopes: [
      { vi: 'Đọc và phân loại thư', en: 'Read and label mail' },
      { vi: 'Soạn thư nháp', en: 'Create drafts' },
      { vi: 'Không tự động gửi thư', en: 'Never send without approval' },
    ],
  },
  jira: {
    connected: false,
    account: 'savameta.atlassian.net',
    lastSync: { vi: 'chưa đồng bộ', en: 'never' },
    scopes: [
      { vi: 'Đọc issue và sprint', en: 'Read issues and sprints' },
      { vi: 'Bình luận thay bạn', en: 'Comment on your behalf' },
      { vi: 'Cập nhật trạng thái ticket', en: 'Move tickets between states' },
    ],
  },
}
