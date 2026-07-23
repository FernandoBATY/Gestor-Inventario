'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Download,
  AlertTriangle,
  Package,
  ShoppingBag,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

type ReportType = 'inventario' | 'bajoStock' | 'ventas';

const REPORT_CONFIG: Record<ReportType, { label: string; icon: any; fields: string[]; headers: string[]; filename: string }> = {
  inventario: {
    label: 'Reporte de Inventario General',
    icon: Package,
    fields: ['nombre', 'marca', 'precio_compra', 'precio_venta', 'unidades', 'presentacion'],
    headers: ['Nombre', 'Marca', 'Precio Compra', 'Precio Venta', 'Unidades', 'Presentación'],
    filename: 'inventario-general',
  },
  bajoStock: {
    label: 'Reporte de Productos Bajo Stock',
    icon: AlertTriangle,
    fields: ['nombre', 'marca', 'precio_compra', 'precio_venta', 'unidades', 'presentacion'],
    headers: ['Nombre', 'Marca', 'Precio Compra', 'Precio Venta', 'Unidades', 'Presentación'],
    filename: 'productos-bajo-stock',
  },
  ventas: {
    label: 'Reporte de Ventas Realizadas',
    icon: ShoppingBag,
    fields: ['folio', 'fecha', 'total'],
    headers: ['Folio', 'Fecha', 'Total'],
    filename: 'ventas-realizadas',
  },
};

const moneyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
});

function generateCSV(data: any[], fields: string[], headers: string[]): string {
  const headerRow = headers.map((h) => `"${h}"`).join(',');
  const rows = data.map((row) => {
    return fields
      .map((field) => {
        let val = row[field];
        if (typeof val === 'number') {
          if (field.includes('precio') || field === 'total') {
            val = val.toFixed(2);
          }
        }
        if (field === 'fecha' && val) {
          val = new Date(val).toLocaleString('es-MX');
        }
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      })
      .join(',');
  });
  return [headerRow, ...rows].join('\r\n');
}

export default function ReportesPage() {
  const [reportType, setReportType] = useState<ReportType>('inventario');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<ReportType | null>(null);

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

  const exportCSV = useCallback(async (type: ReportType) => {
    setExporting(type);
    try {
      let exportData: any[];
      if (type === 'inventario') {
        const res = await fetch('/api/productos');
        exportData = res.ok ? await res.json() : [];
      } else if (type === 'bajoStock') {
        const res = await fetch('/api/productos/bajo-stock');
        exportData = res.ok ? await res.json() : [];
      } else {
        const res = await fetch('/api/ventas');
        exportData = res.ok ? await res.json() : [];
      }

      if (!exportData.length) return;

      const config = REPORT_CONFIG[type];
      const csvContent = generateCSV(exportData, config.fields, config.headers);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${config.filename}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(null);
    }
  }, []);

  const exportPDF = useCallback(async (type: ReportType) => {
    setExporting(type);
    try {
      let exportData: any[];
      if (type === 'inventario') {
        const res = await fetch('/api/productos');
        exportData = res.ok ? await res.json() : [];
      } else if (type === 'bajoStock') {
        const res = await fetch('/api/productos/bajo-stock');
        exportData = res.ok ? await res.json() : [];
      } else {
        const res = await fetch('/api/ventas');
        exportData = res.ok ? await res.json() : [];
      }

      if (!exportData.length) return;

      const cfg = REPORT_CONFIG[type];
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      printWindow.document.write(`
        <html><head><title>${cfg.label}</title>
        <style>
          @page { size: letter; margin: 15mm; }
          body { font-family: Arial, sans-serif; font-size: 11px; color: #000; padding: 20px; }
          h1 { font-size: 16px; margin-bottom: 5px; }
          p { font-size: 10px; color: #555; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; font-size: 10px; }
          th { background: #f0ebe7; padding: 6px 4px; text-align: left; border: 1px solid #ccc; }
          td { padding: 4px; border: 1px solid #ddd; }
          .footer { margin-top: 20px; font-size: 9px; color: #999; text-align: center; }
        </style></head><body>
        <h1>${cfg.label}</h1>
        <p>Generado el ${new Date().toLocaleString('es-MX')}</p>
        <table><thead><tr>${cfg.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${exportData.map(row => `<tr>${cfg.fields.map(f => {
          let val = row[f];
          if ((f.includes('precio') || f === 'total') && typeof val === 'number') val = `$${val.toFixed(2)}`;
          if (f === 'fecha' && val) val = new Date(val).toLocaleString('es-MX');
          return `<td>${val ?? ''}</td>`;
        }).join('')}</tr>`).join('')}</tbody></table>
        <div class="footer">Papelería - Sistema de Inventario</div>
        <script>window.onload=function(){window.print();window.close()};</script>
        </body></html>
      `);
      printWindow.document.close();
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(null);
    }
  }, []);

  const config = REPORT_CONFIG[reportType];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#201816] flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-[#6f5249]" /> Reportes del Sistema
        </h1>
        <p className="text-xs text-[#7c6b64] mt-1">Generación y exportación de datos clave en formato CSV.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {(Object.entries(REPORT_CONFIG) as [ReportType, typeof REPORT_CONFIG[ReportType]][]).map(([id, cfg]) => {
            const Icon = cfg.icon;
            return (
              <button
                key={id}
                onClick={() => setReportType(id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                  reportType === id
                    ? 'bg-[#2f1e18] text-[#fff8f4] shadow-lg shadow-[#2f1e18]/15'
                    : 'bg-[#fffaf7] text-[#7c6b64] border border-[#d7c7c0] hover:bg-[#f6efe8]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.entries(REPORT_CONFIG) as [ReportType, typeof REPORT_CONFIG[ReportType]][]).map(([id, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div key={id} className={`glass-panel border rounded-2xl p-5 transition ${reportType === id ? 'border-[#2f1e18] ring-1 ring-[#2f1e18]/20' : 'border-[#d7c7c0]'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#efe3db] text-[#6f5249] flex items-center justify-center border border-[#d7c7c0]">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#201816]">{cfg.label}</h3>
                  <p className="text-[10px] text-[#7c6b64]">{cfg.fields.length} columnas</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {cfg.headers.map((h) => (
                  <span key={h} className="px-2 py-0.5 rounded-md bg-[#f6efe8] text-[10px] text-[#7c6b64] border border-[#e6d8d2]">
                    {h}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => exportCSV(id)}
                  disabled={exporting !== null}
                  className="flex-1 bg-[#2f1e18] hover:bg-[#412820] disabled:bg-[#c4b5ae] text-[#fff8f4] font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  {exporting === id ? 'Exportando...' : 'CSV'}
                </button>
                <button
                  onClick={() => exportPDF(id)}
                  disabled={exporting !== null}
                  className="flex-1 bg-[#6f5249] hover:bg-[#5a4139] disabled:bg-[#c4b5ae] text-[#fff8f4] font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <FileText className="w-4 h-4" />
                  {exporting === id ? 'Exportando...' : 'PDF'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

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
                  {config.headers.map((h) => (
                    <th key={h} className="p-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6d8d2] text-[#201816]">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#f7f1ec] transition">
                    {config.fields.map((field) => {
                      let val = row[field];
                      if (field.includes('precio') || field === 'total') {
                        val = moneyFormatter.format(Number(val) || 0);
                      }
                      if (field === 'fecha' && val) {
                        val = new Date(val).toLocaleString('es-MX');
                      }
                      return (
                        <td key={field} className="p-4">
                          {String(val ?? '')}
                        </td>
                      );
                    })}
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
