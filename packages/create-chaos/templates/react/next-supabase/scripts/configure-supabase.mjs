#!/usr/bin/env node

import { chmod, readFile, rename, writeFile } from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"
import { getDevPort, setDevPort, syncSupabaseDevPort } from "./scaffold-config.mjs"

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDirectory, "..")
const defaultDevPort = getDevPort(projectRoot)

function printUsage() {
  process.stdout.write(`Configure Supabase for this project.

Usage:
  node scripts/configure-supabase.mjs [options]

Connection:
  --create-project             Create a hosted project before configuration
  --project-name <name>        Hosted project name
  --organization-slug <slug>   Supabase organization slug
  --region <region>            Hosted database region
  --project-ref <ref>          Hosted Supabase project ref
  --url <url>                  Supabase URL; derived from project ref when omitted
  --publishable-key <key>      Public key; fetched with SUPABASE_ACCESS_TOKEN when omitted
  --output-env-file <path>     Environment file (default: .env.local)
  --result-file <path>         Write non-secret setup result JSON

Auth configuration:
  --site-url <url>             Primary hosted Auth site URL
  --dev-port <port>            Update scaffold.config.json devPort (${defaultDevPort})
  --configure-remote           Push Auth settings and email templates
  --no-configure-remote        Only create the local environment file

Authentication:
  SUPABASE_ACCESS_TOKEN        Required for key discovery and remote configuration
  SUPABASE_DB_PASSWORD         Required only with --create-project

The access token is read only from the environment and is never written to disk.
`)
}

function fail(message) {
  throw new Error(message)
}

function requireValue(args, index, option) {
  const value = args[index + 1]
  if (!value || value.startsWith("--")) {
    fail(`${option} requires a value.`)
  }
  return value
}

function parseArguments(args) {
  const options = {
    createProject: false,
    projectName: "",
    organizationSlug: "",
    region: "",
    projectRef: "",
    supabaseUrl: "",
    publishableKey: "",
    envFile: ".env.local",
    resultFile: "",
    siteUrl: "",
    devPort: defaultDevPort,
    shouldPersistDevPort: false,
    configureRemote: false,
  }

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    switch (argument) {
      case "--create-project":
        options.createProject = true
        break
      case "--project-name":
        options.projectName = requireValue(args, index, argument)
        index += 1
        break
      case "--organization-slug":
        options.organizationSlug = requireValue(args, index, argument)
        index += 1
        break
      case "--region":
        options.region = requireValue(args, index, argument)
        index += 1
        break
      case "--project-ref":
        options.projectRef = requireValue(args, index, argument)
        index += 1
        break
      case "--url":
        options.supabaseUrl = requireValue(args, index, argument)
        index += 1
        break
      case "--publishable-key":
        options.publishableKey = requireValue(args, index, argument)
        index += 1
        break
      case "--output-env-file":
        options.envFile = requireValue(args, index, argument)
        index += 1
        break
      case "--result-file":
        options.resultFile = requireValue(args, index, argument)
        index += 1
        break
      case "--site-url":
        options.siteUrl = requireValue(args, index, argument)
        index += 1
        break
      case "--dev-port":
        options.devPort = Number(requireValue(args, index, argument))
        options.shouldPersistDevPort = true
        index += 1
        break
      case "--configure-remote":
        options.configureRemote = true
        break
      case "--no-configure-remote":
        options.configureRemote = false
        break
      case "--help":
      case "-h":
        printUsage()
        process.exit(0)
        break
      case "--":
        break
      default:
        fail(`Unknown option: ${argument}`)
    }
  }

  return options
}

function normalizeUrl(rawValue, label) {
  let url
  try {
    url = new URL(rawValue)
  } catch {
    fail(`${label} must be a valid URL.`)
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    fail(`${label} must use http or https.`)
  }
  if (url.username || url.password || url.search || url.hash) {
    fail(`${label} cannot contain credentials, a query, or a hash.`)
  }

  return url.toString().replace(/\/+$/, "")
}

