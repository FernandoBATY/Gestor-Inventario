import { Venta } from '@/lib/types';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { mockStore } from '@/lib/mockStore';

export class VentasService {
  static async getAll(): Promise<Venta[]> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('ventas')
        .select('*, detalles:detalle_ventas(*)')
        .order('fecha', { ascending: false });
      if (!error && data) return data;
    }
    return mockStore.getVentas();
  }

  static async createVenta(detalles: { producto_id: string; cantidad: number }[]): Promise<Venta> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      let totalVenta = 0;
      const detallesParaInsertar: any[] = [];

      for (const item of detalles) {
        const { data: prod } = await supabase
          .from('productos')
          .select('*')
          .eq('id', item.producto_id)
          .single();

        if (prod) {
          const precioUnitario = Number(prod.precio_venta);
          const cant = Number(item.cantidad);
          const subtotal = precioUnitario * cant;
          totalVenta += subtotal;

          // Deduct stock
          const nuevosStock = Math.max(0, prod.unidades - cant);
          await supabase.from('productos').update({ unidades: nuevosStock }).eq('id', prod.id);

          // Log movement
          await supabase.from('movimientos_stock').insert([{
            producto_id: prod.id,
            tipo: 'Salida',
            cantidad: cant,
            motivo: 'Venta de producto'
          }]);

          detallesParaInsertar.push({
            producto_id: prod.id,
            nombre_producto: prod.nombre,
            cantidad: cant,
            precio_unitario: precioUnitario,
            subtotal
          });
        }
      }

      const folio = `VEN-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;

      const { data: ventaCreated, error: ventaErr } = await supabase
        .from('ventas')
        .insert([{ folio, total: totalVenta }])
        .select()
        .single();

      if (!ventaErr && ventaCreated) {
        const detallesConVentaId = detallesParaInsertar.map(d => ({
          ...d,
          venta_id: ventaCreated.id
        }));

        const { data: detallesCreated } = await supabase
          .from('detalle_ventas')
          .insert(detallesConVentaId)
          .select();

        return {
          ...ventaCreated,
          detalles: detallesCreated || detallesConVentaId
        };
      }
    }

    return mockStore.createVenta(detalles);
  }
}
