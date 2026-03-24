import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { LockScreen } from './components/auth/LockScreen'
import { Toaster } from 'react-hot-toast'
import { Sidebar } from './components/layout/Sidebar'
import { BottomNav } from './components/layout/BottomNav'
import { TopBar } from './components/layout/TopBar'
import { RightPanel } from './components/layout/RightPanel'
import { Dashboard } from './pages/Dashboard'
import { BankAccounts } from './pages/BankAccounts'
import { Investments } from './pages/Investments'
import { Assets } from './pages/Assets'
import { AIAdvisor } from './pages/AIAdvisor'
import { PrioritySettings } from './pages/PrioritySettings'
import { useFinanceStore } from './store/useFinanceStore'

function ThemeApplier() {
  const theme = useFinanceStore((s) => s.settings.theme)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme ?? 'dark')
  }, [theme])
  return null
}

function SampleDataBanner() {
  const sampleDataLoaded = useFinanceStore((s) => s.sampleDataLoaded)
  const sampleDataDismissed = useFinanceStore((s) => s.sampleDataDismissed)
  const dismissSampleBanner = useFinanceStore((s) => s.dismissSampleBanner)

  if (!sampleDataLoaded || sampleDataDismissed) return null

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-[#3B82F6]/10 border-b border-[#3B82F6]/20 shrink-0">
      <div className="flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
          <circle cx="7" cy="7" r="6.5" stroke="#3B82F6" strokeWidth="1.2"/>
          <path d="M7 6v3.5" stroke="#3B82F6" strokeWidth="1.2" strokeLinecap="round"/>
          <circle cx="7" cy="4.5" r="0.7" fill="#3B82F6"/>
        </svg>
        <span className="text-xs text-[#3B82F6]">
          Sample data loaded — customize by editing or deleting these accounts
        </span>
      </div>
      <button
        onClick={dismissSampleBanner}
        className="text-[#3B82F6]/60 hover:text-[#3B82F6] transition-colors ml-4 shrink-0"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M10.5 3.5l-7 7M3.5 3.5l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}

function Layout() {
  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <SampleDataBanner />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
      <RightPanel />
      <BottomNav />
    </div>
  )
}

export default function App() {
  const [unlocked, setUnlocked] = useState(false)

  useEffect(() => {
    const wasUnlocked = sessionStorage.getItem('floww-unlocked') === '1'
    const hiddenAt = sessionStorage.getItem('floww-hidden-at')
    if (wasUnlocked && !hiddenAt) {
      setUnlocked(true)
    }

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

  if (!unlocked) {
    return (
      <>
        <ThemeApplier />
        <LockScreen onUnlock={handleUnlock} />
      </>
    )
  }

  return (
    <BrowserRouter>
      <ThemeApplier />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#161B22',
            color: '#E6EDF3',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            fontSize: '13px',
          },
          success: {
            iconTheme: { primary: '#00D4AA', secondary: '#0D1117' },
          },
          error: {
            iconTheme: { primary: '#F87171', secondary: '#0D1117' },
          },
        }}
      />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="accounts" element={<BankAccounts />} />
          <Route path="investments" element={<Investments />} />
          <Route path="assets" element={<Assets />} />
          <Route path="advisor" element={<AIAdvisor />} />
          <Route path="settings" element={<PrioritySettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
