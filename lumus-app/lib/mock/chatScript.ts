import type { Locale } from '@/lib/i18n/dictionary'
import type { ToolKey } from '@/lib/tools'
import type { Localized } from './data'

export type ToolRun = {
  id: string
  tool: ToolKey
  title: Localized
  /** Rows rendered inside the expandable result panel. */
  rows: ReadonlyArray<{ label: Localized; value: Localized }>
  runMs: number
}

export type MeetingProposal = {
  title: Localized
  when: Localized
  duration: Localized
  attendees: readonly string[]
  location: Localized
}

export type Intent = {
  id: string
  keywords: Record<Locale, readonly string[]>
  tools: readonly ToolRun[]
  reply: Localized
  proposal?: MeetingProposal
}

export const INTENTS: readonly Intent[] = [
  {
    id: 'brief',
    keywords: {
      vi: ['tóm tắt', 'tổng quan', 'ngày làm việc', 'hôm nay có gì', 'brief'],
      en: ['summarise', 'summarize', 'brief', 'my day', 'overview', 'today'],
    },
    tools: [
      {
        id: 'brief-cal',
        tool: 'calendar',
        title: { vi: 'Đọc lịch hôm nay', en: 'Reading today’s calendar' },
        runMs: 1100,
        rows: [
          { label: { vi: 'Sự kiện', en: 'Events' }, value: { vi: '4 cuộc họp', en: '4 meetings' } },
          {
            label: { vi: 'Tổng thời lượng', en: 'Total time' },
            value: { vi: '2 giờ 45 phút', en: '2h 45m' },
          },
          {
            label: { vi: 'Khoảng trống dài nhất', en: 'Longest free block' },
            value: { vi: '12:00 – 14:30', en: '12:00 – 14:30' },
          },
        ],
      },
      {
        id: 'brief-mail',
        tool: 'gmail',
        title: { vi: 'Quét hộp thư đến', en: 'Scanning the inbox' },
        runMs: 1300,
        rows: [
          { label: { vi: 'Chưa đọc', en: 'Unread' }, value: { vi: '24 thư', en: '24 messages' } },
          {
            label: { vi: 'Cần trả lời', en: 'Needs a reply' },
            value: { vi: '2 thư ưu tiên cao', en: '2 high priority' },
          },
        ],
      },
      {
        id: 'brief-jira',
        tool: 'jira',
        title: { vi: 'Kiểm tra sprint hiện tại', en: 'Checking the current sprint' },
        runMs: 900,
        rows: [
          { label: { vi: 'Tiến độ', en: 'Progress' }, value: { vi: '21/34 điểm', en: '21 of 34 points' } },
          { label: { vi: 'Bị chặn', en: 'Blocked' }, value: { vi: 'LUM-153', en: 'LUM-153' } },
        ],
      },
    ],
    reply: {
      vi: `Đây là bức tranh ngày hôm nay của bạn.

**Lịch** — 4 cuộc họp, tổng 2 giờ 45 phút. Khối trống dài nhất là 12:00–14:30, mình khuyên nên giữ nguyên để làm LUM-146.

**Hộp thư** — 24 thư chưa đọc, nhưng chỉ 2 thư thực sự gấp: duyệt ngân sách Q4 của Ngọc (hạn 17:00) và câu hỏi lộ trình Jira từ Hòa.

**Sprint 24** — 21/34 điểm đã xong, còn 3 ngày. LUM-153 đang bị chặn vì thiếu khoá API Jira Cloud; nếu không gỡ trong hôm nay thì nên đẩy sang sprint sau.

Bạn muốn mình soạn sẵn thư trả lời Ngọc không?`,
      en: `Here is how today looks.

**Calendar** — 4 meetings, 2h 45m total. Your longest free block is 12:00–14:30; I would keep it clear for LUM-146.

**Inbox** — 24 unread, but only 2 that actually need you: Ngọc's Q4 budget approval (due 5pm) and Hòa's question about the Jira roadmap.

**Sprint 24** — 21 of 34 points done with 3 days left. LUM-153 is blocked on the Jira Cloud API key; if that does not clear today it should roll to the next sprint.

Want me to draft the reply to Ngọc?`,
    },
  },
  {
    id: 'schedule',
    keywords: {
      vi: ['đặt lịch', 'tạo lịch', 'lịch họp', 'cuộc họp', 'hẹn', 'book'],
      en: ['schedule', 'book', 'set up a meeting', 'meeting', 'invite'],
    },
    tools: [
      {
        id: 'sched-freebusy',
        tool: 'calendar',
        title: { vi: 'Tìm khung giờ trống của cả nhóm', en: 'Finding a slot everyone shares' },
        runMs: 1400,
        rows: [
          {
            label: { vi: 'Đã kiểm tra', en: 'Checked' },
            value: { vi: '3 lịch cá nhân', en: '3 calendars' },
          },
          {
            label: { vi: 'Khung phù hợp nhất', en: 'Best slot' },
            value: { vi: 'Thứ Năm, 15:00 – 16:00', en: 'Thursday, 3:00 – 4:00 PM' },
          },
          {
            label: { vi: 'Xung đột', en: 'Conflicts' },
            value: { vi: 'không có', en: 'none' },
          },
        ],
      },
      {
        id: 'sched-mail',
        tool: 'gmail',
        title: { vi: 'Tìm ngữ cảnh trong email gần đây', en: 'Pulling context from recent mail' },
        runMs: 800,
        rows: [
          {
            label: { vi: 'Luồng liên quan', en: 'Related thread' },
            value: { vi: 'Mockup onboarding — Linh Phạm', en: 'Onboarding mockups — Linh Phạm' },
          },
        ],
      },
    ],
    proposal: {
      title: { vi: 'Review thiết kế · Onboarding v2', en: 'Design review · Onboarding v2' },
      when: { vi: 'Thứ Năm, 15:00 – 16:00', en: 'Thursday, 3:00 – 4:00 PM' },
      duration: { vi: '60 phút', en: '60 minutes' },
      attendees: ['linh@savameta.com', 'hoa@savameta.com', 'bryan@savameta.com'],
      location: { vi: 'Google Meet (tự sinh link)', en: 'Google Meet (link auto-created)' },
    },
    reply: {
      vi: `Mình đã đối chiếu lịch của Linh, Hòa và bạn. Khung 15:00–16:00 thứ Năm là lựa chọn duy nhất không đụng gì trong tuần này.

Mình cũng đọc luồng email của Linh về mockup onboarding và dùng nó làm mô tả cuộc họp. Bạn xem qua rồi bấm tạo nhé — mình không tự gửi lời mời khi chưa có xác nhận.`,
      en: `I compared Linh's, Hòa's and your calendars. Thursday 3:00–4:00 PM is the only clash-free slot this week.

I also read Linh's thread about the onboarding mockups and used it as the event description. Review it and hit create — I never send invites without your sign-off.`,
    },
  },
  {
    id: 'triage',
    keywords: {
      vi: ['hộp thư', 'email', 'phân loại', 'thư nào', 'trả lời gấp'],
      en: ['inbox', 'email', 'triage', 'mail', 'urgent'],
    },
    tools: [
      {
        id: 'triage-mail',
        tool: 'gmail',
        title: { vi: 'Phân loại 24 thư chưa đọc', en: 'Triaging 24 unread messages' },
        runMs: 1500,
        rows: [
          { label: { vi: 'Cần bạn xử lý', en: 'Needs you' }, value: { vi: '2', en: '2' } },
          { label: { vi: 'Có thể chờ', en: 'Can wait' }, value: { vi: '7', en: '7' } },
          { label: { vi: 'Thông báo tự động', en: 'Automated' }, value: { vi: '15', en: '15' } },
        ],
      },
    ],
    reply: {
      vi: `Mình đã chia 24 thư thành ba nhóm.

**Cần bạn hôm nay (2)**
- Ngọc Trần — duyệt ngân sách Q4, hạn 17:00.
- Hòa Nguyễn — Acme hỏi khi nào có đồng bộ hai chiều với Jira.

**Có thể chờ (7)** — chủ yếu là góp ý thiết kế và cập nhật tài liệu, không thư nào có hạn trong 48 giờ tới.

**Tự động (15)** — deploy, CI, báo cáo. Mình đã gắn nhãn và lưu trữ giúp bạn.

Nói một tiếng là mình soạn nháp cho hai thư đầu.`,
      en: `I split the 24 messages into three buckets.

**Needs you today (2)**
- Ngọc Trần — Q4 budget approval, due 5pm.
- Hòa Nguyễn — Acme asking when two-way Jira sync ships.

**Can wait (7)** — mostly design feedback and doc updates, nothing due in the next 48 hours.

**Automated (15)** — deploys, CI, reports. I labelled and archived those for you.

Say the word and I will draft replies for the first two.`,
    },
  },
  {
    id: 'standup',
    keywords: {
      vi: ['standup', 'báo cáo', 'hôm qua', 'tiến độ'],
      en: ['standup', 'stand-up', 'report', 'yesterday', 'progress'],
    },
    tools: [
      {
        id: 'standup-jira',
        tool: 'jira',
        title: { vi: 'Đọc hoạt động Jira hôm qua', en: 'Reading yesterday’s Jira activity' },
        runMs: 1200,
        rows: [
          { label: { vi: 'Ticket đã chuyển trạng thái', en: 'Tickets moved' }, value: { vi: '3', en: '3' } },
          { label: { vi: 'Bình luận', en: 'Comments' }, value: { vi: '7', en: '7' } },
          { label: { vi: 'Đang bị chặn', en: 'Blocked' }, value: { vi: '1', en: '1' } },
        ],
      },
    ],
    reply: {
      vi: `Bản nháp standup của bạn:

**Hôm qua**
- Đưa LUM-142 (OAuth Google Calendar) sang review, đã xử lý xong 7 bình luận.
- Hoàn thiện bộ máy trạng thái mascot trong LUM-146, còn phần animation che mắt.

**Hôm nay**
- Chốt LUM-146 và nhờ Mai review.
- Trả lời câu hỏi lộ trình Jira của Acme.

**Vướng mắc**
- LUM-153 vẫn chờ khoá API Jira Cloud từ IT — đã chờ 2 ngày.

Copy thẳng vào Slack được luôn.`,
      en: `Here is your standup draft:

**Yesterday**
- Moved LUM-142 (Google Calendar OAuth) into review and cleared all 7 comments.
- Finished the mascot state machine in LUM-146; the eye-cover animation is the last piece.

**Today**
- Land LUM-146 and get Mai to review it.
- Answer Acme's question about the Jira roadmap.

**Blockers**
- LUM-153 is still waiting on the Jira Cloud API key from IT — two days now.

Ready to paste straight into Slack.`,
    },
  },
]

