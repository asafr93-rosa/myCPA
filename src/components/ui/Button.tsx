import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none'

  const variants = {
    primary: 'bg-[#00D4AA] text-[#0D1117] hover:bg-[#00BF99] active:scale-95',
    ghost: 'bg-transparent text-[#7D8590] hover:text-[#E6EDF3] hover:bg-white/5 active:scale-95',
    danger: 'bg-[#F87171]/10 text-[#F87171] hover:bg-[#F87171]/20 border border-[#F87171]/20 active:scale-95',
    outline: 'bg-transparent text-[#E6EDF3] border border-white/10 hover:border-white/20 hover:bg-white/5 active:scale-95',
  }

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  }

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}
