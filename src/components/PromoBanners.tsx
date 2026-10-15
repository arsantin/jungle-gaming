import React from 'react'
import { ArrowRight } from 'lucide-react'

export interface PromoBannersProps {
    onExploreClick?: (category: string) => void
}

export const PromoBanners: React.FC<PromoBannersProps> = ({ onExploreClick }) => {
    return (
        <section className="py-12 max-w-[1440px] mx-auto px-6 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Banner 1: Left matching Rect x=120 y=2116 w=586 h=250 fill=#241612 */}
                <div className="bg-[#241612] border border-[#3F2319] rounded-[20px] overflow-hidden flex flex-col sm:flex-row items-center p-6 gap-6 shadow-xl hover:border-[#D28A4C] transition duration-300">
                    <div className="w-full sm:w-[240px] h-[200px] shrink-0 rounded-[16px] overflow-hidden bg-[#140D0A]">
                        <img
                            src="/assets/image0_2_2.png"
                            alt="Coleção Exclusiva"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    <div className="flex-1 flex flex-col justify-between h-full space-y-3">
                        <div>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#E89B55] block mb-1">
                                Em Destaque
                            </span>
                            <h3 className="text-xl font-extrabold text-[#F5F1EB] leading-tight">
                                Coleção Especial Genesis
                            </h3>
                            <p className="text-xs text-[#CFB28C] mt-2 leading-relaxed">
                                Descubra peças raras criadas pelos principais artistas digitais de vanguarda da comunidade.
                            </p>
                        </div>
                        <button
                            onClick={() => onExploreClick?.('Arte Digital')}
                            className="w-[140px] h-[40px] rounded-[6px] bg-[#D28A4C] hover:bg-[#E89B55] text-[#140D0A] font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                            <span>Explorar</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Banner 2: Right matching Rect x=734 y=2116 w=586 h=250 fill=#241612 */}
                <div className="bg-[#241612] border border-[#3F2319] rounded-[20px] overflow-hidden flex flex-col sm:flex-row items-center p-6 gap-6 shadow-xl hover:border-[#D28A4C] transition duration-300">
                    <div className="w-full sm:w-[240px] h-[200px] shrink-0 rounded-[16px] overflow-hidden bg-[#140D0A]">
                        <img
                            src="/assets/image2_2_2.png"
                            alt="Novos Criadores"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    <div className="flex-1 flex flex-col justify-between h-full space-y-3">
                        <div>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#E89B55] block mb-1">
                                Novos Lançamentos
                            </span>
                            <h3 className="text-xl font-extrabold text-[#F5F1EB] leading-tight">
                                Universo Virtual & 3D
                            </h3>
                            <p className="text-xs text-[#CFB28C] mt-2 leading-relaxed">
                                Ambientes imersivos e ativos 3D prontos para integração no metaverso e plataformas web.
                            </p>
                        </div>
                        <button
                            onClick={() => onExploreClick?.('Metaverso')}
                            className="w-[140px] h-[40px] rounded-[6px] bg-[#D28A4C] hover:bg-[#E89B55] text-[#140D0A] font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                            <span>Explorar</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}
