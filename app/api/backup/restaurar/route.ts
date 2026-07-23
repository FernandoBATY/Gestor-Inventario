import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { mockStore } from '@/lib/mockStore';
import { requireAuth } from '@/lib/auth';

export async function POST(request: Request) {
  const authErr = await requireAuth();
  if (authErr) return authErr;

  try {
    const backupJson = await request.json();

    if (!backupJson || !backupJson.productos) {
      return NextResponse.json({ error: 'Archivo de respaldo inválido' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    if (supabase) {
      if (backupJson.categorias?.length > 0) {
        await supabase.from('categorias').upsert(backupJson.categorias, { onConflict: 'nombre' });
      }
      if (backupJson.productos?.length > 0) {
        await supabase.from('productos').upsert(backupJson.productos, { onConflict: 'id' });
      }
      if (backupJson.movimientos_stock?.length > 0) {
        await supabase.from('movimientos_stock').upsert(backupJson.movimientos_stock, { onConflict: 'id' });
      }
      if (backupJson.ventas?.length > 0) {
        await supabase.from('ventas').upsert(backupJson.ventas, { onConflict: 'id' });
      }
      if (backupJson.detalle_ventas?.length > 0) {
        await supabase.from('detalle_ventas').upsert(backupJson.detalle_ventas, { onConflict: 'id' });
      }
      if (backupJson.historial_precios?.length > 0) {
        await supabase.from('historial_precios').upsert(backupJson.historial_precios, { onConflict: 'id' });
      }
      if (backupJson.negocio_config) {
        await supabase.from('negocio_config').upsert(backupJson.negocio_config, { onConflict: 'id' });
      }
      return NextResponse.json({ success: true, message: 'Respaldo restaurado exitosamente en Supabase' });
    }

    if (backupJson.productos?.length > 0) {
      mockStore.setProducts(backupJson.productos);
    }
    return NextResponse.json({ success: true, message: 'Respaldo restaurado en memoria/fallback' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al restaurar respaldo' }, { status: 500 });
  }
}
