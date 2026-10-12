#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const defaultProjectRoot = path.resolve(scriptDirectory, "..")

function validateDevPort(value) {
  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(
      "scaffold.config.json devPort must be an integer between 1 and 65535.",
    )
  }
  return value
}

export function readScaffoldConfig(projectRoot = defaultProjectRoot) {
  const configPath = path.join(projectRoot, "scaffold.config.json")
  let config

  try {
    config = JSON.parse(readFileSync(configPath, "utf8"))
  } catch (error) {
    throw new Error(`Could not read ${configPath}: ${error.message}`)
  }

  validateDevPort(config.devPort)
  return config
}

export function getDevPort(projectRoot = defaultProjectRoot) {
  return readScaffoldConfig(projectRoot).devPort
}

export function syncSupabaseDevPort(projectRoot = defaultProjectRoot) {
  const devPort = getDevPort(projectRoot)
  const configPath = path.join(projectRoot, "supabase/config.toml")
  const current = readFileSync(configPath, "utf8")
  const next = current
    .replace(/http:\/\/localhost:[0-9]+/g, `http://localhost:${devPort}`)
    .replace(/http:\/\/127\.0\.0\.1:[0-9]+/g, `http://127.0.0.1:${devPort}`)

  if (next !== current) {
    writeFileSync(configPath, next)
  }
  return devPort
}

export function setDevPort(rawValue, projectRoot = defaultProjectRoot) {
  const devPort = validateDevPort(Number(rawValue))
  const configPath = path.join(projectRoot, "scaffold.config.json")
  const config = readScaffoldConfig(projectRoot)
  config.devPort = devPort
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`)
  syncSupabaseDevPort(projectRoot)
  return devPort
}

function printUsage() {
  process.stdout.write(`Manage scaffold.config.json.

Usage:
  node scripts/scaffold-config.mjs show
  node scripts/scaffold-config.mjs port
  node scripts/scaffold-config.mjs sync
  node scripts/scaffold-config.mjs set-port <port>
`)
}

function main() {
  const [command = "show", value] = process.argv
    .slice(2)
    .filter((argument) => argument !== "--")

  switch (command) {
    case "show":
      process.stdout.write(`${JSON.stringify(readScaffoldConfig(), null, 2)}\n`)
      break
    case "port":
      process.stdout.write(`${getDevPort()}\n`)
      break
    case "sync": {
      const devPort = syncSupabaseDevPort()
      process.stdout.write(`Synced local Supabase callbacks to port ${devPort}.\n`)
      break
    }
    case "set-port": {
      if (!value) {
        throw new Error("set-port requires a port.")
      }
      const devPort = setDevPort(value)
      process.stdout.write(`Development port set to ${devPort}.\n`)
      break
    }
    case "--help":
    case "-h":
      printUsage()
      break
    default:
      throw new Error(`Unknown command: ${command}`)
  }
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))

if (isMain) {
  try {
    main()
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n`)
    process.exitCode = 1
  }
}
