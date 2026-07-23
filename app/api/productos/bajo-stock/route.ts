import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { mockStore } from '@/lib/mockStore';

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('productos')
        .select('id, nombre, marca, categoria, precio_compra, precio_venta, unidades, sku, stock_minimo, fotografia, presentacion')
        .order('unidades', { ascending: true });

      if (!error && data) {
        const lowStock = data.filter((p: any) => p.unidades <= p.stock_minimo);
        return NextResponse.json(lowStock, {
          headers: { 'Cache-Control': 'public, max-age=30, s-maxage=60' },
        });
      }
    }

    const products = mockStore.getProducts() as any[];
    const lowStock = products.filter(p => p.unidades <= p.stock_minimo);
    return NextResponse.json(lowStock);
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar bajo stock' }, { status: 500 });
  }
}
