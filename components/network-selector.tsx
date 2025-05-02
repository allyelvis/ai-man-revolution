"use client"

import { useWallet } from "./wallet-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function NetworkSelector() {
  const { selectedNetwork, setSelectedNetwork, getNetworkInfo } = useWallet()

  const networks = ["ethereum", "goerli", "polygon", "solana"]

  return (
    <div className="space-y-2">
      <Label htmlFor="network-select">Network</Label>
      <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
        <SelectTrigger id="network-select">
          <SelectValue placeholder="Select Network" />
        </SelectTrigger>
        <SelectContent>
          {networks.map((network) => {
            const networkInfo = getNetworkInfo(network)
            // Make sure networkInfo exists before trying to access its properties
            return (
              <SelectItem key={network} value={network}>
                <div className="flex items-center">
                  <span className="mr-2">{networkInfo?.name || network}</span>
                  {networkInfo?.isTestnet && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-1 rounded">Testnet</span>
                  )}
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}
