import React, { useState } from 'react'
import { ShieldCheck, Zap, Wallet, Send } from 'lucide-react'

export const ValueProposition: React.FC = () => {
    const [email, setEmail] = useState('')
    const [subscribed, setSubscribed] = useState(false)

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return
        setSubscribed(true)
        window.dispatchEvent(
            new CustomEvent('toast:notification', {
                detail: {
                    title: 'Inscrição realizada!',
                    message: 'Obrigado por assinar nossa newsletter.',
                    type: 'success',
                },
            })
        )
    }

    return (
        <section className="py-12 max-w-[1440px] mx-auto px-6 lg:px-16">
            {/* Container matching Rect width=1200 height=250 fill=#241612 at Y=3034 */}
            <div className="w-full bg-[#241612] border border-[#3F2319] rounded-[24px] p-8 lg:p-10 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-center">
                    {/* Item 1: Icon circle 74x74 fill=#D28A4C at x=168 y=3066 */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-3">
                        <div className="w-[64px] h-[64px] rounded-full bg-[#D28A4C] flex items-center justify-center text-[#140D0A] shadow-md">
                            <Wallet className="w-7 h-7" />
                        </div>
                        <h4 className="text-base font-bold text-[#F5F1EB]">
                            Conecte sua Carteira
                        </h4>
                        <p className="text-xs text-[#CFB28C] leading-relaxed">
                            Integração instantânea com MetaMask, Coinbase e carteiras Web3 para transações rápidas.
                        </p>
                    </div>

                    {/* Item 2: Icon circle 74x74 fill=#D28A4C at x=433 y=3066 */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-3 lg:border-l lg:border-[#3F2319] lg:pl-8">
                        <div className="w-[64px] h-[64px] rounded-full bg-[#D28A4C] flex items-center justify-center text-[#140D0A] shadow-md">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <h4 className="text-base font-bold text-[#F5F1EB]">
                            Autenticidade Garantida
                        </h4>
                        <p className="text-xs text-[#CFB28C] leading-relaxed">
                            Smart contracts auditados e registros imutáveis em blockchain para segurança de cada ativo.
                        </p>
                    </div>

                    {/* Item 3: Icon circle 74x74 fill=#D28A4C at x=699 y=3066 */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-3 lg:border-l lg:border-[#3F2319] lg:pl-8">
                        <div className="w-[64px] h-[64px] rounded-full bg-[#D28A4C] flex items-center justify-center text-[#140D0A] shadow-md">
                            <Zap className="w-7 h-7" />
                        </div>
                        <h4 className="text-base font-bold text-[#F5F1EB]">
                            Liquidez e Velocidade
                        </h4>
                        <p className="text-xs text-[#CFB28C] leading-relaxed">
                            Confirmação em tempo real e checkout determinístico com taxas otimizadas de rede.
                        </p>
                    </div>

                    {/* Item 4 / Newsletter input matching Rect x=965 y=3114 w=325 h=40 fill=#38220F */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-3 lg:border-l lg:border-[#3F2319] lg:pl-8">
                        <h4 className="text-base font-bold text-[#F5F1EB]">
                            Fique por Dentro
                        </h4>
                        <p className="text-xs text-[#CFB28C]">
                            Receba alertas de novos drops e análises de mercado exclusivas no seu email.
                        </p>

                        <form onSubmit={handleSubscribe} className="w-full flex items-center gap-1.5 pt-1">
                            <div className="relative flex-1">
                                <input
                                    type="email"
                                    required
                                    placeholder="Seu melhor email..."
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-[40px] px-3.5 bg-[#38220F] border border-[#55321F] rounded-[6px] text-xs text-[#F5F1EB] placeholder-[#B39463] focus:outline-none focus:border-[#D28A4C] transition"
                                />
                            </div>
                            <button
                                type="submit"
                                className="h-[40px] px-4 rounded-[6px] bg-[#D28A4C] hover:bg-[#E89B55] text-[#140D0A] font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
                            >
                                <span>{subscribed ? 'Feito' : 'Enviar'}</span>
                                <Send className="w-3 h-3" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}
