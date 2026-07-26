import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';

// POST /api/devoluciones - Marcar venta como cancelada y restaurar stock
export async function POST(request: Request) {
  const authErr = await requireAuth();
  if (authErr) return authErr;

  try {
    const { venta_id } = await request.json();
    if (!venta_id) {
      return NextResponse.json({ error: 'ID de venta requerido' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'No disponible' }, { status: 500 });
    }

    // Verificar que la venta existe y no está ya cancelada
    const { data: venta } = await supabase
      .from('ventas')
      .select('estado')
      .eq('id', venta_id)
      .maybeSingle();

    if (!venta) {
      return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 });
    }
    if (venta.estado === 'Cancelada') {
      return NextResponse.json({ error: 'Esta venta ya fue cancelada' }, { status: 400 });
    }

    const { data: detalles } = await supabase
      .from('detalle_ventas')
      .select('*')
      .eq('venta_id', venta_id);

    if (!detalles || detalles.length === 0) {
      return NextResponse.json({ error: 'Venta sin detalles' }, { status: 400 });
    }

    for (const det of detalles) {
      const { data: prod } = await supabase
        .from('productos')
        .select('*')
        .eq('id', det.producto_id)
        .maybeSingle();

      if (prod) {
        const nuevosStock = (Number(prod.unidades) || 0) + det.cantidad;
        await supabase.from('productos').update({ unidades: nuevosStock }).eq('id', prod.id);

        await supabase.from('movimientos_stock').insert([{
          producto_id: prod.id,
          tipo: 'Entrada',
          cantidad: det.cantidad,
          motivo: `Devolución de venta ${venta_id.slice(0, 8)}`,
        }]);
      }
    }

    // Marcar como cancelada en lugar de eliminar
    await supabase.from('ventas').update({ estado: 'Cancelada' }).eq('id', venta_id);

    return NextResponse.json({ success: true, message: 'Venta cancelada y stock restaurado exitosamente' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al procesar devolución' }, { status: 500 });
  }
}
