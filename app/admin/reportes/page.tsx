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
          <h1 className="text-3xl font-extrabold tracking-tight text-[#201816] flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-[#6f5249]" /> Reportes del Sistema
          </h1>
          <p className="text-xs text-[#7c6b64] mt-1">Generación y exportación de datos clave en formato ejecutable CSV / Excel.</p>
        </div>

        <button
          onClick={exportCSV}
          className="bg-[#2f1e18] hover:bg-[#412820] text-[#fff8f4] font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-[#2f1e18]/15 flex items-center gap-2 transition"
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
                  ? 'bg-[#2f1e18] text-[#fff8f4] shadow-lg shadow-[#2f1e18]/15'
                  : 'bg-[#fffaf7] text-[#7c6b64] border border-[#d7c7c0] hover:bg-[#f6efe8]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* REPORT DATA TABLE */}
      <div className="glass-panel border border-[#d7c7c0] rounded-3xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-[#7c6b64] text-xs">Generando informe...</div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center text-[#7c6b64] text-xs">No hay datos disponibles para este reporte.</div>
        ) : (
          <div className="overflow-x-auto max-h-[550px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f6efe8] text-[#7c6b64] font-semibold border-b border-[#d7c7c0] sticky top-0">
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th key={key} className="p-4 capitalize">{key.replace(/_/g, ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6d8d2] text-[#201816]">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#f7f1ec] transition">
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
