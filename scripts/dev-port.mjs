#!/usr/bin/env node

import net from 'node:net'
import { spawn } from 'node:child_process'

const port = 7777
const paths = {
  parent: '/parent',
  institution: '/institution',
  admin: '/admin',
}

const appName = process.argv[2] || 'parent'
const appPath = paths[appName]

if (!appPath) {
  console.error(`Unknown app "${appName}". Use one of: ${Object.keys(paths).join(', ')}`)
  process.exit(1)
}

function canConnect(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port })
    socket.setTimeout(500)
    socket.once('connect', () => {
      socket.destroy()
      resolve(true)
    })
    socket.once('timeout', () => {
      socket.destroy()
      resolve(false)
    })
    socket.once('error', () => resolve(false))
  })
}

if (await canConnect(port)) {
  console.log(`[dev:${appName}] Reusing running service: http://127.0.0.1:${port}${appPath}`)
  process.exit(0)
}

console.log(`[dev:${appName}] Starting service: http://127.0.0.1:${port}${appPath}`)

const child = spawn(
  'next',
  ['dev', '-H', '127.0.0.1', '-p', String(port)],
  {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  },
)

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
  }
  process.exit(code ?? 0)
})
