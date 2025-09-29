import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../styles/globals.css';

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
    <html lang="es">
      <head>
        <link rel="preload" as="image" href="/hero/montanas.jpg" />
      </head>
      <body>
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: -1,
            backgroundColor: '#000'
          }}
        />
        {children}
      </body>
    </html>
  );
}
