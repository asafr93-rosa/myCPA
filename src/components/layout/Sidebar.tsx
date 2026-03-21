import { NavLink } from 'react-router-dom'
import { useFinanceStore } from '../../store/useFinanceStore'

const NAV_ITEMS = [
  {
    path: '/',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="11" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="1" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    path: '/accounts',
    label: 'Bank Accounts',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M1 8h16" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M4 2l5-0M5 2h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="4.5" cy="12" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    path: '/investments',
    label: 'Investments',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 14l4-4 3 2 4-5 3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 6v3h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    path: '/assets',
    label: 'Assets',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M1.5 16.5V8.5L9 3l7.5 5.5v8H1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M6.5 16.5v-5h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    path: '/advisor',
    label: 'AI Advisor',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6.5 7.5C6.5 6.12 7.62 5 9 5s2.5 1.12 2.5 2.5c0 1.5-1.5 2.5-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="9" cy="13" r="0.75" fill="currentColor"/>
      </svg>
    ),
  },
]

export function Sidebar() {
  const userProfile = useFinanceStore((s) => s.settings.userProfile)
  return (
    <aside className="hidden md:flex flex-col w-56 h-full bg-[#0D1117] border-r border-white/8 px-3 py-5 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-8">
        <div className="w-7 h-7 bg-[#00D4AA] rounded-lg flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 10l3-3 2 2 3-4 2 2" stroke="#0D1117" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-base font-semibold text-[#E6EDF3] tracking-tight">Floww</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-[#00D4AA]/10 text-[#00D4AA]'
                  : 'text-[#7D8590] hover:text-[#E6EDF3] hover:bg-white/5'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      <NavLink to="/settings" className="px-3 pt-4 border-t border-white/8 flex items-center gap-2.5 group">
        <div className="w-7 h-7 rounded-full overflow-hidden bg-[#1C2128] border border-white/10 flex items-center justify-center shrink-0">
          {userProfile?.avatarDataUrl ? (
            <img src={userProfile.avatarDataUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="5" r="2.5" stroke="#484F58" strokeWidth="1.2"/>
              <path d="M2 12c0-2.8 2.2-4.5 5-4.5s5 1.7 5 4.5" stroke="#484F58" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#7D8590] group-hover:text-[#E6EDF3] transition-colors truncate">
            {userProfile?.name || 'My Profile'}
          </p>
          {userProfile?.age && (
            <p className="text-[10px] text-[#484F58]">Age {userProfile.age}</p>
          )}
        </div>
      </NavLink>
    </aside>
  )
}
