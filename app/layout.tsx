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
import Script from 'next/script'
import WhatsAppButton from '@/components/WhatsAppButton'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Study With Pride - LGBTQ+ Students in Barcelona',
  description: 'Your trusted recruitment agency connecting LGBTQ+ Latin American students with educational opportunities in Barcelona, Spain.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Study With Pride',
  },
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
    const storageKey = 'theme';
    const cookieName = '${THEME_COOKIE}';
    const readCookieTheme = () => {
      const match = document.cookie.match(new RegExp('(?:^|; )' + cookieName + '=([^;]+)'));
      return match ? match[1] : null;
    };
    const storedTheme = window.localStorage.getItem(storageKey);
    const cookieTheme = readCookieTheme();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const themeValue = storedTheme || cookieTheme || (prefersDark ? 'dark' : 'light');
    const theme = themeValue === 'dark' ? 'dark' : 'light';
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.dataset.theme = theme;
    window.localStorage.setItem(storageKey, theme);
    document.cookie = cookieName + '=' + theme + '; path=/; max-age=31536000';
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
  const themeClass = storedTheme === 'dark' ? 'dark' : ''

  return (
    <html lang="en" suppressHydrationWarning className={themeClass}>
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeInitializer }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider initialTheme={storedTheme}>
          <LanguageProvider>
            <IntlProvider>
              <AuthProvider>
                <Header />
                {children}
                <Footer />
                <WhatsAppButton />
              </AuthProvider>
            </IntlProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
