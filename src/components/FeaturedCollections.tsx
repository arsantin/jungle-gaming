import React from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'

export interface CollectionItem {
    id: string
    title: string
    author: string
    itemsCount: number
    floorPrice: string
    imageUrl: string
}

export interface FeaturedCollectionsProps {
    onSelectCollection?: (id: string) => void
}

const COLLECTIONS_DATA: CollectionItem[] = [
    {
        id: 'col-1',
        title: 'Cyber Samurai Odyssey',
        author: 'Kenji Sato',
        itemsCount: 500,
        floorPrice: '2.50 ETH',
        imageUrl: '/assets/image2_2_2.png',
    },
    {
        id: 'col-2',
        title: 'Celestial Dreamscapes',
        author: 'Elena Rostova',
        itemsCount: 320,
        floorPrice: '1.85 ETH',
        imageUrl: '/assets/image0_2_2.png',
    },
    {
        id: 'col-3',
        title: 'Neo Tokyo Retrowave',
        author: 'Marcus Vance',
        itemsCount: 450,
        floorPrice: '3.10 ETH',
        imageUrl: '/assets/image1_2_2.png',
    },
    {
        id: 'col-4',
        title: 'Ancient Mythos Reborn',
        author: 'Aria Thorne',
        itemsCount: 200,
        floorPrice: '4.20 ETH',
        imageUrl: '/assets/image3_2_2.png',
    },
]

export const FeaturedCollections: React.FC<FeaturedCollectionsProps> = ({ onSelectCollection }) => {
    return (
        <section className="py-16 max-w-[1440px] mx-auto px-6 lg:px-16">
            {/* Section Header matching Path #85 (Title at Y=2470) and Path #86 (Subtitle at Y=2514) */}
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E89B55]">
                    <Sparkles className="w-3.5 h-3.5 text-[#D28A4C]" />
                    <span>Coleções em Destaque</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#F5F1EB]">
                    Top Coleções da Semana
                </h2>
                <p className="text-sm text-[#CFB28C] leading-relaxed">
                    Explore as coleções mais negociadas, com maior volume e engajamento da comunidade na plataforma Kurio.
                </p>
            </div>

            {/* 4 Cards Grid matching Rect x=120, 412, 704, 996 y=2569 w=268 h=369 rx=8 fill=#241612 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {COLLECTIONS_DATA.map((col) => (
                    <div
                        key={col.id}
                        onClick={() => onSelectCollection?.(col.id)}
                        className="bg-[#241612] border border-[#3F2319] rounded-[16px] overflow-hidden hover:border-[#D28A4C] transition duration-300 flex flex-col group cursor-pointer shadow-lg"
                    >
                        {/* Cover Image (w=268 h=195) */}
                        <div className="w-full h-[195px] overflow-hidden bg-[#140D0A]">
                            <img
                                src={col.imageUrl}
                                alt={col.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                                <span className="text-[11px] text-[#CFB28C] block mb-1">
                                    Por {col.author}
                                </span>
                                <h3 className="text-base font-bold text-[#F5F1EB] group-hover:text-[#E89B55] transition line-clamp-1 mb-2">
                                    {col.title}
                                </h3>
                                <div className="flex items-center justify-between text-xs text-[#CFB28C] py-2 border-t border-[#3F2319]">
                                    <span>Piso</span>
                                    <span className="font-mono font-bold text-[#E89B55]">{col.floorPrice}</span>
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-between">
                                <span className="text-[11px] text-[#CFB28C]/80">
                                    {col.itemsCount} itens
                                </span>
                                <span className="text-xs font-bold text-[#E89B55] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    Ver Coleção <ArrowRight className="w-3.5 h-3.5" />
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
