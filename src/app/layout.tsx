import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';

import { ThemeScript } from '@/shared/ui/theme/theme-script';

import './globals.css';

/** Display serifada — reservada a números e títulos, onde o produto vira "caro". */
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

/** Sans de interface — legibilidade acima de personalidade. */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'RoHair',
    template: '%s · RoHair',
  },
  description:
    'O sistema operacional do negócio de uma profissional autônoma da beleza.',
  applicationName: 'RoHair',
  appleWebApp: {
    capable: true,
    title: 'RoHair',
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Ocupa a tela inteira do iPhone, incluindo a área do notch.
  // O zoom por pinça permanece habilitado — desligá-lo violaria a WCAG 2.2.
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fdfbfa' },
    { media: '(prefers-color-scheme: dark)', color: '#231a20' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="h-full" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${fraunces.variable} ${inter.variable} flex min-h-full flex-col bg-canvas text-ink antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
