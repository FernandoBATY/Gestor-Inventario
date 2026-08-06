'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2, ArrowLeft, Share2, Check, AlertTriangle } from 'lucide-react';
import { Producto } from '@/lib/types';

type CartItem = {
  producto: Producto;
  cantidad: number;
};

const CART_KEY = 'gestor-inventario-carrito';
const moneyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
});

const NoPhoto = () => (
  <div className="w-full h-full flex items-center justify-center bg-[#f2edeb] text-[#36160c] font-semibold text-sm text-center px-4">
    Sin fotografía
  </div>
);

const readCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function CarritoPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loadingShared, setLoadingShared] = useState(false);
  const [sharedError, setSharedError] = useState('');
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const initialLoad = useRef(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codigo = params.get('c');
    if (codigo) {
      loadSharedCart(codigo);
    } else {
      setCart(readCart());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSharedCart = async (codigo: string) => {
    setLoadingShared(true);
    setSharedError('');
    try {
      const res = await fetch(`/api/carritos?codigo=${encodeURIComponent(codigo)}`);
      const data = await res.json();
      if (!res.ok) {
        setSharedError(data.error || 'No se pudo cargar el carrito compartido');
        setCart(readCart());
        return;
      }
      const items: CartItem[] = (data.items || []).map((i: any) => ({
        producto: i.producto,
        cantidad: i.cantidad,
      }));
      setCart(items);
    } catch (e) {
      setSharedError('Error al cargar el carrito compartido');
      setCart(readCart());
    } finally {
      setLoadingShared(false);
    }
  };

  const shareCart = async () => {
    if (cart.length === 0) return;
    setSharing(true);
    setCopied(false);
    try {
      const res = await fetch('/api/carritos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((item) => ({ producto_id: item.producto.id, cantidad: item.cantidad })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSharedError(data.error || 'No se pudo generar el enlace');
        return;
      }
      const url = `${window.location.origin}/carrito?c=${data.codigo}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch (e) {
      setSharedError('Error al generar el enlace de compartir');
    } finally {
      setSharing(false);
    }
  };

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.producto.id !== id) return item;
          const nextQty = item.cantidad + delta;
          const stock = Math.max(0, Number(item.producto.unidades) || 0);
          if (nextQty > stock) return item;
          return { ...item, cantidad: Math.max(0, nextQty) };
        })
        .filter((item) => item.cantidad > 0)
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.producto.id !== id));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, item) => sum + Number(item.producto.precio_venta || 0) * item.cantidad, 0);
  const itemsCount = cart.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <div className="min-h-screen bg-background text-[#201816]">
      <header className="sticky top-0 z-40 glass-panel border-b border-[#d5c2bd] px-4 lg:px-8 py-3">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/icon.png" alt="Logo Papelería" className="w-10 h-10 object-contain shrink-0" />
            <div className="min-w-0">
              <h1 className="font-headline text-xl sm:text-2xl tracking-tight text-[#36160c] truncate">Carrito de compras</h1>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#fffaf7] hover:bg-[#f6efe8] text-[#201816] text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-[#d7c7c0] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al catálogo</span>
          </Link>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 lg:px-8 py-10">
        {(loadingShared || sharedError) && (
          <div className="mb-6 p-4 rounded-2xl border border-[#d7c7c0] bg-[#fffaf7] flex items-center gap-3">
            {loadingShared ? (
              <>
                <div className="w-4 h-4 border-2 border-[#6f5249] border-t-transparent rounded-full animate-spin shrink-0" />
                <p className="text-sm text-[#7c6b64]">Cargando carrito compartido...</p>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-[#9f5d55] shrink-0" />
                <p className="text-sm text-[#9f5d55] font-semibold">{sharedError}</p>
              </>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#efe3db] text-[#6f5249] border border-[#d7c7c0] mb-3">
                  <ShoppingBag className="w-3.5 h-3.5" /> Carrito temporal
                </span>
                <h2 className="font-headline text-3xl text-[#201816]">Artículos agregados</h2>
                <p className="text-sm text-[#7c6b64] mt-1">Ajusta cantidades con base en el stock disponible.</p>
              </div>
              <button
                onClick={clearCart}
                className="text-xs font-semibold text-[#9f5d55] hover:text-[#87463d]"
              >
                Vaciar carrito
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="glass-panel rounded-3xl border border-[#d7c7c0] p-10 text-center">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-[#83746f]" />
                <h3 className="font-headline text-2xl text-[#201816]">Tu carrito está vacío</h3>
                <p className="text-sm text-[#7c6b64] mt-1">Agrega productos desde el catálogo para ver la suma aquí.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => {
                  const stock = Math.max(0, Number(item.producto.unidades) || 0);
                  return (
                    <article key={item.producto.id} className="glass-panel rounded-3xl border border-[#d7c7c0] p-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-28 h-28 rounded-2xl overflow-hidden bg-[#f2edeb] border border-[#d7c7c0] shrink-0">
                          {item.producto.fotografia ? (
                            <img
                              src={item.producto.fotografia}
                              alt={item.producto.nombre}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(event) => {
                                const target = event.currentTarget as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <NoPhoto />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div>
                              <span className="text-xs font-semibold uppercase tracking-wider text-[#83746f]">{item.producto.categoria}</span>
                              <h3 className="font-headline text-2xl text-[#201816] mt-1">{item.producto.nombre}</h3>
                              <p className="text-sm text-[#7c6b64]">{item.producto.marca} • {item.producto.presentacion}</p>
                            </div>
                            <div className="text-left sm:text-right">
                              <p className="text-xs text-[#7c6b64]">Precio unitario</p>
                              <p className="font-headline text-2xl text-[#36160c]">{moneyFormatter.format(Number(item.producto.precio_venta) || 0)}</p>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-[#e6d8d2]">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center bg-[#fffaf7] border border-[#d7c7c0] rounded-xl overflow-hidden">
                                <button
                                  onClick={() => updateQuantity(item.producto.id, -1)}
                                  className="p-2 text-[#7c6b64] hover:text-[#201816]"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="px-3 font-semibold text-[#201816]">{item.cantidad}</span>
                                <button
                                  onClick={() => updateQuantity(item.producto.id, 1)}
                                  className="p-2 text-[#7c6b64] hover:text-[#201816]"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              <button
                                onClick={() => removeItem(item.producto.id)}
                                className="inline-flex items-center gap-2 text-xs font-semibold text-[#9f5d55] hover:text-[#87463d]"
                              >
                                <Trash2 className="w-4 h-4" />
                                Quitar
                              </button>
                            </div>

                            <div className="text-sm text-[#7c6b64]">
                              <span className="font-semibold text-[#201816]">Stock disponible:</span> {stock} unidades
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="glass-panel rounded-3xl border border-[#d7c7c0] p-6 sticky top-24 space-y-5">
            <div>
              <h3 className="font-headline text-2xl text-[#201816]">Resumen</h3>
              <p className="text-sm text-[#7c6b64] mt-1">El total es aproximado y depende del stock actual de cada artículo.</p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#7c6b64]">Artículos en carrito</span>
                <span className="font-semibold text-[#201816]">{itemsCount}</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#e6d8d2]">
                <span className="text-[#7c6b64]">Total aproximado</span>
                <span className="font-headline text-3xl text-[#36160c]">{moneyFormatter.format(total)}</span>
              </div>
            </div>

            <p className="text-xs text-[#7c6b64] italic">
              * Esta vista solo guarda una selección temporal. Los precios y disponibilidad están sujetos a cambio.
            </p>

            <button
              onClick={shareCart}
              disabled={sharing || cart.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#2f1e18] hover:bg-[#412820] text-[#fff8f4] font-semibold text-xs px-4 py-3 rounded-xl transition disabled:opacity-50"
            >
              {sharing ? (
                <div className="w-4 h-4 border-2 border-[#fff8f4]/40 border-t-transparent rounded-full animate-spin" />
              ) : copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Enlace copiado al portapapeles
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Compartir carrito
                </>
              )}
            </button>
            <p className="text-[11px] text-[#7c6b64] text-center">
              Genera un enlace con estos artículos para enviarlo a otra persona.
            </p>
          </aside>
        </div>
      </main>

      <div className="mt-12 overflow-hidden bg-[#f2baa8] border-y border-[#e5c7ae] py-2.5">
        <div className="flex w-max animate-marquee">
          {[0, 1].map((half) => (
            <div key={half} className="flex shrink-0 items-center">
              {[0, 1, 2, 3].map((n) => (
                <span key={n} className="flex items-center whitespace-nowrap text-xs sm:text-sm text-[#36160c] font-semibold">
                  <span className="px-6">Los productos están sujetos a cambiar de stock día con día</span>
                  <span className="text-[#6f5249]/70">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <footer className="bg-[#2f1e18] text-[#f5efed] pt-16 pb-10 px-4 lg:px-8">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/icon.png" alt="Logo Papelería" className="h-8 w-8 object-contain" />
              <span className="font-headline text-xl">Papelería</span>
            </div>
            <p className="text-sm text-[#d9c8c0]">Sistema de inventario.</p>
          </div>
          <div>
            <h5 className="text-xs uppercase tracking-[0.25em] text-[#f2baa8] font-semibold mb-4">Enlaces</h5>
            <ul className="space-y-2 text-sm text-[#d9c8c0]">
              <li><Link href="/aviso-de-privacidad" className="hover:text-[#f2baa8] transition-colors">Aviso de Privacidad</Link></li>
              <li><Link href="/terminos-del-servicio" className="hover:text-[#f2baa8] transition-colors">Términos del Servicio</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs uppercase tracking-[0.25em] text-[#f2baa8] font-semibold mb-4">Contacto</h5>
            <ul className="space-y-2 text-sm text-[#d9c8c0]">
              <li>contacto@cuadernodorado.mx</li>
              <li>+52 (555) 123-4567</li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs uppercase tracking-[0.25em] text-[#f2baa8] font-semibold mb-4">Horario</h5>
            <ul className="space-y-2 text-sm text-[#d9c8c0]">
              <li>Lun - Vie: 9:00 - 18:00</li>
              <li>Sáb: 9:00 - 14:00</li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-[#d9c8c0]">
          <p>© 2026 Papelería. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="/aviso-de-privacidad" className="hover:text-[#f2baa8] transition-colors">Aviso de Privacidad</Link>
            <Link href="/terminos-del-servicio" className="hover:text-[#f2baa8] transition-colors">Términos del Servicio</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
