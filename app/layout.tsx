import type { Metadata } from 'next'
import '../styles/globals.css'
import Providers from '@/components/layout/Providers'

export const metadata: Metadata = {
  title: 'Код Вечности: 4N',
  description: 'Цифровая Вальхалла — Web3 экосистема на блокчейне TON',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/icons/ton-logo.svg" type="image/svg+xml" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
