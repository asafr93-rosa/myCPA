import { useEffect, useState } from 'react'
import { useAuth } from '../../lib/useAuth'
import { fetchCloudState, initCloudSync, uploadLocalState } from '../../lib/cloudSync'
import { useFinanceStore } from '../../store/useFinanceStore'
import { LoginPage } from './LoginPage'
import { LockScreen } from './LockScreen'
import { MigrationDialog } from './MigrationDialog'

const SUPABASE_CONFIGURED =
  !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY

interface Props {
  children: React.ReactNode
}

export function AuthGuard({ children }: Props) {
  // ── Supabase not configured — behave exactly like the original app ─────────
  if (!SUPABASE_CONFIGURED) {
    return <LocalOnlyGuard>{children}</LocalOnlyGuard>
  }

  return <CloudGuard>{children}</CloudGuard>
}

// Original lock-screen-only guard (no cloud auth)
function LocalOnlyGuard({ children }: Props) {
  const [unlocked, setUnlocked] = useState(false)

  useEffect(() => {
    const wasUnlocked = sessionStorage.getItem('floww-unlocked') === '1'
    const hiddenAt    = sessionStorage.getItem('floww-hidden-at')
    if (wasUnlocked && !hiddenAt) setUnlocked(true)

    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        sessionStorage.setItem('floww-hidden-at', String(Date.now()))
      } else if (document.visibilityState === 'visible') {
        const ts = sessionStorage.getItem('floww-hidden-at')
        if (ts && Date.now() - Number(ts) > 15_000) {
          sessionStorage.removeItem('floww-unlocked')
          sessionStorage.removeItem('floww-hidden-at')
          setUnlocked(false)
        } else {
          sessionStorage.removeItem('floww-hidden-at')
        }
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  function handleUnlock() {
    sessionStorage.setItem('floww-unlocked', '1')
    sessionStorage.removeItem('floww-hidden-at')
    setUnlocked(true)
  }

  if (!unlocked) return <LockScreen onUnlock={handleUnlock} />
  return <>{children}</>
}

// Full cloud-auth guard (used once Supabase is configured)
function CloudGuard({ children }: Props) {
  const { session, authLoading, signIn, signOut } = useAuth()
  const [unlocked, setUnlocked]       = useState(false)
  const [dataReady, setDataReady]     = useState(false)
  const [showMigration, setShowMigration] = useState(false)
  const [uploading, setUploading]     = useState(false)

  const accounts    = useFinanceStore((s) => s.accounts)
  const investments = useFinanceStore((s) => s.investments)
  const assets      = useFinanceStore((s) => s.assets)

  // Restore lock state from sessionStorage
  useEffect(() => {
    const wasUnlocked = sessionStorage.getItem('floww-unlocked') === '1'
    const hiddenAt    = sessionStorage.getItem('floww-hidden-at')
    if (wasUnlocked && !hiddenAt) setUnlocked(true)

    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        sessionStorage.setItem('floww-hidden-at', String(Date.now()))
      } else if (document.visibilityState === 'visible') {
        const ts = sessionStorage.getItem('floww-hidden-at')
        if (ts && Date.now() - Number(ts) > 15_000) {
          sessionStorage.removeItem('floww-unlocked')
          sessionStorage.removeItem('floww-hidden-at')
          setUnlocked(false)
        } else {
          sessionStorage.removeItem('floww-hidden-at')
        }
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  // Once session is confirmed, load cloud data
  useEffect(() => {
    if (authLoading || !session) return

    async function loadData() {
      const userId = session!.user.id
      try {
        const cloudData = await fetchCloudState(userId)

        if (cloudData) {
          // Cloud row exists — hydrate store (cloud wins)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          useFinanceStore.setState(cloudData as any, true)
        } else {
          // No cloud row — check if there's local data worth migrating
          const hasLocalData = accounts.length > 0 || investments.length > 0
          if (hasLocalData) {
            setShowMigration(true)
            return // wait for user decision before marking dataReady
          }
          // Fresh start — nothing to migrate, upload empty state
          await uploadLocalState(userId)
        }
      } catch (err) {
        console.error('[AuthGuard] Failed to load cloud data', err)
        // Fall through — use whatever is in localStorage
      }

      initCloudSync(userId)
      setDataReady(true)
    }

    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, session])

  function handleUnlock() {
    sessionStorage.setItem('floww-unlocked', '1')
    sessionStorage.removeItem('floww-hidden-at')
    setUnlocked(true)
  }

  async function handleMigrationUpload() {
    if (!session) return
    setUploading(true)
    try {
      await uploadLocalState(session.user.id)
    } catch (err) {
      console.error('[AuthGuard] Migration upload failed', err)
    }
    setUploading(false)
    setShowMigration(false)
    initCloudSync(session.user.id)
    setDataReady(true)
  }

  async function handleStartFresh() {
    if (!session) return
    // Clear local data — store will rehydrate with empty state
    useFinanceStore.setState({
      accounts: [], investments: [], assets: [], snapshots: [],
      trackingSettings: [], priorityConfig: [], sampleDataLoaded: false,
      sampleDataDismissed: false, creditCards: [], transactions: [],
      importBatches: [], categoryRules: {},
    })
    try {
      await uploadLocalState(session.user.id)
    } catch (err) {
      console.error('[AuthGuard] Start fresh upload failed', err)
    }
    setShowMigration(false)
    initCloudSync(session.user.id)
    setDataReady(true)
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#F8F9FA]">
        <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="2"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="#00C896" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    )
  }

  // ── Unauthenticated ────────────────────────────────────────────────────────
  if (!session) {
    return <LoginPage onSignIn={signIn} />
  }

  // ── Migration dialog ───────────────────────────────────────────────────────
  if (showMigration) {
    return (
      <>
        {/* Blurred background while waiting */}
        <div className="fixed inset-0 bg-[#F8F9FA]" />
        <MigrationDialog
          accountCount={accounts.length}
          investmentCount={investments.length}
          assetCount={assets.length}
          onUpload={handleMigrationUpload}
          onStartFresh={handleStartFresh}
          uploading={uploading}
        />
      </>
    )
  }

  // ── Waiting for cloud data ─────────────────────────────────────────────────
  if (!dataReady) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#F8F9FA]">
        <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="2"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="#00C896" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    )
  }

  // ── Lock screen ────────────────────────────────────────────────────────────
  if (!unlocked) {
    return <LockScreen onUnlock={handleUnlock} />
  }

  // ── App ────────────────────────────────────────────────────────────────────
  return (
    <>
      {children}
      {/* Expose signOut so Sidebar/TopBar can call it — stored on window for simplicity */}
      <SignOutProvider signOut={signOut} />
    </>
  )
}

// Tiny component that stores signOut on window so Sidebar can call it without
// drilling props through the whole tree. Replaces prop drilling or a context.
function SignOutProvider({ signOut }: { signOut: () => Promise<void> }) {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).__flowwSignOut = signOut
  }, [signOut])
  return null
}
