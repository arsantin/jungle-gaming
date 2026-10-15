import React, { useState } from 'react'
import {
    User as UserIcon,
    Wallet as WalletIcon,
    KeyRound,
    Plus,
    CheckCircle2,
    AlertCircle,
    Save,
} from 'lucide-react'
import { useAuth } from '@/context/useAuth'
import { useWallets, useAddWallet, useUpdateWallet } from '@/hooks/useQueries'
import { api } from '@/lib/api'
import { Modal } from './ui/Modal'

export const ProfileWalletsView: React.FC = () => {
    const { user, refreshUser } = useAuth()
    const { data: wallets = [] } = useWallets()
    const addWalletMutation = useAddWallet()
    const updateWalletMutation = useUpdateWallet()

    // Tabs
    const [activeTab, setActiveTab] = useState<'profile' | 'wallets' | 'security'>('profile')

    // Profile Form state
    const [name, setName] = useState(user?.name || '')
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '')
    const [bio, setBio] = useState(user?.bio || '')
    const [profileSaving, setProfileSaving] = useState(false)
    const [profileSuccess, setProfileSuccess] = useState(false)
    const [profileError, setProfileError] = useState<string | null>(null)

    // Password Form state
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [passwordSaving, setPasswordSaving] = useState(false)
    const [passwordSuccess, setPasswordSuccess] = useState(false)
    const [passwordError, setPasswordError] = useState<string | null>(null)

    // Add Wallet Modal
    const [addWalletOpen, setAddWalletOpen] = useState(false)
    const [newWalletAddress, setNewWalletAddress] = useState('')
    const [newWalletLabel, setNewWalletLabel] = useState('')
    const [newWalletChain, setNewWalletChain] = useState<'ethereum' | 'polygon' | 'arbitrum' | 'optimism'>('ethereum')
    const [newWalletPrimary, setNewWalletPrimary] = useState(false)

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setProfileSaving(true)
        setProfileSuccess(false)
        setProfileError(null)

        try {
            await api.patch('/profile', { name, avatarUrl, bio })
            await refreshUser()
            setProfileSuccess(true)
            window.dispatchEvent(
                new CustomEvent('toast:notification', {
                    detail: {
                        title: 'Profile Updated',
                        message: 'Your collector profile information was saved.',
                        type: 'success',
                    },
                })
            )
        } catch (err: unknown) {
            const responseData = (err as { response?: { data?: { error?: string } } })?.response?.data
            setProfileError(responseData?.error || 'Failed to update profile.')
        } finally {
            setProfileSaving(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setPasswordSaving(true)
        setPasswordSuccess(false)
        setPasswordError(null)

        try {
            await api.post('/profile/change-password', { currentPassword, newPassword })
            setCurrentPassword('')
            setNewPassword('')
            setPasswordSuccess(true)
            window.dispatchEvent(
                new CustomEvent('toast:notification', {
                    detail: {
                        title: 'Password Changed',
                        message: 'Your account password has been updated.',
                        type: 'success',
                    },
                })
            )
        } catch (err: unknown) {
            const responseData = (err as { response?: { data?: { error?: string } } })?.response?.data
            setPasswordError(responseData?.error || 'Failed to change password.')
        } finally {
            setPasswordSaving(false)
        }
    }

    const handleCreateWallet = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newWalletAddress.trim() || !newWalletLabel.trim()) return

        addWalletMutation.mutate(
            {
                address: newWalletAddress.trim(),
                label: newWalletLabel.trim(),
                chain: newWalletChain,
                isPrimary: newWalletPrimary,
                balanceEth: '5.00',
            },
            {
                onSuccess: () => {
                    setAddWalletOpen(false)
                    setNewWalletAddress('')
                    setNewWalletLabel('')
                    setNewWalletPrimary(false)
                    window.dispatchEvent(
                        new CustomEvent('toast:notification', {
                            detail: {
                                title: 'Wallet Added',
                                message: 'New wallet successfully connected to your account.',
                                type: 'success',
                            },
                        })
                    )
                },
            }
        )
    }

    const handleSetPrimary = (walletId: string) => {
        updateWalletMutation.mutate({ id: walletId, updates: { isPrimary: true } })
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-300 space-y-8">
            {/* Header Profile preview */}
            <div className="p-6 sm:p-8 rounded-[24px] bg-[#241612] border border-[#3F2319] shadow-xl flex flex-col sm:flex-row items-center gap-6">
                <img
                    src={user?.avatarUrl}
                    alt={user?.name}
                    className="w-20 h-20 rounded-[16px] object-cover border-2 border-[#D28A4C] shadow-lg shadow-[#D28A4C]/10"
                />
                <div className="text-center sm:text-left space-y-1">
                    <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#E89B55]">
                        Perfil do Colecionador
                    </div>
                    <h1 className="text-2xl font-extrabold text-[#F5F1EB]">{user?.name}</h1>
                    <p className="text-xs text-[#CFB28C] font-mono">{user?.email}</p>
                    <p className="text-xs text-[#E89B55] mt-1 max-w-md">{user?.bio || 'Colecionador & Entusiasta Web3'}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#3F2319] gap-4 sm:gap-6">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-2 pb-3 px-1 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer ${activeTab === 'profile'
                        ? 'border-[#D28A4C] text-[#E89B55]'
                        : 'border-transparent text-[#CFB28C] hover:text-[#F5F1EB]'
                        }`}
                >
                    <UserIcon className="w-4 h-4" />
                    Editar Perfil
                </button>
                <button
                    onClick={() => setActiveTab('wallets')}
                    className={`flex items-center gap-2 pb-3 px-1 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer ${activeTab === 'wallets'
                        ? 'border-[#D28A4C] text-[#E89B55]'
                        : 'border-transparent text-[#CFB28C] hover:text-[#F5F1EB]'
                        }`}
                >
                    <WalletIcon className="w-4 h-4" />
                    Carteiras ({wallets.length})
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`flex items-center gap-2 pb-3 px-1 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer ${activeTab === 'security'
                        ? 'border-[#D28A4C] text-[#E89B55]'
                        : 'border-transparent text-[#CFB28C] hover:text-[#F5F1EB]'
                        }`}
                >
                    <KeyRound className="w-4 h-4" />
                    Segurança
                </button>
            </div>

            {/* Tab 1: Profile */}
            {activeTab === 'profile' && (
                <form
                    onSubmit={handleSaveProfile}
                    className="p-6 sm:p-8 rounded-[20px] bg-[#241612] border border-[#3F2319] shadow-xl space-y-5 max-w-xl"
                >
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#F5F1EB]">
                        Informações do Colecionador
                    </h3>

                    {profileSuccess && (
                        <div className="p-3.5 rounded-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>Perfil atualizado com sucesso.</span>
                        </div>
                    )}

                    {profileError && (
                        <div className="p-3.5 rounded-[10px] bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{profileError}</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-[#CFB28C] mb-1.5">
                            Nome de Exibição
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Seu nome completo"
                            className="w-full bg-[#140D0A] border border-[#3F2319] rounded-[10px] px-3.5 py-2.5 text-xs text-[#F5F1EB] placeholder-[#CFB28C]/40 focus:outline-none focus:border-[#D28A4C] transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#CFB28C] mb-1.5">
                            URL do Avatar
                        </label>
                        <input
                            type="text"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-[#140D0A] border border-[#3F2319] rounded-[10px] px-3.5 py-2.5 text-xs text-[#F5F1EB] placeholder-[#CFB28C]/40 focus:outline-none focus:border-[#D28A4C] transition-colors"
                        />
                        <span className="text-[11px] text-[#CFB28C]/70 block mt-1">
                            URL direta de imagem para seu avatar Web3
                        </span>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#CFB28C]">Biografia & Interesses</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={3}
                            placeholder="Conte mais sobre sua coleção de artes digitais..."
                            className="w-full bg-[#140D0A] border border-[#3F2319] rounded-[10px] px-3.5 py-2.5 text-xs text-[#F5F1EB] placeholder-[#CFB28C]/40 focus:outline-none focus:border-[#D28A4C] transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={profileSaving}
                        className="px-6 py-2.5 rounded-[8px] bg-[#D28A4C] hover:bg-[#E89B55] text-[#140D0A] font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-[#D28A4C]/20 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                    >
                        {profileSaving ? (
                            <span className="inline-block w-3.5 h-3.5 border-2 border-[#140D0A] border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Save className="w-3.5 h-3.5" />
                        )}
                        <span>Salvar Alterações</span>
                    </button>
                </form>
            )}

            {/* Tab 2: Wallets */}
            {activeTab === 'wallets' && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#F5F1EB]">
                                Carteiras Conectadas
                            </h3>
                            <p className="text-xs text-[#CFB28C] mt-0.5">
                                Gerencie seus endereços Web3 primários e secundários para recebimentos e liquidações.
                            </p>
                        </div>
                        <button
                            onClick={() => setAddWalletOpen(true)}
                            className="px-4 py-2 rounded-[8px] bg-[#D28A4C] hover:bg-[#E89B55] text-[#140D0A] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-[#D28A4C]/20 transition-all cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Adicionar Carteira</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {wallets.map((w) => (
                            <div
                                key={w.id}
                                className="p-5 rounded-[18px] bg-[#241612] border border-[#3F2319] space-y-3 flex flex-col justify-between shadow-xl"
                            >
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-xs text-[#F5F1EB]">{w.label}</span>
                                        {w.isPrimary ? (
                                            <span className="bg-[#D28A4C]/20 border border-[#D28A4C]/30 text-[#E89B55] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                Principal
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleSetPrimary(w.id)}
                                                className="text-[11px] text-[#CFB28C] hover:text-[#E89B55] transition cursor-pointer"
                                            >
                                                Definir como principal
                                            </button>
                                        )}
                                    </div>
                                    <span className="font-mono text-xs text-[#CFB28C] block mt-1">{w.address}</span>
                                </div>

                                <div className="pt-3 border-t border-[#3F2319] flex items-center justify-between text-xs">
                                    <span className="text-[#CFB28C]/80 uppercase tracking-wider text-[10px]">{w.chain}</span>
                                    <span className="font-mono font-bold text-[#E89B55]">{w.balanceEth} ETH</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tab 3: Security */}
            {activeTab === 'security' && (
                <form
                    onSubmit={handleChangePassword}
                    className="p-6 sm:p-8 rounded-[20px] bg-[#241612] border border-[#3F2319] shadow-xl space-y-4 max-w-xl"
                >
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#F5F1EB]">
                        Alterar Senha da Conta
                    </h3>

                    {passwordSuccess && (
                        <div className="p-3.5 rounded-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>Senha alterada com sucesso.</span>
                        </div>
                    )}

                    {passwordError && (
                        <div className="p-3.5 rounded-[10px] bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{passwordError}</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-[#CFB28C] mb-1.5">
                            Senha Atual
                        </label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-[#140D0A] border border-[#3F2319] rounded-[10px] px-3.5 py-2.5 text-xs text-[#F5F1EB] placeholder-[#CFB28C]/40 focus:outline-none focus:border-[#D28A4C] transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#CFB28C] mb-1.5">
                            Nova Senha
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-[#140D0A] border border-[#3F2319] rounded-[10px] px-3.5 py-2.5 text-xs text-[#F5F1EB] placeholder-[#CFB28C]/40 focus:outline-none focus:border-[#D28A4C] transition-colors"
                        />
                        <span className="text-[11px] text-[#CFB28C]/70 block mt-1">
                            Recomendado mínimo de 6 caracteres
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={passwordSaving}
                        className="px-6 py-2.5 rounded-[8px] bg-[#D28A4C] hover:bg-[#E89B55] text-[#140D0A] font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-[#D28A4C]/20 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                    >
                        {passwordSaving ? (
                            <span className="inline-block w-3.5 h-3.5 border-2 border-[#140D0A] border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Save className="w-3.5 h-3.5" />
                        )}
                        <span>Atualizar Senha</span>
                    </button>
                </form>
            )}

            {/* Add Wallet Modal */}
            <Modal
                isOpen={addWalletOpen}
                onClose={() => setAddWalletOpen(false)}
                title="Conectar Nova Carteira"
                maxWidth="md"
            >
                <form onSubmit={handleCreateWallet} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-[#CFB28C] mb-1.5">
                            Rótulo da Carteira
                        </label>
                        <input
                            type="text"
                            placeholder="ex: Ledger Cold Vault"
                            value={newWalletLabel}
                            onChange={(e) => setNewWalletLabel(e.target.value)}
                            required
                            className="w-full bg-[#140D0A] border border-[#3F2319] rounded-[10px] px-3.5 py-2.5 text-xs text-[#F5F1EB] placeholder-[#CFB28C]/40 focus:outline-none focus:border-[#D28A4C] transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#CFB28C] mb-1.5">
                            Endereço Público
                        </label>
                        <input
                            type="text"
                            placeholder="0x..."
                            value={newWalletAddress}
                            onChange={(e) => setNewWalletAddress(e.target.value)}
                            required
                            className="w-full bg-[#140D0A] border border-[#3F2319] rounded-[10px] px-3.5 py-2.5 text-xs text-[#F5F1EB] placeholder-[#CFB28C]/40 focus:outline-none focus:border-[#D28A4C] transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#CFB28C] block">Rede</label>
                        <select
                            value={newWalletChain}
                            onChange={(e) =>
                                setNewWalletChain(
                                    e.target.value as 'ethereum' | 'polygon' | 'arbitrum' | 'optimism'
                                )
                            }
                            aria-label="Network Chain"
                            className="w-full bg-[#140D0A] border border-[#3F2319] rounded-[10px] px-3.5 py-2.5 text-xs text-[#F5F1EB] focus:outline-none focus:border-[#D28A4C] transition-colors cursor-pointer"
                        >
                            <option value="ethereum">Ethereum (ERC-721/1155)</option>
                            <option value="polygon">Polygon PoS</option>
                            <option value="arbitrum">Arbitrum</option>
                            <option value="optimism">Optimism</option>
                        </select>
                    </div>

                    <label className="flex items-center gap-2 text-xs text-[#CFB28C] cursor-pointer pt-1">
                        <input
                            type="checkbox"
                            checked={newWalletPrimary}
                            onChange={(e) => setNewWalletPrimary(e.target.checked)}
                            className="accent-[#D28A4C] cursor-pointer"
                        />
                        <span>Definir como carteira principal para compras</span>
                    </label>

                    <div className="pt-4 flex justify-end gap-3 border-t border-[#3F2319]">
                        <button
                            type="button"
                            onClick={() => setAddWalletOpen(false)}
                            className="px-4 py-2 rounded-[8px] border border-[#3F2319] text-[#CFB28C] hover:text-[#F5F1EB] hover:border-[#D28A4C] text-xs font-semibold transition cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={addWalletMutation.isPending}
                            className="px-5 py-2 rounded-[8px] bg-[#D28A4C] hover:bg-[#E89B55] text-[#140D0A] font-extrabold text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                        >
                            {addWalletMutation.isPending ? 'Adicionando...' : 'Adicionar Carteira'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}