import React from 'react'
import { Search, RotateCcw, ChevronDown } from 'lucide-react'
import { useNFTs } from '@/hooks/useQueries'

export interface FilterState {
    q: string
    category: string
    minPrice: string
    maxPrice: string
    status: 'all' | 'available' | 'sold_out'
    sort: 'recommended' | 'price_asc' | 'price_desc' | 'most_popular' | 'newest'
    page: number
}

export interface CatalogFiltersProps {
    filters: FilterState
    onChange: (updates: Partial<FilterState>) => void
    onReset: () => void
}

// Map between Portuguese display categories and backend fixture categories
const toBackendCategory = (cat: string): string => {
    if (!cat) return ''
    if (cat === 'Arte Digital') return 'Art'
    if (cat === 'Fotografia') return 'Photography'
    if (cat === 'Música') return 'Music'
    if (cat === 'Jogos' || cat === 'Games') return 'Gaming'
    if (cat === 'Colecionáveis') return 'Collectibles'
    if (cat === 'Metaverso') return 'Virtual Worlds'
    if (cat === 'Animação') return 'Animation'
    if (cat === 'Domínios') return 'Domains'
    if (cat === 'Esportes') return 'Sports'
    return cat
}

// Convert backend category or Portuguese category to canonical display label
const toDisplayCategory = (cat: string): string => {
    if (!cat) return ''
    const lower = cat.toLowerCase()
    if (lower === 'art' || lower === 'arte digital') return 'Arte Digital'
    if (lower === 'photography' || lower === 'fotografia') return 'Fotografia'
    if (lower === 'music' || lower === 'música') return 'Música'
    if (lower === 'gaming' || lower === 'games' || lower === 'jogos') return 'Jogos'
    if (lower === 'collectibles' || lower === 'colecionáveis') return 'Colecionáveis'
    if (lower === 'virtual worlds' || lower === 'metaverso') return 'Metaverso'
    if (lower === 'animation' || lower === 'animação') return 'Animação'
    if (lower === 'domains' || lower === 'domínios') return 'Domínios'
    if (lower === 'sports' || lower === 'esportes') return 'Esportes'
    return cat
}

const CATEGORIES_LIST = [
    { name: 'Arte Digital' },
    { name: 'Fotografia' },
    { name: 'Música' },
    { name: 'Jogos' },
    { name: 'Colecionáveis' },
    { name: 'Metaverso' },
    { name: 'Animação' },
    { name: 'Domínios' },
    { name: 'Esportes' },
]

// Top Navigation Tabs matching home.svg (Group 7 at Y=650..669: TODOS OS NFTS, NOVOS LANÇAMENTOS, EM ALTA)
const TOP_TABS = [
    { id: 'all', label: 'TODOS OS NFTS', sort: 'recommended' as const, status: 'all' as const },
    { id: 'newest', label: 'NOVOS LANÇAMENTOS', sort: 'newest' as const, status: 'all' as const },
    { id: 'trending', label: 'EM ALTA', sort: 'most_popular' as const, status: 'available' as const },
]

const SORT_OPTIONS: { id: FilterState['sort']; label: string }[] = [
    { id: 'recommended', label: 'Recomendados' },
    { id: 'newest', label: 'Mais Recentes' },
    { id: 'most_popular', label: 'Mais Populares' },
    { id: 'price_asc', label: 'Preço: Menor para Maior' },
    { id: 'price_desc', label: 'Preço: Maior para Menor' },
]

