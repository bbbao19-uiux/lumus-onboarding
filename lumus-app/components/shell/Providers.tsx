'use client'

import type { ReactNode } from 'react'
import { I18nProvider } from '@/lib/i18n/I18nProvider'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'
import { MascotProvider } from '@/components/mascot/MascotContext'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <MascotProvider>{children}</MascotProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}
