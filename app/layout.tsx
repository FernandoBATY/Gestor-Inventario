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
    <html lang="es">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
