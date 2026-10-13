import { describe, expect, it } from "vitest"
import {
  authFormConfig,
  isAllowedRegistrationEmail,
  isValidEmail,
  isValidEmailCode,
} from "./auth-form-config"

describe("auth form config", () => {
  it("requires passwords to contain at least eight characters", () => {
    expect(authFormConfig.password.minimumLength).toBe(8)
  })

  it.each([
    ["user@example.com", true],
    [" user@example.com ", false],
    ["user@example", false],
    ["user@", false],
  ])("validates email %s", (value, expected) => {
    expect(isValidEmail(value)).toBe(expected)
  })

  it.each([
    "member@qq.com",
    "member@163.com",
    "member@foxmail.com",
    "member@gmail.com",
    "member@outlook.com",
    "member@icloud.com",
    "member@proton.me",
  ])("allows registration with a common email domain: %s", (email) => {
    expect(isAllowedRegistrationEmail(email)).toBe(true)
  })

  it("matches registration email domains case-insensitively", () => {
    expect(isAllowedRegistrationEmail("member@QQ.COM")).toBe(true)
  })

  it.each([
    "member@example.com",
    "member@company.internal",
    "member@mail.qq.com",
    "member@qq.com.example.com",
    "invalid-address",
  ])("rejects unsupported registration email domains: %s", (email) => {
    expect(isAllowedRegistrationEmail(email)).toBe(false)
  })

  it("accepts numeric email codes without imposing a length", () => {
    expect(authFormConfig.emailCode.resendCooldownSeconds).toBe(60)
    expect(isValidEmailCode("123456")).toBe(true)
    expect(isValidEmailCode("1")).toBe(true)
    expect(isValidEmailCode("123456789012")).toBe(true)
    expect(isValidEmailCode("")).toBe(false)
    expect(isValidEmailCode("12345a")).toBe(false)
  })
})
