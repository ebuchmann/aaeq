#!/usr/bin/env node
/**
 * Usage:
 *   node equipment_to_csv.js
 *   node equipment_to_csv.js --stat=CLER_CAST_LEVEL --values=1,2
 *   node equipment_to_csv.js --stat=THIEF_SKILL_LEVEL --values=1 --require=DAMROLL,HITROLL
 *   node equipment_to_csv.js path/to/equipment.json output.csv --stat=CLER_CAST_LEVEL --values=1,2
 *
 * Reads a local equipment.json file (defaults to ./src/data/equipment.json),
 * keeps only items whose stats[--stat] is one of --values, optionally
 * further restricted to items that have at least one of the --require stat
 * keys present, and writes a CSV with columns:
 *   wear, name, evil, neutral, good, level, mana regen, damroll, hitroll,
 *   dexterity, strength, constitution, charisma, intelligence, wisdom, other
 *
 * Flags:
 *   --stat=KEY      Stat key that defines the class/skill filter
 *                   (default: CLER_CAST_LEVEL). This key is used to decide
 *                   which items are included, and is excluded from the
 *                   "other" column.
 *   --values=1,2    Comma-separated list of acceptable values for --stat
 *                   (default: 1,2).
 *   --require=A,B   Optional comma-separated list of stat keys. When set,
 *                   only items that have at least one of these stat keys
 *                   present are kept; everything else is skipped.
 *
 * Positional args (first non-flag = input, second = output):
 *   input.json   Path to the equipment JSON file (default: ./src/data/equipment.json)
 *   output.csv   Path to write the CSV to (default: prints to stdout)
 */

const fs = require('fs')
const path = require('path')

// --- Parse args: separate flags (--key=value) from positional args ---
const args = process.argv.slice(2)
const flags = {}
const positional = []

for (const arg of args) {
  const match = arg.match(/^--([^=]+)=(.*)$/)
  if (match) {
    flags[match[1]] = match[2]
  } else {
    positional.push(arg)
  }
}

const inputPath = positional[0] || './src/data/equipment.json'
const outputPath = positional[1] // optional; if omitted, prints to stdout

const FILTER_STAT = flags.stat || 'CLER_CAST_LEVEL'
const FILTER_VALUES = (flags.values !== undefined ? flags.values : '1,2')
  .split(',')
  .map((v) => v.trim())
  .filter((v) => v.length > 0)
  .map(Number)

const REQUIRE_STATS = flags.require
  ? flags.require
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
  : null // null = no additional requirement

if (!fs.existsSync(path.resolve(inputPath))) {
  console.error(`Input file not found: ${inputPath}`)
  console.error('Usage: node equipment_to_csv.js [input.json] [output.csv] --stat=KEY --values=1,2 --require=A,B')
  process.exit(1)
}

const raw = fs.readFileSync(path.resolve(inputPath), 'utf8')
const data = JSON.parse(raw)

// Stats that get their own dedicated column
const NAMED_STAT_MAP = {
  MANA_REGEN: 'mana regen',
  DAMROLL: 'damroll',
  HITROLL: 'hitroll',
  DEX: 'dexterity',
  STR: 'strength',
  CON: 'constitution',
  CHR: 'charisma',
  INT: 'intelligence',
  WIS: 'wisdom',
}

const COLUMNS = [
  'wear',
  '',
  'name',
  'evil',
  'neutral',
  'good',
  'classLevel',
  'totalLevel',
  'mana regen',
  'damroll',
  'hitroll',
  'dexterity',
  'strength',
  'constitution',
  'charisma',
  'intelligence',
  'wisdom',
  'other',
]

function csvEscape(value) {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (/[",\n\r]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

const rows = []

for (const item of data) {
  const stats = item.stats || {}

  // Class/skill filter (e.g. CLER_CAST_LEVEL in [1, 2])
  const filterValue = stats[FILTER_STAT]
  if (!FILTER_VALUES.includes(filterValue)) continue

  // Optional "at least one of these stats present" filter
  if (REQUIRE_STATS && !REQUIRE_STATS.some((key) => stats[key] !== undefined)) {
    continue
  }

  const flagSet = new Set(item.flags || [])

  const evilOk = !(flagSet.has('ANTI_EVIL') || flagSet.has('GOOD'))
  const neutralOk = !flagSet.has('ANTI_NEUTRAL')
  const goodOk = !(flagSet.has('ANTI_GOOD') || flagSet.has('EVIL'))

  const worn = item.worn || []
  const wear = Array.isArray(worn) ? worn.join(' ') : String(worn)

  const dropSources = Array.isArray(item.dropSources) ? item.dropSources : []
  const displayName = dropSources.length ? `${item.name || ''} - ${dropSources.join('; ')}` : item.name || ''

  const row = {
    wear,
    '': '',
    name: displayName,
    evil: evilOk ? 'x' : '',
    neutral: neutralOk ? 'x' : '',
    good: goodOk ? 'x' : '',
    classLevel: item.classLevel !== undefined ? item.classLevel : '',
    totalLevel: item.totalLevel !== undefined ? item.totalLevel : '',
    'mana regen': '',
    damroll: '',
    hitroll: '',
    dexterity: '',
    strength: '',
    constitution: '',
    charisma: '',
    intelligence: '',
    wisdom: '',
    other: '',
  }

  const otherParts = []
  for (const [k, v] of Object.entries(stats)) {
    if (k === FILTER_STAT) continue
    if (NAMED_STAT_MAP[k]) {
      row[NAMED_STAT_MAP[k]] = v
    } else {
      otherParts.push(`${k}:${v}`)
    }
  }
  row.other = otherParts.join('; ')

  rows.push(row)
}

// Group by wear location, then sort by level ascending within each group
rows.sort((a, b) => {
  if (a.wear !== b.wear) return a.wear.localeCompare(b.wear)
  const la = typeof a.level === 'number' ? a.level : 0
  const lb = typeof b.level === 'number' ? b.level : 0
  return la - lb
})

const lines = []
lines.push(COLUMNS.join(','))
let prevWear = null
for (const row of rows) {
  if (prevWear !== null && row.wear !== prevWear) {
    lines.push('') // blank separator row between wear-location groups
  }
  lines.push(COLUMNS.map((c) => csvEscape(row[c])).join(','))
  prevWear = row.wear
}
const csvText = lines.join('\r\n') + '\r\n'

if (outputPath) {
  fs.writeFileSync(path.resolve(outputPath), csvText, 'utf8')
  console.error(`Wrote ${rows.length} rows to ${outputPath}`)
} else {
  process.stdout.write(csvText)
}
