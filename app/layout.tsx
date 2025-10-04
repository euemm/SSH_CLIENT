import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../src/index.css'
import '../public/styles/liquid-glass.css'
import '@xterm/xterm/css/xterm.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SSH Client',
  description: 'Modern SSH client built with Next.js',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/icons/EUEM_LIGHT.png', media: '(prefers-color-scheme: light)' },
      { url: '/icons/EUEM_DARK.png', media: '(prefers-color-scheme: dark)' }
    ],
    shortcut: '/favicon.ico',
    apple: '/icons/EUEM_LIGHT.png'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
