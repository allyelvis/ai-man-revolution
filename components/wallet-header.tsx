"use client"

import { useWallet } from "./wallet-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Network, Database } from "lucide-react"

export default function WalletHeader() {
  const { wallet, balances, isConnected } = useWallet()

  return (
    <div className="space-y-4 mb-6">
      <Card>
        <CardContent className="p-4 flex items-center space-x-2">
          <Network className="h-5 w-5 text-gray-500" />
          <span className="text-sm">
            Network:{" "}
            {isConnected ? (
              <Badge variant="outline" className="ml-1 bg-green-50 text-green-700 hover:bg-green-50">
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="ml-1 bg-gray-100 text-gray-500 hover:bg-gray-100">
                Disconnected
              </Badge>
            )}
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center space-x-2">
          <Wallet className="h-5 w-5 text-gray-500" />
          <span className="text-sm">
            Address:{" "}
            {wallet ? (
              <span className="font-mono text-xs ml-1 break-all">{wallet.address}</span>
            ) : (
              <span className="text-gray-500">(none)</span>
            )}
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center space-x-2">
          <Database className="h-5 w-5 text-gray-500" />
          <span className="text-sm">
            Balance: <span className="font-semibold">{balances.ETH.toFixed(6)} ETH</span>
          </span>
        </CardContent>
      </Card>
    </div>
  )
}
