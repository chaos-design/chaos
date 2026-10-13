#!/usr/bin/env node

import { spawn } from "node:child_process"
import { createRequire } from "node:module"
import process from "node:process"
import { getDevPort } from "./scaffold-config.mjs"

const require = createRequire(import.meta.url)
const nextCliPath = require.resolve("next/dist/bin/next")
const [command, ...rawArguments] = process.argv.slice(2)
const forwardedArguments = rawArguments.filter((argument) => argument !== "--")

if (command !== "dev" && command !== "start") {
  process.stderr.write("Usage: node scripts/run-next.mjs <dev|start> [options]\n")
  process.exit(1)
}

if (
  forwardedArguments.some(
    (argument) =>
      argument === "--port" ||
      argument === "-p" ||
      argument.startsWith("--port=") ||
      argument.startsWith("-p="),
  )
) {
  process.stderr.write(
    "Error: configure the application port through scaffold.config.json.\n",
  )
  process.exit(1)
}

const nextArguments = [command]
if (command === "dev") {
  nextArguments.push("--turbopack")
}
nextArguments.push("--port", String(getDevPort()), ...forwardedArguments)

const child = spawn(process.execPath, [nextCliPath, ...nextArguments], {
  env: process.env,
  stdio: "inherit",
})

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal))
}

child.on("error", (error) => {
  process.stderr.write(`Failed to start Next.js: ${error.message}\n`)
  process.exitCode = 1
})

child.on("exit", (code) => {
  process.exitCode = code ?? 1
})
