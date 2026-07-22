'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Producto } from '@/lib/types';
import { 
  Search, 
  LogIn, 
  BookOpen, 
  Tag, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  ShoppingBag,
  Sparkles,
  Info
} from 'lucide-react';

export default function PublicStorefrontPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);

  useEffect(() => {
    fetchCatalog();
    fetchCategories();
  }, []);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/productos');
      if (res.ok) {
        const data = await res.json();
        setProductos(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/productos/categorias');
      if (res.ok) {
        const data = await res.json();
        setCategorias(['Todas', ...data]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredProducts = productos.filter((p) => {
    const matchesSearch = 
      p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.marca.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoria === 'Todas' || p.categoria === selectedCategoria;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* HEADER PUBLICO */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight text-white flex items-center gap-2">
                Papelería <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">El Cuaderno Dorado</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">Catálogo público de productos disponibles</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-sky-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO BANNER */}
      <section className="relative overflow-hidden py-12 px-4 lg:px-8 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Todo en papelería escolar y de oficina
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Encuentra los mejores materiales para tus proyectos
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base mb-8">
            Explora nuestro catálogo en tiempo real. Consulta precios de venta, presentaciones y disponibilidad sin necesidad de registrarte.
          </p>

          {/* SEARCH BAR & CATEGORIES */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por producto, marca o código SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/70 focus:border-sky-500 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition shadow-xl"
              />
            </div>

            {/* CATEGORY CHIPS */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 scrollbar-none">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoria(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategoria === cat
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATALOG GRID */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-4 animate-pulse h-72">
                <div className="w-full h-36 bg-slate-800 rounded-xl mb-4" />
                <div className="h-4 bg-slate-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-800 rounded w-1/2 mb-4" />
                <div className="h-6 bg-slate-800 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center max-w-md mx-auto">
            <ShoppingBag className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="font-bold text-lg text-slate-200">No se encontraron productos</h3>
            <p className="text-xs text-slate-400 mt-1">Intenta con otro término de búsqueda o selecciona otra categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => setSelectedProduct(prod)}
                className="glass-card rounded-2xl p-4 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-900 mb-3 border border-slate-800">
                    <img
                      src={prod.fotografia || 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&q=80'}
                      alt={prod.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-slate-950/80 backdrop-blur-md text-sky-400 border border-sky-500/20">
                        {prod.categoria}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-slate-100 group-hover:text-sky-400 transition-colors line-clamp-2">
                    {prod.nombre}
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <span className="font-medium text-slate-300">{prod.marca}</span>
                    <span>•</span>
                    <span>{prod.presentacion}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Precio</span>
                    <span className="text-xl font-extrabold text-white">${Number(prod.precio_venta).toFixed(2)}</span>
                  </div>

                  {prod.unidades > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Disponible
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                      <AlertCircle className="w-3.5 h-3.5" /> Agotado
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel border border-slate-700 rounded-3xl max-w-lg w-full p-6 relative overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-full transition"
            >
              ✕
            </button>

            <div className="w-full h-56 rounded-2xl overflow-hidden bg-slate-900 mb-4 border border-slate-800">
              <img
                src={selectedProduct.fotografia}
                alt={selectedProduct.nombre}
                className="w-full h-full object-cover"
              />
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-2 inline-block">
              {selectedProduct.categoria}
            </span>
            <h3 className="text-2xl font-bold text-slate-100">{selectedProduct.nombre}</h3>
            
            <div className="grid grid-cols-2 gap-3 my-4 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80 text-xs">
              <div>
                <span className="text-slate-400 block">Marca</span>
                <span className="font-semibold text-slate-200">{selectedProduct.marca}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Presentación</span>
                <span className="font-semibold text-slate-200">{selectedProduct.presentacion}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Código SKU</span>
                <span className="font-mono text-sky-300 font-semibold">{selectedProduct.sku}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Disponibilidad</span>
                {selectedProduct.unidades > 0 ? (
                  <span className="text-emerald-400 font-semibold">En existencia ({selectedProduct.unidades} uds)</span>
                ) : (
                  <span className="text-rose-400 font-semibold">Sin existencias</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div>
                <span className="text-xs text-slate-400 block">Precio de Venta</span>
                <span className="text-2xl font-extrabold text-white">${Number(selectedProduct.precio_venta).toFixed(2)} MXN</span>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-5 py-2.5 rounded-xl transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="glass-panel border-t border-slate-800/80 py-6 text-center text-xs text-slate-400 mt-12">
        <p>© 2026 Papelería El Cuaderno Dorado. Todos los derechos reservados.</p>
        <p className="mt-1 text-slate-500">Sistema optimizado con Next.js 15, React 19 y Supabase</p>
      </footer>
    </div>
  );
}
