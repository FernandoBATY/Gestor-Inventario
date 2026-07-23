'use client';

import React, { useEffect, useState } from 'react';
import {
  Database,
  Download,
  Upload,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  Server,
  Wallet,
  Lock,
  Unlock,
  Receipt
} from 'lucide-react';
import { DEFAULT_NEGOCIO_CONFIG } from '@/lib/negocioStore';

const defaultConfig = {
  nombre_negocio: DEFAULT_NEGOCIO_CONFIG.nombre_negocio,
  rfc: DEFAULT_NEGOCIO_CONFIG.rfc,
  telefono: DEFAULT_NEGOCIO_CONFIG.telefono,
  direccion: DEFAULT_NEGOCIO_CONFIG.direccion,
  leyenda_ticket: DEFAULT_NEGOCIO_CONFIG.leyenda_ticket,
};

export default function ConfiguracionBackupPage() {
  const [restoring, setRestoring] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [businessConfig, setBusinessConfig] = useState(defaultConfig);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [corteStatus, setCorteStatus] = useState<{ abierto: boolean; corte_actual_id?: string; fecha_apertura?: string; total_ventas?: number; total_gastos?: number; saldo_esperado?: number } | null>(null);
  const [cargandoCorte, setCargandoCorte] = useState(false);
  const [montoCierre, setMontoCierre] = useState('');
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    fetchBusinessConfig();
    fetchCorteStatus();
  }, []);

  const fetchCorteStatus = async () => {
    setCargandoCorte(true);
    try {
      const res = await fetch('/api/cortes-caja');
      if (res.ok) setCorteStatus(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setCargandoCorte(false);
    }
  };

  const handleAbrirCorte = async () => {
    setCargandoCorte(true);
    try {
      const res = await fetch('/api/cortes-caja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'abrir', observaciones }),
      });
      if (res.ok) {
        setObservaciones('');
        await fetchCorteStatus();
      } else {
        const err = await res.json();
        alert(err.error || 'Error al abrir corte');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCargandoCorte(false);
    }
  };

  const handleCerrarCorte = async () => {
    if (!corteStatus?.corte_actual_id) return;
    setCargandoCorte(true);
    try {
      const res = await fetch('/api/cortes-caja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: 'cerrar',
          corte_id: corteStatus.corte_actual_id,
          monto_cierre: parseFloat(montoCierre) || 0,
          observaciones,
        }),
      });
      if (res.ok) {
        setMontoCierre('');
        setObservaciones('');
        await fetchCorteStatus();
      } else {
        const err = await res.json();
        alert(err.error || 'Error al cerrar corte');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCargandoCorte(false);
    }
  };

  const fetchBusinessConfig = async () => {
    try {
      const res = await fetch('/api/negocio');
      if (res.ok) {
        const data = await res.json();
        setBusinessConfig({
          nombre_negocio: data?.nombre_negocio || defaultConfig.nombre_negocio,
          rfc: data?.rfc || defaultConfig.rfc,
          telefono: data?.telefono || defaultConfig.telefono,
          direccion: data?.direccion || defaultConfig.direccion,
          leyenda_ticket: data?.leyenda_ticket || defaultConfig.leyenda_ticket,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveBusinessConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setMessage(null);

    try {
      const res = await fetch('/api/negocio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessConfig),
      });

      if (res.ok) {
        const data = await res.json();
        setBusinessConfig({
          nombre_negocio: data?.nombre_negocio || defaultConfig.nombre_negocio,
          rfc: data?.rfc || defaultConfig.rfc,
          telefono: data?.telefono || defaultConfig.telefono,
          direccion: data?.direccion || defaultConfig.direccion,
          leyenda_ticket: data?.leyenda_ticket || defaultConfig.leyenda_ticket,
        });
        setMessage({ type: 'success', text: 'Datos del negocio actualizados correctamente.' });
      } else {
        setMessage({ type: 'error', text: 'No se pudo guardar la configuración del negocio.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar la configuración del negocio.' });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      window.open('/api/backup/descargar', '_blank');
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoring(true);
    setMessage(null);
    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const res = await fetch('/api/backup/restaurar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Respaldo restaurado exitosamente en el sistema.' });
      } else {
        setMessage({ type: 'error', text: 'Ocurrió un error al procesar el archivo de respaldo.' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Archivo JSON inválido o corrupto.' });
    } finally {
      setRestoring(false);
    }
  };

  const handleWipeData = async () => {
    if (!confirm('⚠️ ¡ATENCIÓN! ¿Deseas eliminar permanentemente TODOS los productos, movimientos y ventas? Esta acción NO se puede deshacer.')) return;

    setClearing(true);
    setMessage(null);
    try {
      const res = await fetch('/api/backup/limpiar-datos', { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Todos los datos del sistema han sido eliminados correctamente.' });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#201816] flex items-center gap-2">
          <Database className="w-7 h-7 text-[#6f5249]" /> Configuración y Respaldos
        </h1>
        <p className="text-xs text-[#7c6b64] mt-1">Ajusta los datos del ticket, exporta respaldos e importa copias de seguridad desde un solo lugar.</p>
      </div>

      <form onSubmit={handleSaveBusinessConfig} className="glass-panel border border-[#d7c7c0] rounded-3xl p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#efe3db] text-[#6f5249] flex items-center justify-center border border-[#d7c7c0] shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#201816]">Datos del ticket</h3>
            <p className="text-xs text-[#7c6b64] mt-1">Estos datos se usan para el comprobante impreso y los respaldos del sistema.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[#7c6b64] font-semibold mb-1">Nombre del negocio</label>
            <input
              type="text"
              required
              value={businessConfig.nombre_negocio}
              onChange={(e) => setBusinessConfig({ ...businessConfig, nombre_negocio: e.target.value })}
              className="w-full bg-[#fffaf7] border border-[#d7c7c0] rounded-xl p-2.5 text-[#201816] outline-none focus:border-[#9d7b6f]"
            />
          </div>

          <div>
            <label className="block text-[#7c6b64] font-semibold mb-1">RFC</label>
            <input
              type="text"
              value={businessConfig.rfc}
              onChange={(e) => setBusinessConfig({ ...businessConfig, rfc: e.target.value })}
              className="w-full bg-[#fffaf7] border border-[#d7c7c0] rounded-xl p-2.5 text-[#201816] outline-none focus:border-[#9d7b6f]"
            />
          </div>

          <div>
            <label className="block text-[#7c6b64] font-semibold mb-1">Teléfono</label>
            <input
              type="text"
              value={businessConfig.telefono}
              onChange={(e) => setBusinessConfig({ ...businessConfig, telefono: e.target.value })}
              className="w-full bg-[#fffaf7] border border-[#d7c7c0] rounded-xl p-2.5 text-[#201816] outline-none focus:border-[#9d7b6f]"
            />
          </div>

          <div>
            <label className="block text-[#7c6b64] font-semibold mb-1">Dirección</label>
            <input
              type="text"
              value={businessConfig.direccion}
              onChange={(e) => setBusinessConfig({ ...businessConfig, direccion: e.target.value })}
              className="w-full bg-[#fffaf7] border border-[#d7c7c0] rounded-xl p-2.5 text-[#201816] outline-none focus:border-[#9d7b6f]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[#7c6b64] font-semibold mb-1">Leyenda del ticket</label>
            <textarea
              rows={4}
              value={businessConfig.leyenda_ticket}
              onChange={(e) => setBusinessConfig({ ...businessConfig, leyenda_ticket: e.target.value })}
              className="w-full bg-[#fffaf7] border border-[#d7c7c0] rounded-xl p-2.5 text-[#201816] outline-none focus:border-[#9d7b6f] resize-y"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={savingConfig}
            className="bg-[#2f1e18] hover:bg-[#412820] text-[#fff8f4] font-semibold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-[#2f1e18]/15 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{savingConfig ? 'Guardando...' : 'Guardar Datos del Negocio'}</span>
          </button>
        </div>
      </form>

      {message && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-[#edf6f1] border-[#cfe0d8] text-[#2f5f4d]'
            : 'bg-[#f8ecea] border-[#e2c8c4] text-[#9f5d55]'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CORTE DE CAJA */}
      <div className="glass-panel border border-[#d7c7c0] rounded-3xl p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#efe3db] text-[#6f5249] flex items-center justify-center border border-[#d7c7c0] shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#201816]">Corte de Caja</h3>
            <p className="text-xs text-[#7c6b64] mt-1">
              {cargandoCorte
                ? 'Consultando estado...'
                : corteStatus?.abierto
                  ? `Caja abierta desde ${new Date(corteStatus.fecha_apertura!).toLocaleString('es-MX')}`
                  : 'Caja cerrada — no hay corte activo'}
            </p>
          </div>
        </div>

        {corteStatus?.abierto ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#edf6f1] border border-[#cfe0d8] rounded-2xl p-3 text-center">
                <p className="text-[10px] text-[#2f5f4d] font-semibold">Ventas</p>
                <p className="text-lg font-extrabold text-[#2f5f4d]">${Number(corteStatus.total_ventas || 0).toFixed(2)}</p>
              </div>
              <div className="bg-[#f8ecea] border border-[#e2c8c4] rounded-2xl p-3 text-center">
                <p className="text-[10px] text-[#9f5d55] font-semibold">Gastos</p>
                <p className="text-lg font-extrabold text-[#9f5d55]">${Number(corteStatus.total_gastos || 0).toFixed(2)}</p>
              </div>
              <div className="bg-[#f6efe8] border border-[#d7c7c0] rounded-2xl p-3 text-center">
                <p className="text-[10px] text-[#7c6b64] font-semibold">Saldo Esperado</p>
                <p className="text-lg font-extrabold text-[#201816]">${Number(corteStatus.saldo_esperado || 0).toFixed(2)}</p>
              </div>
            </div>

            <div className="border-t border-[#d7c7c0] pt-4 space-y-3">
              <h4 className="font-semibold text-xs text-[#7c6b64]">Cerrar Corte</h4>
              <input
                type="number"
                step="0.01"
                value={montoCierre}
                onChange={(e) => setMontoCierre(e.target.value)}
                placeholder="Monto real en caja"
                className="w-full bg-[#fffaf7] border border-[#d7c7c0] rounded-xl px-4 py-2.5 text-sm text-[#201816] outline-none focus:border-[#9d7b6f]"
              />
              <input
                type="text"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Observaciones (opcional)"
                className="w-full bg-[#fffaf7] border border-[#d7c7c0] rounded-xl px-4 py-2.5 text-sm text-[#201816] outline-none focus:border-[#9d7b6f]"
              />
              <button
                onClick={handleCerrarCorte}
                disabled={cargandoCorte || !montoCierre}
                className="bg-[#9f5d55] hover:bg-[#87463d] disabled:bg-[#c4b5ae] text-[#fff8f4] font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition"
              >
                <Lock className="w-4 h-4" />
                {cargandoCorte ? 'Procesando...' : 'Cerrar Corte'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Observaciones de apertura (opcional)"
              className="w-full bg-[#fffaf7] border border-[#d7c7c0] rounded-xl px-4 py-2.5 text-sm text-[#201816] outline-none focus:border-[#9d7b6f]"
            />
            <button
              onClick={handleAbrirCorte}
              disabled={cargandoCorte}
              className="bg-[#2f5f4d] hover:bg-[#254c3f] disabled:bg-[#c4b5ae] text-[#fff8f4] font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition"
            >
              <Unlock className="w-4 h-4" />
              {cargandoCorte ? 'Procesando...' : 'Abrir Corte de Caja'}
            </button>
          </div>
        )}
      </div>

      {/* CARD 1: DOWNLOAD BACKUP */}
        <div className="glass-panel border border-[#d7c7c0] rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#efe3db] text-[#6f5249] flex items-center justify-center mb-4 border border-[#d7c7c0]">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#201816]">Descargar Respaldo JSON</h3>
            <p className="text-xs text-[#7c6b64] mt-1">
              Genera una copia de seguridad en formato JSON que incluye productos, historial de precios, movimientos e historial de ventas.
            </p>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="mt-6 bg-[#2f1e18] hover:bg-[#412820] text-[#fff8f4] font-semibold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-[#2f1e18]/15 flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4" /> Descargar Copia (.json)
          </button>
        </div>

        {/* CARD 2: RESTORE BACKUP */}
        <div className="glass-panel border border-[#d7c7c0] rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#efe3db] text-[#6f5249] flex items-center justify-center mb-4 border border-[#d7c7c0]">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#201816]">Restaurar Respaldo</h3>
            <p className="text-xs text-[#7c6b64] mt-1">
              Sube un archivo de copia previa para restablecer los catálogos y registros en Supabase.
            </p>
          </div>

          <label className="mt-6 bg-[#fffaf7] hover:bg-[#f6efe8] text-[#201816] font-semibold text-xs py-2.5 px-4 rounded-xl shadow-lg border border-[#d7c7c0] flex items-center justify-center gap-2 cursor-pointer transition">
            <Upload className="w-4 h-4" />
            <span>{restoring ? 'Restaurando...' : 'Seleccionar Archivo JSON'}</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* DANGER ZONE: DATA WIPE */}
      <div className="glass-panel border border-[#e2c8c4] rounded-3xl p-6 bg-[#f8ecea]">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/60 text-[#9f5d55] flex items-center justify-center border border-[#e2c8c4] shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#9f5d55]">Zona de Peligro - Limpieza de Datos</h3>
            <p className="text-xs text-[#7c6b64] mt-1">
              Esta acción vaciará por completo la base de datos eliminando tablas de productos, ventas y movimientos. Utilizar con precaución antes de recargar semillas de prueba.
            </p>

            <button
              onClick={handleWipeData}
              disabled={clearing}
              className="mt-4 bg-[#9f5d55] hover:bg-[#87463d] text-[#fff8f4] font-semibold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-[#9f5d55]/15 flex items-center gap-2 transition disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{clearing ? 'Eliminando...' : 'Limpiar Completamente los Datos'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
