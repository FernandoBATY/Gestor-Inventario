'use client';

import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  BarChart3,
  AlertTriangle,
  Package,
  ShoppingBag,
  FileSpreadsheet,
  FileText,
  Filter,
  X
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

function formatCell(field: string, value: unknown): string {
  if ((field.includes('precio') || field === 'total') && typeof value === 'number') {
    return moneyFormatter.format(value);
  }
  if (field === 'fecha' && value) {
    return new Date(value as string).toLocaleString('es-MX');
  }
  return String(value ?? '');
}

function getDataField(field: string, value: unknown): string | number {
  if ((field.includes('precio') || field === 'total') && typeof value === 'number') {
    return Number(value.toFixed(2));
  }
  if (field === 'fecha' && value) {
    return new Date(value as string).toLocaleString('es-MX');
  }
  return String(value ?? '');
}

export default function ReportesPage() {
  const [reportType, setReportType] = useState<ReportType>('inventario');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<ReportType | null>(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    fetchReportData();
  }, [reportType, fechaInicio, fechaFin]);

  const buildUrl = (base: string) => {
    const params = new URLSearchParams();
    if (base.includes('/api/ventas') && (fechaInicio || fechaFin)) {
      if (fechaInicio) params.set('fechaInicio', fechaInicio);
      if (fechaFin) params.set('fechaFin', fechaFin);
    }
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      if (reportType === 'inventario') {
        const res = await fetch(buildUrl('/api/productos'));
        if (res.ok) setData(await res.json());
      } else if (reportType === 'bajoStock') {
        const res = await fetch(buildUrl('/api/productos/bajo-stock'));
        if (res.ok) setData(await res.json());
      } else if (reportType === 'ventas') {
        const res = await fetch(buildUrl('/api/ventas'));
        if (res.ok) setData(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = useCallback(async (type: ReportType) => {
    setExporting(type);
    try {
      let exportData: any[];
      if (type === 'inventario') {
        const res = await fetch(buildUrl('/api/productos'));
        exportData = res.ok ? await res.json() : [];
      } else if (type === 'bajoStock') {
        const res = await fetch(buildUrl('/api/productos/bajo-stock'));
        exportData = res.ok ? await res.json() : [];
      } else {
        const res = await fetch(buildUrl('/api/ventas'));
        exportData = res.ok ? await res.json() : [];
      }

      if (!exportData.length) return;

      const config = REPORT_CONFIG[type];
      const rows = exportData.map((row) => {
        const obj: Record<string, string | number> = {};
        config.fields.forEach((field, i) => {
          obj[config.headers[i]] = getDataField(field, row[field]);
        });
        return obj;
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);
      worksheet['!cols'] = config.fields.map((f) => ({ wch: f === 'fecha' ? 22 : 16 }));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, config.label.slice(0, 31));
      XLSX.writeFile(workbook, `${config.filename}-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(null);
    }
  }, [fechaInicio, fechaFin]);

  const exportPDF = useCallback(async (type: ReportType) => {
    setExporting(type);
    try {
      let exportData: any[];
      if (type === 'inventario') {
        const res = await fetch(buildUrl('/api/productos'));
        exportData = res.ok ? await res.json() : [];
      } else if (type === 'bajoStock') {
        const res = await fetch(buildUrl('/api/productos/bajo-stock'));
        exportData = res.ok ? await res.json() : [];
      } else {
        const res = await fetch(buildUrl('/api/ventas'));
        exportData = res.ok ? await res.json() : [];
      }

      if (!exportData.length) return;

      const config = REPORT_CONFIG[type];
      const body = exportData.map((row) => config.fields.map((f) => formatCell(f, row[f])));

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' });
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text(config.label, 14, 16);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generado el ${new Date().toLocaleString('es-MX')}`, 14, 22);
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text('Papelería - Sistema de Inventario', 14, 27);

      autoTable(doc, {
        startY: 31,
        head: [config.headers],
        body,
        theme: 'grid',
        styles: { fontSize: 7.5, cellPadding: 2, textColor: [32, 24, 22] },
        headStyles: { fillColor: [47, 30, 24], textColor: [255, 248, 244], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [246, 239, 232] },
      });

      doc.save(`${config.filename}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(null);
    }
  }, [fechaInicio, fechaFin]);

  const clearFechas = () => {
    setFechaInicio('');
    setFechaFin('');
  };

  const config = REPORT_CONFIG[reportType];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#201816] flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-[#6f5249]" /> Reportes del Sistema
        </h1>
        <p className="text-xs text-[#7c6b64] mt-1">Generación y exportación de datos clave en Excel y PDF.</p>
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

      {reportType === 'ventas' && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-[#7c6b64]" />
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="bg-[#fffaf7] border border-[#d7c7c0] rounded-xl px-3 py-2 text-xs text-[#201816] outline-none focus:border-[#9d7b6f]"
            title="Fecha inicio"
          />
          <span className="text-[#7c6b64] text-xs">a</span>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="bg-[#fffaf7] border border-[#d7c7c0] rounded-xl px-3 py-2 text-xs text-[#201816] outline-none focus:border-[#9d7b6f]"
            title="Fecha fin"
          />
          {(fechaInicio || fechaFin) && (
            <button onClick={clearFechas} className="p-2 text-[#7c6b64] hover:text-[#b91c1c] transition" title="Limpiar fechas">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

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
                  onClick={() => exportExcel(id)}
                  disabled={exporting !== null}
                  className="flex-1 bg-[#2f1e18] hover:bg-[#412820] disabled:bg-[#c4b5ae] text-[#fff8f4] font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  {exporting === id ? 'Exportando...' : 'Excel'}
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
