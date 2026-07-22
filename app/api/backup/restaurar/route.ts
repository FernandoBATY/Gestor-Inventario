import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { mockStore } from '@/lib/mockStore';

// POST /api/backup/restaurar
export async function POST(request: Request) {
  try {
    const backupJson = await request.json();

    if (!backupJson || (!backupJson.productos && !Array.isArray(backupJson))) {
      return NextResponse.json({ error: 'Archivo de respaldo inválido' }, { status: 400 });
    }

    const productosToRestore = Array.isArray(backupJson) ? backupJson : backupJson.productos || [];

    const supabase = getSupabaseServerClient();
    if (supabase) {
      if (productosToRestore.length > 0) {
        await supabase.from('productos').upsert(productosToRestore, { onConflict: 'id' });
      }
      return NextResponse.json({ success: true, message: 'Respaldo restaurado exitosamente en Supabase' });
    }

    mockStore.setProducts(productosToRestore);
    return NextResponse.json({ success: true, message: 'Respaldo restaurado en memoria/fallback' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al restaurar respaldo' }, { status: 500 });
  }
}
