import { RecommendationPanel } from '../recommendations/RecommendationPanel'

export function RightPanel() {
  return (
    <aside className="hidden lg:flex flex-col w-60 h-dvh shrink-0 border-l border-white/5 bg-[#0D1117] overflow-hidden">
      <RecommendationPanel />
    </aside>
  )
}
