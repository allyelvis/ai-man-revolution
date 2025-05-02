"use client"

import { useWallet } from "./wallet-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Network, Database, Copy, Check } from "lucide-react"
import { useState } from "react"

export default function WalletHeader() {
  const { wallet, cryptoAssets, isConnected, isSandboxMode, selectedNetwork, getNetworkInfo } = useWallet()
  const [copied, setCopied] = useState(false)

  // Calculate total portfolio value in USD
  const totalValue = cryptoAssets.reduce((total, asset) => {
    const price = asset.marketData?.price || 0
    return total + asset.balance * price
  }, 0)

  const copyToClipboard = () => {
    if (wallet) {
      navigator.clipboard.writeText(wallet.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const networkInfo = getNetworkInfo(selectedNetwork)

  return (
    <div className="space-y-4 mb-6">
      <Card>
        <CardContent className="p-4 flex items-center space-x-2">
          <Network className="h-5 w-5 text-gray-500" />
          <span className="text-sm">
            Network:{" "}
            {isConnected ? (
              <>
                <Badge
                  variant="outline"
                  className={`ml-1 ${isSandboxMode ? "bg-amber-50 text-amber-700 hover:bg-amber-50" : "bg-green-50 text-green-700 hover:bg-green-50"}`}
                >
                  {isSandboxMode ? "Sandbox Mode" : networkInfo?.name || selectedNetwork}
                </Badge>
                {networkInfo?.isTestnet && !isSandboxMode && (
                  <Badge variant="outline" className="ml-1 bg-blue-50 text-blue-700 hover:bg-blue-50">
                    Testnet
                  </Badge>
                )}
              </>
            ) : (
              <Badge variant="outline" className="ml-1 bg-gray-100 text-gray-500 hover:bg-gray-100">
                Disconnected
              </Badge>
            )}
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-gray-500" />
            <span className="text-sm">
              Address:{" "}
              {wallet ? (
                <span className="font-mono text-xs ml-1 break-all">
                  {wallet.address.substring(0, 6)}...{wallet.address.substring(wallet.address.length - 4)}
                </span>
              ) : (
                <span className="text-gray-500">(none)</span>
              )}
            </span>
          </div>
          {wallet && (
            <button onClick={copyToClipboard} className="text-gray-500 hover:text-gray-700" title="Copy address">
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-gray-500" />
            <span className="text-sm">Portfolio Value:</span>
          </div>
          <span className="font-semibold">
            ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </CardContent>
      </Card>
    </div>
  )
}
