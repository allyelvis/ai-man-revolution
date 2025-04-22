import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export function NetworkSupport() {
  const networks = [
    {
      name: "Ethereum",
      logo: "/placeholder.svg?height=64&width=64",
      description: "The original smart contract platform",
    },
    {
      name: "Base",
      logo: "/placeholder.svg?height=64&width=64",
      description: "Coinbase's Ethereum L2 solution",
    },
    {
      name: "Private Networks",
      logo: "/placeholder.svg?height=64&width=64",
      description: "Support for private blockchain deployments",
    },
    {
      name: "Testnets",
      logo: "/placeholder.svg?height=64&width=64",
      description: "Sepolia, Base Goerli, and more",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Supported Networks</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Deploy your tokens on multiple blockchain networks
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mt-12">
          {networks.map((network, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                <Image
                  src={network.logo || "/placeholder.svg"}
                  alt={network.name}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
                <div>
                  <h3 className="text-xl font-bold">{network.name}</h3>
                  <p className="text-sm text-muted-foreground">{network.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
