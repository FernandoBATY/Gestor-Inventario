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
  UserCheck,
  Receipt,
  Wallet,
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-[#7c6b64] text-sm">
        <div className="w-10 h-10 border-4 border-[#6f5249] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-semibold">Verificando credenciales de Supabase Auth...</p>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Productos', href: '/admin/productos', icon: Package },
    { name: 'Inventario', href: '/admin/inventario', icon: Boxes },
    { name: 'Punto de Venta', href: '/admin/ventas', icon: ShoppingCart },
    { name: 'Egresos', href: '/admin/egresos', icon: Receipt },
    { name: 'Cortes', href: '/admin/cortes', icon: Wallet },
    { name: 'Reportes', href: '/admin/reportes', icon: BarChart3 },
    { name: 'Backup y Datos', href: '/admin/configuracion', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-background text-[#201816] flex flex-col">
      <header className="sticky top-0 z-50 glass-panel border-b border-[#d5c2bd] backdrop-blur-xl">
        <div className="px-4 lg:px-8 py-4 space-y-3 max-w-[1200px] mx-auto w-full">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-[#2f1e18] flex items-center justify-center shadow-lg shadow-[#2f1e18]/15 shrink-0">
                <BookOpen className="w-5 h-5 text-[#fff8f4]" />
              </div>
              <div className="min-w-0">
                <h2 className="font-headline text-base sm:text-lg tracking-tight text-[#36160c] truncate">Papelería</h2>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#7c6b64] font-semibold">
                    <span>Panel Admin</span>
                  </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#f6efe8] border border-[#d7c7c0]">
                <div className="w-8 h-8 rounded-full bg-[#efe3db] border border-[#d7c7c0] flex items-center justify-center font-bold text-xs text-[#6f5249] shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="max-w-44 overflow-hidden">
                  <p className="text-[10px] font-bold text-[#201816] truncate">Usuario Activo</p>
                  <p className="text-[10px] text-[#7c6b64] truncate">{userEmail}</p>
                </div>
              </div>
              <div className="sm:hidden flex items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-[#efe3db] border border-[#d7c7c0] flex items-center justify-center font-bold text-xs text-[#6f5249] shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 py-2 px-2.5 sm:px-4 rounded-2xl text-xs font-semibold text-[#7c6b64] hover:text-[#9f5d55] hover:bg-[#f8ecea] border border-[#d7c7c0] transition"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
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
                      ? 'bg-[#2f1e18] text-[#fff8f4] shadow-lg shadow-[#2f1e18]/15'
                      : 'text-[#7c6b64] hover:text-[#201816] hover:bg-[#f6efe8] border border-transparent hover:border-[#d7c7c0]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {bajoStockCount > 0 && (
            <Link
              href="/admin/productos"
              className="flex items-center justify-between p-3 rounded-2xl bg-[#fee2e2] border border-[#fecaca] text-[#b91c1c] hover:bg-[#fecaca] transition group"
            >
              <div className="flex items-center gap-2 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse text-[#b91c1c]" />
                <span>Bajo stock en {bajoStockCount} producto(s)</span>
              </div>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}

        </div>
      </header>

      <main className="flex-1 min-w-0 p-4 lg:p-8 overflow-y-auto max-w-[1200px] w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