export const CatalogFilters: React.FC<CatalogFiltersProps> = ({ filters, onChange, onReset }) => {
    // Determine active top tab based on sort & status
    const getActiveTab = () => {
        if (filters.sort === 'newest') return 'newest'
        if (filters.sort === 'most_popular') return 'trending'
        return 'all'
    }

    const activeTab = getActiveTab()

    return (
        <div className="w-full space-y-4 mb-8">
            {/* Top Navigation Tabs & Sort Dropdown matching home.svg (Y=650..669, line underline stroke=#D28A4C) */}
            <div className="flex items-center justify-between border-b border-[#3F2319] pb-3 flex-wrap gap-4">
                {/* Left: Top Filter Tabs */}
                <div className="flex items-center gap-6 sm:gap-8">
                    {TOP_TABS.map((tab) => {
                        const isSelected = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onChange({ sort: tab.sort, status: tab.status, page: 1 })}
                                className={`relative pb-3 text-xs font-bold tracking-wider uppercase transition cursor-pointer ${isSelected
                                    ? 'text-[#E89B55]'
                                    : 'text-[#F5F1EB] hover:text-[#E89B55]'
                                    }`}
                            >
                                {tab.label}
                                {isSelected && (
                                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D28A4C] rounded-full" />
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Right: Sort Dropdown + Search Input + Reset */}
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Sort Dropdown matching Elem 8 & 9 (Ordenar por + dropdown) */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#CFB28C] hidden sm:inline">
                            Ordenar por:
                        </span>
                        <div className="relative">
                            <select
                                value={filters.sort}
                                onChange={(e) => onChange({ sort: e.target.value as FilterState['sort'], page: 1 })}
                                className="appearance-none bg-[#241612] border border-[#3F2319] hover:border-[#D28A4C] rounded-md px-3 py-1.5 pr-8 text-xs font-medium text-[#F5F1EB] focus:outline-none focus:border-[#D28A4C] transition cursor-pointer"
                            >
                                {SORT_OPTIONS.map((opt) => (
                                    <option key={opt.id} value={opt.id} className="bg-[#241612] text-[#F5F1EB]">
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-[#CFB28C] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    {/* Search Input */}
                    <div className="relative w-48 sm:w-60">
                        <Search className="w-3.5 h-3.5 text-[#CFB28C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Buscar obras ou criadores..."
                            value={filters.q}
                            onChange={(e) => onChange({ q: e.target.value, page: 1 })}
                            className="w-full pl-9 pr-3 py-1.5 bg-[#241612] border border-[#3F2319] rounded-md text-xs text-[#F5F1EB] placeholder-[#CFB28C]/60 focus:outline-none focus:border-[#D28A4C] transition"
                        />
                    </div>

                    {/* Reset Button */}
                    <button
                        onClick={onReset}
                        title="Limpar filtros"
                        className="p-1.5 rounded-md border border-[#3F2319] bg-[#241612] text-[#CFB28C] hover:text-[#F5F1EB] hover:border-[#D28A4C] text-xs transition cursor-pointer"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export const CatalogSidebar: React.FC<CatalogFiltersProps> = ({ filters, onChange }) => {
    // Fetch all NFTs to compute accurate counts for categories and status options
    const { data: allNftsData } = useNFTs({ limit: 100 })

    // Calculate real category counts from actual items
    const categoryCounts = React.useMemo(() => {
        const counts: Record<string, number> = {}
        const items = allNftsData?.items || []
        items.forEach((nft) => {
            const displayCat = toDisplayCategory(nft.category)
            counts[displayCat] = (counts[displayCat] || 0) + 1
        })
        return counts
    }, [allNftsData?.items])

    // Calculate real status counts
    const statusCounts = React.useMemo(() => {
        const items = allNftsData?.items || []
        const total = items.length
        const available = items.filter((n) => n.editionsAvailable > 0).length
        const soldOut = items.filter((n) => n.editionsAvailable === 0).length
        return {
            all: total,
            available,
            sold_out: soldOut,
        }
    }, [allNftsData?.items])

    const [prevFiltersPrice, setPrevFiltersPrice] = React.useState({ min: filters.minPrice, max: filters.maxPrice })
    const [minPrice, setMinPrice] = React.useState(filters.minPrice || '0.01')
    const [maxPrice, setMaxPrice] = React.useState(filters.maxPrice || '20')

    if (
        prevFiltersPrice.min !== filters.minPrice ||
        prevFiltersPrice.max !== filters.maxPrice
    ) {
        setPrevFiltersPrice({ min: filters.minPrice, max: filters.maxPrice })
        setMinPrice(filters.minPrice || '0.01')
        setMaxPrice(filters.maxPrice || '20')
    }

    const handleApplyPrice = () => {
        onChange({ minPrice, maxPrice, page: 1 })
    }

    const currentDisplayCategory = toDisplayCategory(filters.category)

    return (
        <aside className="w-full lg:w-[310px] shrink-0 space-y-6">
            {/* Filter Container matching Rect w=310 h=785 fill=#241612 in home.svg */}
            <div className="w-full bg-[#241612] border border-[#3F2319] rounded-[16px] p-6 space-y-8">
                {/* 1. Categorias List (matching Group 3 in home.svg) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold tracking-wider uppercase text-[#F5F1EB]">
                            Categorias
                        </h3>
                        {filters.category && (
                            <button
                                onClick={() => onChange({ category: '', page: 1 })}
                                className="text-[11px] text-[#D28A4C] hover:text-[#E89B55] transition cursor-pointer"
                            >
                                Todas
                            </button>
                        )}
                    </div>
                    <div className="space-y-2">
                        {CATEGORIES_LIST.map((cat) => {
                            const isSelected = currentDisplayCategory === cat.name
                            const count = categoryCounts[cat.name] || 0
                            return (
                                <button
                                    key={cat.name}
                                    onClick={() => {
                                        const newCategory = isSelected ? '' : toBackendCategory(cat.name)
                                        onChange({ category: newCategory, page: 1 })
                                    }}
                                    className={`w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-medium transition cursor-pointer ${isSelected
                                        ? 'text-[#E89B55] bg-[#38220F]/60'
                                        : 'text-[#CFB28C] hover:text-[#F5F1EB] hover:bg-[#38220F]/30'
                                        }`}
                                >
                                    <span>{cat.name}</span>
                                    <span className="font-mono text-[11px] opacity-80">{count}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* 2. Faixa de Preço matching Group 4 in home.svg: Slider + dual range + APLICAR button */}
                <div className="space-y-4 pt-4 border-t border-[#3F2319]">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold tracking-wider uppercase text-[#F5F1EB]">
                            Faixa de Preço
                        </h3>
                        <span className="text-xs font-mono font-semibold text-[#E89B55]">
                            {minPrice} - {maxPrice} ETH
                        </span>
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-[#CFB28C]">
                                <span>Mínimo: {minPrice} ETH</span>
                                <span>Máximo: {maxPrice} ETH</span>
                            </div>
                            <input
                                type="range"
                                min="0.01"
                                max="20"
                                step="0.1"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-full accent-[#D28A4C] bg-[#140D0A] cursor-pointer h-1.5 rounded-lg"
                            />
                        </div>
                        <div className="flex justify-between text-[11px] text-[#CFB28C]">
                            <span>0.01 ETH</span>
                            <span>20.00 ETH</span>
                        </div>
                    </div>

                    <button
                        onClick={handleApplyPrice}
                        className="w-[92px] h-[36px] rounded-[6px] bg-[#D28A4C] hover:bg-[#E89B55] text-[#140D0A] font-bold text-xs uppercase tracking-wider transition flex items-center justify-center cursor-pointer shadow-sm"
                    >
                        Aplicar
                    </button>
                </div>

                {/* 3. Status Options matching Group 5 in home.svg */}
                <div className="space-y-3 pt-4 border-t border-[#3F2319]">
                    <h3 className="text-sm font-bold tracking-wider uppercase text-[#F5F1EB]">
                        Status
                    </h3>
                    <div className="space-y-2.5">
                        {[
                            { id: 'all', label: 'Todos os Itens', count: statusCounts.all },
                            { id: 'available', label: 'Comprar Agora', count: statusCounts.available },
                            { id: 'sold_out', label: 'Em Leilão / Esgotados', count: statusCounts.sold_out },
                        ].map((item) => {
                            const isSelected = filters.status === item.id
                            return (
                                <label
                                    key={item.id}
                                    className="flex items-center justify-between text-xs text-[#CFB28C] hover:text-[#F5F1EB] cursor-pointer py-0.5"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${isSelected
                                                ? 'border-[#D28A4C]'
                                                : 'border-[#CFB28C]/40'
                                                }`}
                                        >
                                            {isSelected && (
                                                <div className="w-2 h-2 rounded-full bg-[#D28A4C]" />
                                            )}
                                        </div>
                                        <input
                                            type="radio"
                                            name="catalog-status"
                                            checked={isSelected}
                                            onChange={() => onChange({ status: item.id as FilterState['status'], page: 1 })}
                                            className="sr-only"
                                        />
                                        <span>{item.label}</span>
                                    </div>
                                    <span className="font-mono text-[11px] opacity-75">{item.count}</span>
                                </label>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Sidebar Promo Box matching Rect w=310 h=470 at Y=1456 in home.svg */}
            <div className="w-full rounded-[22px] overflow-hidden bg-gradient-to-b from-[#38220F] to-[#241612] border border-[#3F2319] p-5 shadow-xl relative text-center">
                <div className="w-full h-48 rounded-[16px] overflow-hidden mb-4 bg-[#140D0A]">
                    <img
                        src="/assets/image1_2_2.png"
                        alt="Promoção Especial"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#E89B55] block mb-1">
                    Coleção em Destaque
                </span>
                <h4 className="text-base font-extrabold text-[#F5F1EB] mb-2">
                    Cosmic Odyssey #404
                </h4>
                <p className="text-xs text-[#CFB28C] mb-4 leading-relaxed">
                    Acesse o drop exclusivo com benefícios para detentores e privilégios no ecossistema Kurio.
                </p>
                <button
                    onClick={() => onChange({ category: 'Art', page: 1 })}
                    className="w-full py-2.5 rounded-[6px] bg-[#D28A4C] hover:bg-[#E89B55] text-[#140D0A] font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                >
                    Ver Drop
                </button>
            </div>
        </aside>
    )
}

