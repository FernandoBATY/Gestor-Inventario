'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  AlertTriangle, 
  PackageCheck,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Visión General del Negocio
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Dashboard Principal</h1>
          <p className="text-xs text-slate-400 mt-1">Estadísticas clave, ingresos y control de inventario en tiempo real.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/ventas"
            className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-sky-600/25 transition"
          >
            + Nueva Venta POS
          </Link>
        </div>
      </div>

      {/* KPI STAT CARDS */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel rounded-2xl p-5 animate-pulse h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* CARD 1: VENTAS DEL DIA */}
          <div className="glass-panel border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Ventas del Día</span>
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-white">${Number(stats?.ventasDia || 0).toFixed(2)}</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Actualizado hace unos momentos</span>
            </div>
          </div>

          {/* CARD 2: VENTAS DEL MES */}
          <div className="glass-panel border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Ventas del Mes</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-white">${Number(stats?.ventasMes || 0).toFixed(2)}</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Ingresos mensuales acumulados
            </div>
          </div>

          {/* CARD 3: TOTAL VENDIDO */}
          <div className="glass-panel border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Total Vendido</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-white">${Number(stats?.totalVendido || 0).toFixed(2)}</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Histórico general de transacciones
            </div>
          </div>

          {/* CARD 4: PRODUCTOS BAJO STOCK */}
          <div className="glass-panel border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Productos Bajo Stock</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-amber-400">{stats?.productosBajoStockCount || 0}</span>
            </div>
            <div className="mt-2 text-[11px] text-amber-500/80">
              Requieren reabastecimiento urgente
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD DETAILS CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: LOW STOCK ALERT FEED */}
        <div className="lg:col-span-2 glass-panel border border-slate-800/80 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Alertas de Inventario Bajo
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Productos con cantidad actual menor o igual al stock mínimo configurado.</p>
            </div>
            <Link
              href="/admin/inventario"
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
            >
              <span>Gestionar Stock</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats?.productosBajoStock?.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800/60">
              <PackageCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="font-semibold text-sm text-slate-200">¡Inventario en excelente estado!</p>
              <p className="text-xs text-slate-400">Todos los productos superan su nivel de stock mínimo.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {stats?.productosBajoStock?.map((prod: any) => (
                <div key={prod.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={prod.fotografia || 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&q=80'}
                      alt={prod.nombre}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-slate-800"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{prod.nombre}</h4>
                      <span className="text-[11px] text-slate-400">{prod.marca} • SKU: {prod.sku}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {prod.unidades} uds disponibles
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Mín: {prod.stock_minimo} uds</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SYSTEM QUICK STATS */}
        <div className="glass-panel border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-white mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" /> Resumen del Sistema
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Total de Productos</span>
                  <span className="text-xl font-bold text-white">{stats?.totalProductos || 0} catálogo</span>
                </div>
                <Link href="/admin/productos" className="p-2 text-sky-400 hover:bg-sky-500/10 rounded-lg transition">
                  <ArrowUpRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Ventas Registradas</span>
                  <span className="text-xl font-bold text-white">{stats?.totalVentasCount || 0} folios</span>
                </div>
                <Link href="/admin/ventas" className="p-2 text-sky-400 hover:bg-sky-500/10 rounded-lg transition">
                  <ArrowUpRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-400">Servidor Node.js API & Base de datos Supabase activos</p>
          </div>
        </div>
      </div>
    </div>
  );
}
