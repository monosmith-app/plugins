// Validates index.json against index.schema.json, then checks what a schema cannot:
// plugins are sorted by name, no digest appears twice, and the archive file name
// matches the plugin and version. With --online it also downloads every archive
// and compares its SHA-256.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

const read = (f) => JSON.parse(readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'))
const index = read('index.json')
const ajv = new Ajv2020({ allErrors: true })
addFormats(ajv)
const errors = []

const validate = ajv.compile(read('index.schema.json'))
if (!validate(index)) {
  for (const e of validate.errors) errors.push(`index.json${e.instancePath}: ${e.message}`)
}

const names = Object.keys(index.plugins ?? {})
if (!names.every((n, i) => i === 0 || names[i - 1] < n)) errors.push('plugins must be sorted by name')

const entries = names.flatMap((name) =>
  Object.entries(index.plugins[name].versions ?? {}).map(([version, v]) => ({ name, version, ...v })),
)
const seen = new Map()
for (const { name, version, url, sha256 } of entries) {
  const where = `${name}@${version}`
  if (seen.has(sha256)) errors.push(`${where} has the same sha256 as ${seen.get(sha256)}`)
  seen.set(sha256, where)
  if (!url?.endsWith(`/${name}-${version}.smith-plugin.zip`)) {
    errors.push(`${where}: the archive file name must be ${name}-${version}.smith-plugin.zip`)
  }
}

if (process.argv.includes('--online')) {
  const token = process.env.GITHUB_TOKEN
  for (const { name, version, url, sha256 } of entries) {
    const where = `${name}@${version}`
    try {
      const headers = { 'User-Agent': 'plugins-index' }
      if (token && new URL(url).hostname === 'github.com') headers.Authorization = `Bearer ${token}`
      const res = await fetch(url, { headers })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const got = createHash('sha256').update(Buffer.from(await res.arrayBuffer())).digest('hex')
      if (got !== sha256) errors.push(`${where}: archive sha256 is ${got}, index says ${sha256}`)
    } catch (e) {
      errors.push(`${where}: cannot download ${url}: ${e.message}`)
    }
  }
}

if (errors.length) {
  console.error(errors.map((e) => `error: ${e}`).join('\n'))
  process.exit(1)
}
console.log(`index.json is valid (${names.length} plugin${names.length === 1 ? '' : 's'}).`)
