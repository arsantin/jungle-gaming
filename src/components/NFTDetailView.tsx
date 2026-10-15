import React, { useState } from 'react'
import {
    Heart,
    ShoppingBag,
    Share2,
    AlertCircle,
    Plus,
    Minus,
    Sparkles,
    Star,
    ExternalLink,
} from 'lucide-react'
import { useNFT, useNFTs, useFavorites, useToggleFavorite, useAddToCart } from '@/hooks/useQueries'
import { useAuth } from '@/context/useAuth'
import { formatEth } from '@/lib/utils'
import { Button } from './ui/Button'
import { Skeleton } from './ui/Skeleton'
import { ValueProposition } from './ValueProposition'

export interface NFTDetailViewProps {
    nftId: string
    onBack: () => void
    onCheckoutDirect?: () => void
}

export const NFTDetailView: React.FC<NFTDetailViewProps> = ({
    nftId,
    onBack,
    onCheckoutDirect,
}) => {
    const { user } = useAuth()
    const { data: nft, isLoading, isError } = useNFT(nftId)
    const { data: relatedData } = useNFTs({ limit: 5 })
    const { data: favs } = useFavorites()
    const toggleFav = useToggleFavorite()
    const addToCart = useAddToCart()

    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'history'>('description')

    const isFavorited = favs?.favoriteIds?.includes(nftId) || false
    const isSoldOut = nft ? nft.editionsAvailable <= 0 : false

    // Curate images for thumbnail strip
    const galleryImages = React.useMemo(() => {
        if (!nft) return []
        const base = nft.imageUrl
        const alt1 = '/assets/image0_2_2.png'
        const alt2 = '/assets/image1_2_2.png'
        const alt3 = '/assets/image2_2_2.png'
        const list = [base, alt1, alt2, alt3]
        return Array.from(new Set(list)).slice(0, 4)
    }, [nft])

    const currentDisplayImage = galleryImages[selectedImageIndex] || nft?.imageUrl

    const handleFavorite = () => {
        if (!user) {
            window.dispatchEvent(
                new CustomEvent('toast:notification', {
                    detail: {
                        title: 'Autenticação necessária',
                        message: 'Faça login para salvar esta obra em seus favoritos.',
                        type: 'info',
                    },
                })
            )
            return
        }
        toggleFav.mutate(nftId)
    }

    const handleAddToCart = () => {
        if (!nft || isSoldOut) return
        addToCart.mutate(
            { nftId: nft.id, quantity },
            {
                onSuccess: () => {
                    window.dispatchEvent(
                        new CustomEvent('toast:notification', {
                            detail: {
                                title: 'Carrinho Atualizado',
                                message: `${quantity} unidade(s) de "${nft.title}" adicionada(s) ao carrinho.`,
                                type: 'success',
                            },
                        })
                    )
                },
            }
        )
    }

    const handleBuyNow = () => {
        if (!nft || isSoldOut) return
        addToCart.mutate(
            { nftId: nft.id, quantity },
            {
                onSuccess: () => {
                    onCheckoutDirect?.()
                },
            }
        )
    }

    if (isLoading) {
        return (
            <div className="max-w-[1200px] mx-auto px-4 py-8 animate-pulse">
                {/* Breadcrumb skeleton */}
                <div className="h-4 w-48 bg-[#241612] rounded mb-6" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                    <div className="lg:col-span-1 flex lg:flex-col gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="w-[100px] h-[100px] rounded-[8px] bg-[#241612]" />
                        ))}
                    </div>
                    <div className="lg:col-span-5">
                        <Skeleton className="w-[444px] h-[444px] max-w-full rounded-[24px] bg-[#241612]" />
                    </div>
                    <div className="lg:col-span-6 space-y-4">
                        <Skeleton className="h-8 w-3/4 bg-[#241612]" />
                        <Skeleton className="h-6 w-1/3 bg-[#241612]" />
                        <Skeleton className="h-20 w-full bg-[#241612]" />
                        <Skeleton className="h-10 w-full bg-[#241612]" />
                    </div>
                </div>
            </div>
        )
    }

    if (isError || !nft) {
        return (
            <div className="max-w-[1200px] mx-auto px-4 py-20 text-center">
                <div className="w-16 h-16 bg-[#241612] text-[#D28A4C] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#3F2319]">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-[#F5F1EB] mb-2">Obra não encontrada</h2>
                <p className="text-[#CFB28C] text-sm mb-6 max-w-md mx-auto">
                    A obra solicitada não pôde ser localizada ou pode ter sido removida do mercado.
                </p>
                <Button onClick={onBack} className="bg-[#D28A4C] hover:bg-[#E89B55] text-[#140D0A] font-bold">
                    Retornar ao Mercado
                </Button>
            </div>
        )
    }

    // Filter out current NFT from related items to get 5 distinct recommended items
    const relatedNFTs = (relatedData?.items?.filter((item) => item.id !== nft.id) || []).slice(0, 5)

    return (
        <div className="w-full text-[#F5F1EB] bg-[#140D0A]">
            <div className="max-w-[1200px] mx-auto px-4 pt-6 pb-16">
                {/* 1. Breadcrumbs (details.svg Y=104..115) */}
                <div className="flex items-center justify-between text-xs text-[#F5F1EB] mb-6">
                    <nav aria-label="Breadcrumb" className="flex items-center gap-2">
                        <button
                            onClick={onBack}
                            className="text-[#CFB28C] hover:text-[#E89B55] transition-colors"
                        >
                            Início
                        </button>
                        <span className="text-[#CFB28C] font-mono">/</span>
                        <button
                            onClick={onBack}
                            className="text-[#CFB28C] hover:text-[#E89B55] transition-colors"
                        >
                            Mercado
                        </button>
                        <span className="text-[#CFB28C] font-mono">/</span>
                        <span className="text-[#E89B55] font-medium truncate max-w-[200px] sm:max-w-md">
                            {nft.title}
                        </span>
                    </nav>

                    {/* Action buttons (Share & Favorite) */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                navigator.clipboard?.writeText(window.location.href)
                                window.dispatchEvent(
                                    new CustomEvent('toast:notification', {
                                        detail: {
                                            title: 'Link Copiado',
                                            message: 'Link da obra copiado para a área de transferência.',
                                            type: 'info',
                                        },
                                    })
                                )
                            }}
                            title="Compartilhar Obra"
                            className="p-2 rounded-[6px] border border-[#3F2319] bg-[#241612] text-[#CFB28C] hover:text-[#E89B55] hover:border-[#D28A4C] transition"
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleFavorite}
                            title={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                            className={`p-2 rounded-[6px] border transition ${isFavorited
                                    ? 'bg-[#D28A4C] text-[#140D0A] border-[#D28A4C]'
                                    : 'bg-[#241612] border-[#3F2319] text-[#CFB28C] hover:text-[#E89B55] hover:border-[#D28A4C]'
                                }`}
                        >
                            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* 2. Main Product Showcase (details.svg Y=129..580) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
                    {/* Left Thumbnail Rail (4 cards of 100x100px at X=120, Y=129, 245, 361, 477) */}
                    <div className="lg:col-span-1 flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                        {galleryImages.map((imgUrl, idx) => {
                            const isSelected = selectedImageIndex === idx
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImageIndex(idx)}
                                    className={`relative w-[100px] h-[100px] shrink-0 rounded-[8px] overflow-hidden bg-[#241612] transition-all duration-200 cursor-pointer ${isSelected
                                            ? 'ring-2 ring-[#D28A4C] border-transparent shadow-lg shadow-[#D28A4C]/15 scale-[1.02]'
                                            : 'border border-[#3F2319] opacity-80 hover:opacity-100 hover:border-[#D28A4C]/60'
                                        }`}
                                >
                                    <img
                                        src={imgUrl}
                                        alt={`Miniatura ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            )
                        })}
                    </div>

                    {/* Central Large Artwork Frame (X=248, Y=131, Container 444x444px, Inner image 404x404px with rx=24) */}
                    <div className="lg:col-span-5 flex justify-center">
                        <div className="relative w-full max-w-[444px] aspect-square rounded-[6px] bg-[#241612] border border-[#3F2319] p-5 flex items-center justify-center shadow-2xl">
                            <div className="w-full h-full rounded-[24px] overflow-hidden relative group">
                                <img
                                    src={currentDisplayImage}
                                    alt={nft.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />

                                {/* Sold Out Overlay */}
                                {isSoldOut && (
                                    <div className="absolute inset-0 bg-[#140D0A]/85 backdrop-blur-xs flex items-center justify-center">
                                        <span className="bg-[#D28A4C] text-[#140D0A] text-xs font-black uppercase tracking-wider px-4 py-2 rounded-[6px]">
                                            Edição Esgotada
                                        </span>
                                    </div>
                                )}

                                {/* Floating Token Badge */}
                                <div className="absolute bottom-3 left-3 bg-[#140D0A]/80 backdrop-blur-md px-3 py-1 rounded-[6px] border border-[#3F2319] text-[11px] font-semibold text-[#CFB28C] flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3 text-[#D28A4C]" />
                                    <span>Token ID {nft.tokenId}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Detail Panel (details.svg X=725..1320) */}
                    <div className="lg:col-span-6 space-y-4">
                        {/* Artwork Title (Path #14: X=727, Y=137..163) */}
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F1EB] tracking-tight leading-snug">
                            {nft.title}
                        </h1>

                        {/* Price & Star Rating Row (details.svg Y=181..210) */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#D28A4C]/30">
                            {/* Price in Gold (Path #15: X=726.9, Y=181.1, fill=#E89B55) */}
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl sm:text-3xl font-black text-[#E89B55] font-mono tracking-tight">
                                    {formatEth(nft.priceEth)} ETH
                                </span>
                                <span className="text-xs text-[#CFB28C]">
                                    (≈ ${(parseFloat(nft.priceEth) * 3150).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                                </span>
                            </div>

                            {/* 5-Star Rating & Reviews (Paths #16..20: 4 stars #D28A4C + 1 star #CFB28C, Path #21 text) */}
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-0.5">
                                    <Star className="w-3.5 h-3.5 fill-[#D28A4C] text-[#D28A4C]" />
                                    <Star className="w-3.5 h-3.5 fill-[#D28A4C] text-[#D28A4C]" />
                                    <Star className="w-3.5 h-3.5 fill-[#D28A4C] text-[#D28A4C]" />
                                    <Star className="w-3.5 h-3.5 fill-[#D28A4C] text-[#D28A4C]" />
                                    <Star className="w-3.5 h-3.5 text-[#CFB28C]" />
                                </div>
                                <span className="text-xs text-[#F5F1EB] font-medium">
                                    4.8 (128 avaliações)
                                </span>
                            </div>
                        </div>

                        {/* Description Section (Path #22: "Descrição", Path #23: text) */}
                        <div className="space-y-1.5 pt-1">
                            <h2 className="text-xs font-bold text-[#F5F1EB] uppercase tracking-wider">
                                Descrição
                            </h2>
                            <p className="text-xs leading-relaxed text-[#CFB28C]">
                                {nft.description}
                            </p>
                        </div>

                        {/* Attribute Chips Row (Path #24 header + Chips at X=725..932, Y=359..386) */}
                        <div className="space-y-2 pt-2">
                            <span className="text-xs font-bold text-[#F5F1EB] uppercase tracking-wider block">
                                Categoria & Propriedades
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="px-3 py-1.5 rounded-[6px] border border-[#3F2319] bg-[#241612] text-xs font-semibold text-[#CFB28C]">
                                    {nft.category || 'Arte Digital'}
                                </span>
                                <span className="px-3 py-1.5 rounded-[6px] border border-[#3F2319] bg-[#241612] text-xs font-semibold text-[#CFB28C]">
                                    3D
                                </span>
                                <span className="px-3 py-1.5 rounded-[6px] border border-[#D28A4C] bg-[#241612] text-xs font-semibold text-[#E89B55]">
                                    Raridade Épica
                                </span>
                                <span className="px-3 py-1.5 rounded-[6px] border border-[#3F2319] bg-[#241612] text-xs font-semibold text-[#CFB28C]">
                                    Colecionável
                                </span>
                            </div>
                        </div>

                        {/* Action Bar (details.svg Y=400: Counter, Buy Now, Add to Cart) */}
                        <div className="pt-4 flex flex-wrap items-center gap-4">
                            {/* Quantity Counter Pill (X=725, 33x49.5px button -, qty, 33x49.5px button +) */}
                            {!isSoldOut && (
                                <div className="flex items-center bg-[#241612] border border-[#3F2319] rounded-[6px] p-1">
                                    <button
                                        disabled={quantity <= 1}
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        aria-label="Diminuir quantidade"
                                        className="w-8 h-9 flex items-center justify-center rounded-[4px] bg-[#D28A4C] text-[#140D0A] font-bold hover:bg-[#E89B55] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="w-10 text-center font-mono font-bold text-sm text-[#F5F1EB]">
                                        {quantity}
                                    </span>
                                    <button
                                        disabled={quantity >= nft.editionsAvailable}
                                        onClick={() => setQuantity((q) => Math.min(nft.editionsAvailable, q + 1))}
                                        aria-label="Aumentar quantidade"
                                        className="w-8 h-9 flex items-center justify-center rounded-[4px] bg-[#D28A4C] text-[#140D0A] font-bold hover:bg-[#E89B55] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}

                            {/* COMPRAR AGORA CTA (Rect #16: X=1052, W=130, H=40, fill=#D28A4C, text=#140D0A) */}
                            <button
                                disabled={isSoldOut || addToCart.isPending}
                                onClick={handleBuyNow}
                                className="h-10 px-5 rounded-[6px] bg-[#D28A4C] hover:bg-[#E89B55] text-[#140D0A] font-bold text-xs uppercase tracking-wider shadow-md shadow-[#D28A4C]/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Comprar Agora
                            </button>

                            {/* ADICIONAR AO CARRINHO Outline CTA (Rect #17: X=1190.5, W=129, H=39, stroke=#D28A4C, text=#E89B55) */}
                            <button
                                disabled={isSoldOut || addToCart.isPending}
                                onClick={handleAddToCart}
                                className="h-10 px-4 rounded-[6px] border border-[#D28A4C] hover:bg-[#D28A4C]/10 text-[#E89B55] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ShoppingBag className="w-4 h-4 text-[#D28A4C]" />
                                <span>Adicionar ao Carrinho</span>
                            </button>
                        </div>

                        {/* Metadata List / Specifications (Paths #39..42: Y=468..577) */}
                        <div className="pt-4 border-t border-[#3F2319] space-y-2.5 text-xs">
                            <div className="flex items-center justify-between py-1">
                                <span className="text-[#B39463]">Endereço do Contrato</span>
                                <span className="font-mono text-[#F5F1EB] hover:text-[#E89B55] cursor-pointer flex items-center gap-1">
                                    0x71c...8942
                                    <ExternalLink className="w-3 h-3 text-[#B39463]" />
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-1">
                                <span className="text-[#B39463]">Padrão do Token</span>
                                <span className="font-mono text-[#F5F1EB]">ERC-721</span>
                            </div>
                            <div className="flex items-center justify-between py-1">
                                <span className="text-[#B39463]">Rede Blockchain</span>
                                <span className="text-[#F5F1EB]">Ethereum Mainnet</span>
                            </div>
                            <div className="flex items-center justify-between py-1">
                                <span className="text-[#F5F1EB]">Royalties do Criador</span>
                                <span className="text-[#F5F1EB] font-bold">5.0%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Extended Information Tabs (details.svg Y=675..1100) */}
                <div className="mb-20">
                    {/* Tab Navigation Header (Y=675, active tab line stroke #D28A4C, border line X=120..1320) */}
                    <div className="border-b border-[#D28A4C]/30 flex items-center gap-8 mb-6">
                        <button
                            onClick={() => setActiveTab('description')}
                            className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider relative transition-colors ${activeTab === 'description'
                                    ? 'text-[#E89B55]'
                                    : 'text-[#F5F1EB] hover:text-[#E89B55]'
                                }`}
                        >
                            Descrição Detalhada
                            {activeTab === 'description' && (
                                <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#D28A4C]" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('specifications')}
                            className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider relative transition-colors ${activeTab === 'specifications'
                                    ? 'text-[#E89B55]'
                                    : 'text-[#F5F1EB] hover:text-[#E89B55]'
                                }`}
                        >
                            Especificações
                            {activeTab === 'specifications' && (
                                <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#D28A4C]" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider relative transition-colors ${activeTab === 'history'
                                    ? 'text-[#E89B55]'
                                    : 'text-[#F5F1EB] hover:text-[#E89B55]'
                                }`}
                        >
                            Histórico de Lances
                            {activeTab === 'history' && (
                                <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#D28A4C]" />
                            )}
                        </button>
                    </div>

                    {/* Tab Content Display */}
                    {activeTab === 'description' && (
                        <div className="space-y-6 text-xs leading-relaxed text-[#CFB28C]">
                            <p>
                                {nft.description} Esta obra faz parte da coleção exclusiva{' '}
                                <strong className="text-[#F5F1EB]">{nft.collection.name}</strong>, concebida pelo aclamado artista digital{' '}
                                <strong className="text-[#F5F1EB]">{nft.creator.name}</strong>. Cada pixel foi renderizado através de técnicas avançadas de modelagem volumétrica, garantindo autenticidade e unicidade registradas de forma imutável no livro-razão da blockchain Ethereum.
                            </p>

                            <div className="space-y-2 pt-2">
                                <h3 className="text-xs font-bold text-[#F5F1EB] uppercase tracking-wider">
                                    Sobre o Criador
                                </h3>
                                <p>
                                    {nft.creator.name} é pioneiro no movimento de arte generativa e surrealismo digital no Brasil, integrando esculturas luminescentes com algoritmos descentralizados desde 2021.
                                </p>
                            </div>

                            <div className="space-y-2 pt-2">
                                <h3 className="text-xs font-bold text-[#F5F1EB] uppercase tracking-wider">
                                    Autenticidade e Certificação
                                </h3>
                                <p>
                                    A custódia do ativo digital é garantida via smart contract auditado, com armazenamento descentralizado em rede IPFS e metadados com criptografia SHA-256.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'specifications' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="bg-[#241612] p-4 rounded-[6px] border border-[#3F2319] space-y-2">
                                <span className="text-[#B39463] font-semibold block">Resolução do Arquivo Original</span>
                                <span className="text-[#F5F1EB] font-mono">4096 × 4096 px (Lossless PNG)</span>
                            </div>
                            <div className="bg-[#241612] p-4 rounded-[6px] border border-[#3F2319] space-y-2">
                                <span className="text-[#B39463] font-semibold block">Armazenamento Descentralizado</span>
                                <span className="text-[#F5F1EB] font-mono">IPFS (InterPlanetary File System)</span>
                            </div>
                            <div className="bg-[#241612] p-4 rounded-[6px] border border-[#3F2319] space-y-2">
                                <span className="text-[#B39463] font-semibold block">Disponibilidade</span>
                                <span className="text-[#F5F1EB]">
                                    {nft.editionsAvailable} de {nft.editionsTotal} edições disponíveis
                                </span>
                            </div>
                            <div className="bg-[#241612] p-4 rounded-[6px] border border-[#3F2319] space-y-2">
                                <span className="text-[#B39463] font-semibold block">Padrão de Metadados</span>
                                <span className="text-[#F5F1EB]">OpenSea Metadata Standard</span>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="space-y-3">
                            <div className="bg-[#241612] p-4 rounded-[6px] border border-[#3F2319] flex items-center justify-between text-xs">
                                <div>
                                    <span className="text-[#F5F1EB] font-bold block">Lance de 2.45 ETH</span>
                                    <span className="text-[#B39463] font-mono">Por 0x99F...120E</span>
                                </div>
                                <span className="text-[#CFB28C]">Há 2 horas</span>
                            </div>
                            <div className="bg-[#241612] p-4 rounded-[6px] border border-[#3F2319] flex items-center justify-between text-xs">
                                <div>
                                    <span className="text-[#F5F1EB] font-bold block">Lance de 2.20 ETH</span>
                                    <span className="text-[#B39463] font-mono">Por 0x32A...44C1</span>
                                </div>
                                <span className="text-[#CFB28C]">Há 6 horas</span>
                            </div>
                            <div className="bg-[#241612] p-4 rounded-[6px] border border-[#3F2319] flex items-center justify-between text-xs">
                                <div>
                                    <span className="text-[#F5F1EB] font-bold block">Criação do Token</span>
                                    <span className="text-[#B39463] font-mono">Por {nft.creator.name}</span>
                                </div>
                                <span className="text-[#CFB28C]">Há 3 dias</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. Recommended / Related Artworks Strip (details.svg Y=1111..1550) */}
                <div className="mb-16">
                    {/* Section Title (Path #55: X=121, Y=1111, fill=#E89B55) */}
                    <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#D28A4C]/30">
                        <h2 className="text-lg sm:text-xl font-bold text-[#E89B55] uppercase tracking-wider">
                            Você Também Pode Gostar
                        </h2>
                        <button
                            onClick={onBack}
                            className="text-xs font-semibold text-[#CFB28C] hover:text-[#E89B55] transition-colors"
                        >
                            Ver Todas
                        </button>
                    </div>

                    {/* 5-Item Card Strip (details.svg X=120, 365, 611, 856, 1101, W=219, H=255) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {relatedNFTs.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => {
                                    window.location.hash = `#/nft/${item.id}`
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                }}
                                className="group bg-[#241612] border border-[#3F2319] hover:border-[#D28A4C] rounded-[6px] p-3 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                            >
                                <div className="aspect-square w-full rounded-[13px] overflow-hidden bg-[#140D0A] mb-3">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xs font-bold text-[#F5F1EB] group-hover:text-[#E89B55] truncate transition-colors">
                                        {item.title}
                                    </h3>
                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-xs font-bold text-[#E89B55] font-mono">
                                            {formatEth(item.priceEth)} ETH
                                        </span>
                                        <span className="text-[10px] text-[#CFB28C]">
                                            {item.editionsAvailable} disp.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Carousel indicator dots (details.svg Y=1510, circles at cx=700, 720, 740) */}
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <span className="w-2.5 h-2.5 rounded-full border border-[#D28A4C]" />
                        <span className="w-3 h-3 rounded-full bg-[#D28A4C]" />
                        <span className="w-2.5 h-2.5 rounded-full border border-[#D28A4C]" />
                    </div>
                </div>
            </div>

            {/* 5. Value Proposition Bar (details.svg Y=1612..1862) */}
            <ValueProposition />
        </div>
    )
}
export default NFTDetailView

