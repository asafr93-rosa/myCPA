/**
 * 3-layer expense categorizer:
 *   Layer 1: User-learned rules (highest priority)
 *   Layer 2: Keyword regex map
 *   Layer 3: Claude API batch call (fallback)
 */
import type { CategoryType } from '../store/useFinanceStore'
import type { ParsedTransaction } from './csvParser'

export interface CategorizeResult {
  category: CategoryType
  source: 'keyword' | 'ai' | 'user'
}

// ── Keyword map ───────────────────────────────────────────────────────────────
// Each entry: [regex, category]. Applied in order; first match wins.
const KEYWORD_RULES: Array<[RegExp, CategoryType]> = [
  // Food
  [/סופרסל|שופרסל|shufersal/i,                               'food'],
  [/רמי.?לוי|rami.?levy/i,                                   'food'],
  [/יוחננוף|yochananof/i,                                     'food'],
  [/מגה|mega.?sport|mega\b/i,                                 'food'],
  [/ויקטורי|victory/i,                                        'food'],
  [/פרש.?מרקט|fresh.?market/i,                               'food'],
  [/מסעדה|restaurant/i,                                       'food'],
  [/קפה|cafe|coffee|aroma|ארומה|לנדוור|landwer/i,            'food'],
  [/פיצה|pizza/i,                                             'food'],
  [/סושי|sushi/i,                                             'food'],
  [/בורגר|burger/i,                                           'food'],
  [/מקדונלד|mcdonald|kfc|kfc/i,                              'food'],
  [/וולט|wolt/i,                                              'food'],
  [/תן.?ביס|tenbis/i,                                         'food'],
  [/bolt.?food/i,                                             'food'],
  [/פלאפל|falafel|שווארמה|shawarma/i,                        'food'],
  [/מאפייה|bakery/i,                                          'food'],
  [/מעדניה|deli/i,                                            'food'],
  [/אוכל|food\b/i,                                            'food'],
  [/supermarket|grocery/i,                                    'food'],
  [/japanika|ג'פניקה/i,                                       'food'],
  [/סטארבקס|starbucks/i,                                      'food'],
  [/מינימרקט|minimarket|קיוסק/i,                             'food'],

  // Fuel
  [/דלק|fuel|delek/i,                                         'fuel'],
  [/סונול|sonol/i,                                            'fuel'],
  [/פז\b|paz\b/i,                                             'fuel'],
  [/דור.?אלון|dor.?alon/i,                                   'fuel'],
  [/ten\b.*תחנה|תחנת.?דלק|gas.?station/i,                   'fuel'],
  [/שפיר.*דלק|שפיר.?אנרג/i,                                  'fuel'],

  // Transport
  [/רכבת|train|rail/i,                                        'transport'],
  [/אגד|egged/i,                                              'transport'],
  [/דן\b|dan\b/i,                                             'transport'],
  [/מטרופולין|metropoline/i,                                  'transport'],
  [/רב.?קו|rav.?kav/i,                                        'transport'],
  [/גט\b|gett\b/i,                                            'transport'],
  [/yango/i,                                                  'transport'],
  [/מונית|taxi/i,                                             'transport'],
  [/uber/i,                                                   'transport'],
  [/moovit/i,                                                 'transport'],
  [/lime\b|bird\b|סקוטר|scooter/i,                           'transport'],
  [/הסעה|shuttle/i,                                           'transport'],

  // Insurance
  [/ביטוח|insurance/i,                                        'insurance'],
  [/פניקס|phoenix/i,                                          'insurance'],
  [/הראל|harel/i,                                             'insurance'],
  [/מגדל|migdal/i,                                            'insurance'],
  [/כלל\b|clal/i,                                             'insurance'],
  [/מנורה|menora/i,                                           'insurance'],
  [/aig\b/i,                                                  'insurance'],

  // Bills
  [/חשמל|electric/i,                                          'bills'],
  [/מים\b|water/i,                                            'bills'],
  [/גז\b|gas\b/i,                                             'bills'],
  [/ארנונה|municipality/i,                                    'bills'],
  [/עיריית?|עיריה/i,                                          'bills'],
  [/ועד.?בית/i,                                               'bills'],
  [/בזק|bezeq/i,                                              'bills'],
  [/פרטנר|partner/i,                                          'bills'],
  [/סלקום|cellcom/i,                                          'bills'],
  [/הוט\b|hot\b/i,                                            'bills'],
  [/גולן.?טלקום|golan.?telecom/i,                            'bills'],
  [/yes\b/i,                                                  'bills'],
  [/נטפליקס|netflix/i,                                        'bills'],
  [/spotify/i,                                                'bills'],
  [/apple.*icloud|apple.*one|apple.*tv/i,                    'bills'],
  [/google.*storage|google.*one/i,                            'bills'],
  [/amazon.*prime/i,                                          'bills'],

  // Haircut
  [/מספרה|מספרת|barber|hair.?salon|salon/i,                  'haircut'],
  [/תספורת|ספר\b|haircut/i,                                   'haircut'],

  // Household
  [/ikea|איקאה/i,                                             'household'],
  [/home.?center|הום.?סנטר/i,                                 'household'],
  [/ace\b/i,                                                  'household'],
  [/ניקיון|cleaning/i,                                        'household'],
  [/מוצרים.?לבית|household/i,                                 'household'],
  [/ריהוט|furniture/i,                                        'household'],
  [/כלי.?בית|kitchenware/i,                                   'household'],
]

function matchKeyword(name: string): CategoryType | null {
  for (const [re, cat] of KEYWORD_RULES) {
    if (re.test(name)) return cat
  }
  return null
}

// ── AI batch categorization ───────────────────────────────────────────────────
async function aiCategorize(
  names: string[],
  apiKey: string
): Promise<Map<string, CategoryType>> {
  const result = new Map<string, CategoryType>()
  if (!names.length) return result

  const deduped = [...new Set(names)]
  const list    = deduped.map((n, i) => `${i + 1}. "${n}"`).join('\n')

  const prompt = `You are a financial categorization assistant for Israeli credit card expenses.
Categorize each business name into EXACTLY ONE category from this list:
food, bills, insurance, transport, fuel, haircut, household

Rules:
- If ambiguous, pick the closest match
- Do NOT invent new categories
- Respond with a raw JSON object only: {"business name": "category", ...}

Business names to categorize:
${list}`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) throw new Error(`API ${res.status}`)
    const data = await res.json() as { content: Array<{ text: string }> }
    const text = data.content[0]?.text ?? '{}'

    // Strip possible markdown code fences
    const clean = text.replace(/```(?:json)?/g, '').trim()
    const parsed = JSON.parse(clean) as Record<string, string>

    for (const [name, cat] of Object.entries(parsed)) {
      const VALID: CategoryType[] = ['food', 'bills', 'insurance', 'transport', 'fuel', 'haircut', 'household']
      if (VALID.includes(cat as CategoryType)) {
        result.set(name, cat as CategoryType)
      }
    }
  } catch (err) {
    console.warn('[categorizer] AI categorization failed', err)
    // Return empty map — callers fall back to 'household'
  }

  return result
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function categorizeTransactions(
  transactions: ParsedTransaction[],
  userRules: Record<string, CategoryType>,
  apiKey: string | null
): Promise<CategorizeResult[]> {
  const results: CategorizeResult[] = []
  const needsAI: number[] = []   // indices of uncategorized transactions

  for (let i = 0; i < transactions.length; i++) {
    const name    = transactions[i].businessName
    const normKey = name.toLowerCase().trim()

    // Layer 1 — user-learned rules (highest priority)
    if (userRules[normKey]) {
      results.push({ category: userRules[normKey], source: 'user' })
      continue
    }

    // Layer 2 — keyword match
    const kw = matchKeyword(name)
    if (kw) {
      results.push({ category: kw, source: 'keyword' })
      continue
    }

    // Layer 3 — needs AI
    results.push({ category: 'household', source: 'ai' })  // placeholder
    needsAI.push(i)
  }

  // Batch AI call for uncategorized items
  if (needsAI.length > 0 && apiKey) {
    const namesToClassify = needsAI.map((i) => transactions[i].businessName)
    const aiMap = await aiCategorize(namesToClassify, apiKey)

    for (const idx of needsAI) {
      const name = transactions[idx].businessName
      const cat  = aiMap.get(name)
      if (cat) {
        results[idx] = { category: cat, source: 'ai' }
      }
      // else: stays as 'household' / 'ai' placeholder
    }
  }

  return results
}
