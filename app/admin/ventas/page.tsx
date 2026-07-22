'use client';

import React, { useState, useEffect } from 'react';
import { Producto, Venta } from '@/lib/types';
import ThermalTicket from '@/components/pos/ThermalTicket';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  Printer, 
  History,
  Barcode,
  X
} from 'lucide-react';

interface CartItem {
  producto: Producto;
  cantidad: number;
}

export default function VentasPOSPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [ventasHistorial, setVentasHistorial] = useState<Venta[]>([]);
  const [completedVenta, setCompletedVenta] = useState<Venta | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHistorialModal, setShowHistorialModal] = useState(false);

  useEffect(() => {
    fetchProductos();
    fetchVentasHistorial();
  }, []);

  const fetchProductos = async () => {
    try {
      const res = await fetch('/api/productos');
      if (res.ok) setProductos(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchVentasHistorial = async () => {
    try {
      const res = await fetch('/api/ventas');
      if (res.ok) setVentasHistorial(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const addToCart = (prod: Producto) => {
    if (prod.unidades <= 0) return alert('Producto agotado en inventario');

    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.producto.id === prod.id);
      if (existingIdx !== -1) {
        const updated = [...prev];
        if (updated[existingIdx].cantidad < prod.unidades) {
          updated[existingIdx].cantidad += 1;
        } else {
          alert('No puedes agregar más del stock disponible');
        }
        return updated;
      }
      return [...prev, { producto: prod, cantidad: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.producto.id === id) {
            const newQty = item.cantidad + delta;
            if (newQty > item.producto.unidades) {
              alert('Stock insuficiente');
              return item;
            }
            return { ...item, cantidad: newQty };
          }
          return item;
        })
        .filter((item) => item.cantidad > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.producto.id !== id));
  };

  const totalCart = cart.reduce((acc, item) => acc + item.producto.precio_venta * item.cantidad, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const payload = {
        detalles: cart.map((item) => ({
          producto_id: item.producto.id,
          cantidad: item.cantidad,
        })),
      };

      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const venta = await res.json();
        setCompletedVenta(venta);
        setCart([]);
        fetchProductos();
        fetchVentasHistorial();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.marca.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-sky-400" /> Punto de Venta (POS)
          </h1>
          <p className="text-xs text-slate-400 mt-1">Cobro rápido, descuento automático de inventario e impresión de tickets.</p>
        </div>

        <button
          onClick={() => setShowHistorialModal(true)}
          className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition"
        >
          <History className="w-4 h-4 text-sky-400" /> Historial de Ventas
        </button>
      </div>

      {/* POS CONTAINER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: CATALOG SEARCH & PRODUCT SELECTOR */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
            <Barcode className="w-5 h-5 text-sky-400" />
            <input
              type="text"
              placeholder="Escanear código SKU o buscar producto por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent w-full text-sm text-slate-100 placeholder:text-slate-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => addToCart(prod)}
                className="glass-card rounded-xl p-3 border border-slate-800 hover:border-sky-500/50 cursor-pointer flex flex-col justify-between transition group"
              >
                <div>
                  <img
                    src={prod.fotografia || 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&q=80'}
                    alt={prod.nombre}
                    className="w-full h-24 rounded-lg object-cover bg-slate-900 border border-slate-800 mb-2"
                  />
                  <h4 className="font-bold text-xs text-slate-100 group-hover:text-sky-400 transition line-clamp-2">
                    {prod.nombre}
                  </h4>
                  <span className="text-[10px] text-slate-400">{prod.marca}</span>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="font-extrabold text-sm text-emerald-400">${Number(prod.precio_venta).toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400">{prod.unidades} uds</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: SHOPPING CART & CHECKOUT */}
        <div className="glass-panel border border-slate-800 rounded-3xl p-6 flex flex-col justify-between h-[650px] shadow-2xl">
          <div>
            <h3 className="font-extrabold text-base text-white pb-3 border-b border-slate-800 flex items-center justify-between">
              <span>Carrito de Venta</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                {cart.reduce((a, b) => a + b.cantidad, 0)} artículos
              </span>
            </h3>

            {cart.length === 0 ? (
              <div className="py-20 text-center text-slate-500 text-xs">
                <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>Haz clic en los productos para agregarlos a la venta</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60 max-h-[380px] overflow-y-auto my-3 pr-1 space-y-2">
                {cart.map((item) => (
                  <div key={item.producto.id} className="pt-2 flex items-center justify-between gap-3 text-xs">
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-slate-200 truncate">{item.producto.nombre}</h4>
                      <span className="text-[10px] text-slate-400">
                        ${Number(item.producto.precio_venta).toFixed(2)} c/u
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.producto.id, -1)}
                          className="p-1 hover:text-white text-slate-400"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 font-bold text-slate-100">{item.cantidad}</span>
                        <button
                          onClick={() => updateQuantity(item.producto.id, 1)}
                          className="p-1 hover:text-white text-slate-400"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.producto.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CHECKOUT SUMMARY */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold text-slate-400">TOTAL A COBRAR</span>
              <span className="text-3xl font-black text-emerald-400">${totalCart.toFixed(2)} MXN</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{loading ? 'Procesando...' : 'Completar Venta e Imprimir'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* THERMAL TICKET MODAL */}
      <ThermalTicket
        venta={completedVenta}
        onClose={() => setCompletedVenta(null)}
      />

      {/* SALES HISTORY MODAL */}
      {showHistorialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel border border-slate-700 rounded-3xl max-w-2xl w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setShowHistorialModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-sky-400" /> Historial Reciente de Ventas
            </h3>

            <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto">
              {ventasHistorial.map((v) => (
                <div key={v.id} className="py-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-sky-300 font-bold block">{v.folio}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(v.fecha).toLocaleString('es-MX')}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-extrabold text-sm text-emerald-400">${Number(v.total).toFixed(2)}</span>
                    <button
                      onClick={() => {
                        setShowHistorialModal(false);
                        setCompletedVenta(v);
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg flex items-center gap-1 transition font-semibold"
                    >
                      <Printer className="w-3.5 h-3.5" /> Reimprimir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
