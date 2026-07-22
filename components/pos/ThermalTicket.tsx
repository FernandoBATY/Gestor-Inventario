'use client';

import React, { useEffect, useState } from 'react';
import { Venta } from '@/lib/types';
import { Printer, X } from 'lucide-react';
import { DEFAULT_NEGOCIO_CONFIG } from '@/lib/negocioStore';

interface ThermalTicketProps {
  venta: Venta | null;
  onClose?: () => void;
}

export default function ThermalTicket({ venta, onClose }: ThermalTicketProps) {
  const [businessConfig, setBusinessConfig] = useState(DEFAULT_NEGOCIO_CONFIG);

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
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 text-slate-100 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-bold text-lg text-slate-100 mb-1">Ticket de Venta</h3>
        <p className="text-xs text-slate-400 mb-4">Vista previa para impresora térmica de 80 mm</p>

        <div
          id="thermal-ticket-container"
          className="bg-white text-black p-4 rounded-lg shadow-inner text-xs font-mono border border-slate-200"
        >
          <div className="text-center font-bold text-sm tracking-wide uppercase">PAPELERÍA {businessConfig.nombre_negocio}</div>
          <div className="text-center text-[10px] text-gray-600 mb-2">Tel: {businessConfig.telefono}</div>
          <div className="text-center text-[10px] text-gray-500 mb-3">{businessConfig.direccion}</div>

          <div className="border-t border-b border-dashed border-gray-400 py-1.5 my-2">
            <div><span className="font-semibold">Folio:</span> {venta.folio}</div>
            <div><span className="font-semibold">Fecha:</span> {new Date(venta.fecha).toLocaleString('es-MX')}</div>
          </div>

          <table className="w-full my-2 text-left">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="pb-1">Cant</th>
                <th className="pb-1">Producto</th>
                <th className="pb-1 text-right">P.U.</th>
                <th className="pb-1 text-right">Subt.</th>
              </tr>
            </thead>
            <tbody>
              {venta.detalles?.map((det, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-1 align-top">{det.cantidad}</td>
                  <td className="py-1 leading-tight">{det.nombre_producto}</td>
                  <td className="py-1 text-right align-top">${Number(det.precio_unitario).toFixed(2)}</td>
                  <td className="py-1 text-right align-top font-semibold">${Number(det.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-dashed border-gray-400 pt-2 mt-2">
            <div className="flex justify-between font-bold text-sm">
              <span>TOTAL:</span>
              <span>${Number(venta.total).toFixed(2)} MXN</span>
            </div>
          </div>

          <div className="text-center text-[9px] text-gray-500 mt-4 leading-tight whitespace-pre-line">
            {businessConfig.leyenda_ticket}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-sky-600/30"
          >
            <Printer className="w-4 h-4" /> Imprimir Ticket (80mm)
          </button>
        </div>
      </div>
    </div>
  );
}
