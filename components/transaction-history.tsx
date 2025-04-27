"use client"

import { useWallet, type Transaction } from "./wallet-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, ArrowUpRight, ArrowDownLeft, Send } from "lucide-react"

export default function TransactionHistory() {
  const { history } = useWallet()

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return ""
    return new Date(timestamp).toLocaleString()
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "Deposit":
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      case "Withdraw":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case "Real Transfer":
        return <Send className="h-4 w-4 text-blue-500" />
      default:
        return <History className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <History className="h-5 w-5 mr-2" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] rounded-md border p-4">
          {history.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No transactions yet.</div>
          ) : (
            <div className="space-y-4">
              {history.map((tx: Transaction, index: number) => (
                <div key={index} className="flex items-start space-x-3 text-sm">
                  <div className="mt-0.5">{getTransactionIcon(tx.type)}</div>
                  <div className="flex-1">
                    <div className="font-medium">{tx.type}</div>
                    <div className="text-gray-500">
                      {tx.amount} {tx.token} {tx.to && `to ${tx.to.substring(0, 10)}...`}
                    </div>
                    {tx.timestamp && <div className="text-xs text-gray-400">{formatDate(tx.timestamp)}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
