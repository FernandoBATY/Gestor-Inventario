'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TerminosServicioPage() {
  return (
    <div className="min-h-screen bg-background text-[#201816] flex flex-col">
      <header className="sticky top-0 z-40 glass-panel border-b border-[#d5c2bd] px-4 lg:px-8 py-3">
        <div className="max-w-[900px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/icon.png" alt="Logo Papelería" className="w-10 h-10 object-contain shrink-0" />
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
                <p className="text-sm text-[#7c6b64]">Última actualización: Agosto 2026</p>
              </div>
            </div>

            <div className="space-y-6 text-sm text-[#201816] leading-relaxed">
              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">1. Aceptación de los términos</h3>
                <p className="text-[#7c6b64]">
                  Al utilizar el catálogo público, el carrito de compras o el panel de administración de Papelería,
                  usted acepta los presentes términos y condiciones. Si no está de acuerdo con alguno de ellos, le
                  solicitamos que no utilice nuestros servicios.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">2. Descripción del servicio</h3>
                <p className="text-[#7c6b64]">
                  Nuestro sitio ofrece un catálogo público de productos con consulta de precios y disponibilidad, así
                  como herramientas internas de administración para la gestión de inventario, ventas, mermas, gastos,
                  cortes de caja y reportes. El catálogo público es de libre acceso; el panel de administración está
                  restringido a personal autorizado mediante autenticación.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">3. Carrito de compras</h3>
                <p className="text-[#7c6b64]">
                  El carrito de compras es únicamente una herramienta de previsualización que se guarda de forma local
                  en su navegador. <span className="font-semibold text-[#201816]">No constituye una orden de compra</span>.
                  La compra se formaliza exclusivamente en el punto de venta de la tienda. Los totales mostrados son
                  aproximados y dependen del stock y precios vigentes al momento de la venta.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">4. Carrito compartido</h3>
                <p className="text-[#7c6b64]">
                  La función "Compartir carrito" genera un enlace temporal con los artículos seleccionados. El enlace
                  tiene una validez de 7 días y permite a la persona que lo reciba consultar la misma selección.
                  Papelería no garantiza la disponibilidad ni el precio final de los artículos contenidos en un enlace
                  compartido, ya que ambos están sujetos a cambios. El enlace no constituye una oferta comercial ni una
                  reserva de mercancía.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">5. Precios y disponibilidad</h3>
                <p className="text-[#7c6b64]">
                  Los precios mostrados en el catálogo público están expresados en pesos mexicanos (MXN). La
                  disponibilidad de los productos está sujeta a cambios día con día sin previo aviso, por lo que el
                  stock visible puede diferir del existente en tienda al momento de la visita. Las fotografías son
                  ilustrativas.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">6. Uso del panel de administración</h3>
                <p className="text-[#7c6b64]">
                  El acceso al panel está restringido a personal autorizado y es de carácter confidencial. El usuario
                  autorizado es responsable de resguardar sus credenciales y de todas las operaciones realizadas con su
                  sesión. Está prohibido compartir credenciales o permitir el acceso a personas no autorizadas.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">7. Devoluciones</h3>
                <p className="text-[#7c6b64]">
                  Las devoluciones de productos se sujetan a las políticas vigentes de la tienda y se registran en el
                  sistema a través del personal autorizado. Papelería se reserva el derecho de aceptar o rechazar una
                  devolución conforme a dichas políticas.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">8. Propiedad intelectual</h3>
                <p className="text-[#7c6b64]">
                  Todo el contenido del sitio web, incluyendo imágenes, textos, logotipos, gráficos y diseño, es
                  propiedad de Papelería, salvo que se indique lo contrario. Queda prohibida su reproducción total o
                  parcial sin autorización expresa.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">9. Limitación de responsabilidad</h3>
                <p className="text-[#7c6b64]">
                  Papelería no se hace responsable por daños directos o indirectos derivados del uso del catálogo
                  público, del carrito de compras, de los enlaces compartidos o del sistema de inventario. El usuario
                  asume la responsabilidad por el uso que dé a la información proporcionada. El sistema podría presentar
                  interrupciones temporales por mantenimiento o fallas ajenas a nuestro control.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">10. Ley aplicable</h3>
                <p className="text-[#7c6b64]">
                  Los presentes términos se rigen por las leyes de los Estados Unidos Mexicanos. Para cualquier
                  controversia derivada del uso del sitio, las partes se someten a la jurisdicción de los tribunales
                  competentes de la Ciudad de México.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">11. Modificaciones</h3>
                <p className="text-[#7c6b64]">
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones serán
                  efectivas inmediatamente después de su publicación. El uso continuado del sitio constituye la
                  aceptación de los términos modificados.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#2f1e18] text-[#f5efed] py-6 px-4 lg:px-8">
        <div className="max-w-[900px] mx-auto text-center text-sm text-[#d9c8c0]">
          <p>© 2026 Papelería. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
