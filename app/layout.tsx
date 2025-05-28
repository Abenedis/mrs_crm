import type { Metadata } from 'next'
import './globals.css'
import { ToasterProvider } from './toaster-provider'

export const metadata: Metadata = {
  title: 'Dentak CRM',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <ToasterProvider />
      </body>
    </html>
  )
}
