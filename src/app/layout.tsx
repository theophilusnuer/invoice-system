import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"

export const metadata: Metadata = {
  title: "Invoice System",
  description: "A simple, cloud-synced invoicing system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
