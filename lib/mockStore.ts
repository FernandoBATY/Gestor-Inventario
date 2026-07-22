import { Producto, MovimientoStock, Venta } from './types';

export const mockStore = {
  getProducts: () => [],
  setProducts: (prods: Producto[]) => {},
  getProductById: (id: string) => undefined,
  createProduct: (prod: Partial<Producto>) => {
    return {
      id: crypto.randomUUID(),
      nombre: prod.nombre || '',
      marca: prod.marca || '',
      categoria: prod.categoria || '',
      precio_compra: Number(prod.precio_compra) || 0,
      precio_venta: Number(prod.precio_venta) || 0,
      unidades: Number(prod.unidades) || 0,
      sku: prod.sku || '',
      presentacion: prod.presentacion || '',
      fotografia: prod.fotografia || '',
      stock_minimo: Number(prod.stock_minimo) || 5,
      created_at: new Date().toISOString(),
    };
  },
  updateProduct: (id: string, prod: Partial<Producto>) => null,
  deleteProduct: (id: string) => {},
  getMovements: () => [],
  addMovement: (mov: any) => mov,
  getVentas: () => [],
  createVenta: (detalles: any[]) => ({ id: '', folio: '', total: 0, fecha: new Date().toISOString(), detalles: [] }),
  getHistorialPrecios: (prodId: string) => [],
  resetData: () => {}
};
