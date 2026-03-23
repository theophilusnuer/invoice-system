"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, PlusCircle, LogOut, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/hooks/useAuth"
import { cn } from "@/lib/utils"

export function Navigation() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
              <FileText className="h-5 w-5" />
              <span>InvoiceApp</span>
            </Link>
            <div className="flex items-center gap-1">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(pathname === "/" && "bg-accent")}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Invoice
                </Button>
              </Link>
              <Link href="/invoices">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(pathname.startsWith("/invoices") && "bg-accent")}
                >
                  <List className="mr-2 h-4 w-4" />
                  Invoice Log
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.displayName ?? user.email}
            </span>
            {user.photoURL && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt="avatar"
                className="h-8 w-8 rounded-full"
              />
            )}
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sign out</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
