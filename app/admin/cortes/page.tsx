'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Unlock,
  Lock,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import type { CorteCaja } from '@/lib/types';

export default function CortesPage() {
  const [cortes, setCortes] = useState<CorteCaja[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCortes();
  }, []);

  const fetchCortes = async () => {
    try {
      const res = await fetch('/api/cortes-caja');
      if (res.ok) {
        const data = await res.json();
        setCortes(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-headline text-xl sm:text-2xl font-bold tracking-tight text-[#201816] flex items-center gap-2">
          <Wallet className="w-6 h-6 text-[#6f5249]" /> Cortes de Caja
        </h1>
        <p className="text-xs text-[#7c6b64] mt-1">Historial de aperturas y cierres de caja</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel rounded-2xl p-5 animate-pulse h-20" />
          ))}
        </div>
      ) : cortes.length === 0 ? (
        <div className="glass-panel border border-[#d7c7c0] rounded-2xl p-8 text-center">
          <Wallet className="w-10 h-10 text-[#d7c7c0] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#7c6b64]">No hay cortes registrados</p>
          <p className="text-xs text-[#7c6b64] mt-1">
            Los cortes aparecerán aquí después de cerrar la caja en Configuración
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {cortes.map((corte) => (
            <div
              key={corte.id}
              className="glass-panel border border-[#d7c7c0] rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {corte.estado === 'Abierto' ? (
                    <Unlock className="w-4 h-4 text-[#2f5f4d]" />
                  ) : (
                    <Lock className="w-4 h-4 text-[#7c6b64]" />
                  )}
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    corte.estado === 'Abierto' ? 'bg-[#edf6f1] text-[#2f5f4d]' : 'bg-[#f6efe8] text-[#7c6b64]'
                  }`}>
                    {corte.estado}
                  </span>
                </div>
                <span className="text-[10px] text-[#7c6b64] font-mono">{corte.id?.slice(0, 8)}...</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#f6efe8] rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-[#7c6b64] flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Apertura
                  </p>
                  <p className="text-xs font-bold text-[#201816] mt-1">
                    {new Date(corte.fecha_apertura).toLocaleDateString('es-MX', {
                      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="bg-[#edf6f1] rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-[#2f5f4d] flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Ingresos
                  </p>
                  <p className="text-sm font-extrabold text-[#2f5f4d] mt-1">${Number(corte.ingresos).toFixed(2)}</p>
                </div>

                <div className="bg-[#f8ecea] rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-[#9f5d55] flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" /> Egresos
                  </p>
                  <p className="text-sm font-extrabold text-[#9f5d55] mt-1">${Number(corte.egresos).toFixed(2)}</p>
                </div>

                <div className="bg-[#fffaf7] rounded-xl p-3 border border-[#d7c7c0]">
                  <p className="text-[10px] font-semibold text-[#7c6b64]">Cierre</p>
                  <p className="text-sm font-extrabold text-[#201816] mt-1">
                    {corte.fecha_cierre
                      ? new Date(corte.fecha_cierre).toLocaleDateString('es-MX', {
                          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                        })
                      : '—'}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                <span className="text-[#7c6b64]">
                  Fondo inicial: <strong className="text-[#201816]">${Number(corte.fondo_inicial).toFixed(2)}</strong>
                </span>
                <span className="text-[#7c6b64]">
                  Esperado: <strong className="text-[#201816]">${Number(corte.total_esperado).toFixed(2)}</strong>
                </span>
                <span className="text-[#7c6b64]">
                  Real: <strong className="text-[#201816]">${Number(corte.total_real || 0).toFixed(2)}</strong>
                </span>
                <span className={`font-bold ${Number(corte.diferencia) >= 0 ? 'text-[#2f5f4d]' : 'text-[#b91c1c]'}`}>
                  {Number(corte.diferencia) >= 0 ? '+' : ''}${Number(corte.diferencia || 0).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
