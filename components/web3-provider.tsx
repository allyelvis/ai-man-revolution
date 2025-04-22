"use client"

import type React from "react"

import { WagmiConfig, createConfig } from "wagmi"
import { ConnectKitProvider, getDefaultConfig } from "connectkit"
import { mainnet, base, sepolia, baseGoerli } from "wagmi/chains"

const chains = [mainnet, base, sepolia, baseGoerli]

const config = createConfig(
  getDefaultConfig({
    // Replace with your actual project ID from WalletConnect
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id",
    // Replace with your actual Alchemy API key
    alchemyId: process.env.NEXT_PUBLIC_ALCHEMY_ID,
    chains,
    appName: "TokenForge",
  }),
)

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider theme="auto" mode="dark">
        {children}
      </ConnectKitProvider>
    </WagmiConfig>
  )
}
