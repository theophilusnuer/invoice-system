"use client"

export const dynamic = "force-dynamic"

import { Suspense, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, ArrowLeft, Edit, X } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { InvoiceForm, type InvoiceFormValues } from "@/components/invoice-form"
import { InvoicePreview } from "@/components/invoice-preview"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/hooks/useAuth"
import { useInvoices } from "@/lib/hooks/useInvoices"

interface PageProps {
  params: { id: string }
}

function InvoiceDetailContent({ params }: PageProps) {
  const { user, loading: authLoading } = useAuth()
  const { invoices, loading: invoicesLoading, updateInvoice } = useInvoices(user?.uid ?? null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isEditing, setIsEditing] = useState(searchParams.get("edit") === "true")
  const [isSaving, setIsSaving] = useState(false)
  const [previewData, setPreviewData] = useState<Partial<InvoiceFormValues>>({})

  const invoice = invoices.find((inv) => inv.id === params.id)

  const handlePreviewChange = useCallback((data: Partial<InvoiceFormValues>) => {
    setPreviewData(data)
  }, [])

  const handleSubmit = async (data: InvoiceFormValues) => {
    try {
      setIsSaving(true)
      await updateInvoice(params.id, data)
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update invoice:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading || invoicesLoading) {
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

  if (!invoice) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <p className="text-muted-foreground">Invoice not found.</p>
          <Link href="/invoices">
            <Button variant="link" className="p-0 mt-2">← Back to invoices</Button>
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Link href="/invoices">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">#{invoice.invoiceNumber}</h1>
            <Badge variant={invoice.status === "paid" ? "outline" : invoice.status === "sent" ? "default" : "secondary"}>
              {invoice.status}
            </Badge>
          </div>
          <Button
            variant={isEditing ? "outline" : "default"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Cancel Edit
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Edit Invoice
              </>
            )}
          </Button>
        </div>

        {isEditing ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <InvoiceForm
              defaultValues={invoice}
              onSubmit={handleSubmit}
              onPreviewChange={handlePreviewChange}
              isLoading={isSaving}
              submitLabel="Update Invoice"
            />
            <div className="lg:sticky lg:top-8 lg:self-start">
              <h2 className="text-lg font-semibold mb-4">Preview</h2>
              <InvoicePreview invoice={previewData} />
            </div>
          </div>
        ) : (
          <div className="max-w-2xl">
            <InvoicePreview invoice={invoice} showExport />
          </div>
        )}
      </main>
    </div>
  )
}

export default function InvoiceDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <InvoiceDetailContent params={params} />
    </Suspense>
  )
}
