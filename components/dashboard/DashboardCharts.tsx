'use client';

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend
} from 'recharts';

const moneyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 0,
});

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel border border-[#d7c7c0] rounded-xl px-4 py-3 text-xs shadow-xl">
        <p className="font-semibold text-[#201816] mb-1">{label}</p>
        {payload.map((entry: any, idx: number) => (
          <p key={idx} style={{ color: entry.color }} className="font-medium">
            {entry.name}: {typeof entry.value === 'number' && entry.value > 1000 ? moneyFormatter.format(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const COLORS = ['#6f5249', '#8a6f5c', '#2f5f4d', '#9f5d55', '#c58d5d', '#7f9b76', '#36160c', '#2f1e18'];
const STOCK_COLORS = ['#2f5f4d', '#9f5d55'];

type ChartProps = {
  barChartData: { fecha: string; Ventas: number }[];
  topProductsData: { nombre: string; Unidades: number }[];
  stats: any;
};

export default function DashboardCharts({ barChartData, topProductsData, stats }: ChartProps) {
  const comparisonData = [
    { name: 'Hoy', value: Number(stats?.ventasDia || 0) },
    { name: 'Este Mes', value: Number(stats?.ventasMes || 0) },
    { name: 'Total', value: Number(stats?.totalVendido || 0) },
  ];

  const stockData = [
    { name: 'Stock Normal', value: Math.max(0, Number(stats?.totalProductos || 0) - Number(stats?.productosBajoStockCount || 0)) },
    { name: 'Stock Bajo', value: Number(stats?.productosBajoStockCount || 0) },
  ];

  const ticketData = [{ name: 'Ticket Promedio', value: Math.min((Number(stats?.ticketPromedio || 0) / 500) * 100, 100) }];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="glass-panel border border-[#d7c7c0] rounded-3xl p-6">
          <h3 className="font-extrabold text-base text-[#201816] mb-1 flex items-center gap-2">
            <BarChartIcon /> Comparativa de Ventas
          </h3>
          <p className="text-xs text-[#7c6b64] mb-4">Día actual vs Mes actual vs Total histórico</p>
          {comparisonData.every(d => d.value === 0) ? (
            <p className="text-xs text-[#7c6b64] text-center py-8">Sin datos para graficar.</p>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#e6d8d2" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#7c6b64' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#7c6b64' }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {comparisonData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="glass-panel border border-[#d7c7c0] rounded-3xl p-6">
          <h3 className="font-extrabold text-base text-[#201816] mb-1 flex items-center gap-2">
            <ShoppingBagIcon width={16} /> Productos más vendidos
          </h3>
          <p className="text-xs text-[#7c6b64] mb-4">Ranking de productos con mayor cantidad de unidades vendidas</p>
          {topProductsData.length === 0 ? (
            <p className="text-xs text-[#7c6b64] text-center py-8">Sin datos para graficar.</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#e6d8d2" strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 9, fill: '#7c6b64' }} />
                  <YAxis type="category" dataKey="nombre" tick={{ fontSize: 9, fill: '#7c6b64' }} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Unidades" fill="#6f5249" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="glass-panel border border-[#d7c7c0] rounded-3xl p-6">
          <h3 className="font-extrabold text-base text-[#201816] mb-1 flex items-center gap-2">
            <LineChartIcon width={16} /> Ventas Últimos 7 Días
          </h3>
          <p className="text-xs text-[#7c6b64] mb-4">Evolución de ingresos diarios</p>
          {barChartData.length === 0 ? (
            <p className="text-xs text-[#7c6b64] text-center py-8">Sin datos para graficar.</p>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={barChartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#e6d8d2" strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: '#7c6b64' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#7c6b64' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="Ventas" stroke="#6f5249" strokeWidth={2} dot={{ fill: '#6f5249', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="glass-panel border border-[#d7c7c0] rounded-3xl p-6">
          <h3 className="font-extrabold text-base text-[#201816] mb-1 flex items-center gap-2">
            <PieChartIcon width={16} /> Salud del Inventario
          </h3>
          <p className="text-xs text-[#7c6b64] mb-4">Productos con stock normal vs bajo stock</p>
          {Number(stats?.totalProductos || 0) === 0 ? (
            <p className="text-xs text-[#7c6b64] text-center py-8">Sin datos de inventario.</p>
          ) : (
            <div className="h-52 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stockData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" paddingAngle={4}>
                    {stockData.map((_, idx) => <Cell key={idx} fill={STOCK_COLORS[idx % STOCK_COLORS.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#7c6b64' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="glass-panel border border-[#d7c7c0] rounded-3xl p-6">
          <h3 className="font-extrabold text-base text-[#201816] mb-1 flex items-center gap-2">
            <PackageIcon width={16} /> Ticket Promedio
          </h3>
          <p className="text-xs text-[#7c6b64] mb-4">Valor promedio por transacción</p>
          {Number(stats?.ticketPromedio || 0) === 0 ? (
            <p className="text-xs text-[#7c6b64] text-center py-8">Sin datos para graficar.</p>
          ) : (
            <div className="h-52 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="80%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" barSize={14} data={ticketData} startAngle={180} endAngle={0}>
                  <RadialBar dataKey="value" cornerRadius={6} fill="#6f5249" />
                </RadialBarChart>
              </ResponsiveContainer>
              <p className="text-2xl font-black text-[#201816] -mt-6">{moneyFormatter.format(Number(stats?.ticketPromedio || 0))}</p>
              <p className="text-[11px] text-[#7c6b64]">{stats?.totalVentasCount || 0} ventas registradas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BarChartIcon({ width = 16 }: { width?: number }) {
  return (
    <svg width={width} height={width} viewBox="0 0 24 24" fill="none" stroke="#6f5249" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}
function ShoppingBagIcon({ width = 16 }: { width?: number }) {
  return (
    <svg width={width} height={width} viewBox="0 0 24 24" fill="none" stroke="#6f5249" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}
function LineChartIcon({ width = 16 }: { width?: number }) {
  return (
    <svg width={width} height={width} viewBox="0 0 24 24" fill="none" stroke="#6f5249" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
function PieChartIcon({ width = 16 }: { width?: number }) {
  return (
    <svg width={width} height={width} viewBox="0 0 24 24" fill="none" stroke="#6f5249" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 118 2.83M22 12A10 10 0 0012 2v10z" />
    </svg>
  );
}
function PackageIcon({ width = 16 }: { width?: number }) {
  return (
    <svg width={width} height={width} viewBox="0 0 24 24" fill="none" stroke="#6f5249" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
