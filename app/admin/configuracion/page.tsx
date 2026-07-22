'use client';

import React, { useEffect, useState } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  ShieldAlert, 
  CheckCircle2, 
  Server
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

  useEffect(() => {
    fetchBusinessConfig();
  }, []);

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
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Database className="w-7 h-7 text-sky-400" /> Configuración y Respaldos
        </h1>
        <p className="text-xs text-slate-400 mt-1">Ajusta los datos del negocio, exporta respaldos e importa copias de seguridad desde un solo lugar.</p>
      </div>

      <form onSubmit={handleSaveBusinessConfig} className="glass-panel border border-slate-800 rounded-3xl p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20 shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Datos del negocio</h3>
            <p className="text-xs text-slate-400 mt-1">Este nombre se reflejará en el panel del administrador, tickets y catálogo público.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nombre del negocio</label>
            <input
              type="text"
              required
              value={businessConfig.nombre_negocio}
              onChange={(e) => setBusinessConfig({ ...businessConfig, nombre_negocio: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">RFC</label>
            <input
              type="text"
              value={businessConfig.rfc}
              onChange={(e) => setBusinessConfig({ ...businessConfig, rfc: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Teléfono</label>
            <input
              type="text"
              value={businessConfig.telefono}
              onChange={(e) => setBusinessConfig({ ...businessConfig, telefono: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Dirección</label>
            <input
              type="text"
              value={businessConfig.direccion}
              onChange={(e) => setBusinessConfig({ ...businessConfig, direccion: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none focus:border-sky-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-300 font-semibold mb-1">Leyenda del ticket</label>
            <textarea
              rows={4}
              value={businessConfig.leyenda_ticket}
              onChange={(e) => setBusinessConfig({ ...businessConfig, leyenda_ticket: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none focus:border-sky-500 resize-y"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={savingConfig}
            className="bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{savingConfig ? 'Guardando...' : 'Guardar Datos del Negocio'}</span>
          </button>
        </div>
      </form>

      {message && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: DOWNLOAD BACKUP */}
        <div className="glass-panel border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4 border border-sky-500/20">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Descargar Respaldo JSON</h3>
            <p className="text-xs text-slate-400 mt-1">
              Genera una copia de seguridad en formato JSON que incluye productos, historial de precios, movimientos e historial de ventas.
            </p>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="mt-6 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4" /> Descargar Copia (.json)
          </button>
        </div>

        {/* CARD 2: RESTORE BACKUP */}
        <div className="glass-panel border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Restaurar Respaldo</h3>
            <p className="text-xs text-slate-400 mt-1">
              Sube un archivo de copia previa para restablecer los catálogos y registros en Supabase.
            </p>
          </div>

          <label className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer transition">
            <Upload className="w-4 h-4" />
            <span>{restoring ? 'Restaurando...' : 'Seleccionar Archivo JSON'}</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* DANGER ZONE: DATA WIPE */}
      <div className="glass-panel border border-rose-500/30 rounded-3xl p-6 bg-rose-500/5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-rose-400">Zona de Peligro - Limpieza de Datos</h3>
            <p className="text-xs text-slate-400 mt-1">
              Esta acción vaciará por completo la base de datos eliminando tablas de productos, ventas y movimientos. Utilizar con precaución antes de recargar semillas de prueba.
            </p>

            <button
              onClick={handleWipeData}
              disabled={clearing}
              className="mt-4 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-rose-600/25 flex items-center gap-2 transition disabled:opacity-50"
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
