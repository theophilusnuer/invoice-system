"use client"

export const dynamic = "force-dynamic"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { InvoiceForm, type InvoiceFormValues } from "@/components/invoice-form"
import { InvoicePreview } from "@/components/invoice-preview"
import { useAuth } from "@/lib/hooks/useAuth"
import { useInvoices } from "@/lib/hooks/useInvoices"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { createInvoice } = useInvoices(user?.uid ?? null)
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [previewData, setPreviewData] = useState<Partial<InvoiceFormValues>>({})

  const handlePreviewChange = useCallback((data: Partial<InvoiceFormValues>) => {
    setPreviewData(data)
  }, [])

  const handleSubmit = async (data: InvoiceFormValues) => {
    if (!user) return
    try {
      setIsSaving(true)
      const id = await createInvoice(data)
      router.push(`/invoices/${id}`)
    } catch (error) {
      console.error("Failed to create invoice:", error)
    } finally {
      setIsSaving(false)
    }
  }

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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Create New Invoice</h1>
          <p className="text-muted-foreground">Fill in the details and see a live preview</p>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <InvoiceForm
            onSubmit={handleSubmit}
            onPreviewChange={handlePreviewChange}
            isLoading={isSaving}
            submitLabel="Create Invoice"
          />
          <div className="lg:sticky lg:top-8 lg:self-start">
            <h2 className="text-lg font-semibold mb-4">Preview</h2>
            <InvoicePreview invoice={previewData} />
          </div>
        </div>
      </main>
    </div>
  )
}
