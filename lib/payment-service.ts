"use server"

import type { CryptoCurrency, FiatCurrency, PaymentMethod, CashOutMethod, PaymentProvider } from "./types"

// Simulate buying crypto with fiat
export async function buyCrypto(
  amount: number,
  fiatCurrency: FiatCurrency,
  cryptoCurrency: CryptoCurrency,
  paymentMethodId: string,
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate a fake order ID
    const orderId = "ORD-" + Math.random().toString(36).substring(2, 10).toUpperCase()

    return {
      success: true,
      orderId,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to process purchase",
    }
  }
}

// Simulate selling crypto for fiat
export async function sellCrypto(
  amount: number,
  cryptoCurrency: CryptoCurrency,
  fiatCurrency: FiatCurrency,
  cashOutMethodId: string,
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate a fake order ID
    const orderId = "ORD-" + Math.random().toString(36).substring(2, 10).toUpperCase()

    return {
      success: true,
      orderId,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to process sale",
    }
  }
}

// Simulate swapping one crypto for another
export async function swapCrypto(
  fromAmount: number,
  fromCurrency: CryptoCurrency,
  toCurrency: CryptoCurrency,
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate a fake order ID
    const orderId = "SWP-" + Math.random().toString(36).substring(2, 10).toUpperCase()

    return {
      success: true,
      orderId,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to process swap",
    }
  }
}

// Get available payment methods
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock payment methods
  return [
    {
      id: "pm_visa_1",
      type: "card",
      provider: "visa",
      name: "Visa ending in 4242",
      last4: "4242",
      expiryDate: "12/25",
      isDefault: true,
    },
    {
      id: "pm_mastercard_1",
      type: "card",
      provider: "mastercard",
      name: "Mastercard ending in 5555",
      last4: "5555",
      expiryDate: "10/26",
      isDefault: false,
    },
    {
      id: "pm_bank_1",
      type: "bank",
      provider: "bank",
      name: "Chase Bank Account",
      last4: "6789",
      isDefault: false,
    },
    {
      id: "pm_paypal_1",
      type: "digital_wallet",
      provider: "paypal",
      name: "PayPal",
      email: "user@example.com",
      isDefault: false,
    },
    {
      id: "pm_mobile_1",
      type: "mobile_money",
      provider: "mpesa",
      name: "M-Pesa",
      phoneNumber: "+254712345678",
      isDefault: false,
    },
  ]
}

// Get available cash out methods
export async function getCashOutMethods(): Promise<CashOutMethod[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock cash out methods
  return [
    {
      id: "co_bank_1",
      type: "bank",
      provider: "bank",
      name: "Chase Bank Account",
      accountNumber: "****6789",
      routingNumber: "****4321",
      isDefault: true,
    },
    {
      id: "co_paypal_1",
      type: "digital_wallet",
      provider: "paypal",
      name: "PayPal",
      email: "user@example.com",
      isDefault: false,
    },
    {
      id: "co_mobile_1",
      type: "mobile_money",
      provider: "mpesa",
      name: "M-Pesa",
      phoneNumber: "+254712345678",
      isDefault: false,
    },
    {
      id: "co_visa_1",
      type: "card",
      provider: "visa",
      name: "Visa Direct to card ending in 4242",
      last4: "4242",
      isDefault: false,
    },
  ]
}

// Add a new payment method
export async function addPaymentMethod(
  type: string,
  provider: PaymentProvider,
  details: Record<string, string>,
): Promise<{ success: boolean; paymentMethod?: PaymentMethod; error?: string }> {
  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // In a real implementation, this would validate the payment details
    // and register them with the payment provider

    // Create a mock payment method based on the type and provider
    let paymentMethod: PaymentMethod

    switch (type) {
      case "card":
        paymentMethod = {
          id: `pm_${provider}_${Math.random().toString(36).substring(2, 8)}`,
          type: "card",
          provider,
          name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} ending in ${details.last4 || "****"}`,
          last4: details.last4 || "****",
          expiryDate: details.expiryDate || "**/**",
          isDefault: false,
        }
        break
      case "bank":
        paymentMethod = {
          id: `pm_bank_${Math.random().toString(36).substring(2, 8)}`,
          type: "bank",
          provider: "bank",
          name: details.bankName || "Bank Account",
          last4: details.accountLast4 || "****",
          isDefault: false,
        }
        break
      case "digital_wallet":
        paymentMethod = {
          id: `pm_${provider}_${Math.random().toString(36).substring(2, 8)}`,
          type: "digital_wallet",
          provider,
          name: `${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
          email: details.email || "user@example.com",
          isDefault: false,
        }
        break
      case "mobile_money":
        paymentMethod = {
          id: `pm_${provider}_${Math.random().toString(36).substring(2, 8)}`,
          type: "mobile_money",
          provider,
          name: `${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
          phoneNumber: details.phoneNumber || "+1234567890",
          isDefault: false,
        }
        break
      default:
        return {
          success: false,
          error: "Unsupported payment method type",
        }
    }

    return {
      success: true,
      paymentMethod,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to add payment method",
    }
  }
}

// Add a new cash out method
export async function addCashOutMethod(
  type: string,
  provider: PaymentProvider,
  details: Record<string, string>,
): Promise<{ success: boolean; cashOutMethod?: CashOutMethod; error?: string }> {
  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // In a real implementation, this would validate the cash out details
    // and register them with the payment provider

    // Create a mock cash out method based on the type and provider
    let cashOutMethod: CashOutMethod

    switch (type) {
      case "bank":
        cashOutMethod = {
          id: `co_bank_${Math.random().toString(36).substring(2, 8)}`,
          type: "bank",
          provider: "bank",
          name: details.bankName || "Bank Account",
          accountNumber: details.accountNumber ? `****${details.accountNumber.slice(-4)}` : "****1234",
          routingNumber: details.routingNumber ? `****${details.routingNumber.slice(-4)}` : "****5678",
          isDefault: false,
        }
        break
      case "digital_wallet":
        cashOutMethod = {
          id: `co_${provider}_${Math.random().toString(36).substring(2, 8)}`,
          type: "digital_wallet",
          provider,
          name: `${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
          email: details.email || "user@example.com",
          isDefault: false,
        }
        break
      case "mobile_money":
        cashOutMethod = {
          id: `co_${provider}_${Math.random().toString(36).substring(2, 8)}`,
          type: "mobile_money",
          provider,
          name: `${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
          phoneNumber: details.phoneNumber || "+1234567890",
          isDefault: false,
        }
        break
      case "card":
        cashOutMethod = {
          id: `co_${provider}_${Math.random().toString(36).substring(2, 8)}`,
          type: "card",
          provider,
          name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Direct to card ending in ${
            details.last4 || "****"
          }`,
          last4: details.last4 || "****",
          isDefault: false,
        }
        break
      default:
        return {
          success: false,
          error: "Unsupported cash out method type",
        }
    }

    return {
      success: true,
      cashOutMethod,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to add cash out method",
    }
  }
}
