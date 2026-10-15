import React from 'react'
import {
    Copy,
    ExternalLink,
    AlertCircle,
    Clock,
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

    const formatDate = (isoString: string) => {
        try {
            const d = new Date(isoString)
            const day = String(d.getDate()).padStart(2, '0')
            const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
            const month = months[d.getMonth()] || 'MÊS'
            const year = d.getFullYear()
            return `${day}.${month}.${year}`
        } catch {
            return 'RECENTE'
        }
    }

    const formatWallet = (wallet: string) => {
        if (!wallet) return 'CARTEIRA'
        if (wallet.length <= 12) return wallet
        return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
    }

    return (
        <div className="w-full flex justify-center px-4 py-8 sm:py-12 animate-in fade-in duration-300">
            {/* Voucher Container matching order.svg: 578px width, #241612 background, 10px bottom gold bar */}
            <div className="w-full max-w-[578px] bg-[#241612] text-[#F5F1EB] rounded-2xl overflow-hidden shadow-2xl border border-[#D28A4C]/30 relative flex flex-col">
                {/* Close Button matching SVG */}
                <button
                    type="button"
                    onClick={onReturnHome}
                    aria-label="Fechar"
                    className="absolute top-5 right-5 text-[#D28A4C] hover:text-[#E89B55] transition-colors p-1 z-10 cursor-pointer"
                >
                    <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M0.17 0.7897C0.397 0.5712 0.764 0.5712 0.991 0.7897L6 5.6163L11.009 0.7897C11.236 0.5712 11.603 0.5712 11.83 0.7897C12.057 1.0082 12.057 1.3625 11.83 1.581L6.821 6.4075L11.83 11.2341C12.057 11.4526 12.057 11.8069 11.83 12.0254C11.603 12.2439 11.236 12.2439 11.009 12.0254L6 7.1988L0.991 12.0254C0.764 12.2439 0.397 12.2439 0.17 12.0254C-0.057 11.8069 -0.057 11.4526 0.17 11.2341L5.179 6.4075L0.17 1.581C-0.057 1.3625 -0.057 1.0082 0.17 0.7897Z"
                            fill="currentColor"
                        />
                    </svg>
                </button>

                {/* Top Section */}
                <div className="pt-8 pb-5 px-6 sm:px-11 flex flex-col items-center text-center">
                    {/* Laurel / Medal Icon matching order.svg */}
                    <div className="mb-4">
                        <svg width="48" height="48" viewBox="0 0 46 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M22.9999 0.8125C20.3093 0.8125 17.6793 1.60965 15.4418 3.1026C13.2043 4.59556 11.4604 6.71714 10.4308 9.19992C9.40118 11.6827 9.13204 14.4144 9.65757 17.0503C10.1831 19.6861 11.4795 22.1065 13.3821 24.009C15.2846 25.9115 17.705 27.2079 20.3408 27.7335C22.9767 28.259 25.7084 27.9899 28.1912 26.9602C30.674 25.9306 32.7955 24.1868 34.2885 21.9493C35.7814 19.7118 36.5786 17.0818 36.5786 14.3912C36.5746 10.7904 35.1415 7.33827 32.5954 4.79216C30.0493 2.24606 26.5972 0.813017 22.9999 0.8125ZM22.9999 24.8778C20.9274 24.8778 18.9016 24.2638 17.1783 23.1139C15.4549 21.9641 14.1118 20.3299 13.3187 18.4177C12.5256 16.5054 12.3183 14.3995 12.723 12.3692C13.1278 10.339 14.1263 8.47485 15.5916 7.00958C17.0568 5.54432 18.921 4.54583 20.9513 4.14107C22.9815 3.7363 25.0874 3.9436 27.0019 4.73673C28.9163 5.52986 30.5483 6.87295 31.6982 8.59632C32.8481 10.3197 33.4621 12.3455 33.4621 14.4179C33.4589 17.1915 32.3551 19.8509 30.3938 21.8121C28.4326 23.7734 25.7733 24.8772 22.9999 24.8778ZM43.9142 4.41738C44.7735 4.41738 45.4704 3.72051 45.4704 2.86119C45.4704 2.00187 44.7735 1.305 43.9142 1.305C42.2039 1.305 38.6479 2.01695 36.1774 4.88812C36.7571 5.34332 37.3095 5.83352 37.8285 6.35246C38.8672 5.06078 40.8514 4.41738 43.9142 4.41738ZM2.08344 4.41738C5.14625 4.41738 7.13043 5.06078 8.16914 6.35246C8.68812 5.83352 9.24055 5.34332 9.82023 4.88812C7.34973 2.01695 3.79371 1.305 2.08344 1.305C1.22412 1.305 0.527246 2.00187 0.527246 2.86119C0.527246 3.72051 1.22412 4.41738 2.08344 4.41738ZM45.4704 11.2721C45.4704 10.4128 44.7735 9.7159 43.9142 9.7159C41.3191 9.7159 39.4049 10.4824 38.2996 11.9764C38.4824 12.7662 38.58 13.5755 38.5878 14.3912C39.4749 14.15 41.2568 13.9983 43.9142 13.9983C44.7735 13.9983 45.4704 13.3014 45.4704 12.4421V11.2721ZM0.527246 11.2721V12.4421C0.527246 13.3014 1.22412 13.9983 2.08344 13.9983C4.74082 13.9983 6.52273 14.15 7.40984 14.3912C7.41766 13.5755 7.51531 12.7662 7.69812 11.9764C6.59281 10.4824 4.67859 9.7159 2.08344 9.7159C1.22412 9.7159 0.527246 10.4128 0.527246 11.2721ZM37.9336 17.6593C37.3829 19.3478 36.4674 20.8931 35.2677 22.1585C36.9602 22.8433 39.7342 23.3374 43.9142 23.3374C44.7735 23.3374 45.4704 22.6405 45.4704 21.7812C45.4704 20.9219 44.7735 20.225 43.9142 20.225C40.6771 20.225 38.8952 19.6764 37.9336 17.6593ZM8.06398 17.6593C7.10242 19.6764 5.32047 20.225 2.08344 20.225C1.22412 20.225 0.527246 20.9219 0.527246 21.7812C0.527246 22.6405 1.22412 23.3374 2.08344 23.3374C6.26344 23.3374 9.03742 22.8433 10.7299 22.1585C9.53026 20.8931 8.61474 19.3478 8.06398 17.6593ZM33.3959 25.7538C31.9447 27.2244 30.1587 28.3248 28.1887 28.9619C29.4027 30.6038 31.8383 32.6775 36.1268 32.6775C36.9861 32.6775 37.683 31.9806 37.683 31.1213C37.683 30.262 36.9861 29.5651 36.1268 29.5651C33.8818 29.5651 32.4812 28.1645 31.6447 26.6978C32.2519 26.4175 32.8394 26.0999 33.3959 25.7538ZM12.6017 25.7538C13.1582 26.0999 13.7457 26.4175 14.3529 26.6978C13.5164 28.1645 12.1158 29.5651 9.87078 29.5651C9.01146 29.5651 8.31459 30.262 8.31459 31.1213C8.31459 31.9806 9.01146 32.6775 9.87078 32.6775C14.1593 32.6775 16.5949 30.6038 17.8089 28.9619C15.8388 28.3248 14.0529 27.2244 12.6017 25.7538ZM24.5561 32.6775C24.5561 31.8182 23.8592 31.1213 22.9999 31.1213C22.1406 31.1213 21.4437 31.8182 21.4437 32.6775C21.4437 36.1402 19.3466 38.8988 14.5377 38.8988C13.6784 38.8988 12.9815 39.5957 12.9815 40.455C12.9815 41.3143 13.6784 42.0112 14.5377 42.0112C21.4437 42.0112 24.5561 37.3424 24.5561 32.6775ZM22.9999 37.3424C22.9999 42.0112 26.1123 42.0112 33.0183 42.0112C33.8776 42.0112 34.5745 41.3143 34.5745 40.455C34.5745 39.5957 33.8776 38.8988 33.0183 38.8988C28.2094 38.8988 26.1123 36.1402 26.1123 32.6775C26.1123 31.8182 25.4154 31.1213 24.5561 31.1213C23.6968 31.1213 22.9999 31.8182 22.9999 32.6775V37.3424Z"
                                fill="#D28A4C"
                            />
                        </svg>
                    </div>

                    {/* Title */}
                    <h1 className="text-base sm:text-lg font-bold tracking-[0.05em] text-[#CFB28C] uppercase mb-1">
                        {order.status === 'confirmed'
                            ? 'Sua compra foi realizada com sucesso!'
                            : order.status === 'rejected'
                                ? 'Sua transação foi recusada'
                                : 'Sua transação está sendo processada...'}
                    </h1>

                    {order.status === 'rejected' && (
                        <p className="text-xs text-red-400 mt-1 max-w-sm">
                            {order.rejectionReason || 'Recusa na rede de liquidação ou saldo insuficiente.'}
                        </p>
                    )}
                </div>

                {/* Primary Gold Line Divider */}
                <div className="w-full h-[1px] bg-[#D28A4C]" />

                {/* 4-Column Transaction Overview Bar matching order.svg */}
                <div className="grid grid-cols-4 divide-x divide-[#D28A4C] py-3.5 px-2 bg-[#241612]">
                    {/* Col 1: ID DA TRANSAÇÃO */}
                    <div className="flex flex-col items-center justify-center text-center px-1">
                        <span className="text-[9px] sm:text-[10px] font-bold text-[#CFB28C] tracking-wider uppercase mb-1">
                            ID DA TRANSAÇÃO
                        </span>
                        <div className="flex items-center justify-center gap-1">
                            <span className="text-[11px] sm:text-xs font-mono text-[#F5F1EB] font-medium truncate max-w-[70px] sm:max-w-[90px]">
                                {order.transactionHash ? `${order.transactionHash.slice(0, 6)}...` : order.id}
                            </span>
                            <button
                                type="button"
                                onClick={copyTxHash}
                                title="Copiar hash da transação"
                                className="text-[#CFB28C] hover:text-[#F5F1EB] transition-colors cursor-pointer shrink-0"
                            >
                                <Copy className="w-3 h-3" />
                            </button>
                            {order.transactionHash && (
                                <a
                                    href={`https://etherscan.io/tx/${order.transactionHash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Abrir no explorador"
                                    className="text-[#CFB28C] hover:text-[#E89B55] transition-colors cursor-pointer shrink-0"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Col 2: DATA */}
                    <div className="flex flex-col items-center justify-center text-center px-1">
                        <span className="text-[9px] sm:text-[10px] font-bold text-[#CFB28C] tracking-wider uppercase mb-1">
                            DATA
                        </span>
                        <span className="text-[11px] sm:text-xs font-semibold text-[#F5F1EB] uppercase">
                            {formatDate(order.createdAt)}
                        </span>
                    </div>

                    {/* Col 3: TOTAL */}
                    <div className="flex flex-col items-center justify-center text-center px-1">
                        <span className="text-[9px] sm:text-[10px] font-bold text-[#CFB28C] tracking-wider uppercase mb-1">
                            TOTAL
                        </span>
                        <span className="text-[11px] sm:text-xs font-bold text-[#E89B55]">
                            {formatEth(order.totalEth)} ETH
                        </span>
                    </div>

                    {/* Col 4: CARTEIRA */}
                    <div className="flex flex-col items-center justify-center text-center px-1">
                        <span className="text-[9px] sm:text-[10px] font-bold text-[#CFB28C] tracking-wider uppercase mb-1">
                            CARTEIRA
                        </span>
                        <span
                            className="text-[11px] sm:text-xs font-mono text-[#F5F1EB] font-medium truncate max-w-[80px] sm:max-w-[100px]"
                            title={order.collector.walletAddress}
                        >
                            {formatWallet(order.collector.walletAddress)}
                        </span>
                    </div>
                </div>

                {/* Primary Gold Line Divider */}
                <div className="w-full h-[1px] bg-[#D28A4C]" />

                {/* Items Table Section */}
                <div className="px-6 sm:px-11 pt-5 pb-3">
                    {/* Table Header matching order.svg */}
                    <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-[#CFB28C] uppercase pb-2">
                        <span className="flex-1">NFTS</span>
                        <span className="w-20 text-center">EDIÇÃO</span>
                        <span className="w-28 text-right">SUBTOTAL</span>
                    </div>

                    {/* Thin 0.3px table divider matching SVG: stroke="#D28A4C" stroke-width="0.3" */}
                    <div className="w-full h-[1px] bg-[#D28A4C]/30 mb-3" />

                    {/* Items rows */}
                    <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1">
                        {order.items.map((item) => {
                            const itemTotal = parseFloat(item.unitPriceEth) * item.quantity
                            return (
                                <div key={item.nftId} className="flex items-center justify-between gap-3 text-xs">
                                    {/* Left: Image Thumbnail + Title + Creator */}
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <img
                                            src={item.imageUrl}
                                            alt={item.title}
                                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-[8px] object-cover shrink-0 border border-[#D28A4C]/40 bg-[#140D0A]"
                                        />
                                        <div className="min-w-0">
                                            <h4 className="font-semibold text-xs sm:text-sm text-[#F5F1EB] truncate">
                                                {item.title}
                                            </h4>
                                            <p className="text-[10px] sm:text-xs text-[#B39463] font-medium truncate">
                                                Token #{item.tokenId}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Center: Edition / Quantity */}
                                    <div className="w-20 text-center shrink-0">
                                        <span className="text-xs font-semibold text-[#CFB28C]">
                                            (x{item.quantity})
                                        </span>
                                    </div>

                                    {/* Right: Subtotal ETH */}
                                    <div className="w-28 text-right shrink-0">
                                        <span className="text-xs sm:text-sm font-bold text-[#E89B55]">
                                            {formatEth(itemTotal)} ETH
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Thin 0.3px line divider matching SVG */}
                    <div className="w-full h-[1px] bg-[#D28A4C]/30 my-4" />

                    {/* Price Breakdown matching order.svg */}
                    <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-semibold text-[#CFB28C] tracking-wide uppercase">
                                TAXA DE REDE
                            </span>
                            <span className="text-xs font-bold text-[#E89B55]">
                                {formatEth(order.networkFeeEth)} ETH
                            </span>
                        </div>

                        {parseFloat(order.discountEth) > 0 && (
                            <div className="flex justify-between items-center text-emerald-400">
                                <span className="text-[11px] font-semibold tracking-wide uppercase">
                                    CUPOM ({order.couponCode})
                                </span>
                                <span className="text-xs font-bold">
                                    -{formatEth(order.discountEth)} ETH
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-semibold text-[#CFB28C] tracking-wide uppercase">
                                SUBTOTAL
                            </span>
                            <span className="text-xs font-bold text-[#E89B55]">
                                {formatEth(order.subtotalEth)} ETH
                            </span>
                        </div>

                        <div className="flex justify-between items-center pt-1">
                            <span className="text-[11px] font-bold text-[#CFB28C] tracking-wide uppercase">
                                TOTAL
                            </span>
                            <span className="text-sm font-bold text-[#E89B55]">
                                {formatEth(order.totalEth)} ETH
                            </span>
                        </div>
                    </div>

                    {/* Thin 0.3px line divider matching SVG */}
                    <div className="w-full h-[1px] bg-[#D28A4C]/30 mt-4 mb-6" />

                    {/* Transaction Status Note if not yet confirmed */}
                    {order.status === 'pending' && (
                        <div className="mb-4 flex items-center justify-center gap-2 text-xs text-[#E89B55] bg-[#140D0A]/60 py-2 px-3 rounded-lg border border-[#D28A4C]/30">
                            <Clock className="w-3.5 h-3.5 animate-spin" />
                            <span>Confirmando transação no ledger descentralizado...</span>
                        </div>
                    )}
                    {order.status === 'rejected' && (
                        <div className="mb-4 flex items-center justify-center gap-2 text-xs text-red-400 bg-red-950/30 py-2 px-3 rounded-lg border border-red-500/30">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>A transação não pôde ser completada.</span>
                        </div>
                    )}

                    {/* CTA Button matching SVG: 186x48 rounded-[5px] bg-[#D28A4C] text-[#140D0A] */}
                    <div className="flex justify-center pb-6">
                        <button
                            type="button"
                            onClick={onReturnHome}
                            className="w-[186px] h-[48px] rounded-[5px] bg-[#D28A4C] hover:bg-[#E89B55] text-[#140D0A] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center transition-all shadow-md active:scale-[0.98] cursor-pointer"
                        >
                            VER MEUS PEDIDOS
                        </button>
                    </div>
                </div>

                {/* Bottom 10px accent bar matching order.svg: <rect y="811" width="578" height="10" fill="#D28A4C"/> */}
                <div className="w-full h-[10px] bg-[#D28A4C] mt-auto" />
            </div>
        </div>
    )
}

