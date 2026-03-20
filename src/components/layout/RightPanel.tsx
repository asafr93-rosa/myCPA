import { RecommendationPanel } from '../recommendations/RecommendationPanel'

export function RightPanel() {
  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen shrink-0 border-l border-white/8 bg-[#0D1117] px-4 py-5">
      <RecommendationPanel />
    </aside>
  )
}
