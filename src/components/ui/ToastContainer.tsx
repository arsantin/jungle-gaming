import React, { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export interface ToastMessage {
    id: string
    title?: string
    message: string
    type: 'success' | 'error' | 'info'
}

export const ToastContainer: React.FC = () => {
    const [toasts, setToasts] = useState<ToastMessage[]>([])

    useEffect(() => {
        const handleNotification = (e: Event) => {
            const customEvent = e as CustomEvent<Omit<ToastMessage, 'id'>>
            const detail = customEvent.detail
            const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
            const newToast: ToastMessage = { ...detail, id }

            setToasts((prev) => [...prev, newToast])

            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id))
            }, 4500)
        }

        window.addEventListener('toast:notification', handleNotification)
        return () => window.removeEventListener('toast:notification', handleNotification)
    }, [])

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }

    if (toasts.length === 0) return null

    return (
        <div
            aria-live="polite"
            className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        >
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 duration-200 bg-[#14151e]/95 border-[#282a3c] text-white"
                >
                    {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
                    {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
                    {toast.type === 'info' && <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />}

                    <div className="flex-1 text-sm">
                        {toast.title && <p className="font-semibold text-white">{toast.title}</p>}
                        <p className="text-gray-300 text-xs mt-0.5 leading-relaxed">{toast.message}</p>
                    </div>

                    <button
                        onClick={() => removeToast(toast.id)}
                        aria-label="Dismiss toast"
                        className="text-gray-400 hover:text-white p-1 rounded-md"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    )
}
