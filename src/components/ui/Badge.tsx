import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'teal' | 'amber' | 'red' | 'neutral' | 'blue'
  className?: string
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  const variants = {
    teal: 'bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/20',
    amber: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20',
    red: 'bg-[#F87171]/10 text-[#F87171] border-[#F87171]/20',
    neutral: 'bg-white/5 text-[#7D8590] border-white/10',
    blue: 'bg-[#58A6FF]/10 text-[#58A6FF] border-[#58A6FF]/20',
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
        border font-mono
        ${variants[variant]} ${className}
      `}
    >
      {children}
    </span>
  )
}
