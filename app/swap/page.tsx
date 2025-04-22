import { SwapInterface } from "@/components/swap-interface"

export default function SwapPage() {
  return (
    <main className="container max-w-lg py-12 md:py-24">
      <div className="flex flex-col items-center space-y-4 text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Token Swap</h1>
        <p className="max-w-[700px] text-muted-foreground md:text-xl">Swap between different tokens with low fees</p>
      </div>

      <SwapInterface />
    </main>
  )
}