function validateOptions(options) {
  if (options.createProject && options.projectRef) {
    fail("--create-project cannot be combined with --project-ref.")
  }
  if (options.createProject && (options.supabaseUrl || options.publishableKey)) {
    fail("--create-project cannot be combined with an existing URL or key.")
  }
  if (options.projectRef && !/^[a-z]{20}$/.test(options.projectRef)) {
    fail("The Supabase project ref must contain exactly 20 lowercase letters.")
  }
  if (options.createProject) {
    if (!options.projectName.trim()) {
      fail("--create-project requires --project-name.")
    }
    if (!/^[\w-]+$/.test(options.organizationSlug)) {
      fail("--create-project requires a valid --organization-slug.")
    }
    if (!options.region) {
      fail("--create-project requires --region.")
    }
    if (!process.env.SUPABASE_DB_PASSWORD) {
      fail("--create-project requires SUPABASE_DB_PASSWORD.")
    }
    if (!process.env.SUPABASE_ACCESS_TOKEN) {
      fail("--create-project requires SUPABASE_ACCESS_TOKEN.")
    }
  }

  if (
    !Number.isInteger(options.devPort) ||
    options.devPort < 1 ||
    options.devPort > 65535
  ) {
    fail("The development port must be between 1 and 65535.")
  }

  if (options.supabaseUrl) {
    options.supabaseUrl = normalizeUrl(options.supabaseUrl, "Supabase URL")
  }

  if (!options.siteUrl) {
    options.siteUrl = `http://localhost:${options.devPort}`
  }
  options.siteUrl = normalizeUrl(options.siteUrl, "Site URL")

  if (/[\r\n]/u.test(options.publishableKey)) {
    fail("The publishable key cannot contain line breaks.")
  }
  if (options.configureRemote && !options.projectRef && !options.createProject) {
    fail("--configure-remote requires --project-ref.")
  }
}

async function managementRequest(route, init = {}) {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim()
  if (!accessToken) {
    fail("SUPABASE_ACCESS_TOKEN is required for hosted Supabase configuration.")
  }

  const apiBase = (
    process.env.SUPABASE_MANAGEMENT_API_URL ?? "https://api.supabase.com"
  ).replace(/\/+$/, "")
  const response = await fetch(`${apiBase}${route}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  })

  if (!response.ok) {
    const responseText = await response.text()
    const secrets = [
      process.env.SUPABASE_ACCESS_TOKEN,
      process.env.SUPABASE_DB_PASSWORD,
    ].filter(Boolean)
    let detail = responseText.trim().slice(0, 500)
    for (const secret of secrets) {
      detail = detail.split(secret).join("[redacted]")
    }
    const error = new Error(
      `Supabase Management API returned ${response.status}${
        detail ? `: ${detail}` : ""
      }`,
    )
    error.status = response.status
    throw error
  }

  return response.json()
}

async function discoverPublishableKey(projectRef) {
  const maximumAttempts = 12
  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    const keys = await managementRequest(
      `/v1/projects/${encodeURIComponent(projectRef)}/api-keys?reveal=true`,
    )
    if (!Array.isArray(keys)) {
      fail("Supabase returned an invalid API key response.")
    }

    const publishableKey = keys.find(
      (key) => key?.type === "publishable" && key?.api_key,
    )?.api_key
    if (publishableKey) {
      return publishableKey
    }
    if (attempt < maximumAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }

  fail(
    "No publishable key was found. Create one in Supabase or pass --publishable-key.",
  )
}

async function createHostedProject(options) {
  const project = await managementRequest("/v1/projects", {
    method: "POST",
    body: JSON.stringify({
      db_pass: process.env.SUPABASE_DB_PASSWORD,
      name: options.projectName,
      organization_slug: options.organizationSlug,
      region_selection: {
        type: "specific",
        code: options.region,
      },
    }),
  })

  if (!project?.ref || !/^[a-z]{20}$/.test(project.ref)) {
    fail("Supabase did not return a valid project ref.")
  }
  return project.ref
}

async function waitForProject(projectRef) {
  const maximumAttempts = 60
  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    const project = await managementRequest(
      `/v1/projects/${encodeURIComponent(projectRef)}`,
    )
    if (project.status === "ACTIVE_HEALTHY") {
      return
    }
    if (["INIT_FAILED", "REMOVED", "RESTORE_FAILED"].includes(project.status)) {
      fail(`Supabase project provisioning failed with status ${project.status}.`)
    }
    if (attempt < maximumAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }
  fail("Timed out waiting for the Supabase project to become healthy.")
}

function createRedirectUrls(siteUrl, devPort) {
  const origins = new Set([
    siteUrl,
    `http://localhost:${devPort}`,
    `http://127.0.0.1:${devPort}`,
  ])
  const redirects = []

  for (const origin of origins) {
    redirects.push(`${origin}/auth/confirm`, `${origin}/auth/callback`)
  }

  return redirects
}

