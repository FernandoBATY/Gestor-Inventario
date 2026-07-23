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
        <h1 className="text-3xl font-extrabold tracking-tight text-[#201816] flex items-center gap-2">
          <Boxes className="w-7 h-7 text-[#6f5249]" /> Movimientos de Inventario
        </h1>
        <p className="text-xs text-[#7c6b64] mt-1">Registra entradas, salidas, ajustes de stock y consulta el historial completo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* REGISTRATION FORM */}
        <div className="glass-panel border border-[#d7c7c0] rounded-3xl p-6 h-fit">
          <h3 className="text-base font-bold text-[#201816] mb-4 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-[#6f5249]" /> Registrar Movimiento
          </h3>

          <form onSubmit={handleRegisterMovement} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#7c6b64] font-semibold mb-1">Producto</label>
              <select
                required
                value={selectedProdId}
                onChange={(e) => setSelectedProdId(e.target.value)}
                className="w-full bg-[#fffaf7] border border-[#d7c7c0] rounded-xl p-2.5 text-[#201816] outline-none focus:border-[#9d7b6f]"
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
              <label className="block text-[#7c6b64] font-semibold mb-1">Tipo de Movimiento</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Entrada', 'Salida', 'Ajuste'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    className={`py-2 rounded-xl font-bold transition ${
                      tipo === t
                        ? 'bg-[#2f1e18] text-[#fff8f4] shadow-lg shadow-[#2f1e18]/15'
                        : 'bg-[#fffaf7] text-[#7c6b64] border border-[#d7c7c0]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[#7c6b64] font-semibold mb-1">Cantidad</label>
              <input
                type="number"
                min="1"
                required
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="w-full bg-[#fffaf7] border border-[#d7c7c0] rounded-xl p-2.5 text-[#201816] outline-none focus:border-[#9d7b6f]"
              />
            </div>

            <div>
              <label className="block text-[#7c6b64] font-semibold mb-1">Motivo / Descripción</label>
              <input
                type="text"
                required
                placeholder="Ej. Compra a distribuidor, Merma, Ajuste físico"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full bg-[#fffaf7] border border-[#d7c7c0] rounded-xl p-2.5 text-[#201816] outline-none focus:border-[#9d7b6f]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#2f1e18] hover:bg-[#412820] text-[#fff8f4] font-semibold py-3 px-4 rounded-xl shadow-lg shadow-[#2f1e18]/15 transition mt-4"
            >
              Guardar Movimiento
            </button>
          </form>
        </div>

        {/* MOVEMENTS HISTORY */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#d7c7c0]">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#7c6b64]" />
              <input
                type="text"
                placeholder="Buscar en historial..."
                value={searchMov}
                onChange={(e) => setSearchMov(e.target.value)}
                className="w-full bg-[#fffaf7] border border-[#d7c7c0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#201816] placeholder:text-[#9a8a83] outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <Filter className="w-4 h-4 text-[#7c6b64] shrink-0" />
              {['Todos', 'Entrada', 'Salida', 'Ajuste'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterTipo(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    filterTipo === t
                      ? 'bg-[#2f1e18] text-[#fff8f4]'
                      : 'bg-[#fffaf7] text-[#7c6b64] border border-[#d7c7c0]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel border border-[#d7c7c0] rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#e6d8d2] font-bold text-sm text-[#201816] flex items-center gap-2">
              <History className="w-4 h-4 text-[#6f5249]" /> Historial de Movimientos
            </div>

            {loading ? (
              <div className="p-8 text-center text-[#7c6b64] text-xs">Cargando movimientos...</div>
            ) : (
              <div className="divide-y divide-[#e6d8d2] max-h-[500px] overflow-y-auto">
                {filteredMovimientos.map((m) => (
                  <div key={m.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#f7f1ec] transition">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        m.tipo === 'Entrada'
                          ? 'bg-[#edf6f1] text-[#2f5f4d] border border-[#cfe0d8]'
                          : m.tipo === 'Salida'
                          ? 'bg-[#f8ecea] text-[#9f5d55] border border-[#e2c8c4]'
                          : 'bg-[#f7efe5] text-[#8a6f5c] border border-[#e1cfbd]'
                      }`}>
                        {m.tipo === 'Entrada' ? <ArrowUpRight className="w-5 h-5" /> : m.tipo === 'Salida' ? <ArrowDownRight className="w-5 h-5" /> : <RefreshCw className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#201816] truncate max-w-[160px] sm:max-w-[300px]">{m.producto?.nombre || 'Producto'}</h4>
                        <p className="text-[11px] text-[#7c6b64]">{m.motivo}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`font-black text-sm block ${
                        m.tipo === 'Entrada' ? 'text-[#2f5f4d]' : m.tipo === 'Salida' ? 'text-[#9f5d55]' : 'text-[#8a6f5c]'
                      }`}>
                        {m.tipo === 'Entrada' ? '+' : m.tipo === 'Salida' ? '-' : ''}{m.cantidad} uds
                      </span>
                      <span className="text-[10px] text-[#7c6b64]">
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
