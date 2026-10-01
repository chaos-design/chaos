const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const emailCodePattern = /^\d+$/
const commonRegistrationEmailDomains = new Set([
  "126.com",
  "139.com",
  "163.com",
  "189.cn",
  "aliyun.com",
  "foxmail.com",
  "gmail.com",
  "hotmail.com",
  "icloud.com",
  "live.com",
  "me.com",
  "outlook.com",
  "proton.me",
  "protonmail.com",
  "qq.com",
  "sina.cn",
  "sina.com",
  "sohu.com",
  "wo.cn",
  "yahoo.com",
  "yeah.net",
])

export const authFormConfig = {
  email: {
    invalidMessage: "请输入有效邮箱",
    unsupportedRegistrationDomainMessage:
      "请使用 QQ、网易、Gmail、Outlook 等常用邮箱注册",
  },
  password: {
    minimumLength: 8,
    requiredMessage: "请输入密码",
  },
  emailCode: {
    invalidMessage: "请输入数字邮箱验证码",
    resendCooldownSeconds: 60,
  },
} as const

export function isValidEmail(value: string): boolean {
  return emailPattern.test(value)
}

export function isAllowedRegistrationEmail(value: string): boolean {
  if (!isValidEmail(value)) {
    return false
  }

  const domain = value.slice(value.lastIndexOf("@") + 1).toLowerCase()
  return commonRegistrationEmailDomains.has(domain)
}

export function isValidEmailCode(value: string): boolean {
  return emailCodePattern.test(value)
}
