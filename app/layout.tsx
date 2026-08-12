import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Papelería - Catálogo y Administración',
  description: 'Sistema integral de gestión de inventario, ventas y catálogo público para papelerías.',
  icons: { icon: '/icon.webp' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Francois+One&display=swap"
        />
      </head>
      <body className="min-h-screen bg-background text-on-background antialiased">
        {children}
      </body>
    </html>
  );
}