async function configureRemoteAuth(options) {
  const authConfigPath = `/v1/projects/${encodeURIComponent(
    options.projectRef,
  )}/config/auth`
  const currentAuthConfig = await managementRequest(authConfigPath)
  const [confirmationTemplate, magicLinkTemplate] = await Promise.all([
    readFile(path.join(projectRoot, "supabase/templates/confirmation.html"), "utf8"),
    readFile(path.join(projectRoot, "supabase/templates/magic_link.html"), "utf8"),
  ])

  const redirectUrls = new Set(
    (currentAuthConfig.uri_allow_list ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  )
  for (const redirectUrl of createRedirectUrls(options.siteUrl, options.devPort)) {
    redirectUrls.add(redirectUrl)
  }

  const body = {
    site_url: options.siteUrl,
    uri_allow_list: [...redirectUrls].join(","),
    disable_signup: false,
    external_email_enabled: true,
    mailer_autoconfirm: false,
    mailer_otp_length: 6,
    mailer_otp_exp: 3600,
    mailer_secure_email_change_enabled: true,
    mailer_subjects_confirmation: "验证您的邮箱",
    mailer_templates_confirmation_content: confirmationTemplate,
    mailer_subjects_magic_link: "您的登录验证码",
    mailer_templates_magic_link_content: magicLinkTemplate,
    refresh_token_rotation_enabled: true,
    security_refresh_token_reuse_interval: 10,
    password_min_length: 8,
    security_update_password_require_reauthentication: false,
  }

  await managementRequest(authConfigPath, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

function updateEnvironmentContent(current, values) {
  const lines = current ? current.replace(/\r\n/g, "\n").split("\n") : []
  const keys = Object.keys(values)
  const seen = new Set()
  const output = []

  for (const line of lines) {
    const matchedKey = keys.find((key) => new RegExp(`^\\s*${key}\\s*=`).test(line))
    if (matchedKey) {
      if (!seen.has(matchedKey)) {
        output.push(`${matchedKey}=${values[matchedKey]}`)
        seen.add(matchedKey)
      }
      continue
    }
    output.push(line)
  }

  for (const key of keys) {
    if (!seen.has(key)) {
      output.push(`${key}=${values[key]}`)
    }
  }

  while (output.at(-1) === "") {
    output.pop()
  }
  return `${output.join("\n")}\n`
}

async function writeEnvironmentFile(options) {
  const envPath = path.resolve(projectRoot, options.envFile)
  let current = ""

  try {
    current = await readFile(envPath, "utf8")
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error
    }
  }

  const next = updateEnvironmentContent(current, {
    NEXT_PUBLIC_SUPABASE_URL: options.supabaseUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: options.publishableKey,
  })
  const temporaryPath = `${envPath}.${process.pid}.tmp`
  await writeFile(temporaryPath, next, { mode: 0o600 })
  await rename(temporaryPath, envPath)
  await chmod(envPath, 0o600)
}

async function main() {
  const options = parseArguments(process.argv.slice(2))
  validateOptions(options)
  if (options.shouldPersistDevPort) {
    setDevPort(options.devPort, projectRoot)
  } else {
    syncSupabaseDevPort(projectRoot)
  }

  if (options.createProject) {
    options.projectRef = await createHostedProject(options)
    await waitForProject(options.projectRef)
  }
  if (!options.supabaseUrl && options.projectRef) {
    options.supabaseUrl = `https://${options.projectRef}.supabase.co`
  }
  if (!options.publishableKey && options.projectRef) {
    options.publishableKey = await discoverPublishableKey(options.projectRef)
  }
  if (!options.supabaseUrl || !options.publishableKey) {
    fail(
      "Provide --project-ref with SUPABASE_ACCESS_TOKEN, or provide both --url and --publishable-key.",
    )
  }

  if (options.configureRemote) {
    await configureRemoteAuth(options)
  }
  await writeEnvironmentFile(options)
  if (options.resultFile) {
    await writeFile(
      path.resolve(projectRoot, options.resultFile),
      `${JSON.stringify(
        {
          projectRef: options.projectRef || null,
          supabaseUrl: options.supabaseUrl,
        },
        null,
        2,
      )}\n`,
      { mode: 0o600 },
    )
  }

  process.stdout.write("Supabase configuration completed.\n")
  process.stdout.write(`  Environment: ${path.resolve(projectRoot, options.envFile)}\n`)
  process.stdout.write(`  URL:         ${options.supabaseUrl}\n`)
  if (options.projectRef) {
    process.stdout.write(`  Project Ref: ${options.projectRef}\n`)
  }
  process.stdout.write(
    `  Remote Auth: ${options.configureRemote ? "configured" : "unchanged"}\n`,
  )
}

main().catch((error) => {
  process.stderr.write(`Error: ${error.message}\n`)
  process.exit(1)
})
