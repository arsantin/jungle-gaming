import React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, id, ...props }, ref) => {
        const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

        return (
            <div className="w-full flex flex-col gap-1.5">
                {label && (
                    <label htmlFor={inputId} className="text-xs font-semibold text-gray-300">
                        {label}
                    </label>
                )}
                <input
                    id={inputId}
                    ref={ref}
                    className={cn(
                        'w-full bg-[#13141c] border border-[#252736] rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-150 disabled:opacity-50',
                        error && 'border-red-500/80 focus:border-red-500 focus:ring-red-500',
                        className
                    )}
                    {...props}
                />
                {error ? (
                    <span className="text-xs text-red-400 font-medium">{error}</span>
                ) : helperText ? (
                    <span className="text-xs text-gray-500">{helperText}</span>
                ) : null}
            </div>
        )
    }
)

Input.displayName = 'Input'
