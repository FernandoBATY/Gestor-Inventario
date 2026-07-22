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

const moneyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
});

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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e8ddd7] text-[#6f5249] border border-[#d3c1b8] mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Visión General del Negocio
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#201816]">Dashboard Principal</h1>
          <p className="text-xs text-[#7c6b64] mt-1">Estadísticas clave, ingresos y control de inventario en tiempo real.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/ventas"
            className="bg-[#2f1e18] hover:bg-[#412820] text-[#fff8f4] font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-[#2f1e18]/15 transition"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {/* CARD 1: VENTAS DEL DIA */}
          <div className="glass-panel border border-[#d7c7c0] rounded-2xl p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#7c6b64]">Ventas del Día</span>
              <div className="w-9 h-9 rounded-xl bg-[#efe3db] text-[#6f5249] flex items-center justify-center border border-[#d7c7c0]">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-[#201816]">{moneyFormatter.format(Number(stats?.ventasDia || 0))}</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-[#7f9b76]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Actualizado hace unos momentos</span>
            </div>
          </div>

          {/* CARD 2: VENTAS DEL MES */}
          <div className="glass-panel border border-[#d7c7c0] rounded-2xl p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#7c6b64]">Ventas del Mes</span>
              <div className="w-9 h-9 rounded-xl bg-[#efe3db] text-[#6f5249] flex items-center justify-center border border-[#d7c7c0]">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-[#201816]">{moneyFormatter.format(Number(stats?.ventasMes || 0))}</span>
            </div>
            <div className="mt-2 text-[11px] text-[#7c6b64]">
              Ingresos mensuales acumulados
            </div>
          </div>

          {/* CARD 3: TOTAL VENDIDO */}
          <div className="glass-panel border border-[#d7c7c0] rounded-2xl p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#7c6b64]">Total Vendido</span>
              <div className="w-9 h-9 rounded-xl bg-[#efe3db] text-[#6f5249] flex items-center justify-center border border-[#d7c7c0]">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-[#201816]">{moneyFormatter.format(Number(stats?.totalVendido || 0))}</span>
            </div>
            <div className="mt-2 text-[11px] text-[#7c6b64]">
              Histórico general de transacciones
            </div>
          </div>

          <div className="glass-panel border border-[#d7c7c0] rounded-2xl p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#7c6b64]">Productos Bajo Stock</span>
              <div className="w-9 h-9 rounded-xl bg-[#efe3db] text-[#6f5249] flex items-center justify-center border border-[#d7c7c0]">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-[#6f5249]">{stats?.productosBajoStockCount || 0}</span>
            </div>
            <div className="mt-2 text-[11px] text-[#8a6f5c]">
              Requieren reabastecimiento urgente
            </div>
          </div>

          <div className="glass-panel border border-[#d7c7c0] rounded-2xl p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#7c6b64]">Categorías activas</span>
              <div className="w-9 h-9 rounded-xl bg-[#efe3db] text-[#6f5249] flex items-center justify-center border border-[#d7c7c0]">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-[#201816]">{stats?.totalCategorias || 0}</span>
            </div>
            <div className="mt-2 text-[11px] text-[#7c6b64]">
              Categorías guardadas en el sistema
            </div>
          </div>

          <div className="glass-panel border border-[#d7c7c0] rounded-2xl p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#7c6b64]">Ticket promedio</span>
              <div className="w-9 h-9 rounded-xl bg-[#efe3db] text-[#6f5249] flex items-center justify-center border border-[#d7c7c0]">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-[#201816]">{moneyFormatter.format(Number(stats?.ticketPromedio || 0))}</span>
            </div>
            <div className="mt-2 text-[11px] text-[#7c6b64]">
              Promedio por cada venta registrada
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 glass-panel border border-[#d7c7c0] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-extrabold text-base text-[#201816] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#6f5249]" /> Alertas de Inventario Bajo
              </h3>
              <p className="text-xs text-[#7c6b64] mt-0.5">Productos con cantidad actual menor o igual al stock mínimo configurado.</p>
            </div>
            <Link
              href="/admin/inventario"
              className="text-xs font-semibold text-[#6f5249] hover:text-[#2f1e18] flex items-center gap-1 transition"
            >
              <span>Gestionar Stock</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats?.productosBajoStock?.length === 0 ? (
            <div className="p-8 text-center bg-[#f6efe8] rounded-2xl border border-[#dbc9c2]">
              <PackageCheck className="w-10 h-10 text-[#7f9b76] mx-auto mb-2" />
              <p className="font-semibold text-sm text-[#201816]">¡Inventario en excelente estado!</p>
              <p className="text-xs text-[#7c6b64]">Todos los productos superan su nivel de stock mínimo.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#e6d8d2]">
              {stats?.productosBajoStock?.map((prod: any) => (
                <div key={prod.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={prod.fotografia}
                      alt={prod.nombre}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-slate-800"
                      onError={(event) => {
                        const target = event.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <div>
                      <h4 className="font-bold text-sm text-[#201816]">{prod.nombre}</h4>
                      <span className="text-[11px] text-[#7c6b64]">{prod.marca} • SKU: {prod.sku}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#efe3db] text-[#6f5249] border border-[#d7c7c0]">
                      {prod.unidades} uds disponibles
                    </span>
                    <span className="text-[10px] text-[#7c6b64] block mt-0.5">Mín: {prod.stock_minimo} uds</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel border border-[#d7c7c0] rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-[#201816] mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#6f5249]" /> Resumen del Sistema
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#f6efe8] border border-[#dbc9c2] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#7c6b64] block">Total de Productos</span>
                  <span className="text-xl font-bold text-[#201816]">{stats?.totalProductos || 0} catálogo</span>
                </div>
                <Link href="/admin/productos" className="p-2 text-[#6f5249] hover:bg-[#efe3db] rounded-lg transition">
                  <ArrowUpRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="p-4 rounded-2xl bg-[#f6efe8] border border-[#dbc9c2] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#7c6b64] block">Ventas Registradas</span>
                  <span className="text-xl font-bold text-[#201816]">{stats?.totalVentasCount || 0} folios</span>
                </div>
                <Link href="/admin/ventas" className="p-2 text-[#6f5249] hover:bg-[#efe3db] rounded-lg transition">
                  <ArrowUpRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="p-4 rounded-2xl bg-[#f6efe8] border border-[#dbc9c2]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs text-[#7c6b64] block">Última venta</span>
                    <span className="text-sm font-semibold text-[#201816]">{stats?.ultimaVentaFecha ? new Date(stats.ultimaVentaFecha).toLocaleString('es-MX') : 'Sin movimientos recientes'}</span>
                  </div>
                </div>
                <Link href="/admin/ventas" className="text-xs font-semibold text-[#6f5249] hover:text-[#2f1e18] transition inline-flex items-center gap-1">
                  Ir a Punto de Venta <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-400">Servidor Node.js API & Base de datos Supabase activos</p>
          </div>
        </div>

        <div className="glass-panel border border-slate-800/80 rounded-3xl p-6">
          <h3 className="font-extrabold text-base text-white mb-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-400" /> Productos más vendidos
          </h3>

          {stats?.productosMasVendidos?.length ? (
            <div className="space-y-3">
              {stats.productosMasVendidos.map((item: any, index: number) => (
                <div key={`${item.nombre}-${index}`} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-100 text-sm">{item.nombre}</p>
                      <p className="text-[11px] text-slate-500">{item.cantidad} unidades vendidas</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">{moneyFormatter.format(Number(item.total || 0))}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-500"
                      style={{ width: `${Math.max(12, Math.min(100, (item.cantidad / Math.max(...stats.productosMasVendidos.map((p: any) => p.cantidad), 1)) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
              Todavía no hay ventas suficientes para mostrar un ranking.
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Ventas últimos 7 días</h4>
            {stats?.ventasUltimos7Dias?.length ? (
              <div className="space-y-2">
                {stats.ventasUltimos7Dias.map((item: any) => (
                  <div key={item.fecha} className="flex items-center gap-3">
                    <span className="w-24 text-[10px] text-slate-500 shrink-0">{new Date(item.fecha).toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit' })}</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
                        style={{ width: `${Math.max(8, Math.min(100, (Number(item.total || 0) / Math.max(...stats.ventasUltimos7Dias.map((p: any) => Number(p.total || 0)), 1)) * 100))}%` }}
                      />
                    </div>
                    <span className="w-24 text-right text-[11px] font-semibold text-slate-200 shrink-0">{moneyFormatter.format(Number(item.total || 0))}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Sin datos para graficar.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
