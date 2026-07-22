import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Papelería El Cuaderno Dorado - Catálogo y Administración',
  description: 'Sistema integral de gestión de inventario, ventas y catálogo público para papelerías.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="light">
      <body className="min-h-screen bg-background text-on-background antialiased">
        {children}
      </body>
    </html>
  );
}
