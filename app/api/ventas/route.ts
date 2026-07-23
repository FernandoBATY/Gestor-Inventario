import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { mockStore } from '@/lib/mockStore';

// GET /api/ventas -> Historial de ventas
export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      let data: any[] | null = null;

      // Try with detalles relation
      const { data: d1, error: e1 } = await supabase
        .from('ventas')
        .select('*, detalles:detalle_ventas(*)')
        .order('fecha', { ascending: false });

      if (!e1 && d1) {
        data = d1;
      } else {
        // Fallback: select without relation
        const { data: d2, error: e2 } = await supabase
          .from('ventas')
          .select('*')
          .order('fecha', { ascending: false });
        if (!e2 && d2) data = d2;
      }

      if (data) return NextResponse.json(data);
    }

    return NextResponse.json(mockStore.getVentas() as any[]);
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar historial de ventas' }, { status: 500 });
  }
}

// POST /api/ventas -> Registrar venta, descontar inventario automáticamente, generar ticket
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { detalles, monto_recibido } = body; // Array of { producto_id, cantidad }

    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      return NextResponse.json({ error: 'Debe incluir al menos un producto en la venta' }, { status: 400 });
    }

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

          // Descontar inventario
          const nuevosStock = Math.max(0, prod.unidades - cant);
          await supabase.from('productos').update({ unidades: nuevosStock }).eq('id', prod.id);

          // Registrar movimiento stock
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
      const recibido = Math.max(0, Number(monto_recibido) || 0);
      const cambio = recibido > 0 ? Math.max(0, recibido - totalVenta) : 0;

      let ventaCreated: any = null;

      // Try with monto_recibido/cambio first (new schema)
      const { data: v1, error: e1 } = await supabase
        .from('ventas')
        .insert([{ folio, total: totalVenta, monto_recibido: recibido, cambio }])
        .select()
        .single();

      if (!e1 && v1) {
        ventaCreated = v1;
      } else {
        // Fallback: insert without new columns (old schema)
        const { data: v2, error: e2 } = await supabase
          .from('ventas')
          .insert([{ folio, total: totalVenta }])
          .select()
          .single();
        if (!e2 && v2) ventaCreated = v2;
      }

      if (ventaCreated) {
        const detallesConVentaId = detallesParaInsertar.map(d => ({
          ...d,
          venta_id: ventaCreated.id
        }));

        const { data: detallesCreated } = await supabase
          .from('detalle_ventas')
          .insert(detallesConVentaId)
          .select();

        const resp = { ...ventaCreated, detalles: detallesCreated || detallesConVentaId };
        // Ensure monto_recibido/cambio exist in response
        if (resp.monto_recibido === undefined) resp.monto_recibido = recibido;
        if (resp.cambio === undefined) resp.cambio = cambio;

        return NextResponse.json(resp, { status: 201 });
      }
    }

    return NextResponse.json({ error: 'Error al registrar venta' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al registrar venta' }, { status: 500 });
  }
}
