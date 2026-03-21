import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  {
    path: '/',
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="11" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="1" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    path: '/accounts',
    label: 'Accounts',
    icon: (
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M1 8h16" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="4.5" cy="12" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    path: '/investments',
    label: 'Invest',
    icon: (
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
        <path d="M2 14l4-4 3 2 4-5 3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 6v3h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    path: '/advisor',
    label: 'AI',
    icon: (
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6.5 7.5C6.5 6.12 7.62 5 9 5s2.5 1.12 2.5 2.5c0 1.5-1.5 2.5-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="9" cy="13" r="0.75" fill="currentColor"/>
      </svg>
    ),
  },
  {
    path: '/assets',
    label: 'Assets',
    icon: (
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
        <path d="M1.5 17V8.5L9 3l7.5 5.5V17H1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M6.5 17v-5h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0D1117]/95 backdrop-blur-md border-t border-white/8 flex">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
              isActive ? 'text-[#00D4AA]' : 'text-[#484F58]'
            }`
          }
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
