/**
 * Cloud sync engine — debounces Zustand state changes to Supabase.
 * Designed as a module-level singleton; no React hooks.
 */
import { supabase } from './supabase'
import { useFinanceStore } from '../store/useFinanceStore'

// Keys that are ephemeral and must NOT be sent to the cloud
const EXCLUDE_KEYS = new Set(['syncStatus', 'setSyncStatus'])

type SyncableState = Record<string, unknown>

let timer: ReturnType<typeof setTimeout> | null = null
let pendingSync  = false
let currentUserId: string | null = null
let prevSnapshot: string | null = null

function serializeForSync(state: SyncableState): SyncableState {
  return Object.fromEntries(
    Object.entries(state).filter(([k]) => !EXCLUDE_KEYS.has(k) && typeof state[k] !== 'function')
  )
}

async function flushSync() {
  if (!currentUserId) return
  const state = useFinanceStore.getState()
  const payload = serializeForSync(state as unknown as SyncableState)

  useFinanceStore.getState().setSyncStatus('syncing')
  try {
    const { error } = await supabase.from('user_data').upsert({
      user_id: currentUserId,
      data: payload,
      updated_at: new Date().toISOString(),
    })
    if (error) throw error
    useFinanceStore.getState().setSyncStatus('synced')
    pendingSync = false
  } catch (err) {
    console.error('[cloudSync] sync failed', err)
    useFinanceStore.getState().setSyncStatus('offline')
    pendingSync = true
  }
}

function scheduleSync() {
  if (timer) clearTimeout(timer)
  timer = setTimeout(flushSync, 2500)
}

function onOnline() {
  if (pendingSync) flushSync()
}

let unsubscribe: (() => void) | null = null

export function initCloudSync(userId: string) {
  currentUserId = userId
  pendingSync   = false

  window.removeEventListener('online', onOnline)
  window.addEventListener('online', onOnline)

  if (unsubscribe) unsubscribe()

  unsubscribe = useFinanceStore.subscribe((state) => {
    // Skip triggering a sync when only syncStatus changed
    const payload = serializeForSync(state as unknown as SyncableState)
    const snapshot = JSON.stringify(payload)
    if (snapshot === prevSnapshot) return
    prevSnapshot = snapshot

    if (!navigator.onLine) {
      useFinanceStore.getState().setSyncStatus('offline')
      pendingSync = true
      return
    }
    scheduleSync()
  })
}

export function stopCloudSync() {
  if (unsubscribe) { unsubscribe(); unsubscribe = null }
  if (timer) { clearTimeout(timer); timer = null }
  window.removeEventListener('online', onOnline)
  currentUserId = null
  prevSnapshot  = null
}

/** Fetch the stored state for a user from Supabase. Returns null if no row exists. */
export async function fetchCloudState(userId: string): Promise<SyncableState | null> {
  const { data, error } = await supabase
    .from('user_data')
    .select('data')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return data.data as SyncableState
}

/** Upload the current localStorage state to Supabase (used during migration). */
export async function uploadLocalState(userId: string) {
  const state = useFinanceStore.getState()
  const payload = serializeForSync(state as unknown as SyncableState)
  const { error } = await supabase.from('user_data').upsert({
    user_id: userId,
    data: payload,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}
