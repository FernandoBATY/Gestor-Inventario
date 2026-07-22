import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { mockStore } from '@/lib/mockStore';

// GET /api/productos/categorias
export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase.from('productos').select('categoria');
      if (!error && data) {
        const categories = Array.from(new Set(data.map((item: any) => item.categoria))).filter(Boolean);
        return NextResponse.json(categories);
      }
    }

    const products = mockStore.getProducts();
    const categories = Array.from(new Set(products.map(p => p.categoria)));
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar categorías' }, { status: 500 });
  }
}
