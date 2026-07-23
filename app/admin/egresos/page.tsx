'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  AlertTriangle,
  Receipt,
  Search,
  Calendar
} from 'lucide-react';
import type { Gasto } from '@/lib/types';

export default function EgresosPage() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGastos();
  }, []);

  const fetchGastos = async () => {
    try {
      const res = await fetch('/api/gastos');
      if (res.ok) setGastos(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!descripcion || !monto) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/gastos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcion, monto: parseFloat(monto) }),
      });
      if (res.ok) {
        setDescripcion('');
        setMonto('');
        setShowForm(false);
        await fetchGastos();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id || !confirm('¿Eliminar este gasto?')) return;
    try {
      const res = await fetch(`/api/gastos?id=${id}`, { method: 'DELETE' });
      if (res.ok) await fetchGastos();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = gastos.filter((g) =>
    g.descripcion.toLowerCase().includes(search.toLowerCase())
  );

  const totalGastos = filtered.reduce((s, g) => s + Number(g.monto), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-headline text-xl sm:text-2xl font-bold tracking-tight text-[#201816] flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#6f5249]" /> Egresos
          </h1>
          <p className="text-xs text-[#7c6b64] mt-1">
            {gastos.length} registro(s) · Total: ${totalGastos.toFixed(2)}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#2f1e18] hover:bg-[#412820] text-[#fff8f4] font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancelar' : 'Nuevo Gasto'}
        </button>
      </div>

      {showForm && (
        <div className="glass-panel border border-[#d7c7c0] rounded-2xl p-4 space-y-3">
          <h3 className="font-bold text-sm text-[#201816]">Registrar Gasto</h3>
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción del gasto"
            className="w-full bg-[#fffaf7] border border-[#d7c7c0] rounded-xl px-4 py-2.5 text-sm text-[#201816] outline-none focus:border-[#9d7b6f]"
          />
          <input
            type="number"
            step="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="Monto"
            className="w-full bg-[#fffaf7] border border-[#d7c7c0] rounded-xl px-4 py-2.5 text-sm text-[#201816] outline-none focus:border-[#9d7b6f]"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!descripcion || !monto || submitting}
              className="bg-[#2f5f4d] hover:bg-[#254c3f] disabled:bg-[#c4b5ae] text-[#fff8f4] font-semibold text-xs px-4 py-2 rounded-xl transition"
            >
              {submitting ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-xs font-semibold text-[#7c6b64] hover:text-[#201816] px-4 py-2 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c6b64]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar gasto..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#fffaf7] border border-[#d7c7c0] rounded-xl text-sm text-[#201816] outline-none focus:border-[#9d7b6f]"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-panel rounded-2xl p-4 animate-pulse h-14" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel border border-[#d7c7c0] rounded-2xl p-8 text-center">
          <Receipt className="w-10 h-10 text-[#d7c7c0] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#7c6b64]">No hay gastos registrados</p>
          <p className="text-xs text-[#7c6b64] mt-1">Agrega tu primer gasto usando el botón superior</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((gasto) => (
            <div
              key={gasto.id}
              className="glass-panel border border-[#d7c7c0] rounded-2xl p-4 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[#201816] truncate">{gasto.descripcion}</p>
                <p className="text-[10px] text-[#7c6b64] flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(gasto.fecha).toLocaleString('es-MX')}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-extrabold text-sm text-[#b91c1c]">-${Number(gasto.monto).toFixed(2)}</span>
                <button
                  onClick={() => handleDelete(gasto.id)}
                  className="p-2 bg-[#f8ecea] hover:bg-[#f3d6d1] text-[#b91c1c] rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
