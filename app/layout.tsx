import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Poppins } from 'next/font/google';
import HeaderMenu from '@/components/HeaderMenu';
import '../styles/globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '600'],
  variable: '--font-poppins',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Montañas | Parallax',
  description: 'Experiencia inmersiva con parallax 3D usando mapa de profundidad.'
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="es" className={poppins.variable}>
      <head>
        <link rel="preload" as="image" href="/hero/montanas.jpg" />
      </head>
      <body className={poppins.className}>
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: -1,
            backgroundColor: '#000'
          }}
        />
        <HeaderMenu />
        {children}
      </body>
    </html>
  );
}
