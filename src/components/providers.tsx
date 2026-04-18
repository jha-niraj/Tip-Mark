"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { AuthModalProvider } from "@/components/auth/auth-modal-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <AuthModalProvider>
          {children}
        </AuthModalProvider>
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </SessionProvider>
  )
}
