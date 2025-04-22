"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConnectKitButton } from "connectkit"
import { Search, SlidersHorizontal } from "lucide-react"
import { useState } from "react"

export function MarketplaceHeader() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)

  return (
    <div className="space-y-8 mb-12">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Token Marketplace</h1>
        <p className="max-w-[700px] text-muted-foreground md:text-xl">
          Buy, sell, and swap digital assets with multiple payment options
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tokens and collections..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setFilterOpen(!filterOpen)}>
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Token Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assets</SelectItem>
              <SelectItem value="fungible">Fungible Tokens</SelectItem>
              <SelectItem value="nft">NFTs</SelectItem>
            </SelectContent>
          </Select>
          <ConnectKitButton.Custom>
            {({ isConnected, show }) => {
              return <Button onClick={show}>{isConnected ? "Connected" : "Connect Wallet"}</Button>
            }}
          </ConnectKitButton.Custom>
        </div>
      </div>

      {filterOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/30">
          <Select defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="Network" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Networks</SelectItem>
              <SelectItem value="ethereum">Ethereum</SelectItem>
              <SelectItem value="base">Base</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="low">Under $10</SelectItem>
              <SelectItem value="medium">$10 - $100</SelectItem>
              <SelectItem value="high">$100+</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="newest">
            <SelectTrigger>
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
