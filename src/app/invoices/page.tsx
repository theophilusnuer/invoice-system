"use client"


import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { InvoiceList } from "@/components/invoice-list"
import { useAuth } from "@/lib/hooks/useAuth"
import { useInvoices } from "@/lib/hooks/useInvoices"

export const dynamic = "force-dynamic"

export default function InvoicesPage() {
  const { user, loading: authLoading } = useAuth()
  const { invoices, loading: invoicesLoading, deleteInvoice } = useInvoices(user?.uid ?? null)
  const router = useRouter()

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    router.push("/auth/login")
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Invoice Log</h1>
          <p className="text-muted-foreground">
            {invoicesLoading ? "Loading..." : `${invoices.length} invoice${invoices.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        {invoicesLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <InvoiceList invoices={invoices} onDelete={deleteInvoice} />
        )}
      </main>
    </div>
  )
}
