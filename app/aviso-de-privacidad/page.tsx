'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, ArrowLeft, Shield } from 'lucide-react';

export default function AvisoPrivacidadPage() {
  return (
    <div className="min-h-screen bg-background text-[#201816] flex flex-col">
      <header className="sticky top-0 z-40 glass-panel border-b border-[#d5c2bd] px-4 lg:px-8 py-3">
        <div className="max-w-[900px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#2f1e18] flex items-center justify-center shadow-lg shadow-[#2f1e18]/15 shrink-0">
              <BookOpen className="w-5 h-5 text-[#fff8f4]" />
            </div>
            <div className="min-w-0">
              <h1 className="font-headline text-xl sm:text-2xl tracking-tight text-[#36160c] truncate">Aviso de Privacidad</h1>
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
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-headline text-2xl text-[#201816]">Aviso de Privacidad</h2>
                <p className="text-sm text-[#7c6b64]">Última actualización: Julio 2026</p>
              </div>
            </div>

            <div className="space-y-6 text-sm text-[#201816] leading-relaxed">
              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">1. Identidad y domicilio del responsable</h3>
                <p className="text-[#7c6b64]">
                  Papelería El Cuaderno Dorado, con domicilio en Ciudad de México, México, es el responsable del
                  tratamiento de sus datos personales. Para cualquier duda o aclaración, puede contactarnos a través del
                  correo electrónico: contacto@cuadernodorado.mx.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">2. Datos personales que recabamos</h3>
                <p className="text-[#7c6b64]">
                  En Papelería El Cuaderno Dorado no recabamos datos personales de los usuarios que navegan en nuestro
                  catálogo público. La única información que se almacena localmente en su navegador es la selección
                  temporal de productos en el carrito de compras, la cual no es compartida con terceros ni almacenada
                  en nuestros servidores.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">3. Finalidad del tratamiento</h3>
                <p className="text-[#7c6b64]">
                  Los datos que pudieran recabarse en el panel de administración son utilizados exclusivamente para la
                  gestión interna del inventario, control de ventas y generación de reportes. No se compartirán con
                  terceros sin su consentimiento explícito.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">4. Derechos ARCO</h3>
                <p className="text-[#7c6b64]">
                  Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales
                  (derechos ARCO). Para ejercer estos derechos, puede enviar una solicitud a
                  contacto@cuadernodorado.mx.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">5. Cambios al aviso de privacidad</h3>
                <p className="text-[#7c6b64]">
                  Nos reservamos el derecho de modificar el presente aviso de privacidad en cualquier momento. Las
                  modificaciones entrarán en vigor inmediatamente después de su publicación en esta página.
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
