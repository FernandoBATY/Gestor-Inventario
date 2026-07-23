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
  ChevronRight,
  Ticket,
  Package,
  Target
} from 'lucide-react';
import ChartsWrapper from '@/components/dashboard/ChartsWrapper';

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

  const barChartData = stats?.ventasUltimos7Dias?.map((item: any) => ({
    fecha: new Date(item.fecha).toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit' }),
    Ventas: Number(item.total) || 0,
  })) || [];

  const topProductsData = stats?.productosMasVendidos?.map((item: any) => ({
    nombre: item.nombre.length > 16 ? item.nombre.substring(0, 16) + '...' : item.nombre,
    Unidades: item.cantidad,
  })) || [];

  return (
    <div className="space-y-6">
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

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-panel rounded-2xl p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
                <Ticket className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-[#201816]">{moneyFormatter.format(Number(stats?.ticketPromedio || 0))}</span>
            </div>
            <div className="mt-2 text-[11px] text-[#7c6b64]">
              Promedio por cada venta registrada
            </div>
          </div>

          <div className="glass-panel border border-[#d7c7c0] rounded-2xl p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#7c6b64]">Costo Total Inventario</span>
              <div className="w-9 h-9 rounded-xl bg-[#efe3db] text-[#6f5249] flex items-center justify-center border border-[#d7c7c0]">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-[#201816]">{moneyFormatter.format(Number(stats?.costoTotalInventario || 0))}</span>
            </div>
            <div className="mt-2 text-[11px] text-[#7c6b64]">
              Inversión total en productos en existencia
            </div>
          </div>

          <div className="glass-panel border border-[#d7c7c0] rounded-2xl p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#7c6b64]">Ganancia Potencial</span>
              <div className="w-9 h-9 rounded-xl bg-[#efe3db] text-[#6f5249] flex items-center justify-center border border-[#d7c7c0]">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-[#7f9b76]">{moneyFormatter.format(Number(stats?.gananciaPotencial || 0))}</span>
            </div>
            <div className="mt-2 text-[11px] text-[#7c6b64]">
              Utilidad estimada si se vende todo el inventario
            </div>
          </div>
        </div>
      )}

      {stats && (
        <div className="glass-panel border border-[#d7c7c0] rounded-3xl p-6">
          <h3 className="font-extrabold text-base text-[#201816] mb-1 flex items-center gap-2">
            <Target className="w-4 h-4 text-[#6f5249]" /> Meta vs Realidad
          </h3>
          <p className="text-xs text-[#7c6b64] mb-4">Comparativa del total vendido contra la ganancia potencial del inventario actual</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#f6efe8] rounded-2xl p-5 border border-[#dbc9c2]">
              <span className="text-xs font-semibold text-[#7c6b64] block">Total Vendido (Real)</span>
              <span className="text-3xl font-black text-[#201816]">{moneyFormatter.format(Number(stats?.totalVendido || 0))}</span>
              <div className="mt-2 h-3 rounded-full bg-[#e6d8d2] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#2f1e18] transition-all"
                  style={{ width: `${Math.min(100, (Number(stats?.totalVendido || 0) / Math.max(1, Number(stats?.gananciaPotencial || 1))) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-[#7c6b64] mt-1">
                {stats?.gananciaPotencial > 0
                  ? `${((Number(stats?.totalVendido || 0) / Number(stats?.gananciaPotencial || 1)) * 100).toFixed(1)}% de la meta potencial`
                  : 'Sin datos de meta'}
              </p>
            </div>
            <div className="bg-[#f6efe8] rounded-2xl p-5 border border-[#dbc9c2]">
              <span className="text-xs font-semibold text-[#7c6b64] block">Ganancia Potencial (Meta)</span>
              <span className="text-3xl font-black text-[#7f9b76]">{moneyFormatter.format(Number(stats?.gananciaPotencial || 0))}</span>
              <div className="mt-2 h-3 rounded-full bg-[#e6d8d2] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#7f9b76] transition-all"
                  style={{ width: `${Math.min(100, (Number(stats?.gananciaPotencial || 0) / Math.max(1, Number(stats?.precioVentaTotal || 1))) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-[#7c6b64] mt-1">
                {((Number(stats?.gananciaPotencial || 0) / Math.max(1, Number(stats?.precioVentaTotal || 1))) * 100).toFixed(1)}% de margen sobre precio de venta
              </p>
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
                <div key={prod.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={prod.fotografia}
                      alt={prod.nombre}
                      className="w-10 h-10 rounded-lg object-cover bg-[#f2edeb] border border-[#d7c7c0] shrink-0"
                      loading="lazy"
                      onError={(event) => {
                        const target = event.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-[#201816] truncate">{prod.nombre}</h4>
                      <span className="text-[11px] text-[#7c6b64]">{prod.marca} • SKU: {prod.sku}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#efe3db] text-[#6f5249] border border-[#d7c7c0]">
                      {prod.unidades} uds
                    </span>
                    <span className="text-[10px] text-[#7c6b64] block mt-0.5">Mín: {prod.stock_minimo}</span>
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
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#f6efe8] border border-[#dbc9c2] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#7c6b64] block">Total de Productos</span>
                  <span className="text-lg font-bold text-[#201816]">{stats?.totalProductos || 0}</span>
                </div>
                <Link href="/admin/productos" className="p-2 text-[#6f5249] hover:bg-[#efe3db] rounded-lg transition">
                  <ArrowUpRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#f6efe8] border border-[#dbc9c2] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#7c6b64] block">Ventas Registradas</span>
                  <span className="text-lg font-bold text-[#201816]">{stats?.totalVentasCount || 0}</span>
                </div>
                <Link href="/admin/ventas" className="p-2 text-[#6f5249] hover:bg-[#efe3db] rounded-lg transition">
                  <ArrowUpRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#f6efe8] border border-[#dbc9c2]">
                <span className="text-xs text-[#7c6b64] block">Última venta</span>
                <span className="text-sm font-semibold text-[#201816]">
                  {stats?.ultimaVentaFecha ? new Date(stats.ultimaVentaFecha).toLocaleString('es-MX') : 'Sin movimientos recientes'}
                </span>
                <Link href="/admin/ventas" className="text-xs font-semibold text-[#6f5249] hover:text-[#2f1e18] transition inline-flex items-center gap-1 mt-2">
                  Ir a Punto de Venta <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#e6d8d2] text-center">
            <p className="text-[10px] text-[#7c6b64]">Servidor Node.js API & Base de datos Supabase activos</p>
          </div>
        </div>
      </div>

      <ChartsWrapper
        barChartData={barChartData}
        topProductsData={topProductsData}
        stats={stats ? {
          ventasDia: stats.ventasDia,
          ventasMes: stats.ventasMes,
          totalVendido: stats.totalVendido,
          totalProductos: stats.totalProductos,
          productosBajoStockCount: stats.productosBajoStockCount,
          ticketPromedio: stats.ticketPromedio,
          totalVentasCount: stats.totalVentasCount,
          costoTotalInventario: stats.costoTotalInventario,
          precioVentaTotal: stats.precioVentaTotal,
          gananciaPotencial: stats.gananciaPotencial,
        } : null}
      />
    </div>
  );
}
