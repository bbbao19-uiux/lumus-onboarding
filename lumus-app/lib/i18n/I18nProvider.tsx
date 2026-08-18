'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { dictionaries, LOCALES, type Dictionary, type Locale } from './dictionary'

const STORAGE_KEY = 'lumus.locale'
const DEFAULT_LOCALE: Locale = 'vi'

type I18nValue = {
  locale: Locale
  setLocale: (next: Locale) => void
  t: Dictionary
}

const I18nContext = createContext<I18nValue | null>(null)

function isLocale(value: string | null): value is Locale {
  return value !== null && (LOCALES as readonly string[]).includes(value)
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // Always start from the default so server and client markup agree, then
  // adopt the stored preference on mount.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (isLocale(stored) && stored !== DEFAULT_LOCALE) setLocaleState(stored)
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const value = useMemo<I18nValue>(
    () => ({ locale, setLocale, t: dictionaries[locale] }),
    [locale, setLocale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>')
  return ctx
}
