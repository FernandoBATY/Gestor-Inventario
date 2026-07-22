'use client';

import React, { useEffect, useState } from 'react';
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
  Tag,
} from 'lucide-react';

const moneyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
});

const defaultProductForm = {
  nombre: '',
  marca: '',
  categoria: '',
  precio_compra: '',
  precio_venta: '',
  unidades: '',
  sku: '',
  presentacion: 'Pieza',
  stock_minimo: '0',
  fotografia: '',
};

const compressImageFile = async (file: File): Promise<File> => {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('No se pudo procesar la imagen'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
    reader.readAsDataURL(file);
  });

  const maxSize = 1280;
  const ratio = Math.min(1, maxSize / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('No se pudo comprimir la imagen');
  }

  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
          return;
        }
        reject(new Error('No se pudo generar la imagen comprimida'));
      },
      'image/webp',
      0.8
    );
  });

  const fileName = file.name.replace(/\.[^.]+$/, '') || `producto-${Date.now()}`;
  return new File([blob], `${fileName}.webp`, { type: 'image/webp' });
};

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoriaOriginal, setCategoriaOriginal] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const [formData, setFormData] = useState({ ...defaultProductForm });

  const [historialModalProdId, setHistorialModalProdId] = useState<string | null>(null);
  const [historialPrecios, setHistorialPrecios] = useState<any[]>([]);

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
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

  const fetchCategorias = async () => {
    try {
      const res = await fetch('/api/productos/categorias');
      if (res.ok) {
        const data = (await res.json()) as string[];
        setCategorias(Array.from(new Set(data)).filter(Boolean).sort((a, b) => a.localeCompare(b, 'es')));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenModal = (prod: Producto | null = null) => {
    if (prod) {
      setEditingProduct(prod);
      setCategoriaOriginal(prod.categoria);
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
      setImagePreview(prod.fotografia || '');
    } else {
      setEditingProduct(null);
      setCategoriaOriginal('');
      setFormData({
        ...defaultProductForm,
        sku: `SKU-${Date.now().toString().slice(-6)}`,
      });
      setImagePreview('');
    }

    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFile(file);
      setImageFile(compressed);

      const reader = new FileReader();
      reader.onload = () => setImagePreview(String(reader.result || ''));
      reader.readAsDataURL(compressed);
    } catch (error) {
      console.error(error);
      alert('No se pudo procesar la imagen seleccionada');
    }
  };

  const handleSaveCategory = async () => {
    const categoria = formData.categoria.trim();
    if (!categoria) {
      alert('Escribe una categoría antes de guardarla');
      return;
    }

    setCategorySaving(true);
    try {
      const isRename = Boolean(categoriaOriginal && categoriaOriginal !== categoria);
      const res = await fetch('/api/productos/categorias', {
        method: isRename ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isRename
            ? { oldCategoria: categoriaOriginal, categoria }
            : { categoria }
        ),
      });

      if (res.ok) {
        const updatedCategories = (await res.json()) as string[];
        setCategorias(Array.from(new Set(updatedCategories)).filter(Boolean).sort((a, b) => a.localeCompare(b, 'es')));
        setCategoriaOriginal(categoria);
        await fetchProductos();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCategorySaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoria.trim()) {
      alert('Agrega una categoría antes de guardar el producto');
      return;
    }

    try {
      const payload = new FormData();
      payload.append('nombre', formData.nombre.trim());
      payload.append('marca', formData.marca.trim());
      payload.append('categoria', formData.categoria.trim());
      payload.append('precio_compra', String(Math.max(0, Number(formData.precio_compra) || 0)));
      payload.append('precio_venta', String(Math.max(0, Number(formData.precio_venta) || 0)));
      payload.append('unidades', String(Math.max(0, Math.trunc(Number(formData.unidades) || 0))));
      payload.append('sku', formData.sku.trim());
      payload.append('presentacion', formData.presentacion.trim());
      payload.append('stock_minimo', String(Math.max(0, Math.trunc(Number(formData.stock_minimo) || 0))));
      payload.append('fotografia', imageFile ? '' : formData.fotografia || '');

      if (editingProduct) {
        payload.append('id', editingProduct.id);
      }

      if (imageFile) {
        payload.append('fotografia_file', imageFile);
      }

      const res = await fetch('/api/productos', {
        method: editingProduct ? 'PUT' : 'POST',
        body: payload,
      });

      if (res.ok) {
        setIsModalOpen(false);
        await Promise.all([fetchProductos(), fetchCategorias()]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      const res = await fetch(`/api/productos?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProductos();
      }
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

  const filtered = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.marca.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
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
                    <td className="p-4 font-semibold text-slate-300">{moneyFormatter.format(Number(prod.precio_compra) || 0)}</td>
                    <td className="p-4 font-bold text-emerald-400">{moneyFormatter.format(Number(prod.precio_venta) || 0)}</td>
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel border border-slate-700 rounded-3xl max-w-3xl w-full p-6 relative shadow-2xl overflow-y-auto max-h-[90vh]">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
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
                  <input
                    list="categorias-list"
                    type="text"
                    required
                    placeholder="Escribe o selecciona una categoría"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none focus:border-sky-500"
                  />
                  <datalist id="categorias-list">
                    {categorias.map((categoria) => (
                      <option key={categoria} value={categoria} />
                    ))}
                  </datalist>
                  <div className="mt-2 flex flex-wrap gap-2 max-h-28 overflow-y-auto pr-1">
                    {categorias.map((categoria) => (
                      <button
                        key={categoria}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, categoria });
                          setCategoriaOriginal(categoria);
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition ${
                          formData.categoria === categoria
                            ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <Tag className="w-3 h-3" />
                        {categoria}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] text-slate-500">
                    Puedes escribir una nueva categoría o cargar una ya existente para editarla y guardarla.
                  </p>
                  <button
                    type="button"
                    onClick={handleSaveCategory}
                    disabled={categorySaving}
                    className="mt-3 inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-2 rounded-xl transition disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{categorySaving ? 'Guardando...' : categoriaOriginal && categoriaOriginal !== formData.categoria ? 'Renombrar Categoría' : 'Guardar Categoría'}</span>
                  </button>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Precio de Compra</label>
                  <input
                    type="number"
                    min="0"
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
                    min="0"
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
                    min="0"
                    step="1"
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
                    min="0"
                    step="1"
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

                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Imagen del Producto</label>
                  <label className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-700 bg-slate-900/70 px-4 py-4 cursor-pointer hover:border-sky-500/60 hover:bg-slate-900 transition">
                    <ImageIcon className="w-4 h-4 text-sky-400" />
                    <span className="text-slate-300 font-semibold">
                      {imageFile ? 'Cambiar imagen seleccionada' : 'Sube una imagen desde tu dispositivo'}
                    </span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>

                  {imagePreview ? (
                    <div className="mt-3 flex items-center gap-3">
                      <img
                        src={imagePreview}
                        alt="Vista previa"
                        className="w-20 h-20 rounded-2xl object-cover border border-slate-700 bg-slate-900"
                      />
                      <div className="text-[11px] text-slate-400">
                        <p className="font-semibold text-slate-200">Imagen comprimida lista para Supabase Storage</p>
                        <p>Se guarda optimizada en WebP para consumir menos espacio y ancho de banda.</p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-[10px] text-slate-500">Si no subes una imagen, el producto se guardará sin fotografía.</p>
                  )}
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
                    <div className="flex justify-between gap-3">
                      <span>P. Compra: {moneyFormatter.format(h.precio_compra_anterior)} → <b className="text-slate-200">{moneyFormatter.format(h.precio_compra_nuevo)}</b></span>
                      <span>P. Venta: {moneyFormatter.format(h.precio_venta_anterior)} → <b className="text-emerald-400">{moneyFormatter.format(h.precio_venta_nuevo)}</b></span>
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
