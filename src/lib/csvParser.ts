/**
 * CSV parser for Israeli credit card statements.
 * Handles: UTF-8, UTF-8 BOM, Windows-1255 (Hebrew); comma/semicolon/tab delimiters;
 * Hebrew and English column headers; multiple date and amount formats.
 */

export interface ParsedTransaction {
  date: string          // ISO 8601 (YYYY-MM-DD)
  businessName: string
  amount: number        // always positive
  currency: string      // default 'ILS'
}

export interface ParseResult {
  transactions: ParsedTransaction[]
  needsMapping: boolean
  rawHeaders: string[]
  rawRows: string[][]
  detectedEncoding: string
  detectedDelimiter: string
  skippedRows: number
}

// ── Windows-1255 decode table (Hebrew block 0x80–0xFF → Unicode) ──────────────
// Safari/iOS may not support TextDecoder with 'windows-1255'.
const WIN1255_MAP: Record<number, number> = {
  0x80: 0x20AC, 0x82: 0x201A, 0x83: 0x0192, 0x84: 0x201E, 0x85: 0x2026,
  0x86: 0x2020, 0x87: 0x2021, 0x88: 0x02C6, 0x89: 0x2030, 0x8B: 0x2039,
  0x91: 0x2018, 0x92: 0x2019, 0x93: 0x201C, 0x94: 0x201D, 0x95: 0x2022,
  0x96: 0x2013, 0x97: 0x2014, 0x98: 0x02DC, 0x99: 0x2122, 0x9B: 0x203A,
  0xA0: 0x00A0, 0xA1: 0x00A1, 0xA2: 0x00A2, 0xA3: 0x00A3, 0xA4: 0x20AA,
  0xA5: 0x00A5, 0xA6: 0x00A6, 0xA7: 0x00A7, 0xA8: 0x00A8, 0xA9: 0x00A9,
  0xAA: 0x00D7, 0xAB: 0x00AB, 0xAC: 0x00AC, 0xAD: 0x00AD, 0xAE: 0x00AE,
  0xAF: 0x00AF, 0xB0: 0x00B0, 0xB1: 0x00B1, 0xB2: 0x00B2, 0xB3: 0x00B3,
  0xB4: 0x00B4, 0xB5: 0x00B5, 0xB6: 0x00B6, 0xB7: 0x00B7, 0xB8: 0x00B8,
  0xB9: 0x00B9, 0xBA: 0x00F7, 0xBB: 0x00BB, 0xBC: 0x00BC, 0xBD: 0x00BD,
  0xBE: 0x00BE, 0xBF: 0x00BF,
  // Hebrew letters 0xE0–0xFA → U+05D0–U+05EA
  ...Object.fromEntries(Array.from({ length: 27 }, (_, i) => [0xE0 + i, 0x05D0 + i])),
}

function decodeWin1255(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => {
      if (b < 0x80) return String.fromCharCode(b)
      return String.fromCharCode(WIN1255_MAP[b] ?? 0xFFFD)
    })
    .join('')
}

// ── Detect encoding from raw bytes ────────────────────────────────────────────
function detectEncoding(bytes: Uint8Array): { encoding: string; offset: number } {
  // UTF-8 BOM: EF BB BF
  if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
    return { encoding: 'utf-8-bom', offset: 3 }
  }
  // Heuristic: if high bytes (0x80–0xFF) appear in the Hebrew range (0xE0–0xFA), assume Windows-1255
  let hebrewByteCount = 0
  for (let i = 0; i < Math.min(bytes.length, 2000); i++) {
    if (bytes[i] >= 0xE0 && bytes[i] <= 0xFA) hebrewByteCount++
  }
  if (hebrewByteCount > 3) return { encoding: 'windows-1255', offset: 0 }
  return { encoding: 'utf-8', offset: 0 }
}

// ── Decode file bytes to string ────────────────────────────────────────────────
function decodeBytes(bytes: Uint8Array, encoding: string, offset: number): string {
  const slice = bytes.slice(offset)
  if (encoding === 'windows-1255') {
    // Try native TextDecoder first
    try {
      return new TextDecoder('windows-1255').decode(slice)
    } catch {
      return decodeWin1255(slice)
    }
  }
  return new TextDecoder('utf-8').decode(slice)
}

// ── Detect delimiter ──────────────────────────────────────────────────────────
function detectDelimiter(lines: string[]): string {
  const sample = lines.slice(0, Math.min(5, lines.length)).join('\n')
  const counts = { ',': 0, ';': 0, '\t': 0 }
  for (const ch of Object.keys(counts) as (keyof typeof counts)[]) {
    const matched = sample.match(new RegExp(ch === '\t' ? '\\t' : ch, 'g'))
    counts[ch] = matched?.length ?? 0
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}

// ── Parse CSV rows (handles quoted fields) ────────────────────────────────────
function parseCSVRows(text: string, delimiter: string): string[][] {
  const rows: string[][] = []
  const lines = text.split(/\r?\n/)
  for (const line of lines) {
    if (!line.trim()) continue
    const cells: string[] = []
    let cur = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++ }
        else inQuotes = !inQuotes
      } else if (ch === delimiter && !inQuotes) {
        cells.push(cur.trim())
        cur = ''
      } else {
        cur += ch
      }
    }
    cells.push(cur.trim())
    rows.push(cells)
  }
  return rows
}

// ── Header mapping ────────────────────────────────────────────────────────────
type FieldKey = 'date' | 'businessName' | 'amount' | 'currency'

