#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"
import { getDevPort, readScaffoldConfig } from "./scaffold-config.mjs"

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDirectory, "..")

// The guides document the template's default port and tell the reader to defer
// to whatever Terminal prints. Once the project is generated, the guides stay
// frozen at that default while devPort may differ, so the port is only tied to
// the configuration while this is still the pristine template.
const templatePackageName = "next-supabase-scaffold"

const guidePaths = [
  "docs/non-technical-quick-start.md",
  "docs/non-technical-quick-start.en.md",
]

const screenshotDirectory = path.join(projectRoot, "docs/screenshots")

// Values that are baked into the PNG files. A text check cannot read an image,
// so each one also names the screenshot a maintainer must re-render.
//
// Every literal must be unique in its source file. An ambiguous literal cannot
// be verified by substring matching, so the check fails loudly instead of
// pretending to guard it.
const bakedValues = [
  {
    screenshot: "05-project-home.png",
    file: "src/app/page.tsx",
    literals: ["AUTHENTICATION READY", "核心能力", "认证架构"],
  },
  {
    screenshot: "04-setup-completed.png",
    file: "scripts/setup-project.sh",
    literals: ["Project setup completed."],
  },
]

function countOccurrences(haystack, needle) {
  return haystack.split(needle).length - 1
}

function readProjectFile(relativePath) {
  const absolutePath = path.join(projectRoot, relativePath)
  if (!existsSync(absolutePath)) {
    throw new Error(`Could not read ${relativePath}: file not found.`)
  }
  return readFileSync(absolutePath, "utf8")
}

function collectProblems() {
  const problems = []
  const config = readScaffoldConfig(projectRoot)
  const devPort = config.devPort
  const isTemplate = config.packageName === templatePackageName
  const guides = new Map()

  for (const guidePath of guidePaths) {
    const absolutePath = path.join(projectRoot, guidePath)
    if (!existsSync(absolutePath)) {
      problems.push(`${guidePath} is missing.`)
      continue
    }
    guides.set(guidePath, readFileSync(absolutePath, "utf8"))
  }

  const referenced = new Set()

  for (const [guidePath, content] of guides) {
    for (const [, imageName] of content.matchAll(/\]\(\.\/screenshots\/([^)]+)\)/g)) {
      referenced.add(imageName)
      if (!existsSync(path.join(screenshotDirectory, imageName))) {
        problems.push(
          `${guidePath} references docs/screenshots/${imageName}, which does not exist.`,
        )
      }
    }
  }

  if (existsSync(screenshotDirectory)) {
    for (const imageName of readdirSync(screenshotDirectory)) {
      if (!referenced.has(imageName)) {
        problems.push(`docs/screenshots/${imageName} is not referenced by any guide.`)
      }
    }
  }

  for (const { screenshot, file, literals } of bakedValues) {
    if (!referenced.has(screenshot)) {
      problems.push(
        `${screenshot} is no longer referenced by any guide but still carries baked values.`,
      )
      continue
    }
    const source = readProjectFile(file)
    for (const literal of literals) {
      const occurrences = countOccurrences(source, literal)
      if (occurrences === 0) {
        problems.push(
          `${screenshot} shows "${literal}", which no longer exists in ${file}. Re-render the screenshot.`,
        )
      } else if (occurrences > 1) {
        problems.push(
          `${screenshot} shows "${literal}", but it now appears ${occurrences} times in ${file} and can no longer be verified. Re-render the screenshot and narrow this literal.`,
        )
      }
    }
  }

  const allPorts = new Set()
  const portsByGuide = new Map()

  for (const [guidePath, content] of guides) {
    const ports = new Set()
    for (const [, port] of content.matchAll(/localhost:(\d+)/g)) {
      ports.add(port)
      allPorts.add(port)
    }
    portsByGuide.set(guidePath, ports)
  }

  if (allPorts.size > 1) {
    problems.push(
      `The guides disagree on the localhost port (${[...allPorts].sort().join(", ")}). Keep the Chinese and English versions on the same port.`,
    )
  }

  if (isTemplate) {
    for (const [guidePath, ports] of portsByGuide) {
      const content = guides.get(guidePath)
      if (!content.includes(`http://localhost:${devPort}`)) {
        problems.push(
          `${guidePath} does not mention the configured devPort ${devPort} (scaffold.config.json).`,
        )
      }
      for (const port of ports) {
        if (port !== String(devPort)) {
          problems.push(
            `${guidePath} mentions localhost:${port}, but scaffold.config.json sets devPort to ${devPort}.`,
          )
        }
      }
    }
  }

  return problems
}

function main() {
  const problems = collectProblems()

  if (problems.length > 0) {
    process.stderr.write(
      `Screenshot documentation check failed:\n${problems
        .map((problem) => `  - ${problem}`)
        .join("\n")}\n`,
    )
    process.exit(1)
  }

  process.stdout.write(
    `Screenshot documentation is in sync (${getDevPort(projectRoot)} dev port).\n` +
      `Note: values inside the PNG files cannot be verified automatically. After\n` +
      `changing the homepage or setup output, re-render docs/screenshots.\n`,
  )
}

main()
