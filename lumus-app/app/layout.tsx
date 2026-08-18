import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/shell/Providers'
import { themeBootstrapScript } from '@/lib/theme/ThemeProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lumus — AI assistant for your workday',
  description:
    'Lumus connects Calendar, Gmail and Jira, then reports, researches and books meetings for you.',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Lumus' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  // Let the glass chrome run under the status bar and home indicator.
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f4f5' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0b0d' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body>
        <div className="ground" aria-hidden="true" />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
