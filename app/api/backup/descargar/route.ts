import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { mockStore } from '@/lib/mockStore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/backup/descargar
export async function GET() {
  try {
    let backupData: any = {};
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data: productos } = await supabase.from('productos').select('*');
      const { data: movimientos } = await supabase.from('movimientos_stock').select('*');
      const { data: ventas } = await supabase.from('ventas').select('*');
      const { data: detalles } = await supabase.from('detalle_ventas').select('*');
      const { data: historial } = await supabase.from('historial_precios').select('*');

      backupData = {
        timestamp: new Date().toISOString(),
        productos: productos || [],
        movimientos_stock: movimientos || [],
        ventas: ventas || [],
        detalle_ventas: detalles || [],
        historial_precios: historial || [],
      };
    } else {
      backupData = {
        timestamp: new Date().toISOString(),
        productos: mockStore.getProducts() as any[],
        movimientos_stock: mockStore.getMovements() as any[],
        ventas: mockStore.getVentas() as any[],
        detalle_ventas: [],
        historial_precios: [],
      };
    }

    const jsonString = JSON.stringify(backupData, null, 2);
    return new Response(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="backup-papeleria-${new Date().toISOString().slice(0,10)}.json"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al descargar respaldo' }, { status: 500 });
  }
}
