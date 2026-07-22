import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { mockStore } from '@/lib/mockStore';

// GET /api/precios/historial/[id]
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'ID de producto requerido' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('historial_precios')
        .select('*')
        .eq('producto_id', id)
        .order('fecha', { ascending: false });

      if (!error && data) {
        return NextResponse.json(data);
      }
    }

    return NextResponse.json(mockStore.getHistorialPrecios(id));
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar historial de precios' }, { status: 500 });
  }
}
