// Contract addresses for ATFi project

export const CONTRACT_ADDRESSES = {
  // Base Sepolia Testnet
  BASE_SEPOLIA: {
    FACTORY_ATFI: "0xC0b0080BBe0c0B12c5886F12C525cCeFBD15e11B",
    USDC: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  },
} as const;

export const NETWORK_CONFIG = {
  BASE_SEPOLIA: {
    chainId: "0x14A34", // 84532 in hex
    chainName: "Base Sepolia",
    rpcUrls: ["https://sepolia.base.org"],
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://sepolia.basescan.org"],
  },
} as const;

export const CURRENT_NETWORK = "BASE_SEPOLIA" as const;