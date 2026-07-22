'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Boxes, 
  ShoppingCart, 
  BarChart3, 
  Database, 
  LogOut,
  AlertTriangle,
  BookOpen,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [bajoStockCount, setBajoStockCount] = useState(0);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const isLoginPage = pathname === '/admin/login';

  // Si estamos en la página de login, no renderizamos el layout del sidebar ni comprobaciones de sesión
  useEffect(() => {
    if (isLoginPage) {
      setCheckingAuth(false);
      return;
    }

    checkUserSession();
    fetchBajoStock();
  }, [isLoginPage]);

  const checkUserSession = async () => {
    const supabase = createClient();
    
    // Si Supabase cliente existe, forzar validación estricta de usuario en Supabase Auth
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCheckingAuth(true);
        router.replace('/admin/login');
        return;
      }
      setUserEmail(user.email || '');
      setCheckingAuth(false);
    } else {
      // Si no hay Supabase configurado, bloquear acceso a panel admin
      router.replace('/admin/login');
    }
  };

  const fetchBajoStock = async () => {
    try {
      const res = await fetch('/api/productos/bajo-stock');
      if (res.ok) {
        const data = await res.json();
        setBajoStockCount(data.length || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.replace('/admin/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 text-sm">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-semibold">Verificando credenciales de Supabase Auth...</p>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Productos', href: '/admin/productos', icon: Package },
    { name: 'Inventario', href: '/admin/inventario', icon: Boxes },
    { name: 'Punto de Venta', href: '/admin/ventas', icon: ShoppingCart },
    { name: 'Reportes', href: '/admin/reportes', icon: BarChart3 },
    { name: 'Backup y Datos', href: '/admin/configuracion', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 backdrop-blur-xl">
        <div className="px-4 lg:px-8 py-4 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="font-extrabold text-base sm:text-lg tracking-tight text-white truncate">El Cuaderno Dorado</h2>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-sky-400 font-semibold">
                  <span>Panel Admin</span>
                  {bajoStockCount > 0 && <span className="text-amber-400">Stock bajo: {bajoStockCount}</span>}
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-sky-400 shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="max-w-44 overflow-hidden">
                  <p className="text-[10px] font-bold text-slate-200 truncate">Usuario Activo</p>
                  <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 py-2.5 px-4 rounded-2xl text-xs font-semibold text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/20 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>

          <nav className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-sm font-semibold transition whitespace-nowrap ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent hover:border-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {bajoStockCount > 0 && (
            <Link
              href="/admin/productos"
              className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition group"
            >
              <div className="flex items-center gap-2 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse text-amber-400" />
                <span>Bajo stock en {bajoStockCount} producto(s)</span>
              </div>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}

          <div className="sm:hidden flex items-center justify-between gap-3 pt-1 border-t border-slate-800/70">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-sky-400 shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-200 truncate">{userEmail}</p>
                <p className="text-[10px] text-slate-500 truncate">Sesión activa</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 min-w-0 p-4 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
