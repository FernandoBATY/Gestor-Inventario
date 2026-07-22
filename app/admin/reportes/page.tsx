'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  AlertTriangle, 
  TrendingUp, 
  Package, 
  ShoppingBag,
  FileSpreadsheet
} from 'lucide-react';

export default function ReportesPage() {
  const [reportType, setReportType] = useState<'inventario' | 'bajoStock' | 'ventas'>('inventario');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [reportType]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      if (reportType === 'inventario') {
        const res = await fetch('/api/productos');
        if (res.ok) setData(await res.json());
      } else if (reportType === 'bajoStock') {
        const res = await fetch('/api/productos/bajo-stock');
        if (res.ok) setData(await res.json());
      } else if (reportType === 'ventas') {
        const res = await fetch('/api/ventas');
        if (res.ok) setData(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((obj) =>
      Object.values(obj)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte-${reportType}-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-sky-400" /> Reportes del Sistema
          </h1>
          <p className="text-xs text-slate-400 mt-1">Generación y exportación de datos clave en formato ejecutable CSV / Excel.</p>
        </div>

        <button
          onClick={exportCSV}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition"
        >
          <Download className="w-4 h-4" /> Exportar Reporte CSV
        </button>
      </div>

      {/* REPORT TYPE SELECTOR CHIPS */}
      <div className="flex items-center gap-3">
        {[
          { id: 'inventario', label: 'Reporte de Inventario General', icon: Package },
          { id: 'bajoStock', label: 'Reporte de Productos Bajo Stock', icon: AlertTriangle },
          { id: 'ventas', label: 'Reporte de Ventas Realizadas', icon: ShoppingBag },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                reportType === tab.id
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* REPORT DATA TABLE */}
      <div className="glass-panel border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Generando informe...</div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No hay datos disponibles para este reporte.</div>
        ) : (
          <div className="overflow-x-auto max-h-[550px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 sticky top-0">
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th key={key} className="p-4 capitalize">{key.replace(/_/g, ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition">
                    {Object.values(row).map((val: any, i) => (
                      <td key={i} className="p-4">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
