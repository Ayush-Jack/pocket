import type { Metadata } from 'next'
import { Atkinson_Hyperlegible, DM_Mono, Sora } from 'next/font/google'
import { SmoothScroll } from '@/components/smooth-scroll'
import './globals.css'

const display = Sora({ subsets: ['latin'], variable: '--font-display', weight: ['500', '600'] })
const body = Atkinson_Hyperlegible({ subsets: ['latin'], variable: '--font-body', weight: ['400', '700'] })
const mono = DM_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400'] })

export const metadata: Metadata = {
  title: 'Pocket',
  description: 'Your Files. Your Space',
  applicationName: 'Pocket',
  manifest: '/brand/site.webmanifest',
  icons: {
    icon: [
      { url: '/brand/favicon.ico' },
      { url: '/brand/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/brand/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/brand/apple-touch-icon.png', sizes: '180x180' }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable} min-h-screen antialiased`}>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  )
}
