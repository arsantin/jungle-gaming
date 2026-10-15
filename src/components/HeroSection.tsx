import React, { useState } from 'react'
import type { NFT } from '@/types'

export interface HeroSectionProps {
    featuredNft?: NFT
    onExploreClick?: () => void
    onNftClick?: (id: string) => void
}

export const HeroSection: React.FC<HeroSectionProps> = ({
    featuredNft,
    onExploreClick,
    onNftClick,
}) => {
    const [currentSlide, setCurrentSlide] = useState(0)

    const slides = [
        {
            image: '/assets/image0_2_2.png',
            title: 'Kurio Hero Artwork 1',
        },
        {
            image: '/assets/image1_2_2.png',
            title: 'Kurio Hero Artwork 2',
        },
        {
            image: '/assets/image2_2_2.png',
            title: 'Kurio Hero Artwork 3',
        },
    ]

    return (
        <section className="relative overflow-hidden pt-10 pb-16 lg:pt-14 lg:pb-24">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-16 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    {/* Left Column: Eyebrow, Display Headline, Description, EXPLORAR Button */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Eyebrow Pill from Path #12 */}
                        <div className="inline-block text-xs uppercase tracking-[0.2em] font-medium text-[#F5F1EB]/80">
                            Bem-vindo à Kurio
                        </div>

                        {/* Display Headline matching Path #13: DESCUBRA E COMPRE ARTES DIGITAIS */}
                        <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold uppercase tracking-tight text-[#F5F1EB] leading-[1.1]">
                            Descubra e Compre <br />
                            <span className="text-[#F5F1EB]">
                                Artes Digitais
                            </span>
                        </h1>

                        {/* Description matching Path #14: text color #CFB28C */}
                        <p className="text-[#CFB28C] text-sm sm:text-base max-w-xl leading-relaxed">
                            Explore o marketplace definitivo de colecionáveis digitais exclusivos. Encontre obras raras,
                            conecte-se com criadores renomados e construa seu portfólio digital na Web3 com segurança.
                        </p>

                        {/* CTA Button matching Path #15: Rect x=160 y=416 w=140 h=40 rx=6 fill=#D28A4C, text #140D0A EXPLORAR */}
                        <div className="pt-2">
                            <button
                                onClick={onExploreClick}
                                className="w-[140px] h-[40px] rounded-[6px] bg-[#D28A4C] hover:bg-[#E89B55] text-[#140D0A] font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center cursor-pointer"
                            >
                                Explorar
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Hero Artwork Rect x=870 y=101 w=450 h=450 rx=24 with Carousel Dots below */}
                    <div className="lg:col-span-5 flex flex-col items-center">
                        <div
                            onClick={() => {
                                if (featuredNft) onNftClick?.(featuredNft.id)
                            }}
                            className="w-full max-w-[450px] aspect-square rounded-[24px] overflow-hidden bg-[#241612] shadow-2xl relative cursor-pointer border border-[#3F2319] hover:border-[#D28A4C] transition duration-300"
                        >
                            <img
                                src={slides[currentSlide].image}
                                alt={slides[currentSlide].title}
                                className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
                            />
                        </div>

                        {/* Carousel 3 dots matching home.svg at y=504: cx=724, 740, 756 r=4 fill=#D28A4C */}
                        <div className="flex items-center gap-4 mt-6">
                            {slides.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    aria-label={`Slide ${idx + 1}`}
                                    className={`w-2 h-2 rounded-full transition-all ${currentSlide === idx ? 'bg-[#D28A4C] w-5' : 'bg-[#D28A4C]/40 hover:bg-[#D28A4C]/80'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
