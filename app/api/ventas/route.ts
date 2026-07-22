import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { mockStore } from '@/lib/mockStore';

// GET /api/ventas -> Historial de ventas
export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('ventas')
        .select('*, detalles:detalle_ventas(*)')
        .order('fecha', { ascending: false });

      if (!error && data) {
        return NextResponse.json(data);
      }
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
    const { detalles } = body; // Array of { producto_id, cantidad }

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

        return NextResponse.json({
          ...ventaCreated,
          detalles: detallesCreated || detallesConVentaId
        }, { status: 201 });
      }
    }

    // Fallback Mock Store
    const venta = mockStore.createVenta(detalles);
    return NextResponse.json(venta, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al registrar venta' }, { status: 500 });
  }
}
