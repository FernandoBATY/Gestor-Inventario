'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const supabase = createClient();
      
      if (!supabase) {
        setErrorMsg('Servidor de Supabase no configurado en .env.local');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message || 'Correo o contraseña incorrectos');
        setLoading(false);
        return;
      }

      if (data?.session || data?.user) {
        // Redirigir explícitamente al Dashboard tras autenticación exitosa
        window.location.href = '/admin/dashboard';
      } else {
        setErrorMsg('No se pudo establecer la sesión');
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con Supabase Auth');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-[#201816] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#f2baa8]/25 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#a4cfc8]/25 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#2f1e18] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[#2f1e18]/15">
            <BookOpen className="w-7 h-7 text-[#fff8f4]" />
          </div>
          <h1 className="text-2xl font-headline font-extrabold tracking-tight text-[#201816]">Panel Administrativo</h1>
          <p className="text-xs text-[#7c6b64] mt-1">Papelería El Cuaderno Dorado</p>
        </div>

        <div className="glass-panel border border-[#d7c7c0] rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-[#f6efe8] border border-[#d7c7c0] text-[#6f5249] text-xs font-medium">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Inicio de sesión requerido para acceder al sistema</span>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-[#f8ecea] border border-[#e2c8c4] text-[#9f5d55] text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#7c6b64] mb-1.5">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[#7c6b64]" />
                <input
                  type="email"
                  required
                  placeholder="tu-correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#fffaf7] border border-[#d7c7c0] focus:border-[#9d7b6f] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#201816] placeholder:text-[#9a8a83] outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#7c6b64] mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[#7c6b64]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#fffaf7] border border-[#d7c7c0] focus:border-[#9d7b6f] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#201816] placeholder:text-[#9a8a83] outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2f1e18] hover:bg-[#412820] text-[#fff8f4] font-semibold py-3 px-4 rounded-xl shadow-lg shadow-[#2f1e18]/15 flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-6"
            >
              {loading ? 'Validando...' : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#e6d8d2] text-center">
            <Link href="/" className="text-xs text-[#7c6b64] hover:text-[#6f5249] transition">
              ← Volver al Catálogo Público
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
