import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

// POST /api/devoluciones - Revertir una venta
export async function POST(request: Request) {
  try {
    const { venta_id } = await request.json();
    if (!venta_id) {
      return NextResponse.json({ error: 'ID de venta requerido' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'No disponible' }, { status: 500 });
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
        .single();

      if (prod) {
        const nuevosStock = (Number(prod.unidades) || 0) + det.cantidad;
        await supabase.from('productos').update({ unidades: nuevosStock }).eq('id', prod.id);

        await supabase.from('movimientos_stock').insert([{
          producto_id: prod.id,
          tipo: 'Entrada',
          cantidad: det.cantidad,
          motivo: `Devolución de venta ${venta_id}`,
        }]);
      }
    }

    await supabase.from('ventas').delete().eq('id', venta_id);

    return NextResponse.json({ success: true, message: 'Venta revertida exitosamente' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al procesar devolución' }, { status: 500 });
  }
}
