export interface LineItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface Invoice {
  id: string
  userId: string
  invoiceNumber: string
  status: "draft" | "sent" | "paid"
  createdAt: Date | string
  updatedAt: Date | string
  dueDate: string
  // Client info
  clientName: string
  clientEmail: string
  clientAddress: string
  // Company info
  companyName: string
  companyAddress: string
  companyLogo?: string
  // Items
  lineItems: LineItem[]
  // Totals
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  // Notes
  notes?: string
}

export type InvoiceFormData = Omit<Invoice, "id" | "userId" | "createdAt" | "updatedAt" | "subtotal" | "taxAmount" | "total">
