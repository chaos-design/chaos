"use client"

import { ArrowRightIcon, KeyRoundIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { type FormEvent, useId, useMemo, useState } from "react"
import { Button } from "../../components/ui/button"
import { Field, FieldGroup } from "../../components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../../components/ui/input-group"
import { Spinner } from "../../components/ui/spinner"
import { createClient } from "../../lib/supabase/client"
import { getAuthErrorMessage } from "./auth-error"
import { AuthFeedback } from "./auth-feedback"
import { AuthFieldHeader } from "./auth-field-header"
import { authFormConfig } from "./auth-form-config"
import { PasswordVisibilityButton } from "./password-visibility-button"

export function ResetPasswordForm({ nextPath }: { nextPath: string }) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmationError, setConfirmationError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const passwordId = useId()
  const passwordErrorId = useId()
  const confirmationId = useId()
  const confirmationErrorId = useId()

  function validatePassword(value: string): boolean {
    if (value.length < authFormConfig.password.minimumLength) {
      setPasswordError(`密码至少需要 ${authFormConfig.password.minimumLength} 位`)
      return false
    }
    setPasswordError("")
    return true
  }

  function validateConfirmation(value: string, password: string): boolean {
    if (!value) {
      setConfirmationError("请再次输入密码")
      return false
    }
    if (password !== value) {
      setConfirmationError("两次输入的密码不一致")
      return false
    }
    setConfirmationError("")
    return true
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setPasswordError("")
    setConfirmationError("")

    const formData = new FormData(event.currentTarget)
    const password = String(formData.get("password") ?? "")
    const confirmation = String(formData.get("confirmation") ?? "")

    const isPasswordValid = validatePassword(password)
    const isConfirmationValid = validateConfirmation(confirmation, password)
    if (!isPasswordValid || !isConfirmationValid) {
      return
    }

    setIsSubmitting(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        throw updateError
      }
      router.replace(nextPath)
      router.refresh()
    } catch (submitError) {
      setError(getAuthErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="auth-form" noValidate onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-invalid={Boolean(passwordError)}>
          <AuthFieldHeader
            htmlFor={passwordId}
            label="新密码"
            error={passwordError}
            errorId={passwordErrorId}
          />
          <InputGroup>
            <InputGroupInput
              id={passwordId}
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={authFormConfig.password.minimumLength}
              placeholder={`请输入至少 ${authFormConfig.password.minimumLength} 位新密码`}
              aria-invalid={Boolean(passwordError)}
              aria-describedby={passwordError ? passwordErrorId : undefined}
              onBlur={(event) => validatePassword(event.currentTarget.value)}
              onChange={(event) => {
                if (passwordError) {
                  validatePassword(event.currentTarget.value)
                }
              }}
              required
            />
            <InputGroupAddon>
              <PasswordVisibilityButton
                isVisible={showPassword}
                onToggle={() => setShowPassword((value) => !value)}
              />
            </InputGroupAddon>
          </InputGroup>
        </Field>

        <Field data-invalid={Boolean(confirmationError)}>
          <AuthFieldHeader
            htmlFor={confirmationId}
            label="确认新密码"
            error={confirmationError}
            errorId={confirmationErrorId}
          />
          <InputGroup>
            <InputGroupInput
              id={confirmationId}
              name="confirmation"
              type={showConfirmation ? "text" : "password"}
              autoComplete="new-password"
              minLength={authFormConfig.password.minimumLength}
              placeholder="请再次输入新密码"
              aria-invalid={Boolean(confirmationError)}
              aria-describedby={confirmationError ? confirmationErrorId : undefined}
              onChange={() => {
                if (confirmationError) {
                  setConfirmationError("")
                }
              }}
              required
            />
            <InputGroupAddon>
              <PasswordVisibilityButton
                isVisible={showConfirmation}
                onToggle={() => setShowConfirmation((value) => !value)}
              />
            </InputGroupAddon>
          </InputGroup>
        </Field>

        <AuthFeedback error={error} message="" />

        <Button
          className="w-full"
          type="submit"
          disabled={
            isSubmitting || Boolean(passwordError) || Boolean(confirmationError)
          }
        >
          {isSubmitting ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <KeyRoundIcon data-icon="inline-start" aria-hidden="true" />
          )}
          更新密码
          <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
        </Button>
      </FieldGroup>
    </form>
  )
}
