'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, ArrowLeft, FileText } from 'lucide-react';

export default function TerminosServicioPage() {
  return (
    <div className="min-h-screen bg-background text-[#201816] flex flex-col">
      <header className="sticky top-0 z-40 glass-panel border-b border-[#d5c2bd] px-4 lg:px-8 py-3">
        <div className="max-w-[900px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#2f1e18] flex items-center justify-center shadow-lg shadow-[#2f1e18]/15 shrink-0">
              <BookOpen className="w-5 h-5 text-[#fff8f4]" />
            </div>
            <div className="min-w-0">
              <h1 className="font-headline text-xl sm:text-2xl tracking-tight text-[#36160c] truncate">Términos del Servicio</h1>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#fffaf7] hover:bg-[#f6efe8] text-[#201816] text-xs font-semibold px-4 py-2.5 rounded-xl border border-[#d7c7c0] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al catálogo</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 lg:px-8 py-12">
        <div className="max-w-[900px] mx-auto">
          <div className="glass-panel border border-[#d7c7c0] rounded-3xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#e6d8d2]">
              <div className="w-12 h-12 rounded-xl bg-[#efe3db] text-[#6f5249] flex items-center justify-center border border-[#d7c7c0]">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-headline text-2xl text-[#201816]">Términos del Servicio</h2>
                <p className="text-sm text-[#7c6b64]">Última actualización: Julio 2026</p>
              </div>
            </div>

            <div className="space-y-6 text-sm text-[#201816] leading-relaxed">
              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">1. Aceptación de los términos</h3>
                <p className="text-[#7c6b64]">
                  Al utilizar el sitio web y el sistema de inventario de Papelería El Cuaderno Dorado, usted acepta
                  los presentes términos y condiciones. Si no está de acuerdo con alguno de estos términos, le
                  solicitamos que no utilice nuestros servicios.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">2. Uso del sistema</h3>
                <p className="text-[#7c6b64]">
                  El sistema de inventario está diseñado para la gestión interna de productos, ventas y movimientos
                  de stock. El acceso al panel de administración está restringido a personal autorizado. El catálogo
                  público es de libre acceso para consulta de productos y precios.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">3. Precios y disponibilidad</h3>
                <p className="text-[#7c6b64]">
                  Los precios mostrados en el catálogo público están expresados en pesos mexicanos (MXN) e incluyen
                  el Impuesto al Valor Agregado (IVA). La disponibilidad de productos está sujeta a cambios sin
                  previo aviso. El carrito de compras es únicamente una herramienta de previsualización y no
                  constituye una orden de compra.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">4. Propiedad intelectual</h3>
                <p className="text-[#7c6b64]">
                  Todo el contenido del sitio web, incluyendo imágenes, textos, logotipos y diseño, es propiedad
                  de Papelería El Cuaderno Dorado, a menos que se indique lo contrario. Queda prohibida su
                  reproducción total o parcial sin autorización expresa.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">5. Limitación de responsabilidad</h3>
                <p className="text-[#7c6b64]">
                  Papelería El Cuaderno Dorado no se hace responsable por daños directos o indirectos derivados del
                  uso del sistema de inventario o del catálogo público. El usuario asume la responsabilidad total
                  por el uso que dé a la información proporcionada.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">6. Modificaciones</h3>
                <p className="text-[#7c6b64]">
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones
                  serán efectivas inmediatamente después de su publicación. El uso continuado del sitio constituye
                  la aceptación de los términos modificados.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#2f1e18] text-[#f5efed] py-6 px-4 lg:px-8">
        <div className="max-w-[900px] mx-auto text-center text-sm text-[#d9c8c0]">
          <p>© 2026 Papelería El Cuaderno Dorado. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
