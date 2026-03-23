"use client"

import { useRef } from "react"
import { Download, FileImage } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Invoice } from "@/lib/types"

interface InvoicePreviewProps {
  invoice: Partial<Invoice>
  showExport?: boolean
}

export function InvoicePreview({ invoice, showExport = false }: InvoicePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const subtotal = invoice.lineItems?.reduce((sum, item) => sum + item.amount, 0) ?? 0
  const taxAmount = ((invoice.taxRate ?? 0) * subtotal) / 100
  const total = subtotal + taxAmount

  const downloadPDF = async () => {
    if (!previewRef.current) return
    const html2canvas = (await import("html2canvas")).default
    const { jsPDF } = await import("jspdf")

    const canvas = await html2canvas(previewRef.current, { scale: 2 })
    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
    pdf.save(`invoice-${invoice.invoiceNumber ?? "draft"}.pdf`)
  }

  const downloadImage = async () => {
    if (!previewRef.current) return
    const html2canvas = (await import("html2canvas")).default

    const canvas = await html2canvas(previewRef.current, { scale: 2 })
    const link = document.createElement("a")
    link.download = `invoice-${invoice.invoiceNumber ?? "draft"}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  return (
    <div className="space-y-4">
      {showExport && (
        <div className="flex gap-2">
          <Button onClick={downloadPDF} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button onClick={downloadImage} variant="outline" size="sm">
            <FileImage className="mr-2 h-4 w-4" />
            Export PNG
          </Button>
        </div>
      )}

      <div
        ref={previewRef}
        className="bg-white text-gray-900 p-8 rounded-lg border shadow-sm min-h-[600px]"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            {invoice.companyLogo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={invoice.companyLogo} alt="Company logo" className="h-16 mb-2 object-contain" />
            )}
            <h2 className="text-xl font-bold text-gray-900">{invoice.companyName || "Your Company"}</h2>
            <p className="text-sm text-gray-500 whitespace-pre-line">{invoice.companyAddress}</p>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
            <p className="text-sm text-gray-500 mt-1">#{invoice.invoiceNumber || "001"}</p>
            <div className="mt-2 text-sm">
              <p><span className="text-gray-500">Date: </span>{formatDate(invoice.createdAt as string | Date)}</p>
              <p><span className="text-gray-500">Due: </span>{formatDate(invoice.dueDate)}</p>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bill To */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Bill To</h3>
          <p className="font-semibold">{invoice.clientName || "Client Name"}</p>
          <p className="text-sm text-gray-600">{invoice.clientEmail}</p>
          <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.clientAddress}</p>
        </div>

        {/* Line Items */}
        <table className="w-full mb-6">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Description</th>
              <th className="py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Qty</th>
              <th className="py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Rate</th>
              <th className="py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems && invoice.lineItems.length > 0 ? (
              invoice.lineItems.map((item, i) => (
                <tr key={item.id || i} className="border-b border-gray-100">
                  <td className="py-3 text-sm">{item.description || "—"}</td>
                  <td className="py-3 text-sm text-right">{item.quantity}</td>
                  <td className="py-3 text-sm text-right">{formatCurrency(item.rate)}</td>
                  <td className="py-3 text-sm text-right font-medium">{formatCurrency(item.amount)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm text-gray-400">
                  No items added yet
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-48 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {(invoice.taxRate ?? 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax ({invoice.taxRate}%)</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Notes</h3>
            <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
