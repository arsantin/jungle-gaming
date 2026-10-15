import React, { useState } from 'react'
import {
    ShieldCheck,
    Wallet as WalletIcon,
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    RefreshCw,
    Lock,
} from 'lucide-react'
import { useAuth } from '@/context/useAuth'
import { useCart, useWallets, useCreateQuote, useCreateOrder } from '@/hooks/useQueries'
import { formatEth } from '@/lib/utils'
import type { Order, Wallet } from '@/types'

export interface CheckoutViewProps {
    onSuccess: (order: Order) => void
    onCancel: () => void
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onSuccess, onCancel }) => {
    const { user } = useAuth()
    const { data: cart } = useCart()
    const { data: wallets = [] } = useWallets()
    const createQuote = useCreateQuote()
    const createOrder = useCreateOrder()

    const primaryWallet = wallets.find((w) => w.isPrimary) || wallets[0]
    const [selectedWalletId, setSelectedWalletId] = useState<string>('')
    const [collectorName, setCollectorName] = useState(user?.name || '')
    const [collectorEmail, setCollectorEmail] = useState(user?.email || '')
    const [selectedChain, setSelectedChain] = useState<'ethereum' | 'polygon' | 'arbitrum' | 'optimism'>('ethereum')

    // Wallet connection state simulation
    const [isWalletConnected, setIsWalletConnected] = useState<boolean>(true)
    const [isConnectingWallet, setIsConnectingWallet] = useState<boolean>(false)

    // Re-validation & Idempotency
    const [quoteConfirmed, setQuoteConfirmed] = useState<boolean>(false)
    const [idempotencyKey, setIdempotencyKey] = useState<string>(() => `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`)
    const [checkoutError, setCheckoutError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    const activeWalletId = selectedWalletId || primaryWallet?.id || ''
    const selectedWallet: Wallet | undefined = wallets.find((w) => w.id === activeWalletId)    // Fetch or revalidate live quote
    const handleValidateQuote = () => {
        if (!cart?.items.length) return
        setCheckoutError(null)
        createQuote.mutate(
            {
                items: cart.items.map((i) => ({ nftId: i.nftId, quantity: i.quantity })),
                couponCode: cart.couponCode,
            },
            {
                onSuccess: () => {
                    setQuoteConfirmed(true)
                    window.dispatchEvent(
                        new CustomEvent('toast:notification', {
                            detail: {
                                title: 'Quote Verified',
                                message: 'Live availability and prices re-verified successfully.',
                                type: 'success',
                            },
                        })
                    )
                },
                onError: (err: unknown) => {
                    const responseData = (err as { response?: { data?: { error?: string } } })?.response?.data
                    setCheckoutError(responseData?.error || 'Inventory or pricing conflict detected.')
                    setQuoteConfirmed(false)
                },
            }
        )
    }

    const handleSimulateWalletToggle = () => {
        if (isWalletConnected) {
            setIsWalletConnected(false)
        } else {
            setIsConnectingWallet(true)
            setTimeout(() => {
                setIsConnectingWallet(false)
                setIsWalletConnected(true)
            }, 600)
        }
    }

    const handlePlaceOrder = async () => {
        if (!selectedWallet) {
            setCheckoutError('Please select a valid wallet address.')
            return
        }
        if (!isWalletConnected) {
            setCheckoutError('Wallet is currently disconnected. Please connect before submitting.')
            return
        }
        if (!cart?.items.length) {
            setCheckoutError('Your cart is empty.')
            return
        }

        setIsSubmitting(true)
        setCheckoutError(null)

        try {
            const order = await createOrder.mutateAsync({
                idempotencyKey,
                collector: {
                    name: collectorName,
                    email: collectorEmail,
                    walletAddress: selectedWallet.address,
                    chain: selectedChain,
                },
                items: cart.items.map((i) => ({ nftId: i.nftId, quantity: i.quantity })),
                couponCode: cart.couponCode,
            })

            window.dispatchEvent(
                new CustomEvent('toast:notification', {
                    detail: {
                        title: 'Order Confirmed!',
                        message: `Order #${order.id} was processed successfully.`,
                        type: 'success',
                    },
                })
            )

            onSuccess(order)
        } catch (err: unknown) {
            const responseData = (err as { response?: { data?: { error?: string } } })?.response?.data
            const msg = responseData?.error || 'Payment execution failed or was declined.'
            setCheckoutError(msg)
            // On failure, keep items in cart, but refresh idempotency key for next explicit attempt
            setIdempotencyKey(`idemp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!cart?.items.length) {
        return (
            <div className="max-w-2xl mx-auto py-16 px-4 text-center">
                <div className="bg-[#241612] border border-[#3F2319] rounded-[20px] p-10">
                    <h2 className="text-xl font-bold text-[#F5F1EB] mb-2">Seu carrinho está vazio</h2>
                    <p className="text-xs text-[#CFB28C] mb-6">Não é possível prosseguir para o checkout sem itens selecionados.</p>
                    <button
                        onClick={onCancel}
                        className="px-6 py-2.5 rounded-[8px] bg-[#D28A4C] hover:bg-[#E89B55] text-[#140D0A] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                        Voltar ao Catálogo
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-300">
            {/* Top Back Navigation */}
            <button
                onClick={onCancel}
                className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#CFB28C] hover:text-[#E89B55] transition-colors cursor-pointer"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar às Compras</span>
            </button>

            {/* Title / Header */}
            <div className="mb-8">
                <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#E89B55] mb-1">
                    Checkout & Settlement
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F1EB] tracking-tight">
                    Finalizar Compra
                </h1>
                <p className="text-xs text-[#CFB28C] mt-1">
                    Revise seus dados, carteira de liquidação e confirme os ativos digitais.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Form & Wallet */}
                <div className="lg:col-span-7 space-y-6">
                    {/* 1. Collector Details */}
                    <div className="p-6 rounded-[20px] bg-[#241612] border border-[#3F2319] shadow-xl space-y-4">
                        <h3 className="text-sm font-extrabold text-[#F5F1EB] uppercase tracking-wider flex items-center gap-2">
                            <Lock className="w-4 h-4 text-[#E89B55]" />
                            1. Dados do Colecionador
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-[#CFB28C] mb-1.5">
                                    Nome do Colecionador
                                </label>
                                <input
                                    type="text"
                                    value={collectorName}
                                    onChange={(e) => setCollectorName(e.target.value)}
                                    placeholder="Seu nome"
                                    className="w-full bg-[#140D0A] border border-[#3F2319] rounded-[10px] px-3.5 py-2.5 text-xs text-[#F5F1EB] placeholder-[#CFB28C]/40 focus:outline-none focus:border-[#D28A4C] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#CFB28C] mb-1.5">
                                    E-mail de Contato
                                </label>
                                <input
                                    type="email"
                                    value={collectorEmail}
                                    onChange={(e) => setCollectorEmail(e.target.value)}
                                    placeholder="seu.email@exemplo.com"
                                    className="w-full bg-[#140D0A] border border-[#3F2319] rounded-[10px] px-3.5 py-2.5 text-xs text-[#F5F1EB] placeholder-[#CFB28C]/40 focus:outline-none focus:border-[#D28A4C] transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. Wallet & Network */}
                    <div className="p-6 rounded-[20px] bg-[#241612] border border-[#3F2319] shadow-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-extrabold text-[#F5F1EB] uppercase tracking-wider flex items-center gap-2">
                                <WalletIcon className="w-4 h-4 text-[#E89B55]" />
                                2. Carteira & Rede
                            </h3>

                            <button
                                type="button"
                                onClick={handleSimulateWalletToggle}
                                disabled={isConnectingWallet}
                                className={`text-[11px] px-3 py-1 rounded-full border font-bold tracking-wider uppercase transition cursor-pointer ${isWalletConnected
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
                                    : 'bg-[#D28A4C]/15 text-[#E89B55] border-[#D28A4C]/40 hover:bg-[#D28A4C]/25'
                                    }`}
                            >
                                {isConnectingWallet
                                    ? 'Conectando...'
                                    : isWalletConnected
                                        ? 'Conectada (Desconectar)'
                                        : 'Desconectada (Conectar)'}
                            </button>
                        </div>

                        {wallets.length === 0 ? (
                            <p className="text-xs text-[#CFB28C]">
                                Nenhuma carteira configurada. Adicione uma carteira em seu perfil.
                            </p>
                        ) : (
                            <div className="space-y-2.5">
                                <label className="text-xs font-semibold text-[#CFB28C] block">
                                    Selecione a Carteira Ativa:
                                </label>
                                {wallets.map((w) => {
                                    const isSelected = activeWalletId === w.id
                                    return (
                                        <label
                                            key={w.id}
                                            className={`flex items-center justify-between p-3.5 rounded-[12px] border cursor-pointer transition ${isSelected
                                                ? 'bg-[#140D0A] border-[#D28A4C] shadow-md shadow-[#D28A4C]/10'
                                                : 'bg-[#140D0A]/70 border-[#3F2319] hover:border-[#D28A4C]/60 text-[#CFB28C]'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name="wallet"
                                                    checked={isSelected}
                                                    onChange={() => {
                                                        setSelectedWalletId(w.id)
                                                        setSelectedChain(w.chain)
                                                    }}
                                                    className="accent-[#D28A4C] cursor-pointer"
                                                />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-xs text-[#F5F1EB]">{w.label}</span>
                                                        {w.isPrimary && (
                                                            <span className="text-[10px] bg-[#D28A4C]/20 text-[#E89B55] font-semibold px-2 py-0.5 rounded-full border border-[#D28A4C]/30">
                                                                Principal
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] font-mono text-[#CFB28C] block mt-0.5">{w.address}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-mono text-[#E89B55] font-bold block">
                                                    {w.balanceEth} ETH
                                                </span>
                                                <span className="text-[10px] uppercase text-[#CFB28C]/80 tracking-wider">
                                                    {w.chain}
                                                </span>
                                            </div>
                                        </label>
                                    )
                                })}
                            </div>
                        )}

                        {/* Network Chain selector */}
                        <div className="pt-2">
                            <label className="text-xs font-semibold text-[#CFB28C] block mb-1.5">
                                Rede de Liquidação:
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedChain}
                                    onChange={(e) =>
                                        setSelectedChain(
                                            e.target.value as 'ethereum' | 'polygon' | 'arbitrum' | 'optimism'
                                        )
                                    }
                                    aria-label="Settlement Chain"
                                    className="w-full bg-[#140D0A] border border-[#3F2319] hover:border-[#D28A4C] rounded-[10px] px-3.5 py-2.5 text-xs text-[#F5F1EB] focus:outline-none focus:border-[#D28A4C] transition cursor-pointer"
                                >
                                    <option value="ethereum">Ethereum Mainnet (L1)</option>
                                    <option value="polygon">Polygon PoS</option>
                                    <option value="arbitrum">Arbitrum One</option>
                                    <option value="optimism">Optimism</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Order Summary & Review */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="p-6 rounded-[20px] bg-[#241612] border border-[#3F2319] shadow-xl space-y-5">
                        <h3 className="text-sm font-extrabold text-[#F5F1EB] uppercase tracking-wider pb-2 border-b border-[#3F2319]">
                            Resumo do Pedido
                        </h3>

                        {/* Item list snapshot */}
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                            {cart.items.map((item) => (
                                <div key={item.nftId} className="flex items-center justify-between text-xs py-1.5 border-b border-[#3F2319]/50 last:border-none">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <img
                                            src={item.nft.imageUrl}
                                            alt={item.nft.title}
                                            className="w-10 h-10 rounded-[8px] object-cover shrink-0 border border-[#3F2319]"
                                        />
                                        <div className="truncate">
                                            <p className="font-bold text-[#F5F1EB] truncate">{item.nft.title}</p>
                                            <p className="text-[#CFB28C] text-[10px]">Qtd: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <span className="font-mono font-bold text-[#E89B55] shrink-0 text-xs">
                                        {formatEth(parseFloat(item.unitPriceEth) * item.quantity)} ETH
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Price lines */}
                        <div className="pt-3 border-t border-[#3F2319] space-y-2 text-xs">
                            <div className="flex justify-between text-[#CFB28C]">
                                <span>Subtotal:</span>
                                <span className="font-mono text-[#F5F1EB]">{formatEth(cart.subtotalEth)} ETH</span>
                            </div>
                            {parseFloat(cart.discountEth) > 0 && (
                                <div className="flex justify-between text-emerald-400">
                                    <span>Desconto ({cart.couponCode}):</span>
                                    <span className="font-mono">-{formatEth(cart.discountEth)} ETH</span>
                                </div>
                            )}
                            <div className="flex justify-between text-[#CFB28C]">
                                <span>Taxa de Rede (Gas):</span>
                                <span className="font-mono text-[#F5F1EB]">{formatEth(cart.networkFeeEth)} ETH</span>
                            </div>
                            <div className="pt-3 border-t border-[#3F2319] flex justify-between items-center text-sm font-bold text-[#F5F1EB]">
                                <span className="uppercase tracking-wider text-xs">Total Final:</span>
                                <span className="font-mono text-[#E89B55] text-lg font-extrabold">
                                    {formatEth(cart.totalEth)} ETH
                                </span>
                            </div>
                        </div>

                        {/* Quote revalidation trigger */}
                        <div className="pt-1">
                            <button
                                type="button"
                                onClick={handleValidateQuote}
                                disabled={createQuote.isPending}
                                className="w-full py-2.5 px-3 rounded-[8px] bg-[#140D0A] border border-[#3F2319] hover:border-[#D28A4C] text-[#CFB28C] hover:text-[#F5F1EB] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${createQuote.isPending ? 'animate-spin' : ''}`} />
                                <span>{quoteConfirmed ? 'Cotação Re-verificada ✓' : 'Verificar Disponibilidade & Gas'}</span>
                            </button>
                        </div>

                        {/* Errors */}
                        {checkoutError && (
                            <div className="p-3.5 rounded-[10px] bg-red-950/40 border border-red-500/40 flex items-start gap-2 text-xs text-red-300">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                                <div>
                                    <p className="font-bold uppercase tracking-wider text-[10px]">Aviso de Checkout</p>
                                    <p className="text-[11px] leading-relaxed mt-0.5">{checkoutError}</p>
                                </div>
                            </div>
                        )}

                        {/* Confirm & Pay */}
                        <button
                            type="button"
                            disabled={isSubmitting || !isWalletConnected}
                            onClick={handlePlaceOrder}
                            className="w-full py-3.5 px-4 rounded-[10px] bg-[#D28A4C] hover:bg-[#E89B55] disabled:opacity-50 disabled:cursor-not-allowed text-[#140D0A] font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#D28A4C]/20 transition-all cursor-pointer active:scale-[0.99]"
                        >
                            {isSubmitting ? (
                                <span className="inline-block w-4 h-4 border-2 border-[#140D0A] border-t-transparent rounded-full animate-spin" />
                            ) : null}
                            <span>Confirm & Transact / Pagar {formatEth(cart.totalEth)} ETH</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>

                        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#CFB28C]/70 text-center pt-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#E89B55]" />
                            <span>Transação protegida por chave idempotente</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
