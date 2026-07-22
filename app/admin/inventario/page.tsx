'use client';

import React, { useState, useEffect } from 'react';
import { Producto, MovimientoStock } from '@/lib/types';
import { 
  Boxes, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  PlusCircle, 
  History, 
  Search,
  Filter
} from 'lucide-react';

export default function InventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchMov, setSearchMov] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('Todos');

  // New Movement Form State
  const [selectedProdId, setSelectedProdId] = useState('');
  const [tipo, setTipo] = useState<'Entrada' | 'Salida' | 'Ajuste'>('Entrada');
  const [cantidad, setCantidad] = useState('1');
  const [motivo, setMotivo] = useState('Reabastecimiento de proveedor');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProd, resMov] = await Promise.all([
        fetch('/api/productos'),
        fetch('/api/movimientos')
      ]);

      if (resProd.ok) setProductos(await resProd.json());
      if (resMov.ok) setMovimientos(await resMov.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProdId) return alert('Selecciona un producto');

    try {
      const res = await fetch('/api/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          producto_id: selectedProdId,
          tipo,
          cantidad: Number(cantidad),
          motivo,
        }),
      });

      if (res.ok) {
        setCantidad('1');
        setMotivo('Reabastecimiento de proveedor');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredMovimientos = movimientos.filter((m) => {
    const prodName = m.producto?.nombre || '';
    const matchesSearch = prodName.toLowerCase().includes(searchMov.toLowerCase()) || m.motivo.toLowerCase().includes(searchMov.toLowerCase());
    const matchesTipo = filterTipo === 'Todos' || m.tipo === filterTipo;
    return matchesSearch && matchesTipo;
  });

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Boxes className="w-7 h-7 text-sky-400" /> Movimientos de Inventario
        </h1>
        <p className="text-xs text-slate-400 mt-1">Registra entradas, salidas, ajustes de stock y consulta el historial completo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* REGISTRATION FORM */}
        <div className="glass-panel border border-slate-800 rounded-3xl p-6 h-fit">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-sky-400" /> Registrar Movimiento
          </h3>

          <form onSubmit={handleRegisterMovement} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Producto</label>
              <select
                required
                value={selectedProdId}
                onChange={(e) => setSelectedProdId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none focus:border-sky-500"
              >
                <option value="">-- Seleccionar Producto --</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} (Stock actual: {p.unidades})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tipo de Movimiento</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Entrada', 'Salida', 'Ajuste'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    className={`py-2 rounded-xl font-bold transition ${
                      tipo === t
                        ? t === 'Entrada'
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                          : t === 'Salida'
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                          : 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Cantidad</label>
              <input
                type="number"
                min="1"
                required
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Motivo / Descripción</label>
              <input
                type="text"
                required
                placeholder="Ej. Compra a distribuidor, Merma, Ajuste físico"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none focus:border-sky-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-sky-600/30 transition mt-4"
            >
              Guardar Movimiento
            </button>
          </form>
        </div>

        {/* MOVEMENTS HISTORY */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar en historial..."
                value={searchMov}
                onChange={(e) => setSearchMov(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              {['Todos', 'Entrada', 'Salida', 'Ajuste'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterTipo(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    filterTipo === t
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 font-bold text-sm text-slate-200 flex items-center gap-2">
              <History className="w-4 h-4 text-sky-400" /> Historial de Movimientos
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Cargando movimientos...</div>
            ) : (
              <div className="divide-y divide-slate-800/60 max-h-[500px] overflow-y-auto">
                {filteredMovimientos.map((m) => (
                  <div key={m.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-900/40 transition">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        m.tipo === 'Entrada'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : m.tipo === 'Salida'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {m.tipo === 'Entrada' ? <ArrowUpRight className="w-5 h-5" /> : m.tipo === 'Salida' ? <ArrowDownRight className="w-5 h-5" /> : <RefreshCw className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-200">{m.producto?.nombre || 'Producto'}</h4>
                        <p className="text-[11px] text-slate-400">{m.motivo}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`font-black text-sm block ${
                        m.tipo === 'Entrada' ? 'text-emerald-400' : m.tipo === 'Salida' ? 'text-rose-400' : 'text-amber-400'
                      }`}>
                        {m.tipo === 'Entrada' ? '+' : m.tipo === 'Salida' ? '-' : ''}{m.cantidad} uds
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(m.fecha).toLocaleString('es-MX')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
