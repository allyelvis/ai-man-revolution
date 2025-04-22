"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState } from "react"
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi"
import { ConnectKitButton } from "connectkit"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Token name must be at least 2 characters.",
  }),
  symbol: z
    .string()
    .min(1, {
      message: "Token symbol is required.",
    })
    .max(8, {
      message: "Token symbol must be 8 characters or less.",
    }),
  initialSupply: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Initial supply must be a positive number.",
  }),
  decimals: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 18, {
    message: "Decimals must be between 0 and 18.",
  }),
  description: z.string().optional(),
  network: z.string(),
})

export function CreateTokenForm() {
  const { toast } = useToast()
  const { isConnected } = useAccount()
  const { chain } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentStatus, setDeploymentStatus] = useState<"idle" | "success" | "error">("idle")
  const [tokenAddress, setTokenAddress] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      symbol: "",
      initialSupply: "1000000",
      decimals: "18",
      description: "",
      network: "ethereum",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to deploy a token",
        variant: "destructive",
      })
      return
    }

    // Switch network if needed
    if (values.network === "ethereum" && chain?.id !== 1) {
      switchNetwork?.(1)
      return
    } else if (values.network === "base" && chain?.id !== 8453) {
      switchNetwork?.(8453)
      return
    }

    setIsDeploying(true)
    setDeploymentStatus("idle")

    try {
      // Simulate token deployment
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock successful deployment
      setDeploymentStatus("success")
      setTokenAddress("0x1234567890123456789012345678901234567890")

      toast({
        title: "Token deployed successfully!",
        description: `Your ${values.name} token has been created.`,
      })
    } catch (error) {
      setDeploymentStatus("error")
      toast({
        title: "Deployment failed",
        description: "There was an error deploying your token. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Token" {...field} />
                    </FormControl>
                    <FormDescription>The full name of your token (e.g., "Ethereum")</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token Symbol</FormLabel>
                    <FormControl>
                      <Input placeholder="MTK" {...field} />
                    </FormControl>
                    <FormDescription>The ticker symbol for your token (e.g., "ETH")</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="initialSupply"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Supply</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>The initial amount of tokens to create</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="decimals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Decimals</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>Divisibility of your token (usually 18)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="network"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Network</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a network" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ethereum">Ethereum Mainnet</SelectItem>
                        <SelectItem value="base">Base</SelectItem>
                        <SelectItem value="sepolia">Sepolia Testnet</SelectItem>
                        <SelectItem value="baseGoerli">Base Goerli Testnet</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>The blockchain network to deploy your token on</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A brief description of your token and its purpose"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {deploymentStatus === "success" && (
              <Alert className="bg-green-50 text-green-900 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle>Token deployed successfully!</AlertTitle>
                <AlertDescription>
                  Your token has been deployed to address:{" "}
                  <code className="bg-green-100 px-1 py-0.5 rounded">{tokenAddress}</code>
                </AlertDescription>
              </Alert>
            )}

            {deploymentStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Deployment failed</AlertTitle>
                <AlertDescription>
                  There was an error deploying your token. Please check your wallet and try again.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-4">
              {!isConnected ? (
                <ConnectKitButton />
              ) : (
                <Button type="submit" disabled={isDeploying}>
                  {isDeploying ? "Deploying..." : "Deploy Token"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
