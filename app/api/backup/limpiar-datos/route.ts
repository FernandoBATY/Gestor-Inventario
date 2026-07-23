import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { mockStore } from '@/lib/mockStore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// DELETE /api/backup/limpiar-datos
export async function DELETE() {
  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      await supabase.from('detalle_ventas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('ventas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('movimientos_stock').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('historial_precios').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('gastos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('cortes_caja').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('productos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      return NextResponse.json({ success: true, message: 'Todos los datos han sido limpiados' });
    }

    mockStore.resetData();
    return NextResponse.json({ success: true, message: 'Datos de fallback limpiados' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al limpiar datos' }, { status: 500 });
  }
}
