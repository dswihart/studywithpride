import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { IntlProvider } from '@/components/IntlProvider'
import { AuthProvider } from '@/components/AuthContext'
import { LanguageProvider } from '@/components/LanguageContext'
import { ThemeProvider, type Theme } from '@/components/ThemeProvider'
import { cookies } from 'next/headers'

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

const THEME_COOKIE = 'theme'

const themeInitializer = `(() => {
  try {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = storedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dataset.theme = theme;
  } catch (error) {
    console.warn('Theme init failed', error);
  }
})();`

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const storedTheme = (cookieStore.get(THEME_COOKIE)?.value as Theme | undefined) || 'light'
  const bodyClass = `${inter.className} ${storedTheme === 'dark' ? 'dark' : ''}`.trim()

  return (
    <html lang="en">
      <body className={bodyClass}>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitializer }}
        />
        <ThemeProvider initialTheme={storedTheme}>
          <LanguageProvider>
            <IntlProvider>
              <AuthProvider>
                <Header />
                {children}
                <Footer />
              </AuthProvider>
            </IntlProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
