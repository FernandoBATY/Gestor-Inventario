import { Producto, Venta, MovimientoStock } from './types';

export class ApiClient {
  static async getProductos(): Promise<Producto[]> {
    const res = await fetch('/api/productos');
    if (!res.ok) throw new Error('Error al obtener productos');
    return res.json();
  }

  static async getProductosPaginado(page = 0, size = 12, search = '', categoria = '') {
    const params = new URLSearchParams({ page: String(page), size: String(size), search, categoria });
    const res = await fetch(`/api/productos/paginado?${params.toString()}`);
    if (!res.ok) throw new Error('Error al obtener productos paginados');
    return res.json();
  }

  static async getBajoStock(): Promise<Producto[]> {
    const res = await fetch('/api/productos/bajo-stock');
    if (!res.ok) throw new Error('Error al obtener productos bajo stock');
    return res.json();
  }

  static async getCategorias(): Promise<string[]> {
    const res = await fetch('/api/productos/categorias');
    if (!res.ok) throw new Error('Error al obtener categorías');
    return res.json();
  }

  static async getDashboardStats() {
    const res = await fetch('/api/dashboard');
    if (!res.ok) throw new Error('Error al obtener estadisticas');
    return res.json();
  }

  static async getMovimientos(): Promise<MovimientoStock[]> {
    const res = await fetch('/api/movimientos');
    if (!res.ok) throw new Error('Error al obtener movimientos');
    return res.json();
  }

  static async registrarMovimiento(payload: { producto_id: string; tipo: string; cantidad: number; motivo: string }) {
    const res = await fetch('/api/movimientos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Error al registrar movimiento');
    return res.json();
  }

  static async getVentas(): Promise<Venta[]> {
    const res = await fetch('/api/ventas');
    if (!res.ok) throw new Error('Error al obtener ventas');
    return res.json();
  }

  static async registrarVenta(detalles: { producto_id: string; cantidad: number }[]) {
    const res = await fetch('/api/ventas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ detalles }),
    });
    if (!res.ok) throw new Error('Error al registrar venta');
    return res.json();
  }
}
