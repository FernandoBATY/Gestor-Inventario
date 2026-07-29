'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Wallet,
  Unlock,
  Lock,
  Calendar,
  TrendingUp,
  TrendingDown,
  Play,
  Square,
} from 'lucide-react';
import type { CorteCaja } from '@/lib/types';

interface CorteActual extends CorteCaja {
  total_ventas?: number;
  total_gastos?: number;
}

export default function CortesPage() {
  const [actual, setActual] = useState<CorteActual | null>(null);
  const [historial, setHistorial] = useState<CorteCaja[]>([]);
  const [loading, setLoading] = useState(true);
  const [fondoInicial, setFondoInicial] = useState('');
  const [montoCierre, setMontoCierre] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCortes();
  }, []);

  const fetchCortes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cortes-caja');
      if (res.ok) {
        const data = await res.json();
        setActual(data.actual || null);
        setHistorial(data.historial || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAbrir = async () => {
    const monto = parseFloat(fondoInicial) || 0;
    if (!confirm(`¿Abrir caja con fondo inicial de $${monto.toFixed(2)}?`)) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/cortes-caja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'abrir', fondo_inicial: monto }),
      });
      if (res.ok) {
        toast.success('Caja abierta correctamente');
        setFondoInicial('');
        await fetchCortes();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Error al abrir corte');
      }
    } catch {
      toast.error('Error al abrir corte');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCerrar = async () => {
    const monto = parseFloat(montoCierre) || 0;
    if (!confirm(`¿Cerrar caja con efectivo real de $${monto.toFixed(2)}?`)) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/cortes-caja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'cerrar', corte_id: actual?.id, monto_cierre: monto }),
      });
      if (res.ok) {
        toast.success('Caja cerrada correctamente');
        setMontoCierre('');
        await fetchCortes();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Error al cerrar corte');
      }
    } catch {
      toast.error('Error al cerrar corte');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-headline text-xl sm:text-2xl font-bold tracking-tight text-[#201816] flex items-center gap-2">
            <Wallet className="w-6 h-6 text-[#6f5249]" /> Cortes de Caja
          </h1>
          <p className="text-xs text-[#7c6b64] mt-1">Abre y cierra la caja registradora diariamente</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-panel rounded-2xl p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <>
          {/* CORTE ACTUAL */}
          <div className={`glass-panel rounded-2xl p-5 border ${actual?.estado === 'Abierto' ? 'border-[#2f5f4d] ring-1 ring-[#2f5f4d]/20' : 'border-[#d7c7c0]'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {actual?.estado === 'Abierto' ? (
                  <Unlock className="w-5 h-5 text-[#2f5f4d]" />
                ) : (
                  <Lock className="w-5 h-5 text-[#7c6b64]" />
                )}
                <h2 className="font-bold text-base text-[#201816]">
                  {actual ? `Corte de hoy ${actual.estado === 'Abierto' ? '(Abierto)' : '(Cerrado)'}` : 'No hay corte para hoy'}
                </h2>
              </div>
              {actual?.fecha_apertura && (
                <span className="text-[10px] text-[#7c6b64]">
                  {new Date(actual.fecha_apertura).toLocaleString('es-MX')}
                </span>
              )}
            </div>

            {!actual ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[#7c6b64] mb-1">Fondo inicial</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#7c6b64]">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={fondoInicial}
                      onChange={(e) => setFondoInicial(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 bg-[#fffaf7] border border-[#d7c7c0] rounded-xl px-3 py-2 text-sm text-[#201816] outline-none focus:border-[#9d7b6f]"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAbrir}
                  disabled={submitting}
                  className="bg-[#2f5f4d] hover:bg-[#254c3f] disabled:bg-[#c4b5ae] text-[#fff8f4] font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 transition"
                >
                  <Play className="w-4 h-4" />
                  {submitting ? 'Abriendo...' : 'Abrir Caja'}
                </button>
              </div>
            ) : actual.estado === 'Abierto' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#f6efe8] rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-[#7c6b64]">Fondo inicial</p>
                    <p className="text-sm font-extrabold text-[#201816] mt-1">${Number(actual.fondo_inicial).toFixed(2)}</p>
                  </div>
                  <div className="bg-[#edf6f1] rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-[#2f5f4d] flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Ventas hoy
                    </p>
                    <p className="text-sm font-extrabold text-[#2f5f4d] mt-1">${Number(actual.total_ventas || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-[#f8ecea] rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-[#9f5d55] flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" /> Gastos hoy
                    </p>
                    <p className="text-sm font-extrabold text-[#9f5d55] mt-1">${Number(actual.total_gastos || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-[#fffaf7] rounded-xl p-3 border border-[#d7c7c0]">
                    <p className="text-[10px] font-semibold text-[#7c6b64]">Esperado</p>
                    <p className="text-sm font-extrabold text-[#201816] mt-1">
                      ${(Number(actual.fondo_inicial) + Number(actual.total_ventas || 0) - Number(actual.total_gastos || 0)).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 pt-2 border-t border-[#e6d8d2]">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-[#7c6b64] mb-1">Efectivo real contado</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#7c6b64]">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={montoCierre}
                        onChange={(e) => setMontoCierre(e.target.value)}
                        placeholder="0.00"
                        className="flex-1 bg-[#fffaf7] border border-[#d7c7c0] rounded-xl px-3 py-2 text-sm text-[#201816] outline-none focus:border-[#9d7b6f]"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {parseFloat(montoCierre) > 0 && (
                      <div className="text-xs px-3 py-2 rounded-xl bg-[#f6efe8] border border-[#d7c7c0]">
                        <span className="text-[#7c6b64]">Diferencia: </span>
                        <span className={`font-bold ${(parseFloat(montoCierre) - (Number(actual.fondo_inicial) + Number(actual.total_ventas || 0) - Number(actual.total_gastos || 0))) >= 0 ? 'text-[#2f5f4d]' : 'text-[#b91c1c]'}`}>
                          {(parseFloat(montoCierre) - (Number(actual.fondo_inicial) + Number(actual.total_ventas || 0) - Number(actual.total_gastos || 0))).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={handleCerrar}
                      disabled={submitting || !montoCierre}
                      className="bg-[#9f5d55] hover:bg-[#87463d] disabled:bg-[#c4b5ae] text-[#fff8f4] font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 transition"
                    >
                      <Square className="w-4 h-4" />
                      {submitting ? 'Cerrando...' : 'Cerrar Caja'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#f6efe8] rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-[#7c6b64] flex items-center gap-1"><Calendar className="w-3 h-3" /> Apertura</p>
                  <p className="text-xs font-bold text-[#201816] mt-1">{new Date(actual.fecha_apertura).toLocaleString('es-MX')}</p>
                </div>
                <div className="bg-[#edf6f1] rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-[#2f5f4d]">Ingresos</p>
                  <p className="text-sm font-extrabold text-[#2f5f4d] mt-1">${Number(actual.ingresos).toFixed(2)}</p>
                </div>
                <div className="bg-[#f8ecea] rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-[#9f5d55]">Egresos</p>
                  <p className="text-sm font-extrabold text-[#9f5d55] mt-1">${Number(actual.egresos).toFixed(2)}</p>
                </div>
                <div className="bg-[#fffaf7] rounded-xl p-3 border border-[#d7c7c0]">
                  <p className="text-[10px] font-semibold text-[#7c6b64]">Cierre</p>
                  <p className="text-xs font-bold text-[#201816] mt-1">{actual.fecha_cierre ? new Date(actual.fecha_cierre).toLocaleString('es-MX') : '—'}</p>
                </div>
              </div>
            )}
          </div>

          {/* HISTORIAL */}
          <div>
            <h3 className="font-bold text-sm text-[#201816] mb-3">Historial de cortes</h3>
            {historial.length === 0 ? (
              <div className="glass-panel border border-[#d7c7c0] rounded-2xl p-8 text-center">
                <Wallet className="w-10 h-10 text-[#d7c7c0] mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#7c6b64]">No hay cortes registrados</p>
                <p className="text-xs text-[#7c6b64] mt-1">Abre la caja para comenzar el registro diario.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {historial.map((corte) => (
                  <div key={corte.id} className="glass-panel border border-[#d7c7c0] rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {corte.estado === 'Abierto' ? (
                          <Unlock className="w-4 h-4 text-[#2f5f4d]" />
                        ) : (
                          <Lock className="w-4 h-4 text-[#7c6b64]" />
                        )}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${corte.estado === 'Abierto' ? 'bg-[#edf6f1] text-[#2f5f4d]' : 'bg-[#f6efe8] text-[#7c6b64]'}`}>
                          {corte.estado}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#7c6b64]">{new Date(corte.fecha_apertura).toLocaleDateString('es-MX')}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      <div className="bg-[#f6efe8] rounded-xl p-2.5">
                        <p className="text-[9px] text-[#7c6b64]">Fondo</p>
                        <p className="font-bold text-[#201816]">${Number(corte.fondo_inicial).toFixed(2)}</p>
                      </div>
                      <div className="bg-[#edf6f1] rounded-xl p-2.5">
                        <p className="text-[9px] text-[#2f5f4d]">Ingresos</p>
                        <p className="font-bold text-[#2f5f4d]">${Number(corte.ingresos).toFixed(2)}</p>
                      </div>
                      <div className="bg-[#f8ecea] rounded-xl p-2.5">
                        <p className="text-[9px] text-[#9f5d55]">Egresos</p>
                        <p className="font-bold text-[#9f5d55]">${Number(corte.egresos).toFixed(2)}</p>
                      </div>
                      <div className="bg-[#fffaf7] rounded-xl p-2.5 border border-[#d7c7c0]">
                        <p className="text-[9px] text-[#7c6b64]">Esperado</p>
                        <p className="font-bold text-[#201816]">${Number(corte.total_esperado).toFixed(2)}</p>
                      </div>
                      <div className={`rounded-xl p-2.5 border ${Number(corte.diferencia) >= 0 ? 'bg-[#edf6f1] border-[#cfe0d8]' : 'bg-[#f8ecea] border-[#e2c8c4]'}`}>
                        <p className="text-[9px] text-[#7c6b64]">Diferencia</p>
                        <p className={`font-bold ${Number(corte.diferencia) >= 0 ? 'text-[#2f5f4d]' : 'text-[#b91c1c]'}`}>
                          {Number(corte.diferencia) >= 0 ? '+' : ''}${Number(corte.diferencia || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
