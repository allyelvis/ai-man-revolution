"use client"

import { useWallet } from "./wallet-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useState } from "react"

export default function AssetList() {
  const { cryptoAssets, fiatBalances, refreshMarketData } = useWallet()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshMarketData()
    setIsRefreshing(false)
  }

  // Calculate total portfolio value in USD
  const totalValue = cryptoAssets.reduce((total, asset) => {
    const price = asset.marketData?.price || 0
    return total + asset.balance * price
  }, 0)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Your Assets</h3>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="h-8">
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground mb-2">Total Portfolio Value</div>
          <div className="text-2xl font-bold">
            ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {cryptoAssets.map(
          (asset) =>
            asset.balance > 0 && (
              <Card key={asset.symbol}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      {asset.symbol.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{asset.name}</div>
                      <div className="text-sm text-muted-foreground">{asset.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {asset.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      $
                      {(asset.balance * (asset.marketData?.price || 0)).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ),
        )}

        {fiatBalances.map(
          (balance) =>
            balance.balance > 0 && (
              <Card key={balance.currency}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      {balance.symbol}
                    </div>
                    <div>
                      <div className="font-medium">{balance.currency}</div>
                      <div className="text-sm text-muted-foreground">Fiat</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {balance.symbol}
                      {balance.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ),
        )}

        {cryptoAssets.every((asset) => asset.balance === 0) &&
          fiatBalances.every((balance) => balance.balance === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No assets yet. Deposit or buy crypto to get started.
            </div>
          )}
      </div>
    </div>
  )
}
