'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export default function AvisoPrivacidadPage() {
  return (
    <div className="min-h-screen bg-background text-[#201816] flex flex-col">
      <header className="sticky top-0 z-40 glass-panel border-b border-[#d5c2bd] px-4 lg:px-8 py-3">
        <div className="max-w-[900px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/icon.png" alt="Logo Papelería" className="w-10 h-10 object-contain shrink-0" />
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
                <p className="text-sm text-[#7c6b64]">Última actualización: Agosto 2026</p>
              </div>
            </div>

            <div className="space-y-6 text-sm text-[#201816] leading-relaxed">
              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">1. Identidad y domicilio del responsable</h3>
                <p className="text-[#7c6b64]">
                  Papelería, con domicilio en Ciudad de México, México, es el responsable del
                  tratamiento de sus datos personales. Para cualquier duda o aclaración, puede contactarnos a través
                  del correo electrónico: contacto@cuadernodorado.mx, o al teléfono +52 (555) 123-4567, en horario
                  de lunes a viernes de 9:00 a 18:00 y sábados de 9:00 a 14:00.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">2. Datos personales que recabamos</h3>
                <p className="text-[#7c6b64]">
                  Nuestro catálogo público no requiere de registro ni de datos personales para ser consultado. En función
                  de cómo utilice nuestro sitio, recabamos lo siguiente:
                </p>
                <ul className="list-disc list-inside mt-2 text-[#7c6b64] space-y-1.5">
                  <li>
                    <span className="font-semibold text-[#201816]">Carrito de compras (local):</span> la selección
                    temporal de productos y cantidades se almacena únicamente en su navegador (localStorage) y no se
                    envía a nuestros servidores salvo que usted lo comparta.
                  </li>
                  <li>
                    <span className="font-semibold text-[#201816]">Carrito compartido (servidor):</span> si utiliza la
                    función "Compartir carrito", los identificadores de los productos y sus cantidades se guardan de
                    forma temporal en nuestros servidores con un enlace de validez de 7 días, transcurridos los cuales
                    se eliminan automáticamente.
                  </li>
                  <li>
                    <span className="font-semibold text-[#201816]">Panel de administración:</span> el correo
                    electrónico de los usuarios autorizados, utilizado exclusivamente para la autenticación y control
                    de acceso al sistema interno.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">3. Finalidad del tratamiento</h3>
                <p className="text-[#7c6b64]">
                  Los datos recabados se utilizan exclusivamente para: (a) permitirle compartir su selección de
                  productos mediante un enlace temporal; (b) autenticar y controlar el acceso al panel de
                  administración; y (c) gestionar internamente el inventario, las ventas, las devoluciones y la
                  generación de reportes. Sus datos no se utilizarán para fines distintos a los aquí señalados.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">4. Transferencias de datos</h3>
                <p className="text-[#7c6b64]">
                  No transferimos sus datos personales a terceros, salvo que exista obligación legal o mandamiento de
                  autoridad competente. Los datos del carrito compartido son accesibles únicamente por quien reciba el
                  enlace correspondiente.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">5. Derechos ARCO</h3>
                <p className="text-[#7c6b64]">
                  Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales
                  (derechos ARCO). Para ejercer estos derechos, envíe su solicitud a contacto@cuadernodorado.mx
                  indicando su nombre, el derecho que desea ejercer y una descripción de los datos. Le responderemos en
                  un plazo máximo de 15 días hábiles.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">6. Seguridad de la información</h3>
                <p className="text-[#7c6b64]">
                  Adoptamos medidas administrativas, técnicas y físicas razonables para proteger sus datos contra daño,
                  pérdida, alteración, destrucción o uso no autorizado. El acceso al panel de administración se
                  encuentra protegido mediante autenticación segura.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-[#36160c] mb-2">7. Cambios al aviso de privacidad</h3>
                <p className="text-[#7c6b64]">
                  Nos reservamos el derecho de modificar el presente aviso de privacidad en cualquier momento. Las
                  modificaciones entrarán en vigor inmediatamente después de su publicación en esta página, indicándose
                  la fecha de última actualización.
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
