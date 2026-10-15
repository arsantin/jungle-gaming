import React, { useState, useEffect, useMemo } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { HeroSection } from '@/components/HeroSection'
import { CatalogFilters, CatalogSidebar, type FilterState } from '@/components/CatalogFilters'
import { NFTCard } from '@/components/NFTCard'
import { PromoBanners } from '@/components/PromoBanners'
import { FeaturedCollections } from '@/components/FeaturedCollections'
import { ValueProposition } from '@/components/ValueProposition'
import { NFTDetailView } from '@/components/NFTDetailView'
import { CartModal } from '@/components/CartModal'
import { AuthView } from '@/components/AuthView'
import { CheckoutView } from '@/components/CheckoutView'
import { OrderConfirmationView } from '@/components/OrderConfirmationView'
import { ProfileWalletsView } from '@/components/ProfileWalletsView'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { useNFTs, useFavorites } from '@/hooks/useQueries'
import { useAuth } from '@/context/useAuth'
import type { Order } from '@/types'
import { Layers } from 'lucide-react'

export const App: React.FC = () => {
  const { user } = useAuth()

  // Routing state based on window hash and search params
  const [currentRoute, setCurrentRoute] = useState<string>(() => window.location.hash || '#/')
  const [selectedNftId, setSelectedNftId] = useState<string | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null)

  // Catalog Filters State (synchronized with URL search params)
  const [filters, setFilters] = useState<FilterState>(() => {
    const params = new URLSearchParams(window.location.search)
    return {
      q: params.get('q') || '',
      category: params.get('category') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      status: (params.get('status') as FilterState['status']) || 'all',
      sort: (params.get('sort') as FilterState['sort']) || 'recommended',
      page: parseInt(params.get('page') || '1', 10),
    }
  })

  // Synchronize hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/'
      setCurrentRoute(hash)

      if (hash.startsWith('#/nft/')) {
        const id = hash.replace('#/nft/', '')
        setSelectedNftId(id)
      } else {
        setSelectedNftId(null)
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    handleHashChange()
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Synchronize query params with history state
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.category) params.set('category', filters.category)
    if (filters.minPrice) params.set('minPrice', filters.minPrice)
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
    if (filters.status !== 'all') params.set('status', filters.status)
    if (filters.sort !== 'recommended') params.set('sort', filters.sort)
    if (filters.page > 1) params.set('page', filters.page.toString())

    const newSearch = params.toString() ? `?${params.toString()}` : ''
    const newUrl = `${window.location.pathname}${newSearch}${window.location.hash}`
    window.history.replaceState(null, '', newUrl)
  }, [filters])

  // Query NFTs for catalog - 9 items per page (3x3 grid)
  const queryParams = useMemo(() => {
    return {
      q: filters.q,
      category: filters.category,
      minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
      status: filters.status,
      sort: filters.sort,
      page: filters.page,
      limit: 9,
    }
  }, [filters])

  const { data: nftsData, isLoading: nftsLoading, isPlaceholderData } = useNFTs(queryParams)
  const { data: favsData } = useFavorites()

  const navigate = (path: string) => {
    window.location.hash = `#${path}`
  }

  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }

  const handleResetFilters = () => {
    setFilters({
      q: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      status: 'all',
      sort: 'recommended',
      page: 1,
    })
  }

  const featuredNft = nftsData?.items?.find((n) => n.featured) || nftsData?.items?.[0]

  return (
    <div className="min-h-screen flex flex-col bg-[#140D0A] text-[#F5F1EB] font-sans selection:bg-[#D28A4C] selection:text-[#140D0A]">
      {/* Universal Top Header */}
      <Header
        onOpenCart={() => setCartOpen(true)}
        currentPath={currentRoute.replace('#', '')}
        onNavigate={navigate}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Route: NFT Detail */}
        {currentRoute.startsWith('#/nft/') && selectedNftId ? (
          <NFTDetailView
            nftId={selectedNftId}
            onBack={() => navigate('/')}
            onCheckoutDirect={() => {
              if (!user) {
                navigate('/login')
              } else {
                navigate('/checkout')
              }
            }}
          />
        ) : currentRoute === '#/checkout' ? (
          /* Route: Checkout & Payment */
          <CheckoutView
            onSuccess={(order) => {
              setCompletedOrder(order)
              navigate('/order-confirmation')
            }}
            onCancel={() => navigate('/')}
          />
        ) : currentRoute === '#/order-confirmation' && completedOrder ? (
          /* Route: Order Confirmation */
          <OrderConfirmationView
            initialOrder={completedOrder}
            onReturnHome={() => {
              setCompletedOrder(null)
              navigate('/')
            }}
          />
        ) : currentRoute === '#/profile' || currentRoute === '#/wallets' ? (
          /* Route: Profile & Wallets */
          user ? (
            <ProfileWalletsView />
          ) : (
            <div className="py-20 max-w-md mx-auto text-center px-4">
              <h2 className="text-xl font-bold mb-2">Sign in Required</h2>
              <p className="text-xs text-gray-400 mb-6">
                Please sign in with your collector account to access your profile and wallets.
              </p>
              <Button onClick={() => navigate('/login')}>Go to Sign In</Button>
            </div>
          )
        ) : currentRoute === '#/login' || currentRoute === '#/register' ? (
          /* Route: Auth Modal / View (1:1 with signup.svg) */
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <AuthView
              initialMode={currentRoute === '#/register' ? 'register' : 'login'}
              onSuccess={() => navigate('/')}
              onCancel={() => navigate('/')}
              onClose={() => navigate('/')}
            />
          </div>
        ) : currentRoute === '#/favorites' ? (
          /* Route: Favorites View */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center gap-3 mb-8">
              <Layers className="w-6 h-6 text-purple-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Your Saved Favorites</h1>
                <p className="text-xs text-gray-400">
                  {favsData?.favorites?.length || 0} artwork(s) saved to your personal collection
                </p>
              </div>
            </div>

            {!favsData?.favorites?.length ? (
              <div className="py-20 text-center">
                <p className="text-sm text-gray-400 mb-4">No favorited NFTs yet.</p>
                <Button size="sm" onClick={() => navigate('/')}>
                  Discover Artworks
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favsData.favorites.map((nft) => (
                  <NFTCard
                    key={nft.id}
                    nft={nft}
                    onSelect={(id) => navigate(`/nft/${id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Route: Home / Catalog - Exact KURIO layout matching home.svg */
          <div>
            {/* 1. Hero Section (Y=120) */}
            <HeroSection
              featuredNft={featuredNft}
              onExploreClick={() => {
                const el = document.getElementById('catalog-section')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
              onNftClick={(id) => navigate(`/nft/${id}`)}
            />

            {/* 2. Catalog Section with Top Tabs + Left Sidebar + 3x3 Grid (Y=810) */}
            <section
              id="catalog-section"
              className="max-w-[1440px] mx-auto px-6 lg:px-16 py-12"
            >
              {/* Category Filter Tabs & Search Bar */}
              <div className="mb-10">
                <CatalogFilters
                  filters={filters}
                  onChange={handleFilterChange}
                  onReset={handleResetFilters}
                />
              </div>

              {/* 2-Column Catalog Layout: Sidebar (310px) + Grid */}
              <div className="flex flex-col lg:flex-row items-start gap-8">
                {/* Left Sidebar Filters */}
                <div className="w-full lg:w-[310px] shrink-0">
                  <CatalogSidebar
                    filters={filters}
                    onChange={handleFilterChange}
                    onReset={handleResetFilters}
                  />
                </div>

                {/* Right: 3x3 Card Grid + Pagination */}
                <div className="flex-1 w-full">
                  {nftsLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-[#241612] border border-[#3F2319] rounded-[18px] p-4 space-y-4"
                        >
                          <Skeleton className="aspect-square w-full rounded-[14px]" />
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <div className="pt-2 flex justify-between items-center">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-8 w-16 rounded-xl" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !nftsData?.items?.length ? (
                    <div className="py-20 text-center bg-[#241612] rounded-[18px] border border-[#3F2319]">
                      <p className="text-base font-bold text-[#F5F1EB] mb-1">Nenhum item encontrado</p>
                      <p className="text-xs text-[#CFB28C] mb-6 max-w-sm mx-auto">
                        Tente ajustar a busca ou limpar os filtros para ver todas as artes digitais disponíveis.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="px-4 py-2 bg-[#D28A4C] hover:bg-[#E89B55] text-[#140D0A] font-bold text-xs rounded-[8px] transition-colors"
                      >
                        Limpar todos os filtros
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity ${isPlaceholderData ? 'opacity-50' : 'opacity-100'
                        }`}
                    >
                      {nftsData.items.map((nft) => (
                        <NFTCard
                          key={nft.id}
                          nft={nft}
                          onSelect={(id) => navigate(`/nft/${id}`)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Pagination controls matching KURIO Portuguese design */}
                  {nftsData?.pagination && nftsData.pagination.totalPages > 1 && (
                    <div className="pt-12 flex items-center justify-center gap-2">
                      <button
                        disabled={filters.page <= 1}
                        onClick={() => handleFilterChange({ page: filters.page - 1 })}
                        className="px-3 py-1.5 rounded-[6px] border border-[#3F2319] text-xs font-semibold text-[#CFB28C] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Anterior
                      </button>

                      {Array.from({ length: nftsData.pagination.totalPages }).map((_, idx) => {
                        const pageNum = idx + 1
                        const isActive = pageNum === filters.page
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handleFilterChange({ page: pageNum })}
                            className={`w-8 h-8 rounded-[6px] text-xs font-bold transition-all ${isActive
                              ? 'bg-[#D28A4C] text-[#140D0A]'
                              : 'bg-[#241612] border border-[#3F2319] text-[#CFB28C] hover:border-[#D28A4C]'
                              }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}

                      <button
                        disabled={filters.page >= nftsData.pagination.totalPages}
                        onClick={() => handleFilterChange({ page: filters.page + 1 })}
                        className="px-3 py-1.5 rounded-[6px] border border-[#3F2319] text-xs font-semibold text-[#CFB28C] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Próximo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 3. Promotional Banners (Y=2116) */}
            <PromoBanners />

            {/* 4. Featured Collections Carousel (Y=2470) */}
            <FeaturedCollections />

            {/* 5. Value Proposition Pillars & Newsletter Bar (Y=3034) */}
            <ValueProposition />
          </div>
        )}
      </main>

      {/* Cart Drawer / Modal */}
      <CartModal
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onProceedCheckout={() => {
          if (!user) {
            navigate('/login')
          } else {
            navigate('/checkout')
          }
        }}
      />

      {/* Global Notifications and Toasts */}
      <ToastContainer />

      {/* Universal Footer */}
      <Footer />
    </div>
  )
}
export default App
