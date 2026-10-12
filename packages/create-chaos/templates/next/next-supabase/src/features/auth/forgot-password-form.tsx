"use client"

import { ArrowRightIcon, MailIcon } from "lucide-react"
import { type FormEvent, useId, useMemo, useState } from "react"
import { Button } from "../../components/ui/button"
import { Field, FieldGroup } from "../../components/ui/field"
import { Input } from "../../components/ui/input"
import { Spinner } from "../../components/ui/spinner"
import { createClient } from "../../lib/supabase/client"
import { getAuthErrorMessage } from "./auth-error"
import { AuthFeedback } from "./auth-feedback"
import { AuthFieldHeader } from "./auth-field-header"
import { authFormConfig, isValidEmail } from "./auth-form-config"

export function ForgotPasswordForm({ nextPath }: { nextPath: string }) {
  const supabase = useMemo(() => createClient(), [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [emailError, setEmailError] = useState("")
  const emailId = useId()
  const emailErrorId = useId()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setMessage("")
    setEmailError("")

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "").trim()
    if (!isValidEmail(email)) {
      setEmailError(authFormConfig.email.invalidMessage)
      return
    }

    const resetPath = `/reset-password?next=${encodeURIComponent(nextPath)}`
    const callbackUrl = new URL("/auth/callback", window.location.origin)
    callbackUrl.searchParams.set("next", resetPath)

    setIsSubmitting(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: callbackUrl.toString(),
      })
      if (resetError) {
        throw resetError
      }
      setMessage("重设密码邮件已发送，请前往邮箱继续。")
    } catch (submitError) {
      setError(getAuthErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="auth-form" noValidate onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-invalid={Boolean(emailError)}>
          <AuthFieldHeader
            htmlFor={emailId}
            label="邮箱"
            error={emailError}
            errorId={emailErrorId}
          />
          <Input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="请输入账户邮箱"
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? emailErrorId : undefined}
            onChange={() => {
              if (emailError) {
                setEmailError("")
              }
            }}
            required
          />
        </Field>

        <AuthFeedback error={error} message={message} />

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <MailIcon data-icon="inline-start" aria-hidden="true" />
          )}
          发送重设邮件
          <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
        </Button>
      </FieldGroup>
    </form>
  )
}
