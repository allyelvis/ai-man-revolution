"use client"

import { useWallet } from "./wallet-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  RefreshCw,
  DollarSign,
  CreditCard,
  ExternalLink,
} from "lucide-react"
import type { Transaction } from "@/lib/types"

export default function TransactionHistory() {
  const { transactions, getNetworkInfo } = useWallet()

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "Deposit":
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      case "Withdraw":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case "Transfer":
        return <Send className="h-4 w-4 text-blue-500" />
      case "Simulated":
        return <Send className="h-4 w-4 text-amber-500" />
      case "Swap":
        return <RefreshCw className="h-4 w-4 text-purple-500" />
      case "Buy":
        return <CreditCard className="h-4 w-4 text-green-500" />
      case "Sell":
        return <DollarSign className="h-4 w-4 text-blue-500" />
      case "CashOut":
        return <DollarSign className="h-4 w-4 text-red-500" />
      default:
        return <History className="h-4 w-4 text-gray-500" />
    }
  }

  const getTransactionDescription = (tx: Transaction) => {
    switch (tx.type) {
      case "Deposit":
        return `Deposited ${tx.amount} ${tx.currency}`
      case "Withdraw":
        return `Withdrew ${tx.amount} ${tx.currency}`
      case "Transfer":
        return `Sent ${tx.amount} ${tx.currency} to ${tx.toAddress?.substring(0, 10)}...`
      case "Simulated":
        return `Simulated transfer of ${tx.amount} ${tx.currency} to ${tx.toAddress?.substring(0, 10)}...`
      case "Swap":
        return `Swapped ${tx.amount} ${tx.currency} for ${tx.toCurrency}`
      case "Buy":
        return `Bought ${tx.amount} ${tx.currency}`
      case "Sell":
        return `Sold ${tx.amount} ${tx.currency} for ${tx.toCurrency}`
      case "CashOut":
        return `Cashed out ${tx.amount} ${tx.currency} to ${tx.toCurrency}`
      default:
        return `${tx.type} ${tx.amount} ${tx.currency}`
    }
  }

  const getTransactionLink = (tx: Transaction) => {
    if (!tx.hash || !tx.network) return null

    const networkInfo = getNetworkInfo(tx.network)
    return `${networkInfo.blockExplorerUrl}/tx/${tx.hash}`
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
        <ScrollArea className="h-[300px] rounded-md border p-4">
          {transactions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No transactions yet.</div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx: Transaction) => (
                <div key={tx.id} className="flex items-start space-x-3 text-sm">
                  <div className="mt-0.5">{getTransactionIcon(tx.type)}</div>
                  <div className="flex-1">
                    <div className="font-medium">{tx.type}</div>
                    <div className="text-gray-500">
                      {getTransactionDescription(tx)}
                      {tx.fee && <span className="text-xs ml-1">(Fee: {tx.fee.toFixed(4)})</span>}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center">
                      {formatDate(tx.timestamp)}
                      {tx.hash && (
                        <a
                          href={getTransactionLink(tx) || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 flex items-center text-blue-500 hover:text-blue-700"
                        >
                          View <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-medium ${tx.type === "Deposit" || tx.type === "Buy" ? "text-green-600" : tx.type === "Withdraw" || tx.type === "Sell" || tx.type === "CashOut" ? "text-red-600" : ""}`}
                    >
                      {tx.type === "Deposit" || tx.type === "Buy"
                        ? "+"
                        : tx.type === "Withdraw" ||
                            tx.type === "Sell" ||
                            tx.type === "CashOut" ||
                            tx.type === "Transfer" ||
                            tx.type === "Simulated"
                          ? "-"
                          : ""}
                      {tx.amount} {tx.currency}
                    </div>
                    {tx.toCurrency && tx.type === "Swap" && (
                      <div className="text-xs text-gray-500">
                        Received: {(tx.amount * 0.995).toFixed(6)} {tx.toCurrency}
                      </div>
                    )}
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
