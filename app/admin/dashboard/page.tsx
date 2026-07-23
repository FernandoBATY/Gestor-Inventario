'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  PackageCheck,
  Sparkles,
  Calendar,
  ChevronRight,
  Ticket,
  Package,
  TrendingDown,
  Percent,
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
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async (inicio?: string, fin?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (inicio) params.set('fechaInicio', inicio);
      if (fin) params.set('fechaFin', fin);
      const qs = params.toString();
      const res = await fetch(`/api/dashboard${qs ? `?${qs}` : ''}`);
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

  const handleFilterDates = () => {
    fetchDashboard(fechaInicio, fechaFin);
  };

  const handleClearDates = () => {
    setFechaInicio('');
    setFechaFin('');
    fetchDashboard();
  };

  const barChartData = stats?.ventasUltimos7Dias?.map((item: any) => ({
    fecha: new Date(item.fecha).toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit' }),
    Ventas: Number(item.total) || 0,
  })) || [];

  const topProductsData = stats?.productosMasVendidos?.map((item: any) => ({
    nombre: item.nombre.length > 22 ? item.nombre.substring(0, 22) + '...' : item.nombre,
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

      <div className="glass-panel border border-[#d7c7c0] rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <Calendar className="w-4 h-4 text-[#6f5249] shrink-0" />
        <span className="text-xs font-semibold text-[#7c6b64] shrink-0">Filtrar por fecha:</span>
        <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full sm:w-auto bg-[#fffaf7] border border-[#d7c7c0] rounded-xl px-3 py-2 text-xs text-[#201816] outline-none focus:border-[#9d7b6f]" />
        <span className="text-xs text-[#7c6b64]">a</span>
        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full sm:w-auto bg-[#fffaf7] border border-[#d7c7c0] rounded-xl px-3 py-2 text-xs text-[#201816] outline-none focus:border-[#9d7b6f]" />
        <button onClick={handleFilterDates} className="bg-[#2f1e18] hover:bg-[#412820] text-[#fff8f4] text-xs font-semibold px-4 py-2 rounded-xl transition">Aplicar</button>
        {(fechaInicio || fechaFin) && (
          <button onClick={handleClearDates} className="text-xs font-semibold text-[#7c6b64] hover:text-[#201816] transition">Limpiar</button>
        )}
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
            <div className="mt-2 flex items-center gap-1 text-[11px] text-[#16a34a]">
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
            <div className="mt-2 text-[11px] text-[#b91c1c] font-semibold">
              Requieren reabastecimiento urgente
            </div>
          </div>

          <div className="glass-panel border border-[#d7c7c0] rounded-2xl p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#7c6b64]">Ticket Promedio</span>
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
              <span className="text-xs font-semibold text-[#7c6b64]">Gastos del Período</span>
              <div className="w-9 h-9 rounded-xl bg-[#f8ecea] text-[#9f5d55] flex items-center justify-center border border-[#e2c8c4]">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-[#9f5d55]">{moneyFormatter.format(Number(stats?.totalGastos || 0))}</span>
            </div>
            <div className="mt-2 text-[11px] text-[#7c6b64]">
              Egresos en el rango de fechas seleccionado
            </div>
          </div>

          <div className="glass-panel border border-[#d7c7c0] rounded-2xl p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#7c6b64]">Ganancia Real</span>
              <div className="w-9 h-9 rounded-xl bg-[#edf6f1] text-[#2f5f4d] flex items-center justify-center border border-[#cfe0d8]">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-[#2f5f4d]">{moneyFormatter.format(Number(stats?.gananciaReal || 0))}</span>
            </div>
            <div className="mt-2 text-[11px] text-[#7c6b64]">
              Ventas - Gastos del período
            </div>
          </div>

          <div className="glass-panel border border-[#d7c7c0] rounded-2xl p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#7c6b64]">Margen Promedio</span>
              <div className="w-9 h-9 rounded-xl bg-[#efe3db] text-[#6f5249] flex items-center justify-center border border-[#d7c7c0]">
                <Percent className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-[#201816]">{Number(stats?.margenPromedio || 0).toFixed(1)}%</span>
            </div>
            <div className="mt-2 text-[11px] text-[#7c6b64]">
              Ganancia promedio sobre precio de compra
            </div>
          </div>
        </div>
      )}

      <div className="glass-panel border border-[#d7c7c0] rounded-3xl p-6">
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
            <PackageCheck className="w-10 h-10 text-[#16a34a] mx-auto mb-2" />
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
        } : null}
      />
    </div>
  );
}
