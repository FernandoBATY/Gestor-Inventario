'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Venta } from '@/lib/types';
import { Printer, X, Download } from 'lucide-react';
import { DEFAULT_NEGOCIO_CONFIG } from '@/lib/negocioStore';

interface ThermalTicketProps {
  venta: Venta | null;
  onClose?: () => void;
}

export default function ThermalTicket({ venta, onClose }: ThermalTicketProps) {
  const [businessConfig, setBusinessConfig] = useState(DEFAULT_NEGOCIO_CONFIG);
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBusinessConfig = async () => {
      try {
        const res = await fetch('/api/negocio');
        if (res.ok) {
          const data = await res.json();
          setBusinessConfig({
            nombre_negocio: data?.nombre_negocio || DEFAULT_NEGOCIO_CONFIG.nombre_negocio,
            rfc: data?.rfc || DEFAULT_NEGOCIO_CONFIG.rfc,
            telefono: data?.telefono || DEFAULT_NEGOCIO_CONFIG.telefono,
            direccion: data?.direccion || DEFAULT_NEGOCIO_CONFIG.direccion,
            leyenda_ticket: data?.leyenda_ticket || DEFAULT_NEGOCIO_CONFIG.leyenda_ticket,
          });
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchBusinessConfig();
  }, []);

  if (!venta) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket - ${venta.folio}</title>
          <style>
            @page { size: letter; margin: 15mm; }
            body { font-family: 'Courier New', monospace; font-size: 11px; color: #000; margin: 0; padding: 20px; }
            .header { text-align: center; margin-bottom: 15px; }
            .header h2 { margin: 0; font-size: 16px; text-transform: uppercase; }
            .header p { margin: 2px 0; font-size: 10px; color: #555; }
            .divider { border-top: 1px dashed #999; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { border-bottom: 1px solid #999; padding: 4px 2px; text-align: left; }
            th.right, td.right { text-align: right; }
            td { padding: 3px 2px; vertical-align: top; }
            .total-row td { border-top: 1px solid #999; font-weight: bold; padding-top: 6px; }
            .footer { text-align: center; margin-top: 15px; font-size: 9px; color: #777; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${businessConfig.nombre_negocio}</h2>
            <p>RFC: ${businessConfig.rfc}</p>
            <p>Tel: ${businessConfig.telefono}</p>
            <p>${businessConfig.direccion}</p>
          </div>
          <div class="divider"></div>
          <p><strong>Folio:</strong> ${venta.folio}</p>
          <p><strong>Fecha:</strong> ${new Date(venta.fecha).toLocaleString('es-MX')}</p>
          <div class="divider"></div>
          <table>
            <thead>
              <tr>
                <th>Cant</th>
                <th>Producto</th>
                <th class="right">P.U.</th>
                <th class="right">Subt.</th>
              </tr>
            </thead>
            <tbody>
              ${(venta.detalles || []).map((det) => `
                <tr>
                  <td>${det.cantidad}</td>
                  <td>${det.nombre_producto}</td>
                  <td class="right">$${Number(det.precio_unitario).toFixed(2)}</td>
                  <td class="right">$${Number(det.subtotal).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="divider"></div>
          <table>
            <tr class="total-row">
              <td></td>
              <td><strong>TOTAL:</strong></td>
              <td class="right" colspan="2"><strong>$${Number(venta.total).toFixed(2)} MXN</strong></td>
            </tr>
          </table>
          <div class="divider"></div>
          <div class="footer">
            ${businessConfig.leyenda_ticket.replace(/\n/g, '<br>')}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket-${venta.folio}</title>
          <style>
            @page { size: letter; margin: 15mm; }
            body { font-family: 'Courier New', monospace; font-size: 11px; color: #000; margin: 0; padding: 20px; }
            .header { text-align: center; margin-bottom: 15px; }
            .header h2 { margin: 0; font-size: 16px; text-transform: uppercase; }
            .header p { margin: 2px 0; font-size: 10px; color: #555; }
            .divider { border-top: 1px dashed #999; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { border-bottom: 1px solid #999; padding: 4px 2px; text-align: left; }
            th.right, td.right { text-align: right; }
            td { padding: 3px 2px; vertical-align: top; }
            .total-row td { border-top: 1px solid #999; font-weight: bold; padding-top: 6px; }
            .footer { text-align: center; margin-top: 15px; font-size: 9px; color: #777; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${businessConfig.nombre_negocio}</h2>
            <p>RFC: ${businessConfig.rfc}</p>
            <p>Tel: ${businessConfig.telefono}</p>
            <p>${businessConfig.direccion}</p>
          </div>
          <div class="divider"></div>
          <p><strong>Folio:</strong> ${venta.folio}</p>
          <p><strong>Fecha:</strong> ${new Date(venta.fecha).toLocaleString('es-MX')}</p>
          <div class="divider"></div>
          <table>
            <thead>
              <tr>
                <th>Cant</th>
                <th>Producto</th>
                <th class="right">P.U.</th>
                <th class="right">Subt.</th>
              </tr>
            </thead>
            <tbody>
              ${(venta.detalles || []).map((det) => `
                <tr>
                  <td>${det.cantidad}</td>
                  <td>${det.nombre_producto}</td>
                  <td class="right">$${Number(det.precio_unitario).toFixed(2)}</td>
                  <td class="right">$${Number(det.subtotal).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="divider"></div>
          <table>
            <tr class="total-row">
              <td></td>
              <td><strong>TOTAL:</strong></td>
              <td class="right" colspan="2"><strong>$${Number(venta.total).toFixed(2)} MXN</strong></td>
            </tr>
          </table>
          <div class="divider"></div>
          <div class="footer">
            ${businessConfig.leyenda_ticket.replace(/\n/g, '<br>')}
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white border border-[#d7c7c0] rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#7c6b64] hover:text-[#201816] bg-[#f6efe8] rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 border-b border-[#e6d8d2]">
          <h3 className="font-bold text-lg text-[#201816]">Ticket de Venta</h3>
          <p className="text-xs text-[#7c6b64]">Vista previa para impresión tamaño carta</p>
        </div>

        <div
          ref={ticketRef}
          className="p-6 bg-white text-xs font-mono border-b border-[#e6d8d2]"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          <div className="text-center font-bold text-sm tracking-wide uppercase text-[#201816]">
            {businessConfig.nombre_negocio}
          </div>
          <div className="text-center text-[10px] text-[#7c6b64]">RFC: {businessConfig.rfc}</div>
          <div className="text-center text-[10px] text-[#7c6b64]">Tel: {businessConfig.telefono}</div>
          <div className="text-center text-[10px] text-[#7c6b64] mb-3">{businessConfig.direccion}</div>

          <div className="border-t border-b border-dashed border-[#d7c7c0] py-1.5 my-2 text-[#201816]">
            <div><span className="font-semibold">Folio:</span> {venta.folio}</div>
            <div><span className="font-semibold">Fecha:</span> {new Date(venta.fecha).toLocaleString('es-MX')}</div>
          </div>

          <table className="w-full my-2 text-left text-xs text-[#201816]">
            <thead>
              <tr className="border-b border-[#d7c7c0]">
                <th className="pb-1 font-semibold text-[#7c6b64]">Cant</th>
                <th className="pb-1 font-semibold text-[#7c6b64]">Producto</th>
                <th className="pb-1 text-right font-semibold text-[#7c6b64]">P.U.</th>
                <th className="pb-1 text-right font-semibold text-[#7c6b64]">Subt.</th>
              </tr>
            </thead>
            <tbody>
              {venta.detalles?.map((det, idx) => (
                <tr key={idx} className="border-b border-[#f2edeb]">
                  <td className="py-1 align-top">{det.cantidad}</td>
                  <td className="py-1 leading-tight break-words max-w-[120px] sm:max-w-none">{det.nombre_producto}</td>
                  <td className="py-1 text-right align-top">${Number(det.precio_unitario).toFixed(2)}</td>
                  <td className="py-1 text-right align-top font-semibold">${Number(det.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-dashed border-[#d7c7c0] pt-2 mt-2">
            <div className="flex justify-between font-bold text-sm text-[#201816]">
              <span>TOTAL:</span>
              <span>${Number(venta.total).toFixed(2)} MXN</span>
            </div>
          </div>

          <div className="text-center text-[9px] text-[#7c6b64] mt-4 leading-tight whitespace-pre-line">
            {businessConfig.leyenda_ticket}
          </div>
        </div>

        <div className="p-4 flex gap-3 bg-[#faf7f5]">
          <button
            onClick={handlePrint}
            className="flex-1 bg-[#2f1e18] hover:bg-[#412820] text-[#fff8f4] font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg"
          >
            <Printer className="w-4 h-4" /> Imprimir
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex-1 bg-[#fffaf7] hover:bg-[#f6efe8] text-[#201816] font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition border border-[#d7c7c0]"
          >
            <Download className="w-4 h-4" /> Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
