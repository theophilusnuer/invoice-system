"use client"

import { useState, useEffect } from "react"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { getFirebaseDb } from "@/lib/firebase"
import type { Invoice, InvoiceFormData } from "@/lib/types"

function serializeInvoice(data: Record<string, unknown>, id: string): Invoice {
  const createdAt = data.createdAt instanceof Timestamp
    ? data.createdAt.toDate().toISOString()
    : (data.createdAt as string) ?? new Date().toISOString()
  const updatedAt = data.updatedAt instanceof Timestamp
    ? data.updatedAt.toDate().toISOString()
    : (data.updatedAt as string) ?? new Date().toISOString()
  return { ...data, id, createdAt, updatedAt } as Invoice
}

export function useInvoices(userId: string | null) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setInvoices([])
      setLoading(false)
      return
    }

    const db = getFirebaseDb()
    const q = query(
      collection(db, "invoices"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) =>
          serializeInvoice(d.data(), d.id)
        )
        setInvoices(docs)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId])

  const createInvoice = async (data: InvoiceFormData): Promise<string> => {
    if (!userId) throw new Error("Not authenticated")
    const subtotal = data.lineItems.reduce((sum, item) => sum + item.amount, 0)
    const taxAmount = (subtotal * data.taxRate) / 100
    const total = subtotal + taxAmount

    const docRef = await addDoc(collection(getFirebaseDb(), "invoices"), {
      ...data,
      userId,
      subtotal,
      taxAmount,
      total,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  }

  const updateInvoice = async (id: string, data: Partial<InvoiceFormData>): Promise<void> => {
    const subtotal = data.lineItems
      ? data.lineItems.reduce((sum, item) => sum + item.amount, 0)
      : undefined

    const updates: Record<string, unknown> = { ...data, updatedAt: serverTimestamp() }
    if (subtotal !== undefined && data.taxRate !== undefined) {
      const taxAmount = (subtotal * data.taxRate) / 100
      updates.subtotal = subtotal
      updates.taxAmount = taxAmount
      updates.total = subtotal + taxAmount
    }

    await updateDoc(doc(getFirebaseDb(), "invoices", id), updates)
  }

  const deleteInvoice = async (id: string): Promise<void> => {
    await deleteDoc(doc(getFirebaseDb(), "invoices", id))
  }

  return { invoices, loading, error, createInvoice, updateInvoice, deleteInvoice }
}
