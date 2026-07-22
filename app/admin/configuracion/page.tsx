'use client';

import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw,
  Server
} from 'lucide-react';

export default function ConfiguracionBackupPage() {
  const [restoring, setRestoring] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    <div className="space-y-8 max-w-4xl">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Database className="w-7 h-7 text-sky-400" /> Respaldos y Mantenimiento
        </h1>
        <p className="text-xs text-slate-400 mt-1">Exportación, importación de copias de seguridad y purga de base de datos Supabase.</p>
      </div>

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
