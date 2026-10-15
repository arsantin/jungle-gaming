import React, { useState, useEffect } from 'react'
import {
    Trash2,
    Plus,
    Minus,
    Tag,
    ShoppingBag,
    AlertTriangle,
    X,
    Check,
} from 'lucide-react'
import {
    useCart,
    useUpdateCartItem,
    useRemoveFromCart,
    useApplyCoupon,
    useRemoveCoupon,
} from '@/hooks/useQueries'
import { formatEth } from '@/lib/utils'
import { Skeleton } from './ui/Skeleton'

export interface CartModalProps {
    isOpen: boolean
    onClose: () => void
    onProceedCheckout: () => void
}

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, onProceedCheckout }) => {
    const { data: cart, isLoading } = useCart()
    const updateItem = useUpdateCartItem()
    const removeItem = useRemoveFromCart()
    const applyCoupon = useApplyCoupon()
    const removeCoupon = useRemoveCoupon()

    const [couponInput, setCouponInput] = useState('')
    const [couponError, setCouponError] = useState<string | null>(null)
    const [selectedPayment, setSelectedPayment] = useState<'crypto' | 'metamask' | 'coinbase'>('coinbase')

    const items = cart?.items || []
    const hasItems = items.length > 0
    const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0)

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
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

    const handleApplyCoupon = (e: React.FormEvent) => {
        e.preventDefault()
        if (!couponInput.trim()) return
        setCouponError(null)
        applyCoupon.mutate(couponInput.trim(), {
            onSuccess: () => {
                setCouponInput('')
                window.dispatchEvent(
                    new CustomEvent('toast:notification', {
                        detail: {
                            title: 'Cupom aplicado',
                            message: `Cupom "${couponInput.toUpperCase()}" aplicado com sucesso.`,
                            type: 'success',
                        },
                    })
                )
            },
            onError: (err: unknown) => {
                const responseData = (err as { response?: { data?: { error?: string } } })?.response?.data
                const msg = responseData?.error || 'Cupom inválido ou expirado'
                setCouponError(msg)
            },
        })
    }

    const handleRemoveCoupon = () => {
        removeCoupon.mutate(undefined, {
            onSuccess: () => {
                window.dispatchEvent(
                    new CustomEvent('toast:notification', {
                        detail: {
                            title: 'Cupom removido',
                            message: 'Desconto removido do carrinho.',
                            type: 'info',
                        },
                    })
                )
            },
        })
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Slide-over Drawer / Modal (W=405px matching cart.svg) */}
            <div
                className="relative z-50 w-full max-w-[405px] h-full bg-[#140D0A] text-[#F5F1EB] flex flex-col shadow-2xl border-l border-[#3F2319] transform transition-transform duration-300 ease-out"
                role="dialog"
                aria-modal="true"
                aria-labelledby="cart-heading"
            >
                {/* Header (Y=0..55 in cart.svg) */}
                <div className="relative px-6 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                        <h2 id="cart-heading" className="text-xl font-bold tracking-tight text-[#F5F1EB]">
                            Carrinho
                        </h2>
                        {totalItemsCount > 0 && (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#241612] text-[#D28A4C] border border-[#3F2319]">
                                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'itens'}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        aria-label="Fechar carrinho"
                        className="p-1.5 rounded-full text-[#CFB28C] hover:text-[#F5F1EB] hover:bg-[#241612] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Gold separator line matching cart.svg (y=55.85, stroke="#D28A4C") */}
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#D28A4C]/60" />
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scrollbar-thin">
                    {isLoading ? (
                        <div className="space-y-4 py-4">
                            <Skeleton className="h-24 w-full bg-[#241612] rounded-xl" />
                            <Skeleton className="h-24 w-full bg-[#241612] rounded-xl" />
                            <Skeleton className="h-28 w-full bg-[#241612] rounded-xl" />
                        </div>
                    ) : !hasItems ? (
                        <div className="py-16 text-center space-y-4">
                            <div className="w-16 h-16 bg-[#241612] border border-[#3F2319] text-[#D28A4C] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                                <ShoppingBag className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-[#F5F1EB] mb-1">Seu carrinho está vazio</h3>
                                <p className="text-xs text-[#CFB28C] max-w-xs mx-auto">
                                    Explore o catálogo e adicione NFTs extraordinários à sua coleção.
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-lg bg-[#241612] hover:bg-[#2d1b16] text-[#D28A4C] border border-[#3F2319] hover:border-[#D28A4C] font-semibold text-xs transition"
                            >
                                Explorar Coleções
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Items List (matching cards in cart.svg: bg=#241612, border=#3F2319) */}
                            <div className="space-y-3">
                                {items.map((item) => {
                                    const liveAvailable = item.nft.editionsAvailable
                                    const hasInventoryConflict = item.quantity > liveAvailable

                                    return (
                                        <div
                                            key={item.nftId}
                                            className="p-3 rounded-xl bg-[#241612] border border-[#3F2319] flex items-center gap-3.5 hover:border-[#55321F] transition"
                                        >
                                            {/* Thumbnail preview (~70x70 rounded in cart.svg) */}
                                            <div className="relative w-[70px] h-[70px] rounded-lg overflow-hidden shrink-0 border border-[#3F2319]/80 bg-black/40">
                                                <img
                                                    src={item.nft.imageUrl}
                                                    alt={item.nft.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-[#F5F1EB] truncate">
                                                    {item.nft.title}
                                                </h4>
                                                {item.nft.creator && (
                                                    <span className="text-[11px] text-[#CFB28C] truncate block">
                                                        por {item.nft.creator.name}
                                                    </span>
                                                )}

                                                <div className="mt-1 flex items-baseline gap-1.5">
                                                    <span className="text-xs font-semibold text-[#E89B55]">
                                                        {formatEth(item.unitPriceEth)} ETH
                                                    </span>
                                                    {item.quantity > 1 && (
                                                        <span className="text-[10px] text-[#B39463]">
                                                            (Total: {formatEth((parseFloat(item.unitPriceEth) * item.quantity).toString())} ETH)
                                                        </span>
                                                    )}
                                                </div>

                                                {hasInventoryConflict && (
                                                    <div className="flex items-center gap-1 text-[11px] text-amber-400 mt-1">
                                                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                                        <span>Apenas {liveAvailable} disponíveis</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Quantity Stepper & Remove */}
                                            <div className="flex flex-col items-end justify-between self-stretch gap-1 shrink-0">
                                                <button
                                                    onClick={() => removeItem.mutate(item.nftId)}
                                                    aria-label={`Remover ${item.nft.title} do carrinho`}
                                                    className="p-1 text-[#CFB28C] hover:text-red-400 transition"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>

                                                <div className="flex items-center gap-1.5 bg-[#140D0A] border border-[#3F2319] rounded-md px-1.5 py-0.5">
                                                    <button
                                                        onClick={() =>
                                                            updateItem.mutate({ nftId: item.nftId, quantity: item.quantity - 1 })
                                                        }
                                                        aria-label="Diminuir quantidade"
                                                        className="p-0.5 text-[#CFB28C] hover:text-[#F5F1EB] transition"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="text-xs font-mono font-bold text-[#F5F1EB] min-w-[14px] text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        disabled={item.quantity >= liveAvailable}
                                                        onClick={() =>
                                                            updateItem.mutate({ nftId: item.nftId, quantity: item.quantity + 1 })
                                                        }
                                                        aria-label="Aumentar quantidade"
                                                        className="p-0.5 text-[#CFB28C] hover:text-[#F5F1EB] disabled:opacity-30 transition"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Coupon Code Section */}
                            <div className="pt-2">
                                {cart?.couponCode ? (
                                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#38220F] border border-[#55321F] text-xs">
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-[#D28A4C]" />
                                            <span className="font-semibold text-[#E89B55]">
                                                Cupom &quot;{cart.couponCode}&quot; aplicado
                                            </span>
                                        </div>
                                        <button
                                            onClick={handleRemoveCoupon}
                                            aria-label="Remover cupom"
                                            className="p-1 text-[#CFB28C] hover:text-[#F5F1EB] transition"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                placeholder="Código promocional (ex: SAVE10)"
                                                value={couponInput}
                                                onChange={(e) => setCouponInput(e.target.value)}
                                                className="w-full px-3 py-2 text-xs rounded-lg bg-[#241612] border border-[#3F2319] focus:border-[#D28A4C] focus:outline-none text-[#F5F1EB] placeholder-[#CFB28C]/60"
                                            />
                                            {couponError && (
                                                <p className="text-[11px] text-red-400 mt-1 absolute left-0 -bottom-4">
                                                    {couponError}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={applyCoupon.isPending || !couponInput.trim()}
                                            className="px-4 py-2 rounded-lg bg-[#241612] hover:bg-[#2d1b16] text-[#D28A4C] border border-[#3F2319] hover:border-[#D28A4C] text-xs font-semibold disabled:opacity-40 transition shrink-0"
                                        >
                                            {applyCoupon.isPending ? 'Aplicando...' : 'Aplicar'}
                                        </button>
                                    </form>
                                )}
                            </div>

                            {/* Order Summary Breakdown */}
                            <div className="p-3.5 rounded-xl bg-[#241612] border border-[#3F2319] space-y-2 text-xs">
                                <div className="flex justify-between text-[#CFB28C]">
                                    <span>Subtotal:</span>
                                    <span className="font-mono text-[#F5F1EB]">{formatEth(cart?.subtotalEth || '0')} ETH</span>
                                </div>

                                {parseFloat(cart?.discountEth || '0') > 0 && (
                                    <div className="flex justify-between text-[#E89B55]">
                                        <span>Desconto ({cart?.couponCode}):</span>
                                        <span className="font-mono">-{formatEth(cart?.discountEth || '0')} ETH</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-[#CFB28C]">
                                    <span>Taxa de rede estimada:</span>
                                    <span className="font-mono text-[#F5F1EB]">{formatEth(cart?.networkFeeEth || '0')} ETH</span>
                                </div>
                            </div>

                            {/* Gold divider line matching cart.svg (y=465.85, stroke="#D28A4C") */}
                            <div className="h-[1px] bg-[#D28A4C]/60 my-2" />

                            {/* Total Section (cart.svg y=480..525: Total and #E89B55 value) */}
                            <div className="flex items-baseline justify-between px-1">
                                <span className="text-base font-bold text-[#F5F1EB] tracking-wide">Total</span>
                                <span className="text-2xl font-bold font-mono text-[#E89B55]">
                                    {formatEth(cart?.totalEth || '0')} ETH
                                </span>
                            </div>

                            {/* Payment Options (matching cart.svg: 3 options with radio circles and badges) */}
                            <div className="space-y-2 pt-1">
                                <p className="text-xs font-semibold text-[#CFB28C] uppercase tracking-wider">
                                    Método de Pagamento
                                </p>

                                {/* Option 1: Multi-wallet badge (METAMASK - WALLETCONNECT - COINBASE) */}
                                <div
                                    onClick={() => setSelectedPayment('crypto')}
                                    className={`p-3 rounded-[3px] border cursor-pointer transition flex items-center justify-between ${selectedPayment === 'crypto'
                                        ? 'border-[#D28A4C] bg-[#241612]'
                                        : 'border-[#3F2319] bg-[#140D0A] hover:border-[#55321F]'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-[16px] h-[16px] rounded-full border flex items-center justify-center ${selectedPayment === 'crypto'
                                                ? 'border-[#D28A4C]'
                                                : 'border-[#D28A4C]/60'
                                                }`}
                                        >
                                            {selectedPayment === 'crypto' && (
                                                <div className="w-[10px] h-[10px] rounded-full bg-[#D28A4C]" />
                                            )}
                                        </div>

                                        <div className="px-2.5 py-1 rounded-[5.5px] bg-[#38220F] border border-[#55321F]">
                                            <span className="text-[10px] font-bold tracking-wider text-[#E89B55]">
                                                METAMASK - WALLETCONNECT - COINBASE
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Option 2: Metamask */}
                                <div
                                    onClick={() => setSelectedPayment('metamask')}
                                    className={`p-3 rounded-[3px] border cursor-pointer transition flex items-center justify-between ${selectedPayment === 'metamask'
                                        ? 'border-[#D28A4C] bg-[#241612]'
                                        : 'border-[#3F2319] bg-[#140D0A] hover:border-[#55321F]'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-[16px] h-[16px] rounded-full border flex items-center justify-center ${selectedPayment === 'metamask'
                                                ? 'border-[#D28A4C]'
                                                : 'border-[#D28A4C]/60'
                                                }`}
                                        >
                                            {selectedPayment === 'metamask' && (
                                                <div className="w-[10px] h-[10px] rounded-full bg-[#D28A4C]" />
                                            )}
                                        </div>

                                        <span className="text-sm font-semibold text-[#F5F1EB]">
                                            Metamask
                                        </span>
                                    </div>
                                </div>

                                {/* Option 3: Coinbase Wallet (Selected in cart.svg) */}
                                <div
                                    onClick={() => setSelectedPayment('coinbase')}
                                    className={`p-3 rounded-[3px] border cursor-pointer transition flex items-center justify-between ${selectedPayment === 'coinbase'
                                        ? 'border-[#D28A4C] bg-[#241612]'
                                        : 'border-[#3F2319] bg-[#140D0A] hover:border-[#55321F]'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-[16px] h-[16px] rounded-full border flex items-center justify-center ${selectedPayment === 'coinbase'
                                                ? 'border-[#D28A4C]'
                                                : 'border-[#D28A4C]/60'
                                                }`}
                                        >
                                            {selectedPayment === 'coinbase' && (
                                                <div className="w-[10px] h-[10px] rounded-full bg-[#D28A4C]" />
                                            )}
                                        </div>

                                        <span className="text-sm font-semibold text-[#F5F1EB]">
                                            Coinbase Wallet
                                        </span>
                                    </div>

                                    {selectedPayment === 'coinbase' && (
                                        <span className="text-[11px] text-[#D28A4C] flex items-center gap-1 font-medium">
                                            <Check className="w-3.5 h-3.5" /> Conectado
                                        </span>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer CTA Button matching cart.svg: y=733, w=405, h=45, rx=8, fill=#D28A4C, text="Finalizar Compra" in #140D0A */}
                {hasItems && (
                    <div className="p-4 bg-[#140D0A] border-t border-[#3F2319] shrink-0">
                        <button
                            type="button"
                            onClick={() => {
                                onClose()
                                onProceedCheckout()
                            }}
                            className="w-full h-[45px] rounded-[8px] bg-[#D28A4C] hover:bg-[#e0985a] active:bg-[#c27c3e] text-[#140D0A] font-bold text-sm tracking-wide shadow-lg shadow-[#D28A4C]/20 transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                            Finalizar Compra
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

