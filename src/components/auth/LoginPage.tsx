interface Props {
  onSignIn: () => void
}

export function LoginPage({ onSignIn }: Props) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#F8F9FA] z-50 px-8">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-14">
        <div className="w-9 h-9 rounded-xl bg-[#00C896] flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 14L8 9L11 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-xl font-bold text-[#111827]">Floww</span>
      </div>

      <div className="w-full max-w-sm glass-card p-8 flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-[#111827] mb-2">Welcome to Floww</h1>
          <p className="text-sm text-[#6B7280]">Sign in to access your financial dashboard from any device</p>
        </div>

        <button
          onClick={onSignIn}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] active:bg-[#F3F4F6] transition-colors text-sm font-medium text-[#111827]"
        >
          {/* Google G icon */}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-xs text-[#9CA3AF] text-center leading-relaxed">
          Your financial data is stored securely and never shared with third parties.
        </p>
      </div>
    </div>
  )
}
