import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { IntlProvider } from '@/components/IntlProvider'
import { AuthProvider } from '@/components/AuthContext'
import { LanguageProvider } from '@/components/LanguageContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Study With Pride - LGBTQ+ Students in Barcelona',
  description: 'Your trusted recruitment agency connecting LGBTQ+ Latin American students with educational opportunities in Barcelona, Spain.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <IntlProvider>
            <AuthProvider>
              <Header />
              {children}
              <Footer />
            </AuthProvider>
          </IntlProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
