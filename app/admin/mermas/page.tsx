'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Loader from '@/components/Loader';
import { Producto, Merma } from '@/lib/types';
import {
  PackageX,
  Package,
  PlusCircle,
  History,
  Search,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

const MOTIVOS = ['Dañado', 'Vencido', 'Extraviado', 'Otro'] as const;

const MOTIVO_CLS: Record<string, string> = {
  Dañado: 'bg-[#fee2e2] text-[#b91c1c] border-[#fecaca]',
  Vencido: 'bg-[#fff4e0] text-[#b45309] border-[#fcd9a8]',
  Extraviado: 'bg-[#efe3db] text-[#6f5249] border-[#d7c7c0]',
  Otro: 'bg-[#edf6f1] text-[#16a34a] border-[#c9e6d8]',
};

export default function MermasPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [mermas, setMermas] = useState<Merma[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [selectedProdId, setSelectedProdId] = useState('');
  const [motivo, setMotivo] = useState<typeof MOTIVOS[number]>('Dañado');
  const [cantidad, setCantidad] = useState('1');
  const [observacion, setObservacion] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProd, resMermas] = await Promise.all([
        fetch('/api/productos'),
        fetch('/api/mermas'),
      ]);
      if (resProd.ok) setProductos(await resProd.json());
      if (resMermas.ok) setMermas(await resMermas.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProdId) {
      toast.error('Selecciona un producto');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/mermas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          producto_id: selectedProdId,
          cantidad: Number(cantidad),
          motivo,
          observacion,
        }),
      });

      if (res.ok) {
        toast.success('Merma registrada y stock actualizado');
        setCantidad('1');
        setObservacion('');
        await fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Error al registrar merma');
      }
    } catch {
      toast.error('Error al registrar merma');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = mermas.filter((m) => {
    const prodName = m.producto?.nombre || '';
    return prodName.toLowerCase().includes(search.toLowerCase()) || m.motivo.toLowerCase().includes(search.toLowerCase());
  });

  const totalMerma = filtered.reduce((s, m) => s + Number(m.cantidad), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#201816] flex items-center gap-2">
          <PackageX className="w-7 h-7 text-[#6f5249]" /> Mermas
        </h1>
        <p className="text-xs text-[#7c6b64] mt-1">Registra productos dañados, vencidos o extraviados. El stock se descuenta automáticamente.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* REGISTRATION FORM */}
        <div className="glass-panel border border-[#d7c7c0] rounded-3xl p-6 h-fit">
          <h3 className="text-base font-bold text-[#201816] mb-4 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-[#6f5249]" /> Registrar Merma
          </h3>

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
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
              <label className="block text-[#7c6b64] font-semibold mb-1">Motivo</label>
              <div className="grid grid-cols-2 gap-2">
                {MOTIVOS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMotivo(m)}
                    className={`py-2 rounded-xl font-bold transition ${
                      motivo === m
                        ? 'bg-[#2f1e18] text-[#fff8f4] shadow-lg shadow-[#2f1e18]/15'
                        : 'bg-[#fffaf7] text-[#7c6b64] border border-[#d7c7c0]'
                    }`}
                  >
                    {m}
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
              <label className="block text-[#7c6b64] font-semibold mb-1">Observación (opcional)</label>
              <input
                type="text"
                placeholder="Ej. Lote dañado en bodega, envase roto"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                className="w-full bg-[#fffaf7] border border-[#d7c7c0] rounded-xl p-2.5 text-[#201816] outline-none focus:border-[#9d7b6f]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#9f5d55] hover:bg-[#8a4e47] disabled:bg-[#c4b5ae] text-[#fff8f4] font-semibold py-3 px-4 rounded-xl shadow-lg shadow-[#9f5d55]/15 transition mt-4"
            >
              {submitting ? 'Registrando...' : 'Registrar Merma'}
            </button>
          </form>
        </div>

        {/* MERMAS HISTORY */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#d7c7c0]">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#7c6b64]" />
              <input
                type="text"
                placeholder="Buscar en historial..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#fffaf7] border border-[#d7c7c0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#201816] placeholder:text-[#9a8a83] outline-none"
              />
            </div>
            <p className="text-xs font-semibold text-[#7c6b64]">
              {filtered.length} merma(s) · {totalMerma} unidades
            </p>
          </div>

          <div className="glass-panel border border-[#d7c7c0] rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#e6d8d2] font-bold text-sm text-[#201816] flex items-center gap-2">
              <History className="w-4 h-4 text-[#6f5249]" /> Historial de Mermas
            </div>

            {loading ? (
              <Loader label="Cargando mermas..." />
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-[#7c6b64] text-xs">
                No hay mermas registradas. Usa el formulario para registrar la primera.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f6efe8] text-[#7c6b64] font-semibold border-b border-[#d7c7c0]">
                    <tr>
                      <th className="py-3 px-4">Producto</th>
                      <th className="py-3 px-4">Motivo</th>
                      <th className="py-3 px-4">Cantidad</th>
                      <th className="py-3 px-4">Observación</th>
                      <th className="py-3 px-4">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e6d8d2]">
                    {filtered.map((m) => (
                      <tr key={m.id} className="hover:bg-[#fffaf7] transition-colors">
                        <td className="py-3 px-4 font-semibold text-[#201816] flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-[#6f5249] shrink-0" />
                          {m.producto?.nombre || 'Producto eliminado'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${MOTIVO_CLS[m.motivo] || MOTIVO_CLS.Otro}`}>
                            {m.motivo}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-[#9f5d55]">-{m.cantidad}</td>
                        <td className="py-3 px-4 text-[#7c6b64]">{m.observacion || '—'}</td>
                        <td className="py-3 px-4 text-[#7c6b64] whitespace-nowrap">
                          {new Date(m.fecha).toLocaleString('es-MX')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
