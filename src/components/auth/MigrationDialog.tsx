import { createPortal } from 'react-dom'

interface Props {
  accountCount: number
  investmentCount: number
  assetCount: number
  onUpload: () => void
  onStartFresh: () => void
  uploading: boolean
}

export function MigrationDialog({ accountCount, investmentCount, assetCount, onUpload, onStartFresh, uploading }: Props) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-fade-in">
        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-[#00C896]/10 flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2v10m0 0l-3-3m3 3l3-3" stroke="#00C896" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" stroke="#00C896" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        <h2 className="text-base font-semibold text-[#111827] mb-1">Existing data found</h2>
        <p className="text-sm text-[#6B7280] mb-4">
          We found local data on this device. Would you like to upload it to your cloud account?
        </p>

        {/* Summary */}
        <div className="flex gap-3 mb-6">
          {accountCount > 0 && (
            <div className="flex-1 text-center bg-[#F3F4F6] rounded-xl py-2.5">
              <p className="text-lg font-bold text-[#111827]">{accountCount}</p>
              <p className="text-[10px] text-[#6B7280]">Account{accountCount !== 1 ? 's' : ''}</p>
            </div>
          )}
          {investmentCount > 0 && (
            <div className="flex-1 text-center bg-[#F3F4F6] rounded-xl py-2.5">
              <p className="text-lg font-bold text-[#111827]">{investmentCount}</p>
              <p className="text-[10px] text-[#6B7280]">Investment{investmentCount !== 1 ? 's' : ''}</p>
            </div>
          )}
          {assetCount > 0 && (
            <div className="flex-1 text-center bg-[#F3F4F6] rounded-xl py-2.5">
              <p className="text-lg font-bold text-[#111827]">{assetCount}</p>
              <p className="text-[10px] text-[#6B7280]">Asset{assetCount !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onUpload}
            disabled={uploading}
            className="w-full py-2.5 rounded-xl bg-[#00C896] text-white text-sm font-semibold hover:bg-[#00B589] active:bg-[#00A07A] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeOpacity="0.3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Uploading…
              </>
            ) : (
              'Upload to Cloud'
            )}
          </button>
          <button
            onClick={onStartFresh}
            disabled={uploading}
            className="w-full py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#6B7280] hover:bg-[#F9FAFB] transition-colors disabled:opacity-60"
          >
            Start Fresh
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
