import React, { useState } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/useAuth'

export interface AuthModalProps {
    isOpen?: boolean
    initialMode?: 'login' | 'register'
    onSuccess?: () => void
    onCancel?: () => void
    onClose?: () => void
}

export const AuthView: React.FC<AuthModalProps> = ({
    initialMode = 'register',
    onSuccess,
    onCancel,
    onClose,
}) => {
    const { login, register } = useAuth()
    const [mode, setMode] = useState<'login' | 'register'>(initialMode)

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [serverError, setServerError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleDismiss = () => {
        if (onClose) onClose()
        else if (onCancel) onCancel()
    }

    const validate = () => {
        const errs: Record<string, string> = {}
        if (mode === 'register' && !name.trim()) {
            errs.name = 'Nome completo é obrigatório'
        }
        if (!email.trim()) {
            errs.email = 'E-mail é obrigatório'
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            errs.email = 'Formato de e-mail inválido'
        }
        if (!password) {
            errs.password = 'Senha é obrigatória'
        } else if (password.length < 6) {
            errs.password = 'A senha deve ter pelo menos 6 caracteres'
        }
        if (mode === 'register') {
            if (!confirmPassword) {
                errs.confirmPassword = 'Confirmação de senha é obrigatória'
            } else if (password !== confirmPassword) {
                errs.confirmPassword = 'As senhas não coincidem'
            }
        }
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setServerError(null)
        if (!validate()) return

        setIsSubmitting(true)
        try {
            if (mode === 'login') {
                await login(email, password)
                window.dispatchEvent(
                    new CustomEvent('toast:notification', {
                        detail: {
                            title: 'Bem-vindo de volta!',
                            message: 'Autenticado com sucesso.',
                            type: 'success',
                        },
                    })
                )
            } else {
                await register(name, email, password)
                window.dispatchEvent(
                    new CustomEvent('toast:notification', {
                        detail: {
                            title: 'Conta criada com sucesso!',
                            message: 'Sua conta de colecionador KURIO está pronta.',
                            type: 'success',
                        },
                    })
                )
            }
            onSuccess?.()
        } catch (err: unknown) {
            const responseData = (err as { response?: { data?: { error?: string } } })?.response?.data
            setServerError(responseData?.error || 'Falha na autenticação. Verifique os dados fornecidos.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const fillDemoAccount = (demoEmail: string) => {
        setEmail(demoEmail)
        setPassword('password123')
        setConfirmPassword('password123')
        setMode('login')
    }

    const handleSocialAuth = (provider: 'Google' | 'Facebook') => {
        // Trigger simulation toast
        window.dispatchEvent(
            new CustomEvent('toast:notification', {
                detail: {
                    title: `Entrar com ${provider}`,
                    message: `Redirecionando para login social com ${provider} (simulado)...`,
                    type: 'info',
                },
            })
        )
        // Autologin with demo user for seamless user flow
        setTimeout(async () => {
            try {
                await login('alex.rivera@example.com', 'password123')
                window.dispatchEvent(
                    new CustomEvent('toast:notification', {
                        detail: {
                            title: 'Conectado com sucesso!',
                            message: `Autenticado via ${provider} como Alex Rivera.`,
                            type: 'success',
                        },
                    })
                )
                onSuccess?.()
            } catch {
                // Ignore fallback
            }
        }, 600)
    }

    return (
        <div className="relative w-full max-w-[500px] bg-[#241612] border border-[#3F2319] rounded-[8px] overflow-hidden shadow-2xl text-[#F5F1EB]">
            {/* Close 'X' button (top-right X=471.9..484.1, Y=15.9..28.1, color #D28A4C) */}
            <button
                type="button"
                onClick={handleDismiss}
                aria-label="Fechar"
                className="absolute top-4 right-4 p-1.5 text-[#D28A4C] hover:text-[#E89B55] transition-colors rounded-sm focus:outline-none"
            >
                <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Modal Body */}
            <div className="pt-10 px-8 sm:px-14 pb-8 space-y-6">
                {/* 1. Header Tabs: Entrar / Cadastrar (signup.svg Y=51..66) */}
                <div className="flex items-center justify-center gap-6">
                    <button
                        type="button"
                        onClick={() => {
                            setMode('login')
                            setErrors({})
                            setServerError(null)
                        }}
                        className={`text-base sm:text-lg font-bold tracking-tight transition-colors ${mode === 'login' ? 'text-[#E89B55]' : 'text-[#F5F1EB] opacity-70 hover:opacity-100'
                            }`}
                    >
                        Entrar
                    </button>

                    {/* Vertical Divider / indicator (Rect 1x20 fill=#F0805F) */}
                    <div className="w-[1px] h-5 bg-[#F0805F]" />

                    <button
                        type="button"
                        onClick={() => {
                            setMode('register')
                            setErrors({})
                            setServerError(null)
                        }}
                        className={`text-base sm:text-lg font-bold tracking-tight transition-colors ${mode === 'register' ? 'text-[#E89B55]' : 'text-[#F5F1EB] opacity-70 hover:opacity-100'
                            }`}
                    >
                        Cadastrar
                    </button>
                </div>

                {/* 2. Subtitle (Path #4: "Crie sua conta para começar a colecionar obras de arte digitais.") */}
                <div className="text-center px-2">
                    <p className="text-xs text-[#F5F1EB] font-normal leading-relaxed">
                        {mode === 'register' ? (
                            <>
                                Crie sua conta para começar a colecionar
                                <br />
                                obras de arte digitais.
                            </>
                        ) : (
                            <>
                                Acesse sua conta de colecionador e continue
                                <br />
                                explorando o acervo KURIO.
                            </>
                        )}
                    </p>
                </div>

                {/* Server Error Alert */}
                {serverError && (
                    <div className="p-3 rounded-[6px] bg-red-950/60 border border-red-800 text-red-200 text-xs">
                        {serverError}
                    </div>
                )}

                {/* 3. Form Inputs (signup.svg Y=164..360, 339x39px each, border=#3F2319, rx=4.5) */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                    {/* Field 1: Nome completo (only shown in register mode) */}
                    {mode === 'register' && (
                        <div className="space-y-1">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nome completo"
                                    className="w-full h-[40px] px-3.5 rounded-[5px] bg-transparent border border-[#3F2319] text-xs text-[#F5F1EB] placeholder-[#B39463] focus:outline-none focus:border-[#D28A4C] transition"
                                />
                            </div>
                            {errors.name && (
                                <span className="text-[11px] text-red-400 pl-1 block">{errors.name}</span>
                            )}
                        </div>
                    )}

                    {/* Field 2: E-mail (signup.svg "Digite seu e-mail") */}
                    <div className="space-y-1">
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Digite seu e-mail"
                                className="w-full h-[40px] px-3.5 rounded-[5px] bg-transparent border border-[#3F2319] text-xs text-[#F5F1EB] placeholder-[#B39463] focus:outline-none focus:border-[#D28A4C] transition"
                            />
                        </div>
                        {errors.email && (
                            <span className="text-[11px] text-red-400 pl-1 block">{errors.email}</span>
                        )}
                    </div>

                    {/* Field 3: Senha (signup.svg "Senha" with eye icon at right) */}
                    <div className="space-y-1">
                        <div className="relative flex items-center">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Senha"
                                className="w-full h-[40px] pl-3.5 pr-10 rounded-[5px] bg-transparent border border-[#3F2319] text-xs text-[#F5F1EB] placeholder-[#B39463] focus:outline-none focus:border-[#D28A4C] transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 text-[#B39463] hover:text-[#E89B55] transition"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <span className="text-[11px] text-red-400 pl-1 block">{errors.password}</span>
                        )}
                    </div>

                    {/* Field 4: Confirmar senha (signup.svg "Confirmar senha", in register mode) */}
                    {mode === 'register' && (
                        <div className="space-y-1">
                            <div className="relative flex items-center">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirmar senha"
                                    className="w-full h-[40px] pl-3.5 pr-10 rounded-[5px] bg-transparent border border-[#3F2319] text-xs text-[#F5F1EB] placeholder-[#B39463] focus:outline-none focus:border-[#D28A4C] transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 text-[#B39463] hover:text-[#E89B55] transition"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <span className="text-[11px] text-red-400 pl-1 block">{errors.confirmPassword}</span>
                            )}
                        </div>
                    )}

                    {/* 4. Cadastrar / Entrar Button (signup.svg Rect 340x45 fill=#D28A4C rx=5 text=#140D0A font-bold) */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-[45px] rounded-[5px] bg-[#D28A4C] hover:bg-[#E89B55] text-[#140D0A] font-bold text-xs uppercase tracking-wider shadow-md shadow-[#D28A4C]/20 transition-all cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? 'Processando...' : mode === 'register' ? 'Cadastrar' : 'Entrar'}
                        </button>
                    </div>
                </form>

                {/* 5. Divider "Ou continue com" (signup.svg Group 20 Y=460.5) */}
                <div className="flex items-center gap-3 pt-1">
                    <div className="flex-1 h-[1px] bg-[#3F2319]" />
                    <span className="text-[11px] text-[#F5F1EB] whitespace-nowrap font-medium">
                        Ou continue com
                    </span>
                    <div className="flex-1 h-[1px] bg-[#3F2319]" />
                </div>

                {/* 6. Social Logins: Google & Facebook (signup.svg Y=485..580, 339x39px, border=#3F2319) */}
                <div className="space-y-2.5">
                    {/* Google Button */}
                    <button
                        type="button"
                        onClick={() => handleSocialAuth('Google')}
                        className="w-full h-[40px] px-4 rounded-[5px] border border-[#3F2319] hover:border-[#D28A4C]/60 hover:bg-[#38220F]/30 transition-all flex items-center justify-center gap-3 text-xs text-[#CFB28C] font-semibold cursor-pointer"
                    >
                        {/* Authentic SVG Google 'G' icon from signup.svg (Elem #22) */}
                        <svg className="w-4 h-4 shrink-0" viewBox="155 495 21 21">
                            <path
                                d="M171.934 512.605C170.199 514.07 167.949 515 165.5 515C161.855 515 158.656 512.992 156.922 510.063L157.571 507.069L160.449 506.535C161.117 508.691 163.133 510.273 165.5 510.273C166.648 510.273 167.715 509.91 168.594 509.266L171.359 509.688L171.934 512.605Z"
                                fill="#59C36A"
                            />
                            <path
                                d="M171.934 512.605L171.359 509.687L168.594 509.266C167.715 509.91 166.648 510.273 165.5 510.273V515C167.949 515 170.199 514.07 171.934 512.605Z"
                                fill="#00A66C"
                            />
                            <path
                                d="M160.227 505C160.227 505.539 160.309 506.055 160.449 506.535L156.922 510.062C156.043 508.586 155.5 506.852 155.5 505C155.5 503.148 156.043 501.414 156.922 499.938L159.753 500.425L160.449 503.465C160.309 503.945 160.227 504.461 160.227 505Z"
                                fill="#FFDA2D"
                            />
                            <path
                                d="M175.5 505C175.5 508.047 174.09 510.777 171.934 512.605L168.594 509.266C169.273 508.773 169.848 508.117 170.223 507.344H165.5C165.172 507.344 164.914 507.086 164.914 506.758V503.242C164.914 502.914 165.172 502.656 165.5 502.656H174.75C175.031 502.656 175.277 502.855 175.324 503.137C175.441 503.746 175.5 504.379 175.5 505Z"
                                fill="#4086F4"
                            />
                            <path
                                d="M170.223 507.344C169.848 508.117 169.273 508.773 168.594 509.266L171.934 512.605C174.09 510.777 175.5 508.047 175.5 505C175.5 504.379 175.441 503.746 175.324 503.137C175.277 502.855 175.031 502.656 174.75 502.656H165.5V507.344H170.223Z"
                                fill="#4175DF"
                            />
                            <path
                                d="M172.098 497.793C172.109 497.957 172.039 498.109 171.934 498.227L169.426 500.723C169.227 500.934 168.898 500.957 168.664 500.781C167.738 500.09 166.648 499.727 165.5 499.727C163.133 499.727 161.117 501.309 160.449 503.465L156.922 499.937C158.656 497.008 161.855 495 165.5 495C167.832 495 170.105 495.859 171.887 497.359C172.016 497.465 172.086 497.629 172.098 497.793Z"
                                fill="#FF641A"
                            />
                            <path
                                d="M168.664 500.781C168.898 500.957 169.227 500.934 169.426 500.723L171.934 498.227C172.039 498.109 172.109 497.957 172.098 497.793C172.086 497.629 172.016 497.465 171.887 497.359C170.105 495.859 167.832 495 165.5 495V499.727C166.648 499.727 167.738 500.09 168.664 500.781Z"
                                fill="#F0805F"
                            />
                        </svg>
                        <span>Entrar com Google</span>
                    </button>

                    {/* Facebook Button */}
                    <button
                        type="button"
                        onClick={() => handleSocialAuth('Facebook')}
                        className="w-full h-[40px] px-4 rounded-[5px] border border-[#3F2319] hover:border-[#D28A4C]/60 hover:bg-[#38220F]/30 transition-all flex items-center justify-center gap-3 text-xs text-[#CFB28C] font-semibold cursor-pointer"
                    >
                        {/* Authentic SVG Facebook icon from signup.svg (Elem #25) */}
                        <svg className="w-4 h-4 shrink-0" viewBox="150 558 15 15">
                            <path
                                d="M157.062 570.978V565.413H155.195V563.245H157.062V561.649C157.062 559.8 158.192 558.791 159.845 558.791C160.636 558.791 161.319 558.85 161.517 558.876V560.814H160.369C159.473 560.814 159.3 561.24 159.3 561.865V563.245H161.448L161.168 565.413H159.3V570.978H157.062Z"
                                fill="#3B5999"
                            />
                        </svg>
                        <span>Entrar com Facebook</span>
                    </button>
                </div>

                {/* 7. Demo Accounts Quick Selection (Development helper) */}
                <div className="pt-2">
                    <div className="p-3 rounded-[6px] bg-[#140D0A] border border-[#3F2319] space-y-1.5">
                        <span className="text-[10px] font-semibold text-[#B39463] uppercase tracking-wider block">
                            Contas de Teste (MSW Demo):
                        </span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => fillDemoAccount('alex.rivera@example.com')}
                                className="flex-1 py-1 px-2 bg-[#241612] hover:bg-[#38220F] rounded-[4px] text-[11px] text-[#E89B55] border border-[#3F2319] text-center transition"
                            >
                                Alex Rivera
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDemoAccount('elena.rostova@example.com')}
                                className="flex-1 py-1 px-2 bg-[#241612] hover:bg-[#38220F] rounded-[4px] text-[11px] text-[#E89B55] border border-[#3F2319] text-center transition"
                            >
                                Elena Rostova
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Gold Accent Bar (signup.svg Rect 27: 500x10 fill=#D28A4C) */}
            <div className="w-full h-[10px] bg-[#D28A4C]" />
        </div>
    )
}

export default AuthView

