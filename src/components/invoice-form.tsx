"use client"

import { useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { PlusCircle, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Invoice } from "@/lib/types"

const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  rate: z.coerce.number().min(0, "Rate must be non-negative"),
  amount: z.coerce.number(),
})

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  status: z.enum(["draft", "sent", "paid"]),
  dueDate: z.string().min(1, "Due date is required"),
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Invalid email"),
  clientAddress: z.string().min(1, "Client address is required"),
  companyName: z.string().min(1, "Company name is required"),
  companyAddress: z.string().min(1, "Company address is required"),
  companyLogo: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, "At least one item is required"),
  taxRate: z.coerce.number().min(0).max(100),
  notes: z.string().optional(),
})

export type InvoiceFormValues = z.infer<typeof invoiceSchema>

interface InvoiceFormProps {
  defaultValues?: Partial<Invoice>
  onSubmit: (data: InvoiceFormValues) => Promise<void>
  onPreviewChange?: (data: Partial<InvoiceFormValues>) => void
  isLoading?: boolean
  submitLabel?: string
}

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

function generateInvoiceNumber() {
  const date = new Date()
  return `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`
}

export function InvoiceForm({
  defaultValues,
  onSubmit,
  onPreviewChange,
  isLoading = false,
  submitLabel = "Save Invoice",
}: InvoiceFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: defaultValues?.invoiceNumber ?? generateInvoiceNumber(),
      status: defaultValues?.status ?? "draft",
      dueDate: defaultValues?.dueDate ?? "",
      clientName: defaultValues?.clientName ?? "",
      clientEmail: defaultValues?.clientEmail ?? "",
      clientAddress: defaultValues?.clientAddress ?? "",
      companyName: defaultValues?.companyName ?? "",
      companyAddress: defaultValues?.companyAddress ?? "",
      companyLogo: defaultValues?.companyLogo ?? "",
      lineItems: defaultValues?.lineItems?.length
        ? defaultValues.lineItems
        : [{ id: generateId(), description: "", quantity: 1, rate: 0, amount: 0 }],
      taxRate: defaultValues?.taxRate ?? 0,
      notes: defaultValues?.notes ?? "",
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "lineItems" })

  const watchedValues = watch()

  // Auto-calculate line item amounts
  useEffect(() => {
    watchedValues.lineItems?.forEach((item, index) => {
      const amount = (item.quantity || 0) * (item.rate || 0)
      if (amount !== item.amount) {
        setValue(`lineItems.${index}.amount`, amount)
      }
    })
  }, [watchedValues.lineItems, setValue])

  // Notify parent for preview
  useEffect(() => {
    if (onPreviewChange) {
      onPreviewChange(watchedValues)
    }
  }, [watchedValues, onPreviewChange])

  const subtotal = watchedValues.lineItems?.reduce((sum, item) => sum + (item.amount || 0), 0) ?? 0
  const taxAmount = (subtotal * (watchedValues.taxRate || 0)) / 100
  const total = subtotal + taxAmount

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="invoiceNumber">Invoice #</Label>
            <Input id="invoiceNumber" {...register("invoiceNumber")} />
            {errors.invoiceNumber && <p className="text-xs text-destructive mt-1">{errors.invoiceNumber.message}</p>}
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input id="dueDate" type="date" {...register("dueDate")} />
            {errors.dueDate && <p className="text-xs text-destructive mt-1">{errors.dueDate.message}</p>}
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select id="status" {...register("status")}>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle>Your Company</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" {...register("companyName")} placeholder="Acme Inc." />
            {errors.companyName && <p className="text-xs text-destructive mt-1">{errors.companyName.message}</p>}
          </div>
          <div>
            <Label htmlFor="companyLogo">Logo URL (optional)</Label>
            <Input id="companyLogo" {...register("companyLogo")} placeholder="https://..." />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="companyAddress">Company Address</Label>
            <Textarea id="companyAddress" {...register("companyAddress")} placeholder="123 Main St, City, State 12345" rows={2} />
            {errors.companyAddress && <p className="text-xs text-destructive mt-1">{errors.companyAddress.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Client Info */}
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="clientName">Client Name</Label>
            <Input id="clientName" {...register("clientName")} placeholder="Jane Smith" />
            {errors.clientName && <p className="text-xs text-destructive mt-1">{errors.clientName.message}</p>}
          </div>
          <div>
            <Label htmlFor="clientEmail">Client Email</Label>
            <Input id="clientEmail" type="email" {...register("clientEmail")} placeholder="jane@example.com" />
            {errors.clientEmail && <p className="text-xs text-destructive mt-1">{errors.clientEmail.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="clientAddress">Client Address</Label>
            <Textarea id="clientAddress" {...register("clientAddress")} placeholder="456 Client St, City, State 67890" rows={2} />
            {errors.clientAddress && <p className="text-xs text-destructive mt-1">{errors.clientAddress.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="hidden sm:grid sm:grid-cols-12 gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
              <span className="col-span-5">Description</span>
              <span className="col-span-2 text-right">Qty</span>
              <span className="col-span-2 text-right">Rate</span>
              <span className="col-span-2 text-right">Amount</span>
              <span className="col-span-1" />
            </div>
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-12 sm:col-span-5">
                  <Input
                    {...register(`lineItems.${index}.description`)}
                    placeholder="Item description"
                  />
                  {errors.lineItems?.[index]?.description && (
                    <p className="text-xs text-destructive">{errors.lineItems[index]?.description?.message}</p>
                  )}
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    {...register(`lineItems.${index}.quantity`)}
                    placeholder="1"
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register(`lineItems.${index}.rate`)}
                    placeholder="0.00"
                  />
                </div>
                <div className="col-span-3 sm:col-span-2 text-right">
                  <span className="text-sm font-medium">
                    {formatCurrency((watchedValues.lineItems?.[index]?.amount) || 0)}
                  </span>
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ id: generateId(), description: "", quantity: 1, rate: 0, amount: 0 })}
            className="mt-4"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Item
          </Button>

          <Separator className="my-4" />

          <div className="flex justify-end">
            <div className="w-48 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">Tax %</span>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  {...register("taxRate")}
                  className="h-8 w-20 text-right"
                />
              </div>
              {(watchedValues.taxRate || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax Amount</span>
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
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register("notes")}
            placeholder="Payment terms, thank you note, etc."
            rows={3}
          />
        </CardContent>
      </Card>

      <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  )
}
