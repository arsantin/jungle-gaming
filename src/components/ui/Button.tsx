import React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading = false, disabled, children, ...props }, ref) => {
        const base =
            'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0f] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'

        const variants = {
            primary: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25 active:scale-[0.98]',
            secondary: 'bg-[#1e1f29] hover:bg-[#282a37] text-white border border-[#2e3040]',
            outline: 'border border-purple-500/40 text-purple-300 hover:bg-purple-500/10 hover:border-purple-500',
            ghost: 'text-gray-300 hover:text-white hover:bg-white/5',
            danger: 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30',
        }

        const sizes = {
            sm: 'px-3 py-1.5 text-xs gap-1.5',
            md: 'px-4 py-2.5 text-sm gap-2',
            lg: 'px-6 py-3.5 text-base gap-2.5',
        }

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(base, variants[variant], sizes[size], className)}
                {...props}
            >
                {isLoading && (
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                )}
                {children}
            </button>
        )
    }
)

Button.displayName = 'Button'
