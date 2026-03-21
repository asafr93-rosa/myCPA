import { NavLink } from 'react-router-dom'
import { useFinanceStore } from '../../store/useFinanceStore'

export function TopBar() {
  const userProfile = useFinanceStore((s) => s.settings.userProfile)

  return (
    <div className="md:hidden shrink-0 h-12 px-4 flex items-center justify-between bg-[#0D1117] border-b border-white/8">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-[#00D4AA] rounded-md flex items-center justify-center shrink-0">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M2 10l3-3 2 2 3-4 2 2" stroke="#0D1117" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-sm font-semibold text-[#E6EDF3] tracking-tight">Floww</span>
      </div>

      {/* Profile avatar */}
      <NavLink to="/settings" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-[#1C2128] border border-white/10 flex items-center justify-center">
          {userProfile?.avatarDataUrl ? (
            <img src={userProfile.avatarDataUrl} alt="" className="w-full h-full object-cover" />
          ) : userProfile?.name ? (
            <span className="text-xs font-semibold text-[#7D8590]">
              {userProfile.name.charAt(0).toUpperCase()}
            </span>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="5" r="2.5" stroke="#484F58" strokeWidth="1.2"/>
              <path d="M2 12c0-2.8 2.2-4.5 5-4.5s5 1.7 5 4.5" stroke="#484F58" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          )}
        </div>
      </NavLink>
    </div>
  )
}
