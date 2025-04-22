"use client"

import { Button } from "@/components/ui/button"
import { ConnectKitButton } from "connectkit"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  const router = useRouter()

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Create, Trade, and Manage Digital Assets
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                A decentralized platform for creating fungible tokens and NFTs with seamless wallet connectivity and
                diverse payment options.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <ConnectKitButton.Custom>
                {({ isConnected, show }) => {
                  return (
                    <Button onClick={show} size="lg">
                      {isConnected ? "Connected" : "Connect Wallet"}
                    </Button>
                  )
                }}
              </ConnectKitButton.Custom>
              <Button variant="outline" size="lg" onClick={() => router.push("/create")} className="group">
                Create Tokens
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-[500px] aspect-square">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative bg-card border rounded-xl shadow-xl overflow-hidden p-6 h-full flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="bg-muted rounded-lg p-4 flex flex-col gap-2">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-blue-500"></div>
                    </div>
                    <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                    <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 flex flex-col gap-2">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-lg bg-purple-500"></div>
                    </div>
                    <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                    <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 flex flex-col gap-2">
                    <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-lg bg-green-500"></div>
                    </div>
                    <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                    <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 flex flex-col gap-2">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-amber-500"></div>
                    </div>
                    <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                    <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
