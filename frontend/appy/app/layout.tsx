import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Business Dashboard",
  description: "Manage your business inventory, credits, and competitions",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <div id="toast-container" className="fixed top-4 right-4 z-50 space-y-2"></div>
      </body>
    </html>
  )
}