export const FALLBACK: Intent = {
  id: 'fallback',
  keywords: { vi: [], en: [] },
  tools: [
    {
      id: 'fallback-search',
      tool: 'calendar',
      title: { vi: 'Đối chiếu ngữ cảnh công việc', en: 'Cross-checking your work context' },
      runMs: 900,
      rows: [
        {
          label: { vi: 'Nguồn đã đọc', en: 'Sources read' },
          value: { vi: 'Calendar, Gmail, Jira', en: 'Calendar, Gmail, Jira' },
        },
      ],
    },
  ],
  reply: {
    vi: `Mình đã ghi nhận. Trong bản demo này Lumi trả lời sẵn cho bốn tình huống: tóm tắt ngày làm việc, đặt lịch họp, phân loại hộp thư và soạn báo cáo standup.

Bạn thử một trong các gợi ý bên dưới để xem đầy đủ luồng gọi công cụ nhé.`,
    en: `Noted. In this demo Lumi has scripted answers for four situations: briefing your day, scheduling a meeting, triaging the inbox and drafting a standup.

Try one of the suggestions below to see the full tool-calling flow.`,
  },
}

export function matchIntent(input: string, locale: Locale): Intent {
  const haystack = input.toLowerCase()
  for (const intent of INTENTS) {
    const keywords = [...intent.keywords[locale], ...intent.keywords.en]
    if (keywords.some((keyword) => haystack.includes(keyword.toLowerCase()))) return intent
  }
  return FALLBACK
}
