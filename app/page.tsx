"use client"
import { WalletProvider } from "@/components/wallet-provider"
import WalletInterface from "@/components/wallet-interface"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <WalletProvider>
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <WalletInterface />
        </div>
      </WalletProvider>
    </main>
  )
}
