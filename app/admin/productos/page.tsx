'use client';

import React, { useState, useEffect } from 'react';
import { Producto } from '@/lib/types';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  X,
  History,
  Tag
} from 'lucide-react';

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nombre: '',
    marca: '',
    categoria: 'Cuadernos',
    precio_compra: '',
    precio_venta: '',
    unidades: '',
    sku: '',
    presentacion: 'Pieza',
    stock_minimo: '5',
    fotografia: '',
  });

  const [historialModalProdId, setHistorialModalProdId] = useState<string | null>(null);
  const [historialPrecios, setHistorialPrecios] = useState<any[]>([]);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
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

  const handleOpenModal = (prod: Producto | null = null) => {
    if (prod) {
      setEditingProduct(prod);
      setFormData({
        nombre: prod.nombre,
        marca: prod.marca,
        categoria: prod.categoria,
        precio_compra: String(prod.precio_compra),
        precio_venta: String(prod.precio_venta),
        unidades: String(prod.unidades),
        sku: prod.sku,
        presentacion: prod.presentacion,
        stock_minimo: String(prod.stock_minimo),
        fotografia: prod.fotografia,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        nombre: '',
        marca: '',
        categoria: 'Cuadernos',
        precio_compra: '0',
        precio_venta: '0',
        unidades: '0',
        sku: `SKU-${Date.now().toString().slice(-6)}`,
        presentacion: 'Pieza',
        stock_minimo: '5',
        fotografia: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        precio_compra: Number(formData.precio_compra),
        precio_venta: Number(formData.precio_venta),
        unidades: Number(formData.unidades),
        stock_minimo: Number(formData.stock_minimo),
        id: editingProduct?.id,
      };

      const url = '/api/productos';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchProductos();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      const res = await fetch(`/api/productos?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchProductos();
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenHistorial = async (id: string) => {
    setHistorialModalProdId(id);
    try {
      const res = await fetch(`/api/precios/historial/${id}`);
      if (res.ok) {
        const data = await res.json();
        setHistorialPrecios(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = productos.filter(p => 
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.marca.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Package className="w-7 h-7 text-sky-400" /> Catálogo de Productos
          </h1>
          <p className="text-xs text-slate-400 mt-1">Alta, baja, actualización y gestión integral de productos.</p>
        </div>

        <button
          onClick={() => handleOpenModal(null)}
          className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-sky-600/25 flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> Nuevo Producto
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, marca o SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent w-full text-sm text-slate-100 placeholder:text-slate-500 outline-none"
        />
      </div>

      {/* PRODUCTS TABLE */}
      {loading ? (
        <div className="glass-panel rounded-3xl p-8 text-center text-slate-400">Cargando inventario...</div>
      ) : (
        <div className="glass-panel border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Fotografía</th>
                  <th className="p-4">Producto</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">P. Compra</th>
                  <th className="p-4">P. Venta</th>
                  <th className="p-4">Unidades</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-4">
                      <img
                        src={prod.fotografia || 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&q=80'}
                        alt={prod.nombre}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-900 border border-slate-800"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-100 text-sm">{prod.nombre}</div>
                      <div className="text-[11px] text-slate-400">{prod.marca} • {prod.presentacion}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {prod.categoria}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-300">${Number(prod.precio_compra).toFixed(2)}</td>
                    <td className="p-4 font-bold text-emerald-400">${Number(prod.precio_venta).toFixed(2)}</td>
                    <td className="p-4">
                      {prod.unidades <= prod.stock_minimo ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" /> {prod.unidades} (Bajo)
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-200">{prod.unidades} uds</span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-sky-300">{prod.sku}</td>
                    <td className="p-4 text-center space-x-2">
                      <button
                        onClick={() => handleOpenHistorial(prod.id)}
                        title="Ver historial de precios"
                        className="p-1.5 text-slate-400 hover:text-sky-400 bg-slate-800 rounded-lg transition"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenModal(prod)}
                        title="Editar producto"
                        className="p-1.5 text-slate-400 hover:text-amber-400 bg-slate-800 rounded-lg transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id)}
                        title="Eliminar producto"
                        className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel border border-slate-700 rounded-3xl max-w-xl w-full p-6 relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold text-white mb-4">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Nombre del Producto</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Marca</label>
                  <input
                    type="text"
                    required
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Categoría</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none focus:border-sky-500"
                  >
                    <option value="Cuadernos">Cuadernos</option>
                    <option value="Escritura">Escritura</option>
                    <option value="Papel y Cartón">Papel y Cartón</option>
                    <option value="Pegamentos y Adhesivos">Pegamentos y Adhesivos</option>
                    <option value="Corte y Manualidades">Corte y Manualidades</option>
                    <option value="Artículos de Arte y Dibujo">Artículos de Arte y Dibujo</option>
                    <option value="Oficina y Archivadores">Oficina y Archivadores</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Precio de Compra</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.precio_compra}
                    onChange={(e) => setFormData({ ...formData, precio_compra: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Precio de Venta</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.precio_venta}
                    onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unidades en Stock</label>
                  <input
                    type="number"
                    required
                    value={formData.unidades}
                    onChange={(e) => setFormData({ ...formData, unidades: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    required
                    value={formData.stock_minimo}
                    onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Código SKU</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Presentación</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Pieza, Caja c/12"
                    value={formData.presentacion}
                    onChange={(e) => setFormData({ ...formData, presentacion: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none focus:border-sky-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">URL de Fotografía (Supabase Storage)</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.fotografia}
                    onChange={(e) => setFormData({ ...formData, fotografia: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-5 py-2 rounded-xl transition shadow-lg shadow-sky-600/30"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRICE HISTORY MODAL */}
      {historialModalProdId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel border border-slate-700 rounded-3xl max-w-lg w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setHistorialModalProdId(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <History className="w-5 h-5 text-sky-400" /> Historial de Cambios de Precio
            </h3>

            {historialPrecios.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No hay registros de actualización de precios para este producto.</p>
            ) : (
              <div className="space-y-3 mt-4 max-h-60 overflow-y-auto">
                {historialPrecios.map((h, i) => (
                  <div key={i} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
                    <div className="text-[10px] text-slate-500 mb-1">{new Date(h.fecha).toLocaleString('es-MX')}</div>
                    <div className="flex justify-between">
                      <span>P. Compra: ${h.precio_compra_anterior} → <b className="text-slate-200">${h.precio_compra_nuevo}</b></span>
                      <span>P. Venta: ${h.precio_venta_anterior} → <b className="text-emerald-400">${h.precio_venta_nuevo}</b></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
