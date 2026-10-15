import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    children: React.ReactNode
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'md',
}) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) {
            document.body.style.overflow = 'hidden'
            window.addEventListener('keydown', handleKeyDown)
        }
        return () => {
            document.body.style.overflow = ''
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    const widths = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    }

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Dialog'}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className={cn(
                    'w-full bg-[#241612] border border-[#3F2319] rounded-[20px] p-6 text-[#F5F1EB] shadow-2xl relative transition-all transform scale-100',
                    widths[maxWidth]
                )}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between pb-4 border-b border-[#3F2319] mb-4">
                    <h2 className="text-base font-extrabold uppercase tracking-wider text-[#F5F1EB]">{title}</h2>
                    <button
                        onClick={onClose}
                        aria-label="Close dialog"
                        className="p-1 rounded-lg text-[#CFB28C] hover:text-[#F5F1EB] hover:bg-[#38220F]/50 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    )
}
