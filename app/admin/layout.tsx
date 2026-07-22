'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Boxes, 
  ShoppingCart, 
  BarChart3, 
  Database, 
  Settings, 
  LogOut,
  AlertTriangle,
  BookOpen,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [bajoStockCount, setBajoStockCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchBajoStock();
  }, []);

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

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Productos', href: '/admin/productos', icon: Package },
    { name: 'Inventario', href: '/admin/inventario', icon: Boxes },
    { name: 'Punto de Venta', href: '/admin/ventas', icon: ShoppingCart },
    { name: 'Reportes', href: '/admin/reportes', icon: BarChart3 },
    { name: 'Backup y Datos', href: '/admin/configuracion', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* MOBILE HEADER BAR */}
      <div className="md:hidden glass-panel border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-white">Panel Papelería</span>
        </div>

        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-800"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 glass-panel border-r border-slate-800/80 p-5 flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0 bg-slate-950' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          {/* LOGO */}
          <div className="flex items-center gap-3 pb-6 mb-6 border-b border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="overflow-hidden">
              <h2 className="font-extrabold text-base tracking-tight text-white truncate">El Cuaderno Dorado</h2>
              <span className="text-[10px] text-sky-400 font-semibold uppercase tracking-wider block">Panel Admin</span>
            </div>
          </div>

          {/* LOW STOCK BANNER ALERT */}
          {bajoStockCount > 0 && (
            <Link
              href="/admin/productos?filter=bajo-stock"
              className="flex items-center justify-between p-3 mb-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition group"
            >
              <div className="flex items-center gap-2 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse text-amber-400" />
                <span>Bajo Stock ({bajoStockCount})</span>
              </div>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}

          {/* NAV LINKS */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM USER / LOGOUT */}
        <div className="pt-6 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-sky-400">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-200 truncate">Administrador</p>
              <p className="text-[10px] text-slate-500 truncate">admin@papeleria.com</p>
            </div>
          </div>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/20 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión / Catálogo</span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 p-4 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
