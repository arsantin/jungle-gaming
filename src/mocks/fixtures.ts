import type { NFT, User, Wallet } from "../types";

export const MOCK_USERS: User[] = [
  {
    id: "user-1",
    name: "Alex Rivera",
    email: "alex.rivera@example.com",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bio: "Digital art enthusiast and Web3 early adopter. Collecting generative art and 3D cyber artifacts.",
    createdAt: "2025-01-15T10:00:00Z"
  },
  {
    id: "user-2",
    name: "Elena Rostova",
    email: "elena.rostova@example.com",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "Metaverse curator and digital sculptor exploring boundaries of virtual architecture.",
    createdAt: "2025-02-10T14:30:00Z"
  }
];

export const MOCK_WALLETS: Wallet[] = [
  {
    id: "wallet-1",
    userId: "user-1",
    address: "0x71C...8942",
    chain: "ethereum",
    label: "Primary Vault (MetaMask)",
    isPrimary: true,
    balanceEth: "14.85"
  },
  {
    id: "wallet-2",
    userId: "user-1",
    address: "0x32A...44C1",
    chain: "polygon",
    label: "Hot Wallet (Polygon)",
    isPrimary: false,
    balanceEth: "2.40"
  },
  {
    id: "wallet-3",
    userId: "user-2",
    address: "0x99F...120E",
    chain: "ethereum",
    label: "Cold Storage (Ledger)",
    isPrimary: true,
    balanceEth: "35.12"
  }
];

export const MOCK_NFTS: NFT[] = [
  {
    id: "nft-1",
    tokenId: "#4092",
    title: "Neon Odyssey #4092",
    description:
      "A psychedelic journey through a cyberpunk metropolis bathed in chromatic neon light and decentralized signals.",
    creator: {
      id: "creator-1",
      name: "CyberKinetics",
      avatarUrl:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
      verified: true
    },
    collection: {
      id: "col-1",
      name: "Neon Odyssey Genesis",
      floorPrice: "1.25"
    },
    category: "Art",
    imageUrl:
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80",
    priceEth: "1.85",
    editionsTotal: 10,
    editionsAvailable: 4,
    likesCount: 142,
    featured: true,
    version: 1,
    updatedAt: "2026-10-10T12:00:00Z"
  },
  {
    id: "nft-2",
    tokenId: "#1104",
    title: "Aetherial Blossom #1104",
    description:
      "Organic forms rendered into crystal lattices floating through ethereal gravitational anomalies.",
    creator: {
      id: "creator-2",
      name: "LuminaFlora",
      avatarUrl:
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=100&auto=format&fit=crop&q=80",
      verified: true
    },
    collection: {
      id: "col-2",
      name: "Flora of the Void",
      floorPrice: "0.80"
    },
    category: "Art",
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    priceEth: "0.95",
    editionsTotal: 25,
    editionsAvailable: 12,
    likesCount: 98,
    featured: true,
    version: 1,
    updatedAt: "2026-10-10T12:00:00Z"
  },
  {
    id: "nft-3",
    tokenId: "#0087",
    title: "Hyperion Sentinel #0087",
    description:
      "Armored combat autonomous unit built for high-orbit asteroid mining defense and telemetry relay.",
    creator: {
      id: "creator-3",
      name: "MechaFoundry",
      avatarUrl:
        "https://images.unsplash.com/photo-1563089145-599997674d42?w=100&auto=format&fit=crop&q=80",
      verified: true
    },
    collection: {
      id: "col-3",
      name: "Hyperion Fleet",
      floorPrice: "2.50"
    },
    category: "Gaming",
    imageUrl:
      "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&auto=format&fit=crop&q=80",
    priceEth: "3.20",
    editionsTotal: 5,
    editionsAvailable: 2,
    likesCount: 231,
    featured: true,
    version: 1,
    updatedAt: "2026-10-10T12:00:00Z"
  },
  {
    id: "nft-4",
    tokenId: "#8921",
    title: "Submerged Sanctuary #8921",
    description:
      "Undersea oceanic bioluminescent colony capturing light in deep geothermal trenches.",
    creator: {
      id: "creator-4",
      name: "AquaVisions",
      avatarUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
      verified: false
    },
    collection: {
      id: "col-4",
      name: "Abyssal Relics",
      floorPrice: "0.45"
    },
    category: "Photography",
    imageUrl:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    priceEth: "0.50",
    editionsTotal: 50,
    editionsAvailable: 31,
    likesCount: 64,
    featured: false,
    version: 1,
    updatedAt: "2026-10-10T12:00:00Z"
  },
  {
    id: "nft-5",
    tokenId: "#0341",
    title: "Synthetic Dreams #0341",
    description:
      "Generative sonic canvas integrating modular synthesizer rhythms into visual wave patterns.",
    creator: {
      id: "creator-5",
      name: "SoundWaveLab",
      avatarUrl:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      verified: true
    },
    collection: {
      id: "col-5",
      name: "Harmonic Frequencies",
      floorPrice: "1.10"
    },
    category: "Music",
    imageUrl:
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80",
    priceEth: "1.15",
    editionsTotal: 15,
    editionsAvailable: 7,
    likesCount: 88,
    featured: false,
    version: 1,
    updatedAt: "2026-10-10T12:00:00Z"
  },
  {
    id: "nft-6",
    tokenId: "#9901",
    title: "Cosmic Nexus Gateway #9901",
    description:
      "Interdimensional portal connecting parallel virtual metaverses through quantum entangled nodes.",
    creator: {
      id: "creator-6",
      name: "ZeroGWorld",
      avatarUrl:
        "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
      verified: true
    },
    collection: {
      id: "col-6",
      name: "Nexus Real Estate",
      floorPrice: "4.00"
    },
    category: "Virtual Worlds",
    imageUrl:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    priceEth: "4.75",
    editionsTotal: 3,
    editionsAvailable: 1,
    likesCount: 310,
    featured: true,
    version: 1,
    updatedAt: "2026-10-10T12:00:00Z"
  },
  {
    id: "nft-7",
    tokenId: "#2214",
    title: "Chrono Glitch #2214",
    description:
      "Temporal distortion artifacts captured from high frequency algorithmic trading disruptions.",
    creator: {
      id: "creator-1",
      name: "CyberKinetics",
      avatarUrl:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
      verified: true
    },
    collection: {
      id: "col-1",
      name: "Neon Odyssey Genesis",
      floorPrice: "1.25"
    },
    category: "Collectibles",
    imageUrl:
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80",
    priceEth: "1.40",
    editionsTotal: 20,
    editionsAvailable: 0, // SOLD OUT scenario
    likesCount: 175,
    featured: false,
    version: 1,
    updatedAt: "2026-10-10T12:00:00Z"
  },
  {
    id: "nft-8",
    tokenId: "#5512",
    title: "Solar Flare Protocol #5512",
    description:
      "Thermonuclear coronal emissions translated into reactive holographic projections.",
    creator: {
      id: "creator-2",
      name: "LuminaFlora",
      avatarUrl:
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=100&auto=format&fit=crop&q=80",
      verified: true
    },
    collection: {
      id: "col-2",
      name: "Flora of the Void",
      floorPrice: "0.80"
    },
    category: "Art",
    imageUrl:
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80",
    priceEth: "0.85",
    editionsTotal: 30,
    editionsAvailable: 18,
    likesCount: 112,
    featured: false,
    version: 1,
    updatedAt: "2026-10-10T12:00:00Z"
  }
];

export const MOCK_COUPONS: Record<string, number> = {
  SAVE10: 10,
  CRYPTO20: 20,
  VIP50: 50
};
