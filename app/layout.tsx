import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/context/AuthContext"  // import your AuthProvider
import { Navigation } from "@/components/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Collabrix - Collaborative Project Management Platform",
  description: "Modern collaborative project and task management platform",
  icons: {
    icon: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
          <AuthProvider>
            <Navigation />
            {children}
            <Toaster />
          </AuthProvider>
      </body>
    </html>
  )
}
