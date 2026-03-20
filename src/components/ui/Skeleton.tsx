interface SkeletonProps {
  className?: string
  height?: string
  width?: string
}

export function Skeleton({ className = '', height = 'h-4', width = 'w-full' }: SkeletonProps) {
  return (
    <div className={`animate-shimmer rounded-lg ${height} ${width} ${className}`} />
  )
}

export function SkeletonCard() {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton width="w-32" height="h-4" />
        <Skeleton width="w-16" height="h-6" />
      </div>
      <Skeleton height="h-8" width="w-48" />
      <div className="flex gap-2">
        <Skeleton width="w-20" height="h-5" />
        <Skeleton width="w-20" height="h-5" />
        <Skeleton width="w-20" height="h-5" />
      </div>
    </div>
  )
}
