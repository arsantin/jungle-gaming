import React from 'react'
import {
    CheckCircle2,
    AlertCircle,
    Clock,
    ExternalLink,
    Copy,
    ArrowRight,
    ShieldCheck,
    ShoppingBag,
} from 'lucide-react'
import type { Order } from '@/types'
import { formatEth } from '@/lib/utils'
import { useOrder } from '@/hooks/useQueries'

export interface OrderConfirmationViewProps {
    initialOrder: Order
    onReturnHome: () => void
}

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({
    initialOrder,
    onReturnHome,
}) => {
    // Real-time synchronization of order state via TanStack Query and socket
    const { data: order = initialOrder } = useOrder(initialOrder.id)

    const copyTxHash = () => {
        navigator.clipboard?.writeText(order.transactionHash)
        window.dispatchEvent(
            new CustomEvent('toast:notification', {
                detail: {
                    title: 'Hash Copiado',
                    message: 'Hash da transação copiado para a área de transferência.',
                    type: 'info',
                },
            })
        )
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-12 animate-in fade-in duration-300">
            <div className="bg-[#241612] border border-[#3F2319] rounded-[24px] p-6 sm:p-10 shadow-2xl space-y-8">
                {/* Status Header */}
                <div className="text-center space-y-3">
                    {order.status === 'confirmed' ? (
                        <div className="w-16 h-16 bg-emerald-500/15 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                            <CheckCircle2 className="w-9 h-9" />
                        </div>
                    ) : order.status === 'rejected' ? (
                        <div className="w-16 h-16 bg-red-500/15 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
                            <AlertCircle className="w-9 h-9" />
                        </div>
                    ) : (
                        <div className="w-16 h-16 bg-[#D28A4C]/20 text-[#E89B55] rounded-full flex items-center justify-center mx-auto border border-[#D28A4C]/30 animate-pulse">
                            <Clock className="w-9 h-9" />
                        </div>
                    )}

                    <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#E89B55]">
                        Transaction Settled • Confirmação
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F1EB] tracking-tight">
                        {order.status === 'confirmed'
                            ? 'Compra Confirmada com Sucesso!'
                            : order.status === 'rejected'
                                ? 'Transação Recusada'
                                : 'Transação Aguardando Confirmação'}
                    </h1>

                    <p className="text-xs sm:text-sm text-[#CFB28C] max-w-md mx-auto leading-relaxed">
                        {order.status === 'confirmed'
                            ? 'Sua compra de NFT foi liquidada e registrada com sucesso na rede blockchain simulada.'
                            : order.status === 'rejected'
                                ? `Falha na transação: ${order.rejectionReason || 'Recusa de rede ou saldo insuficiente.'}`
                                : 'Transmitindo telemetria para os nós descentralizados. Atualizações em tempo real.'}
                    </p>
                </div>

                {/* Transaction Metadata Snapshot */}
                <div className="p-5 rounded-[16px] bg-[#140D0A] border border-[#3F2319] space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-[#3F2319]">
                        <span className="text-[#CFB28C]">ID de Referência do Pedido:</span>
                        <span className="font-mono font-bold text-[#F5F1EB] text-sm">{order.id}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-[#3F2319]">
                        <span className="text-[#CFB28C]">Hash da Transação (Tx):</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-[#E89B55] truncate max-w-[200px] sm:max-w-[280px]">
                                {order.transactionHash}
                            </span>
                            <button
                                onClick={copyTxHash}
                                aria-label="Copiar hash da transação"
                                className="text-[#CFB28C] hover:text-[#F5F1EB] transition-colors cursor-pointer"
                            >
                                <Copy className="w-3.5 h-3.5" />
                            </button>
                            <a
                                href={`https://etherscan.io/tx/${order.transactionHash}`}
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Visualizar no explorador de blocos"
                                className="text-[#CFB28C] hover:text-[#E89B55] transition-colors cursor-pointer"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-[#3F2319]">
                        <span className="text-[#CFB28C]">Carteira de Destino:</span>
                        <span className="font-mono text-[#F5F1EB]">
                            {order.collector.walletAddress} ({order.collector.chain.toUpperCase()})
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-[#CFB28C]">Data & Horário:</span>
                        <span className="text-[#F5F1EB]">
                            {new Date(order.createdAt).toLocaleString('pt-BR', {
                                dateStyle: 'medium',
                                timeStyle: 'medium',
                            })}
                        </span>
                    </div>
                </div>

                {/* Item Snapshots (frozen at purchase time) */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#CFB28C] mb-3 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-[#E89B55]" />
                        Ativos Adquiridos ({order.items.length})
                    </h3>
                    <div className="space-y-3">
                        {order.items.map((item) => (
                            <div
                                key={item.nftId}
                                className="p-3.5 rounded-[12px] bg-[#140D0A] border border-[#3F2319] flex items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.title}
                                        className="w-12 h-12 rounded-[8px] object-cover shrink-0 border border-[#3F2319]"
                                    />
                                    <div className="truncate">
                                        <h4 className="font-bold text-sm text-[#F5F1EB] truncate">{item.title}</h4>
                                        <span className="text-[11px] font-mono text-[#CFB28C]">
                                            Token {item.tokenId} • Qtd: {item.quantity}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="font-mono font-bold text-sm text-[#E89B55]">
                                        {formatEth(parseFloat(item.unitPriceEth) * item.quantity)} ETH
                                    </span>
                                    <span className="text-[10px] text-[#CFB28C] block">
                                        @{formatEth(item.unitPriceEth)} ETH
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Financial Breakdown */}
                <div className="p-5 rounded-[16px] bg-[#140D0A] border border-[#3F2319] space-y-2.5 text-xs">
                    <div className="flex justify-between text-[#CFB28C]">
                        <span>Subtotal:</span>
                        <span className="font-mono text-[#F5F1EB]">{formatEth(order.subtotalEth)} ETH</span>
                    </div>
                    {parseFloat(order.discountEth) > 0 && (
                        <div className="flex justify-between text-emerald-400">
                            <span>Desconto de Cupom ({order.couponCode}):</span>
                            <span className="font-mono">-{formatEth(order.discountEth)} ETH</span>
                        </div>
                    )}
                    <div className="flex justify-between text-[#CFB28C]">
                        <span>Taxa de Rede (Gas):</span>
                        <span className="font-mono text-[#F5F1EB]">{formatEth(order.networkFeeEth)} ETH</span>
                    </div>
                    <div className="pt-3 border-t border-[#3F2319] flex justify-between items-center text-sm font-bold text-[#F5F1EB]">
                        <span className="uppercase tracking-wider text-xs">Total Pago:</span>
                        <span className="font-mono text-[#E89B55] text-lg font-extrabold">
                            {formatEth(order.totalEth)} ETH
                        </span>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-[#CFB28C]">
                        <ShieldCheck className="w-4 h-4 text-[#E89B55]" />
                        <span>Comprovante criptográfico imutável</span>
                    </div>

                    <button
                        type="button"
                        onClick={onReturnHome}
                        className="w-full sm:w-auto px-6 py-3 rounded-[10px] bg-[#D28A4C] hover:bg-[#E89B55] text-[#140D0A] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#D28A4C]/20 transition-all cursor-pointer active:scale-[0.99]"
                    >
                        <span>Continuar Comprando</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
