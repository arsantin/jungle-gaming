import React from 'react'
import { Heart, ShoppingBag, CheckCircle2 } from 'lucide-react'
import type { NFT } from '@/types'
import { formatEth } from '@/lib/utils'
import { useAuth } from '@/context/useAuth'
import { useFavorites, useToggleFavorite, useAddToCart } from '@/hooks/useQueries'

export interface NFTCardProps {
    nft: NFT
    onSelect?: (id: string) => void
}

export const NFTCard: React.FC<NFTCardProps> = ({ nft, onSelect }) => {
    const { user } = useAuth()
    const { data: favs } = useFavorites()
    const toggleFavMutation = useToggleFavorite()
    const addToCartMutation = useAddToCart()

    const isFavorited = favs?.favoriteIds?.includes(nft.id) || false
    const isSoldOut = nft.editionsAvailable <= 0

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!user) {
            window.dispatchEvent(
                new CustomEvent('toast:notification', {
                    detail: {
                        title: 'Authentication required',
                        message: 'Please sign in to favorite NFTs.',
                        type: 'info',
                    },
                })
            )
            return
        }
        toggleFavMutation.mutate(nft.id)
    }

    const handleAddToCartClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (isSoldOut) return
        addToCartMutation.mutate(
            { nftId: nft.id, quantity: 1 },
            {
                onSuccess: () => {
                    window.dispatchEvent(
                        new CustomEvent('toast:notification', {
                            detail: {
                                title: 'Added to cart',
                                message: `"${nft.title}" was added to your cart.`,
                                type: 'success',
                            },
                        })
                    )
                },
            }
        )
    }

    return (
        <div
            onClick={() => onSelect?.(nft.id)}
            className="group relative bg-[#241612] border border-[#3F2319] rounded-[18px] p-2 hover:border-[#D28A4C] transition-all duration-300 flex flex-col cursor-pointer shadow-lg"
        >
            {/* Thumbnail Container matching home.svg cards (250x250, rx=15) */}
            <div className="relative aspect-square w-full rounded-[15px] overflow-hidden bg-[#140D0A]">
                <img
                    src={nft.imageUrl}
                    alt={nft.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Favorite button */}
                <button
                    onClick={handleFavoriteClick}
                    aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                    className={`absolute top-2.5 right-2.5 p-2 rounded-lg backdrop-blur-md border transition-all ${isFavorited
                        ? 'bg-[#D28A4C] text-[#140D0A] border-[#D28A4C]'
                        : 'bg-[#140D0A]/70 text-[#CFB28C] border-[#3F2319] hover:text-[#F5F1EB] hover:bg-[#241612]'
                        }`}
                >
                    <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>

                {/* Sold out overlay tag */}
                {isSoldOut && (
                    <div className="absolute inset-0 bg-[#140D0A]/85 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-[#38220F] text-[#CFB28C] text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-[#55321F]">
                            Esgotado
                        </span>
                    </div>
                )}
            </div>

            {/* Content matching home.svg typography and colors */}
            <div className="pt-3 pb-1 px-2 flex-1 flex flex-col justify-between gap-2">
                <div>
                    <h3 className="font-bold text-sm text-[#F5F1EB] group-hover:text-[#E89B55] transition line-clamp-1">
                        {nft.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[11px] text-[#CFB28C] truncate">{nft.creator.name}</span>
                        {nft.creator.verified && (
                            <CheckCircle2 className="w-3 h-3 text-[#D28A4C] inline shrink-0" />
                        )}
                    </div>
                </div>

                {/* Price & Action Button */}
                <div className="pt-2 border-t border-[#3F2319]/80 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] text-[#B39463] uppercase font-semibold block">Preço</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-sm font-extrabold text-[#E89B55] font-mono tracking-tight">
                                {formatEth(nft.priceEth)}
                            </span>
                            <span className="text-[10px] text-[#CFB28C] font-bold">ETH</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            disabled={isSoldOut || addToCartMutation.isPending}
                            onClick={handleAddToCartClick}
                            aria-label={`Comprar ${nft.title}`}
                            className="p-2 rounded-md bg-[#D28A4C] hover:bg-[#E89B55] text-[#140D0A] font-bold transition flex items-center justify-center shadow-sm disabled:opacity-50"
                        >
                            <ShoppingBag className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
