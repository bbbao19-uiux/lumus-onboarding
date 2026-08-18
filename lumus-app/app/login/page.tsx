'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FieldAdornment, GlassButton, GlassCard, GlassField } from '@/components/glass/Glass'
import { BrandMark } from '@/components/mascot/BrandMark'
import { Mascot } from '@/components/mascot/Mascot'
import { useMascot } from '@/components/mascot/MascotContext'
import { PreferenceControls } from '@/components/shell/PreferenceControls'
import { useI18n } from '@/lib/i18n/I18nProvider'
import { OtpInput } from './OtpInput'
import styles from './login.module.css'

const DEMO_OTP = '123456'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type Step = 'credentials' | 'otp'

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true">
      <path
        d="M2.6 12S6.4 5.8 12 5.8 21.4 12 21.4 12 17.6 18.2 12 18.2 2.6 12 2.6 12Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.9" stroke="currentColor" strokeWidth="1.7" />
      {open ? null : <path d="M4 20 20 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />}
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const { t } = useI18n()
  const { pulse, say, setBaseMood } = useMascot()

  const [step, setStep] = useState<Step>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [otp, setOtp] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; otp?: string }>({})
  const [pending, setPending] = useState(false)

  const passwordRef = useRef<HTMLInputElement>(null)

  const submitCredentials = (event: React.FormEvent) => {
    event.preventDefault()
    const next: typeof errors = {}
    if (!EMAIL_RE.test(email)) next.email = t.auth.emailError
    if (password.length < 6) next.password = t.auth.passwordError
    setErrors(next)
    if (Object.keys(next).length > 0) {
      pulse('angry', 900)
      return
    }
    setPending(true)
    setBaseMood('working')
    window.setTimeout(() => {
      setPending(false)
      setBaseMood('idle')
      setStep('otp')
      setOtp('')
    }, 900)
  }

  const submitOtp = (event: React.FormEvent) => {
    event.preventDefault()
    if (otp !== DEMO_OTP) {
      setErrors({ otp: t.auth.otpError })
      pulse('angry', 1200)
      return
    }
    setErrors({})
    setPending(true)
    setBaseMood('working')
    pulse('happy', 1600)
    say(t.mascot.happy[0] ?? '')
    window.setTimeout(() => {
      // Hand the workspace a calm mascot rather than a stuck "working" one.
      setBaseMood('idle')
      router.push('/dashboard')
    }, 700)
  }

  return (
    <main className={`phone ${styles.page}`}>
      <div className={styles.topbar}>
        <span className={styles.brand}>
          <BrandMark className={styles.brandMark} />
          {t.common.appName}
        </span>
        <PreferenceControls />
      </div>

      <div className={styles.hero}>
        <div className={styles.mascotSlot}>
          <Mascot size={188} bubbleAlign="center" />
        </div>

        <h1 className={styles.title}>
          {step === 'credentials' ? t.auth.title : t.auth.otpTitle}
        </h1>
        <p className={styles.subtitle}>
          {step === 'credentials' ? t.auth.subtitle : t.auth.otpSubtitle}
        </p>

        <GlassCard className={styles.card} pad="lg" tone="thick">
          {step === 'credentials' ? (
            <form className={styles.form} onSubmit={submitCredentials} noValidate>
              <GlassField
                label={t.auth.emailLabel}
                type="email"
                name="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                placeholder={t.auth.emailPlaceholder}
                value={email}
                error={errors.email}
                onChange={(event) => setEmail(event.target.value)}
              />

              <GlassField
                label={t.auth.passwordLabel}
                type={revealed ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                placeholder={t.auth.passwordPlaceholder}
                value={password}
                error={errors.password}
                ref={passwordRef}
                onChange={(event) => setPassword(event.target.value)}
                adornment={
                  <FieldAdornment
                    aria-label={revealed ? t.auth.hidePassword : t.auth.showPassword}
                    onClick={() => {
                      setRevealed((current) => !current)
                      // Re-focusing re-runs the mascot's focus check, so it
                      // peeks the moment the password becomes visible.
                      window.setTimeout(() => passwordRef.current?.focus(), 0)
                    }}
                  >
                    <EyeIcon open={!revealed} />
                  </FieldAdornment>
                }
              />

              <div className={styles.rowEnd}>
                <button type="button" className={styles.link}>
                  {t.auth.otpResend}
                </button>
              </div>

              <GlassButton type="submit" variant="primary" size="lg" full disabled={pending}>
                {pending ? t.auth.signingIn : t.auth.signIn}
              </GlassButton>

              <span className={styles.hintNote}>{t.auth.demoHint}</span>
            </form>
          ) : (
            <form className={styles.form} onSubmit={submitOtp} noValidate>
              <p className={styles.sentTo}>
                <strong>{email}</strong>
              </p>

              <OtpInput
                value={otp}
                onChange={(next) => {
                  setOtp(next)
                  if (errors.otp) setErrors({})
                }}
                invalid={Boolean(errors.otp)}
                label={t.auth.otpTitle}
                autoFocus
              />

              {errors.otp ? <p className={styles.error}>{errors.otp}</p> : null}

              <GlassButton
                type="submit"
                variant="primary"
                size="lg"
                full
                disabled={pending || otp.length < 6}
              >
                {pending ? t.auth.signingIn : t.auth.otpVerify}
              </GlassButton>

              <div className={styles.rowEnd} style={{ justifyContent: 'space-between' }}>
                <button
                  type="button"
                  className={styles.link}
                  onClick={() => {
                    setStep('credentials')
                    setErrors({})
                  }}
                >
                  {t.common.back}
                </button>
                <button type="button" className={styles.link}>
                  {t.auth.otpResend}
                </button>
              </div>

              <span className={styles.hintNote}>{t.auth.demoHint}</span>
            </form>
          )}
        </GlassCard>

        {step === 'credentials' ? (
          <>
            <p className={styles.tipsTitle}>{t.auth.tryMascot}</p>
            <ul className={styles.tips}>
              {[t.auth.tip1, t.auth.tip2, t.auth.tip3].map((tip, index) => (
                <li key={tip} className={styles.tip}>
                  <span className={styles.tipIndex}>{index + 1}</span>
                  {tip}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <p className={styles.footer}>{t.chat.disclaimer}</p>
      </div>
    </main>
  )
}
