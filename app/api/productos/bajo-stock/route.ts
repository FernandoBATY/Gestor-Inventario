import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { mockStore } from '@/lib/mockStore';

// GET /api/productos/bajo-stock
export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      // Supabase query using raw or column comparison logic
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('unidades', { ascending: true });

      if (!error && data) {
        const lowStock = data.filter((p: any) => p.unidades <= p.stock_minimo);
        return NextResponse.json(lowStock);
      }
    }

    const products = mockStore.getProducts() as any[];
    const lowStock = products.filter(p => p.unidades <= p.stock_minimo);
    return NextResponse.json(lowStock);
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar bajo stock' }, { status: 500 });
  }
}
