"use client"

import Link from "next/link"
import { Eye, Edit, Trash2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Invoice } from "@/lib/types"

interface InvoiceListProps {
  invoices: Invoice[]
  onDelete: (id: string) => void
}

const statusColors: Record<Invoice["status"], "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  sent: "default",
  paid: "outline",
}

export function InvoiceList({ invoices, onDelete }: InvoiceListProps) {
  const formatDate = (date: string | Date) => {
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (_e) {
      return "—"
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No invoices yet</h3>
        <p className="text-muted-foreground mt-1">Create your first invoice to get started</p>
        <Button asChild className="mt-4">
          <Link href="/">Create Invoice</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {invoices.map((invoice) => (
        <Card key={invoice.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-8 w-8 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium truncate">#{invoice.invoiceNumber}</p>
                    <Badge variant={statusColors[invoice.status]}>{invoice.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{invoice.clientName}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(invoice.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <p className="font-semibold text-right hidden sm:block">{formatCurrency(invoice.total)}</p>
                <Link href={`/invoices/${invoice.id}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                </Link>
                <Link href={`/invoices/${invoice.id}?edit=true`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => {
                    if (confirm(`Delete invoice #${invoice.invoiceNumber}?`)) {
                      onDelete(invoice.id)
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
