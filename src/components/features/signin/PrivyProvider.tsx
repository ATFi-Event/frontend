"use client";

import { PrivyProvider } from "@privy-io/react-auth";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        appearance: {
          // logo: "https://auth.privy.io/logos/privy-logo.png",
          landingHeader: "Welcome to ATFI",
          loginMessage: 'Please sign in or sign up below',
          theme: "dark",
          showWalletLoginFirst: false,
          walletChainType: "ethereum-and-solana",
          walletList: [
            "metamask",
            "base_account",
            // "coinbase_wallet",
          ],
        },
        loginMethods: ["email", "wallet", "google"],
        embeddedWallets: {
          showWalletUIs: true,
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
