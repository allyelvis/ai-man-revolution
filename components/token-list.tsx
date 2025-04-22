"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ArrowLeftRight, ExternalLink, Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useAccount } from "wagmi"
import { ConnectKitButton } from "connectkit"

// Mock data for tokens
const mockTokens = [
  {
    id: "1",
    name: "Decentralized Finance Token",
    symbol: "DFT",
    type: "fungible",
    price: 2.45,
    change: 5.2,
    image: "/placeholder.svg?height=400&width=400",
    network: "ethereum",
  },
  {
    id: "2",
    name: "Crypto Punks #1234",
    symbol: "PUNK",
    type: "nft",
    price: 12.5,
    change: -2.1,
    image: "/placeholder.svg?height=400&width=400",
    network: "ethereum",
  },
  {
    id: "3",
    name: "Base Builders",
    symbol: "BUILDER",
    type: "fungible",
    price: 0.85,
    change: 12.3,
    image: "/placeholder.svg?height=400&width=400",
    network: "base",
  },
  {
    id: "4",
    name: "Digital Art Collection #42",
    symbol: "DAC",
    type: "nft",
    price: 3.2,
    change: 1.5,
    image: "/placeholder.svg?height=400&width=400",
    network: "base",
  },
  {
    id: "5",
    name: "Governance Token",
    symbol: "GOV",
    type: "fungible",
    price: 18.75,
    change: -0.8,
    image: "/placeholder.svg?height=400&width=400",
    network: "ethereum",
  },
  {
    id: "6",
    name: "Virtual Land Parcel #789",
    symbol: "LAND",
    type: "nft",
    price: 4.5,
    change: 3.7,
    image: "/placeholder.svg?height=400&width=400",
    network: "base",
  },
]

export function TokenList() {
  const { toast } = useToast()
  const { isConnected } = useAccount()
  const [selectedToken, setSelectedToken] = useState<(typeof mockTokens)[0] | null>(null)
  const [purchaseAmount, setPurchaseAmount] = useState("1")

  const handleBuy = () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to make a purchase",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Purchase initiated",
      description: `Starting purchase of ${selectedToken?.name}. Please confirm in your wallet.`,
    })

    // Simulate transaction
    setTimeout(() => {
      toast({
        title: "Purchase successful!",
        description: `You have successfully purchased ${selectedToken?.name}.`,
      })
    }, 2000)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {mockTokens.map((token) => (
        <Card key={token.id} className="overflow-hidden">
          <CardHeader className="p-0">
            <div className="relative h-48 w-full">
              <Image src={token.image || "/placeholder.svg"} alt={token.name} fill className="object-cover" />
              <div className="absolute top-2 right-2 bg-background/80 text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm">
                {token.network === "ethereum" ? "Ethereum" : "Base"}
              </div>
              <div className="absolute top-2 left-2 bg-background/80 text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm">
                {token.type === "fungible" ? "Token" : "NFT"}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold">{token.name}</h3>
                <p className="text-sm text-muted-foreground">{token.symbol}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">${token.price.toFixed(2)}</p>
                <p className={`text-xs ${token.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {token.change >= 0 ? "+" : ""}
                  {token.change}%
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default" className="flex-1" onClick={() => setSelectedToken(token)}>
                  Buy
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Buy {selectedToken?.name}</DialogTitle>
                  <DialogDescription>
                    Purchase this {selectedToken?.type === "fungible" ? "token" : "NFT"} using your connected wallet or
                    other payment methods.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden">
                      <Image
                        src={selectedToken?.image || "/placeholder.svg?height=64&width=64"}
                        alt={selectedToken?.name || "Token"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold">{selectedToken?.name}</h4>
                      <p className="text-sm text-muted-foreground">${selectedToken?.price.toFixed(2)} per token</p>
                    </div>
                  </div>

                  {selectedToken?.type === "fungible" && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="amount" className="text-right text-sm font-medium col-span-1">
                        Amount
                      </label>
                      <input
                        id="amount"
                        type="number"
                        value={purchaseAmount}
                        onChange={(e) => setPurchaseAmount(e.target.value)}
                        className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Price:</span>
                    <span className="font-bold">
                      $
                      {(
                        selectedToken?.price *
                        (selectedToken?.type === "fungible" ? Number.parseFloat(purchaseAmount) : 1)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
                <DialogFooter>
                  {!isConnected ? <ConnectKitButton /> : <Button onClick={handleBuy}>Confirm Purchase</Button>}
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="icon">
              <ArrowLeftRight className="h-4 w-4" />
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setSelectedToken(token)}>
                  <Info className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedToken?.name} Details</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="relative h-48 w-full rounded-lg overflow-hidden">
                    <Image
                      src={selectedToken?.image || "/placeholder.svg?height=400&width=400"}
                      alt={selectedToken?.name || "Token"}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Symbol</div>
                    <div className="font-medium">{selectedToken?.symbol}</div>

                    <div className="text-muted-foreground">Type</div>
                    <div className="font-medium capitalize">{selectedToken?.type}</div>

                    <div className="text-muted-foreground">Network</div>
                    <div className="font-medium capitalize">{selectedToken?.network}</div>

                    <div className="text-muted-foreground">Price</div>
                    <div className="font-medium">${selectedToken?.price.toFixed(2)}</div>

                    <div className="text-muted-foreground">24h Change</div>
                    <div
                      className={`font-medium ${selectedToken?.change && selectedToken.change >= 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      {selectedToken?.change && selectedToken.change >= 0 ? "+" : ""}
                      {selectedToken?.change}%
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" size="sm" className="gap-1" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      View on Explorer <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