const HEADER_MAP: Array<[RegExp, FieldKey]> = [
  [/תאריך|date/i,                       'date'],
  [/שם.*עסק|עסק|merchant|description|business/i, 'businessName'],
  [/סכום|amount|charge|total/i,         'amount'],
  [/מטבע|currency/i,                    'currency'],
]

function mapHeaders(headers: string[]): Record<FieldKey, number> | null {
  const mapping: Partial<Record<FieldKey, number>> = {}
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i].trim()
    for (const [re, field] of HEADER_MAP) {
      if (re.test(h) && !(field in mapping)) {
        mapping[field] = i
        break
      }
    }
  }
  if (mapping.date !== undefined && mapping.businessName !== undefined && mapping.amount !== undefined) {
    return mapping as Record<FieldKey, number>
  }
  return null
}

// ── Date parsing ──────────────────────────────────────────────────────────────
function parseDate(raw: string): string | null {
  const s = raw.trim()
  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmy = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/)
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2,'0')}-${dmy[1].padStart(2,'0')}`
  // YYYY-MM-DD
  const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (ymd) return s
  return null
}

// ── Amount parsing ────────────────────────────────────────────────────────────
function parseAmount(raw: string): number | null {
  let s = raw.trim().replace(/[₪$€£\s]/g, '')
  if (!s) return null
  // Determine decimal separator: if both . and , are present, the last one is the decimal
  const lastDot   = s.lastIndexOf('.')
  const lastComma = s.lastIndexOf(',')
  if (lastDot !== -1 && lastComma !== -1) {
    if (lastDot > lastComma) {
      // 1,234.56 — US format
      s = s.replace(/,/g, '')
    } else {
      // 1.234,56 — European format
      s = s.replace(/\./g, '').replace(',', '.')
    }
  } else if (lastComma !== -1) {
    // Could be 1,234 (thousands) or 1,56 (decimal)
    const afterComma = s.slice(lastComma + 1)
    s = afterComma.length === 2 ? s.replace(',', '.') : s.replace(/,/g, '')
  }
  const n = parseFloat(s)
  return isNaN(n) ? null : Math.abs(n)
}

// ── Summary row detection ─────────────────────────────────────────────────────
const SUMMARY_PATTERNS = [/סה"כ|סהכ|total|balance|sum|סיכום/i]

function isSummaryRow(cells: string[]): boolean {
  return cells.some((c) => SUMMARY_PATTERNS.some((p) => p.test(c)))
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function parseCSVFile(file: File): Promise<ParseResult> {
  const buffer = await file.arrayBuffer()
  const bytes  = new Uint8Array(buffer)

  const { encoding, offset } = detectEncoding(bytes)
  const text      = decodeBytes(bytes, encoding, offset)
  const lines     = text.split(/\r?\n/).filter((l) => l.trim())
  const delimiter = detectDelimiter(lines)
  const rawRows   = parseCSVRows(text, delimiter)

  // Find header row (first row with ≥3 non-empty cells that likely matches known fields)
  let headerRow: string[] = []
  let dataStartIndex = 0
  for (let i = 0; i < Math.min(5, rawRows.length); i++) {
    const candidate = rawRows[i]
    if (candidate.filter(Boolean).length >= 3 && mapHeaders(candidate) !== null) {
      headerRow      = candidate
      dataStartIndex = i + 1
      break
    }
  }

  // If no header matched, return raw for manual mapping
  if (!headerRow.length) {
    return {
      transactions: [],
      needsMapping: true,
      rawHeaders: rawRows[0] ?? [],
      rawRows: rawRows.slice(1),
      detectedEncoding: encoding,
      detectedDelimiter: delimiter,
      skippedRows: 0,
    }
  }

  const colMap = mapHeaders(headerRow)!
  const transactions: ParsedTransaction[] = []
  let skippedRows = 0

  for (let i = dataStartIndex; i < rawRows.length; i++) {
    const row = rawRows[i]
    if (!row.length || row.every((c) => !c)) continue
    if (isSummaryRow(row)) { skippedRows++; continue }

    const rawDate   = row[colMap.date]?.trim() ?? ''
    const rawName   = row[colMap.businessName]?.trim() ?? ''
    const rawAmount = row[colMap.amount]?.trim() ?? ''
    const rawCur    = colMap.currency !== undefined ? row[colMap.currency]?.trim() : ''

    const date   = parseDate(rawDate)
    const amount = parseAmount(rawAmount)

    if (!date || !amount || !rawName) { skippedRows++; continue }

    transactions.push({
      date,
      businessName: rawName,
      amount,
      currency: rawCur || 'ILS',
    })
  }

  return {
    transactions,
    needsMapping: false,
    rawHeaders: headerRow,
    rawRows: rawRows.slice(dataStartIndex),
    detectedEncoding: encoding,
    detectedDelimiter: delimiter,
    skippedRows,
  }
}

/** Re-parse raw rows using a user-provided column mapping. */
export function parseWithMapping(
  rawRows: string[][],
  colMap: Record<FieldKey, number>
): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = []
  for (const row of rawRows) {
    if (!row.length || row.every((c) => !c)) continue
    if (isSummaryRow(row)) continue
    const date   = parseDate(row[colMap.date]?.trim() ?? '')
    const amount = parseAmount(row[colMap.amount]?.trim() ?? '')
    const name   = row[colMap.businessName]?.trim() ?? ''
    if (!date || !amount || !name) continue
    transactions.push({
      date,
      businessName: name,
      amount,
      currency: colMap.currency !== undefined ? (row[colMap.currency]?.trim() || 'ILS') : 'ILS',
    })
  }
  return transactions
}
