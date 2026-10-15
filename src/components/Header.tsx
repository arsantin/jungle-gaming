import React, { useState } from 'react'
import { ShoppingBag, Search, User, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '@/context/useAuth'
import { useCart } from '@/hooks/useQueries'

export interface HeaderProps {
    onOpenCart?: () => void
    currentPath?: string
    onNavigate?: (path: string) => void
    onOpenSearch?: () => void
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart, currentPath = '/', onNavigate, onOpenSearch }) => {
    const { user, logout } = useAuth()
    const { data: cart } = useCart()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Default to badge 3 from home.svg or actual cart items
    const cartCount = cart?.items?.length ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 3

    const handleNav = (path: string) => {
        setMobileMenuOpen(false)
        if (onNavigate) {
            onNavigate(path)
        } else {
            window.location.hash = path
        }
    }

    return (
        <header className="sticky top-0 z-40 w-full border-b border-[#D28A4C]/30 bg-[#140D0A]/95 backdrop-blur-md">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-16 h-20 flex items-center justify-between relative">
                {/* Brand Logo KURIO */}
                <div className="flex items-center">
                    <button
                        onClick={() => handleNav('/')}
                        className="flex items-center gap-2 text-left focus:outline-none rounded-lg transition group"
                    >
                        <span className="font-extrabold text-2xl tracking-[0.2em] text-[#F5F1EB] uppercase hover:text-[#E89B55] transition">
                            KURIO
                        </span>
                    </button>
                </div>

                {/* Nav Items centered */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium absolute left-1/2 -translate-x-1/2">
                    {/* 1. Início */}
                    <button
                        onClick={() => handleNav('/')}
                        className={`relative py-6 transition hover:text-[#E89B55] ${currentPath === '/' || currentPath === '' ? 'text-[#E89B55] font-semibold' : 'text-[#F5F1EB]'
                            }`}
                    >
                        Início
                        {(currentPath === '/' || currentPath === '') && (
                            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#D28A4C] rounded-full" />
                        )}
                    </button>

                    {/* 2. Mercado */}
                    <button
                        onClick={() => handleNav('/mercado')}
                        className={`relative py-6 transition hover:text-[#E89B55] ${currentPath === '/mercado' ? 'text-[#E89B55] font-semibold' : 'text-[#F5F1EB]'
                            }`}
                    >
                        Mercado
                        {currentPath === '/mercado' && (
                            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#D28A4C] rounded-full" />
                        )}
                    </button>

                    {/* 3. Criadores */}
                    <button
                        onClick={() => handleNav('/criadores')}
                        className={`relative py-6 transition hover:text-[#E89B55] ${currentPath === '/criadores' ? 'text-[#E89B55] font-semibold' : 'text-[#F5F1EB]'
                            }`}
                    >
                        Criadores
                        {currentPath === '/criadores' && (
                            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#D28A4C] rounded-full" />
                        )}
                    </button>

                    {/* 4. Aprenda */}
                    <button
                        onClick={() => handleNav('/aprenda')}
                        className={`relative py-6 transition hover:text-[#E89B55] ${currentPath === '/aprenda' ? 'text-[#E89B55] font-semibold' : 'text-[#F5F1EB]'
                            }`}
                    >
                        Aprenda
                        {currentPath === '/aprenda' && (
                            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#D28A4C] rounded-full" />
                        )}
                    </button>
                </nav>

                {/* Right side actions */}
                <div className="flex items-center gap-5">
                    {/* Search Icon */}
                    <button
                        onClick={onOpenSearch}
                        aria-label="Search"
                        className="p-2 text-[#F5F1EB] hover:text-[#E89B55] transition"
                    >
                        <Search className="w-5 h-5" />
                    </button>

                    {/* Cart Trigger with badge circle fill=#D28A4C, number 3 */}
                    <button
                        onClick={onOpenCart}
                        aria-label={`Cart with ${cartCount} items`}
                        className="relative p-2 text-[#F5F1EB] hover:text-[#E89B55] transition"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        <span className="absolute top-0 right-0 bg-[#D28A4C] text-[#140D0A] text-[11px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center border border-[#140D0A]">
                            {cartCount}
                        </span>
                    </button>

                    {/* User profile / Conectar Carteira button (Rect x=1220 w=100 h=35 rx=6 fill=#D28A4C) */}
                    {user ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleNav('/profile')}
                                aria-label="User Profile"
                                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#241612] border border-[#3F2319] hover:border-[#D28A4C] transition"
                            >
                                <img
                                    src={user.avatarUrl}
                                    alt={user.name}
                                    className="w-6 h-6 rounded-md object-cover"
                                />
                                <span className="text-xs font-medium text-[#F5F1EB] hidden sm:inline max-w-[90px] truncate">
                                    {user.name}
                                </span>
                            </button>
                            <button
                                onClick={() => logout()}
                                aria-label="Log out"
                                title="Log out"
                                className="p-2 rounded-md border border-[#3F2319] bg-[#241612] hover:bg-red-500/10 text-[#CFB28C] hover:text-red-400 transition"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleNav('/login')}
                                className="h-[35px] px-4 rounded-[6px] bg-[#D28A4C] hover:bg-[#E89B55] text-[#140D0A] text-xs font-bold transition flex items-center justify-center whitespace-nowrap shadow-sm"
                            >
                                Conectar Carteira
                            </button>
                        </div>
                    )}

                    {/* Mobile menu toggle */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle navigation menu"
                        className="md:hidden p-2 rounded-lg border border-[#3F2319] bg-[#241612] text-[#F5F1EB]"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-[#3F2319] bg-[#140D0A] px-6 py-4 space-y-3">
                    <button
                        onClick={() => handleNav('/')}
                        className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-[#F5F1EB] hover:bg-[#241612]"
                    >
                        Início
                    </button>
                    <button
                        onClick={() => handleNav('/mercado')}
                        className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-[#F5F1EB] hover:bg-[#241612]"
                    >
                        Mercado
                    </button>
                    <button
                        onClick={() => handleNav('/criadores')}
                        className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-[#F5F1EB] hover:bg-[#241612]"
                    >
                        Criadores
                    </button>
                    <button
                        onClick={() => handleNav('/aprenda')}
                        className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-[#F5F1EB] hover:bg-[#241612]"
                    >
                        Aprenda
                    </button>

                    {user ? (
                        <div className="border-t border-[#3F2319] pt-3 space-y-2">
                            <button
                                onClick={() => handleNav('/profile')}
                                className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium text-[#CFB28C] hover:bg-[#241612]"
                            >
                                <User className="w-4 h-4 text-[#D28A4C]" />
                                Perfil
                            </button>
                            <button
                                onClick={() => {
                                    logout()
                                    setMobileMenuOpen(false)
                                }}
                                className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10"
                            >
                                Sair
                            </button>
                        </div>
                    ) : (
                        <div className="pt-2 flex flex-col gap-2 border-t border-[#3F2319]">
                            <button
                                onClick={() => handleNav('/login')}
                                className="w-full py-2.5 rounded-[6px] bg-[#D28A4C] text-[#140D0A] font-bold text-xs"
                            >
                                Conectar Carteira
                            </button>
                        </div>
                    )}
                </div>
            )}
        </header>
    )
}
