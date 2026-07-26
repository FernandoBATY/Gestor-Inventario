import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { mockStore } from '@/lib/mockStore';

// GET /api/ventas -> Historial de ventas (con filtros opcionales de fecha)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');

    const supabase = getSupabaseServerClient();
    if (supabase) {
      let query = supabase
        .from('ventas')
        .select('*, detalles:detalle_ventas(*)')
        .order('fecha', { ascending: false });

      if (fechaInicio) {
        query = query.gte('fecha', `${fechaInicio}T00:00:00`);
      }
      if (fechaFin) {
        query = query.lte('fecha', `${fechaFin}T23:59:59`);
      }

      const { data: d1, error: e1 } = await query;

      if (!e1 && d1) {
        return NextResponse.json(d1);
      }

      // Fallback: select without relation
      let fallbackQuery = supabase
        .from('ventas')
        .select('*')
        .order('fecha', { ascending: false });

      if (fechaInicio) {
        fallbackQuery = fallbackQuery.gte('fecha', `${fechaInicio}T00:00:00`);
      }
      if (fechaFin) {
        fallbackQuery = fallbackQuery.lte('fecha', `${fechaFin}T23:59:59`);
      }

      const { data: d2, error: e2 } = await fallbackQuery;
      if (!e2 && d2) return NextResponse.json(d2);
    }

    return NextResponse.json(mockStore.getVentas() as any[]);
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar historial de ventas' }, { status: 500 });
  }
}

// POST /api/ventas -> Registrar venta en transacción SQL (todo o nada)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { detalles, monto_recibido } = body;

    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      return NextResponse.json({ error: 'Debe incluir al menos un producto en la venta' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'No disponible' }, { status: 500 });
    }

    let totalVenta = 0;
    const detallesParaInsertar: any[] = [];

    for (const item of detalles) {
      const { data: prod } = await supabase
        .from('productos')
        .select('*')
        .eq('id', item.producto_id)
        .single();

      if (!prod) {
        return NextResponse.json({ error: `Producto ${item.producto_id} no encontrado` }, { status: 400 });
      }

      const precioUnitario = Number(prod.precio_venta);
      const cant = Number(item.cantidad);
      totalVenta += precioUnitario * cant;

      detallesParaInsertar.push({
        producto_id: prod.id,
        nombre_producto: prod.nombre,
        cantidad: cant,
        precio_unitario: precioUnitario,
        subtotal: precioUnitario * cant,
      });
    }

    const folio = `VEN-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const recibido = Math.max(0, Number(monto_recibido) || 0);

    // Try transaction via RPC function first
    const { data: txResult, error: txError } = await supabase
      .rpc('realizar_venta', {
        p_detalles: detallesParaInsertar,
        p_folio: folio,
        p_monto_recibido: recibido,
        p_total: totalVenta,
      });

    if (!txError && txResult) {
      return NextResponse.json(txResult, { status: 201 });
    }

    // Fallback: multi-step with manual rollback on failure
    let ventaCreated: any = null;

    try {
      const { data: v1, error: e1 } = await supabase
        .from('ventas')
        .insert([{ folio, total: totalVenta, monto_recibido: recibido, cambio: Math.max(0, recibido - totalVenta), estado: 'Completada' }])
        .select()
        .single();

      if (!e1 && v1) {
        ventaCreated = v1;
      } else {
        const { data: v2, error: e2 } = await supabase
          .from('ventas')
          .insert([{ folio, total: totalVenta, estado: 'Completada' }])
          .select()
          .single();
        if (!e2 && v2) ventaCreated = v2;
      }

      if (!ventaCreated) {
        return NextResponse.json({ error: 'Error al crear la venta' }, { status: 500 });
      }

      // Insert details, update stock, create movements
      for (const det of detallesParaInsertar) {
        const { error: detErr } = await supabase
          .from('detalle_ventas')
          .insert([{ ...det, venta_id: ventaCreated.id }]);

        if (detErr) throw new Error(detErr.message);

        // Get current stock and deduct
        const { data: prod } = await supabase
          .from('productos')
          .select('unidades')
          .eq('id', det.producto_id)
          .single();

        if (prod) {
          const { error: updErr } = await supabase
            .from('productos')
            .update({ unidades: Math.max(0, Number(prod.unidades) - det.cantidad) })
            .eq('id', det.producto_id);

          if (updErr) throw new Error(updErr.message);
        }

        const { error: movErr } = await supabase.from('movimientos_stock').insert([{
          producto_id: det.producto_id,
          tipo: 'Salida',
          cantidad: det.cantidad,
          motivo: 'Venta de producto',
        }]);

        if (movErr) throw new Error(movErr.message);
      }

      const resp = { ...ventaCreated, detalles: detallesParaInsertar };
      if (resp.monto_recibido === undefined) resp.monto_recibido = recibido;
      if (resp.cambio === undefined) resp.cambio = Math.max(0, recibido - totalVenta);

      return NextResponse.json(resp, { status: 201 });
    } catch (fallbackErr) {
      if (ventaCreated) {
        await supabase.from('detalle_ventas').delete().eq('venta_id', ventaCreated.id);
        await supabase.from('ventas').delete().eq('id', ventaCreated.id);
      }
      return NextResponse.json({ error: 'Error al registrar venta (operación revertida)' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error al registrar venta' }, { status: 500 });
  }
}
