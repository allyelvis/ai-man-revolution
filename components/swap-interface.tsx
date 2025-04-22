"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowDown, Settings } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { useAccount } from "wagmi"
import { ConnectKitButton } from "connectkit"

// Mock token data
const tokens = [
  { id: "eth", name: "Ethereum", symbol: "ETH", balance: "1.45", price: 3500 },
  { id: "usdc", name: "USD Coin", symbol: "USDC", balance: "2500.00", price: 1 },
  { id: "dft", name: "Decentralized Finance Token", symbol: "DFT", balance: "1250.00", price: 2.45 },
  { id: "gov", name: "Governance Token", symbol: "GOV", balance: "75.00", price: 18.75 },
]

export function SwapInterface() {
  const { toast } = useToast()
  const { isConnected } = useAccount()
  const [fromToken, setFromToken] = useState(tokens[0])
  const [toToken, setToToken] = useState(tokens[1])
  const [fromAmount, setFromAmount] = useState("0.1")
  const [slippage, setSlippage] = useState(0.5)
  const [showSettings, setShowSettings] = useState(false)

  // Calculate the to amount based on price
  const toAmount =
    fromAmount && fromToken && toToken
      ? ((Number.parseFloat(fromAmount) * fromToken.price) / toToken.price).toFixed(6)
      : "0"

  const handleSwap = () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to swap tokens",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Swap initiated",
      description: `Swapping ${fromAmount} ${fromToken.symbol} to ${toAmount} ${toToken.symbol}. Please confirm in your wallet.`,
    })

    // Simulate transaction
    setTimeout(() => {
      toast({
        title: "Swap successful!",
        description: `You have successfully swapped ${fromAmount} ${fromToken.symbol} to ${toAmount} ${toToken.symbol}.`,
      })
    }, 2000)
  }

  const switchTokens = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Swap Tokens</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>Exchange tokens at the best rates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showSettings && (
          <div className="p-4 border rounded-lg mb-4 space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Slippage Tolerance</span>
                <span className="text-sm">{slippage}%</span>
              </div>
              <Slider defaultValue={[slippage]} max={5} step={0.1} onValueChange={(value) => setSlippage(value[0])} />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0.1%</span>
                <span>5%</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">From</label>
              {isConnected && (
                <span className="text-xs text-muted-foreground">
                  Balance: {fromToken.balance} {fromToken.symbol}
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.0"
                />
              </div>
              <Select
                value={fromToken.id}
                onValueChange={(value) => {
                  const token = tokens.find((t) => t.id === value)
                  if (token) setFromToken(token)
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token.id} value={token.id}>
                      {token.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-center">
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 bg-muted" onClick={switchTokens}>
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">To</label>
              {isConnected && (
                <span className="text-xs text-muted-foreground">
                  Balance: {toToken.balance} {toToken.symbol}
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input type="text" value={toAmount} readOnly placeholder="0.0" />
              </div>
              <Select
                value={toToken.id}
                onValueChange={(value) => {
                  const token = tokens.find((t) => t.id === value)
                  if (token) setToToken(token)
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token.id} value={token.id}>
                      {token.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="p-3 bg-muted rounded-lg text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rate</span>
            <span>
              1 {fromToken.symbol} = {(fromToken.price / toToken.price).toFixed(6)} {toToken.symbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fee</span>
            <span>0.3%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Slippage Tolerance</span>
            <span>{slippage}%</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {!isConnected ? (
          <ConnectKitButton.Custom>
            {({ show }) => (
              <Button className="w-full" onClick={show}>
                Connect Wallet
              </Button>
            )}
          </ConnectKitButton.Custom>
        ) : (
          <Button className="w-full" onClick={handleSwap} disabled={!fromAmount || Number.parseFloat(fromAmount) <= 0}>
            Swap
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
