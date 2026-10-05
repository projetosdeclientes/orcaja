import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OrçaJá – Orçamentos na hora',
  description: 'Gerador de orçamentos por medida para pequenas empresas.',
  manifest: '/manifest.json',
  themeColor: '#0F62FE',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'OrçaJá' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={geist.className}>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
