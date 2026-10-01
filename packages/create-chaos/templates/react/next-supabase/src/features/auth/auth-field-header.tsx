import type { ReactNode } from "react"
import { FieldError, FieldLabel } from "../../components/ui/field"

export function AuthFieldHeader({
  action,
  error,
  errorId,
  htmlFor,
  label,
}: {
  action?: ReactNode
  error?: string
  errorId?: string
  htmlFor: string
  label: string
}) {
  return (
    <div className="field-label-row">
      <div className="field-label-feedback">
        <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
        <FieldError id={errorId}>{error}</FieldError>
      </div>
      {action}
    </div>
  )
}
