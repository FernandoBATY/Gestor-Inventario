'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Producto } from '@/lib/types';
import { 
  Search, 
  LogIn, 
  BookOpen, 
  ShoppingBag,
  Sparkles,
  ShoppingCart,
  Plus
} from 'lucide-react';

type CartItem = {
  producto: Producto;
  cantidad: number;
};

const CART_KEY = 'gestor-inventario-carrito';

const NoPhoto = ({ text = 'Sin fotografía' }: { text?: string }) => (
  <div className="w-full h-full flex items-center justify-center bg-[#f2edeb] text-[#36160c] font-semibold text-sm text-center px-4">
    {text}
  </div>
);

export default function PublicStorefrontPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [priceLimit, setPriceLimit] = useState(500);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchCatalog();
    fetchCategories();
    updateCartCount();

    const handleStorage = () => updateCartCount();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const updateCartCount = () => {
    try {
      const raw = window.localStorage.getItem(CART_KEY);
      const cart = raw ? (JSON.parse(raw) as CartItem[]) : [];
      setCartCount(cart.reduce((total, item) => total + item.cantidad, 0));
    } catch {
      setCartCount(0);
    }
  };

  const addToTemporaryCart = (product: Producto) => {
    const stock = Math.max(0, Number(product.unidades) || 0);
    if (stock <= 0) return;

    try {
      const raw = window.localStorage.getItem(CART_KEY);
      const cart = raw ? (JSON.parse(raw) as CartItem[]) : [];
      const index = cart.findIndex((item) => item.producto.id === product.id);

      if (index >= 0) {
        if (cart[index].cantidad < stock) {
          cart[index].cantidad += 1;
        }
      } else {
        cart.push({ producto: product, cantidad: 1 });
      }

      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
      updateCartCount();
    } catch (error) {
      console.error(error);
    }
  };

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
    const price = Number(p.precio_venta) || 0;
    return matchesSearch && matchesCategory && price >= 0 && price <= priceLimit;
  });

  return (
    <div className="min-h-screen bg-background text-[#201816] flex flex-col selection:bg-[#f2baa8]/40 selection:text-[#201816]">
      <header className="sticky top-0 z-40 glass-panel border-b border-[#d5c2bd] px-4 lg:px-8 py-3">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-3 lg:justify-start">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#2f1e18] flex items-center justify-center shadow-lg shadow-[#2f1e18]/15 shrink-0">
                <BookOpen className="w-5 h-5 text-[#fff8f4]" />
              </div>
              <div className="min-w-0">
                <h1 className="font-headline text-xl sm:text-2xl tracking-tight text-[#36160c] truncate">Papelería <span className="text-[#6f5249]">El Cuaderno Dorado</span></h1>
                <p className="text-xs text-[#7c6b64] font-medium hidden sm:block">Catálogo público de productos disponibles</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/carrito"
                className="relative inline-flex lg:hidden items-center gap-1.5 bg-[#fffaf7] hover:bg-[#f6efe8] text-[#201816] text-xs font-semibold px-3 py-2.5 rounded-xl shadow-lg border border-[#d7c7c0] transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#9f5d55] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 bg-[#2f1e18] hover:bg-[#412820] text-[#fff8f4] text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-[#2f1e18]/15 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar sesión</span>
              </Link>
            </div>
          </div>

          <div className="flex-grow max-w-2xl lg:mx-lg hidden md:block">
            <div className="flex items-center bg-[#fffaf7] border border-[#d7c7c0] rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#f2baa8]/25 transition-all">
              <select
                className="bg-[#f6efe8] border-none text-xs font-semibold py-3 pl-4 pr-6 cursor-pointer focus:ring-0 text-[#7c6b64] border-r border-[#d7c7c0]"
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
              >
                {categorias.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
              <input
                className="w-full bg-transparent border-none focus:ring-0 py-3 px-4 text-sm text-[#201816] placeholder:text-[#9a8a83] outline-none"
                placeholder="Buscar productos, marcas o SKU..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="bg-[#2f1e18] text-[#fff8f4] px-4 py-3 hover:bg-[#412820] transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/carrito"
              className="relative inline-flex items-center gap-2 bg-[#fffaf7] hover:bg-[#f6efe8] text-[#201816] text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-[#d7c7c0] transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Carrito</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#9f5d55] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              href="/admin/login"
              className="bg-[#2f1e18] hover:bg-[#412820] text-[#fff8f4] text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-[#2f1e18]/15 transition-all"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden py-12 px-4 lg:px-8 border-b border-[#d5c2bd] bg-gradient-to-b from-[#fff8f4] to-[#f6efe8]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-8 items-start">
          <aside className="glass-panel rounded-3xl p-6 border border-[#d7c7c0] sticky top-24">
            <div className="flex items-center justify-between border-b border-[#e6d8d2] pb-3">
              <h2 className="font-headline text-2xl text-[#201816]">Filtros</h2>
              <button
                onClick={() => {
                  setSelectedCategoria('Todas');
                  setSearchQuery('');
                  setPriceLimit(500);
                }}
                className="text-[#6f5249] text-xs font-semibold hover:underline"
              >
                Limpiar todo
              </button>
            </div>

            <div className="space-y-6 mt-5">
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-[#83746f]">Categoría</h3>
                <div className="flex flex-wrap gap-2">
                  {categorias.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategoria(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        selectedCategoria === cat
                          ? 'bg-[#2f1e18] text-[#fff8f4] shadow-lg shadow-[#2f1e18]/10'
                          : 'bg-[#fffaf7] text-[#7c6b64] border border-[#d7c7c0] hover:bg-[#f6efe8]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-[#83746f]">Disponibilidad</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input className="rounded border-[#d7c7c0] text-[#2f1e18] focus:ring-[#f2baa8]/30 w-4 h-4" type="checkbox" />
                  <span className="text-sm text-[#7c6b64]">Incluir agotados</span>
                </label>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-[#83746f]">Rango de Precios</h3>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceLimit}
                    onChange={(e) => setPriceLimit(Number(e.target.value))}
                    className="w-full accent-[#2f1e18] h-2"
                  />
                  <span className="text-sm font-semibold text-[#201816] min-w-[3rem] text-right">${priceLimit}</span>
                </div>
                <div className="flex justify-between text-xs text-[#7c6b64]">
                  <span>$0</span>
                  <span>$500</span>
                </div>
              </div>
            </div>
          </aside>

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d5c2bd] pb-4 mb-6">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#efe3db] text-[#6f5249] border border-[#d7c7c0] mb-3">
                  <Sparkles className="w-3.5 h-3.5" /> Soluciones en Papelería
                </span>
                <h2 className="font-headline text-3xl sm:text-[36px] leading-tight text-[#201816]">Catálogo Premium</h2>
                <p className="text-sm text-[#7c6b64] mt-1">Mostrando {filteredProducts.length} de {productos.length} artículos</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[#83746f]">Ordenar por:</span>
                <select className="bg-[#fffaf7] border border-[#d7c7c0] rounded-xl py-2 px-4 text-xs font-semibold text-[#7c6b64] outline-none">
                  <option>Relevancia</option>
                  <option>Precio: Menor a Mayor</option>
                  <option>Precio: Mayor a Menor</option>
                  <option>Más recientes</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass-card rounded-2xl p-4 animate-pulse h-80 bg-[#fffaf7] border border-[#d7c7c0]">
                    <div className="w-full h-44 bg-[#f2edeb] rounded-xl mb-4" />
                    <div className="h-4 bg-[#f2edeb] rounded w-3/4 mb-2" />
                    <div className="h-3 bg-[#f2edeb] rounded w-1/2 mb-4" />
                    <div className="h-6 bg-[#f2edeb] rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="glass-panel rounded-3xl p-12 text-center max-w-md mx-auto border border-[#d7c7c0]">
                <ShoppingBag className="w-12 h-12 text-[#83746f] mx-auto mb-4" />
                <h3 className="font-headline text-2xl text-[#201816]">No se encontraron productos</h3>
                <p className="text-sm text-[#7c6b64] mt-1">Intenta con otro término de búsqueda o selecciona otra categoría.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => setSelectedProduct(prod)}
                    className="bg-white rounded-xl overflow-hidden border border-[#d7c7c0] hover:shadow-xl transition-all group flex flex-col h-full cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#f2edeb]">
                      {prod.fotografia ? (
                        <img
                          src={prod.fotografia}
                          alt={prod.nombre}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(event) => {
                            const target = event.currentTarget as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <NoPhoto />
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-white/80 backdrop-blur-md text-[#6f5249] border border-[#d7c7c0]">
                          {prod.categoria}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#83746f]">{prod.marca}</span>
                        <span className="text-xs text-[#7f9b76] font-semibold">{prod.unidades > 0 ? 'DISPONIBLE' : 'AGOTADO'}</span>
                      </div>
                      <h4 className="font-headline text-2xl text-[#201816] mb-2 line-clamp-2 group-hover:text-[#6f5249] transition-colors">{prod.nombre}</h4>
                      <p className="text-sm text-[#7c6b64] mb-4 line-clamp-2">{prod.presentacion}</p>
                      <div className="mt-auto space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-headline text-2xl text-[#36160c]">${Number(prod.precio_venta).toFixed(2)}</span>
                          <span className={`text-[10px] font-bold flex items-center gap-1 ${prod.unidades > 0 ? 'text-[#7f9b76]' : 'text-[#8a6f5c]'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${prod.unidades > 0 ? 'bg-[#7f9b76]' : 'bg-[#8a6f5c]'}`} />
                            {prod.unidades > 0 ? 'DISPONIBLE' : 'STOCK BAJO'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToTemporaryCart(prod);
                            }}
                            disabled={prod.unidades <= 0}
                            className="flex-1 bg-[#2f1e18] hover:bg-[#412820] disabled:bg-[#c4b5ae] text-[#fff8f4] py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2"
                          >
                            <Plus className="w-4 h-4" /> Agregar
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProduct(prod);
                            }}
                            className="bg-[#fffaf7] hover:bg-[#f6efe8] text-[#201816] border border-[#d7c7c0] py-2.5 px-4 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#d5c2bd] pt-5">
              <p className="text-sm text-[#7c6b64]">Mostrando 1 a {Math.min(filteredProducts.length, 12)} de {filteredProducts.length} resultados</p>
              <nav className="flex items-center gap-2">
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#d7c7c0] bg-white hover:bg-[#f6efe8] transition-all">‹</button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#2f1e18] text-[#fff8f4] font-semibold">1</button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#d7c7c0] bg-white hover:bg-[#f6efe8] transition-all">2</button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#d7c7c0] bg-white hover:bg-[#f6efe8] transition-all">3</button>
                <span className="text-[#83746f]">...</span>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#d7c7c0] bg-white hover:bg-[#f6efe8] transition-all">13</button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#d7c7c0] bg-white hover:bg-[#f6efe8] transition-all">›</button>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel border border-[#d7c7c0] rounded-3xl max-w-lg w-full p-6 relative overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 text-[#7c6b64] hover:text-[#201816] bg-[#f6efe8] rounded-full transition"
            >
              ✕
            </button>

            <div className="w-full h-56 rounded-2xl overflow-hidden bg-[#f2edeb] mb-4 border border-[#d7c7c0]">
              {selectedProduct.fotografia ? (
                <img
                  src={selectedProduct.fotografia}
                  alt={selectedProduct.nombre}
                  className="w-full h-full object-cover"
                  onError={(event) => {
                    const target = event.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <NoPhoto />
              )}
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#efe3db] text-[#6f5249] border border-[#d7c7c0] mb-2 inline-block">
              {selectedProduct.categoria}
            </span>
            <h3 className="text-2xl font-headline text-[#201816]">{selectedProduct.nombre}</h3>

            <div className="grid grid-cols-2 gap-3 my-4 bg-[#fffaf7] p-3.5 rounded-2xl border border-[#d7c7c0] text-xs">
              <div><span className="text-[#7c6b64] block">Marca</span><span className="font-semibold text-[#201816]">{selectedProduct.marca}</span></div>
              <div><span className="text-[#7c6b64] block">Presentación</span><span className="font-semibold text-[#201816]">{selectedProduct.presentacion}</span></div>
              <div><span className="text-[#7c6b64] block">Código SKU</span><span className="font-mono text-[#6f5249] font-semibold">{selectedProduct.sku}</span></div>
              <div><span className="text-[#7c6b64] block">Disponibilidad</span>{selectedProduct.unidades > 0 ? <span className="text-[#7f9b76] font-semibold">En existencia ({selectedProduct.unidades} uds)</span> : <span className="text-[#9f5d55] font-semibold">Sin existencias</span>}</div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#e6d8d2]">
              <div>
                <span className="text-xs text-[#7c6b64] block">Precio de Venta</span>
                <span className="text-2xl font-headline text-[#36160c]">${Number(selectedProduct.precio_venta).toFixed(2)} MXN</span>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="bg-[#2f1e18] hover:bg-[#412820] text-[#fff8f4] text-xs font-semibold px-5 py-2.5 rounded-xl transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-[#2f1e18] text-[#f5efed] mt-20 pt-16 pb-10 px-4 lg:px-8">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-lg bg-[#fff8f4] flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[#2f1e18]" />
              </div>
              <span className="font-headline text-xl">El Cuaderno Dorado</span>
            </div>
            <p className="text-sm text-[#d9c8c0]">Sistema de inventario.</p>
          </div>
          <div>
            <h5 className="text-xs uppercase tracking-[0.25em] text-[#f2baa8] font-semibold mb-4">Productos</h5>
            <ul className="space-y-2 text-sm text-[#d9c8c0]">
              <li>Instrumentos de Escritura</li><li>Papel Fino</li><li>Organización de Escritorio</li><li>Herramientas Técnicas</li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs uppercase tracking-[0.25em] text-[#f2baa8] font-semibold mb-4">Empresa</h5>
            <ul className="space-y-2 text-sm text-[#d9c8c0]">
              <li>Sobre Nosotros</li><li>Sostenibilidad</li><li>Carreras</li><li>Prensa</li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs uppercase tracking-[0.25em] text-[#f2baa8] font-semibold mb-4">Boletín</h5>
            <p className="text-sm text-[#d9c8c0] mb-3">Mantente al día con nuestros últimos lanzamientos.</p>
            <div className="flex">
              <input className="bg-white/10 border border-white/15 rounded-l-lg px-4 py-2.5 w-full text-sm outline-none" placeholder="correo@ejemplo.com" type="email" />
              <button className="bg-[#f2baa8] text-[#2f1e18] px-4 py-2.5 rounded-r-lg font-semibold">Enviar</button>
            </div>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-[#d9c8c0]">
          <p>© 2026 Papelería El Cuaderno Dorado. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <span>Aviso de Privacidad</span>
            <span>Términos del Servicio</span>
            <span>Accesibilidad</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
