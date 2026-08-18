'use client'

import { Segmented } from '@/components/glass/Glass'
import { useI18n } from '@/lib/i18n/I18nProvider'
import { LOCALES, LOCALE_LABEL, LOCALE_SHORT, type Locale } from '@/lib/i18n/dictionary'
import { useTheme, type Theme } from '@/lib/theme/ThemeProvider'
import styles from './preferences.module.css'

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
      <path
        d="M20 13.4A8.2 8.2 0 0 1 10.6 4a8.4 8.4 0 1 0 9.4 9.4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AutoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 3.6v16.8A8.4 8.4 0 0 0 12 3.6Z" fill="currentColor" />
    </svg>
  )
}

export function ThemeControl() {
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()

  return (
    <Segmented<Theme>
      ariaLabel={t.common.theme}
      value={theme}
      onChange={setTheme}
      options={[
        { value: 'light', label: <SunIcon />, title: t.common.themeLight },
        { value: 'dark', label: <MoonIcon />, title: t.common.themeDark },
        { value: 'system', label: <AutoIcon />, title: t.common.themeSystem },
      ]}
    />
  )
}

export function LanguageControl() {
  const { locale, setLocale, t } = useI18n()

  return (
    <Segmented<Locale>
      ariaLabel={t.common.language}
      value={locale}
      onChange={setLocale}
      options={LOCALES.map((value) => ({
        value,
        label: LOCALE_SHORT[value],
        title: LOCALE_LABEL[value],
      }))}
    />
  )
}

export function PreferenceControls({ className }: { className?: string }) {
  return (
    <div className={[styles.row, className].filter(Boolean).join(' ')}>
      <LanguageControl />
      <ThemeControl />
    </div>
  )
}
