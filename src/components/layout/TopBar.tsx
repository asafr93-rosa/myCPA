import { NavLink } from 'react-router-dom'
import { useFinanceStore } from '../../store/useFinanceStore'
import { SyncStatusBadge } from './SyncStatusBadge'

export function TopBar() {
  const userProfile = useFinanceStore((s) => s.settings.userProfile)

  return (
    <div className="md:hidden shrink-0 h-14 px-5 flex items-center justify-between bg-white border-b border-[#F3F4F6]">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-[#00C896] rounded-lg flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 10l3-3 2 2 3-4 2 2" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-base font-bold text-[#111827] tracking-tight">Floww</span>
      </div>

      <div className="flex items-center gap-2">
        <SyncStatusBadge />

        {/* Profile avatar */}
        <NavLink to="/settings" className="flex items-center">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center">
            {userProfile?.avatarDataUrl ? (
              <img src={userProfile.avatarDataUrl} alt="" className="w-full h-full object-cover" />
            ) : userProfile?.name ? (
              <span className="text-sm font-semibold text-[#6B7280]">
                {userProfile.name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="5" r="2.5" stroke="#9CA3AF" strokeWidth="1.3"/>
                <path d="M2 12c0-2.8 2.2-4.5 5-4.5s5 1.7 5 4.5" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            )}
          </div>
        </NavLink>
      </div>
    </div>
  )
}
