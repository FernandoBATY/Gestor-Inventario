export interface Producto {
  id: string;
  nombre: string;
  marca: string;
  categoria: string;
  precio_compra: number;
  precio_venta: number;
  unidades: number;
  sku: string;
  presentacion: string;
  fotografia: string;
  stock_minimo: number;
  created_at?: string;
  updated_at?: string;
}

export interface CategoriaProducto {
  nombre: string;
  created_at?: string;
  updated_at?: string;
}

export interface NegocioConfig {
  id?: number;
  nombre_negocio: string;
  rfc: string;
  telefono: string;
  direccion: string;
  leyenda_ticket: string;
  created_at?: string;
  updated_at?: string;
}

export interface MovimientoStock {
  id: string;
  producto_id: string;
  tipo: 'Entrada' | 'Salida' | 'Ajuste';
  cantidad: number;
  motivo: string;
  fecha: string;
  producto?: Producto;
}

export interface Venta {
  id: string;
  folio: string;
  total: number;
  fecha: string;
  detalles?: DetalleVenta[];
}

export interface DetalleVenta {
  id?: string;
  venta_id?: string;
  producto_id: string;
  nombre_producto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface HistorialPrecio {
  id: string;
  producto_id: string;
  precio_compra_anterior: number;
  precio_compra_nuevo: number;
  precio_venta_anterior: number;
  precio_venta_nuevo: number;
  fecha: string;
}

export interface DashboardStats {
  ventasDia: number;
  ventasMes: number;
  totalVendido: number;
  productosBajoStockCount: number;
  productosBajoStock: Producto[];
  productosMasVendidos: { nombre: string; cantidad: number; total: number }[];
  ventasUltimos7Dias: { fecha: string; total: number }[];
  totalProductos?: number;
  totalVentasCount?: number;
  totalCategorias?: number;
  ticketPromedio?: number;
  ultimaVentaFecha?: string | null;
}
