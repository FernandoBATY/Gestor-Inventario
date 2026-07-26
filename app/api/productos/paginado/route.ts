import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { mockStore } from '@/lib/mockStore';

// GET /api/productos/paginado?page=0&size=12&sort=nombre-asc&incluirAgotados=true
const SORT_MAP: Record<string, { field: string; dir: 'asc' | 'desc' }> = {
  'nombre-asc': { field: 'nombre', dir: 'asc' },
  'precio-asc': { field: 'precio_venta', dir: 'asc' },
  'precio-desc': { field: 'precio_venta', dir: 'desc' },
  'reciente': { field: 'created_at', dir: 'desc' },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0', 10);
    const size = parseInt(searchParams.get('size') || '12', 10);
    const search = searchParams.get('search') || '';
    const categoria = searchParams.get('categoria') || '';
    const precioMin = parseFloat(searchParams.get('precioMin') || '0');
    const precioMax = parseFloat(searchParams.get('precioMax') || '999999');
    const sort = searchParams.get('sort') || 'nombre-asc';
    const incluirAgotados = searchParams.get('incluirAgotados') !== 'false';

    const supabase = getSupabaseServerClient();
    if (supabase) {
      let query = supabase.from('productos').select('*', { count: 'exact' });

      if (!incluirAgotados) {
        query = query.gt('unidades', 0);
      }

      if (search) {
        query = query.or(`nombre.ilike.%${search}%,marca.ilike.%${search}%,sku.ilike.%${search}%`);
      }
      if (categoria && categoria !== 'Todas') {
        query = query.eq('categoria', categoria);
      }
      if (precioMin > 0) {
        query = query.gte('precio_venta', precioMin);
      }
      if (precioMax < 999999) {
        query = query.lte('precio_venta', precioMax);
      }

      const from = page * size;
      const to = from + size - 1;

      const sortConfig = SORT_MAP[sort] || SORT_MAP['nombre-asc'];

      const { data, count, error } = await query
        .range(from, to)
        .order(sortConfig.field, { ascending: sortConfig.dir === 'asc' });

      if (!error && data) {
        return NextResponse.json({
          content: data,
          totalElements: count || 0,
          totalPages: Math.ceil((count || 0) / size),
          page,
          size,
        });
      }
    }

    // Mock fallback paginado
    let products = mockStore.getProducts() as any[];
    if (!incluirAgotados) {
      products = products.filter(p => Number(p.unidades) > 0);
    }
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(
        p => p.nombre.toLowerCase().includes(q) || p.marca.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      );
    }
    if (categoria && categoria !== 'Todas') {
      products = products.filter(p => p.categoria === categoria);
    }
    products = products.filter(p => {
      const price = Number(p.precio_venta) || 0;
      return price >= precioMin && price <= precioMax;
    });

    const sortConfig = SORT_MAP[sort] || SORT_MAP['nombre-asc'];
    products.sort((a, b) => {
      const aVal = a[sortConfig.field];
      const bVal = b[sortConfig.field];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.dir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal ?? '').toLowerCase();
      const bStr = String(bVal ?? '').toLowerCase();
      return sortConfig.dir === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    const totalElements = products.length;
    const start = page * size;
    const content = products.slice(start, start + size);

    return NextResponse.json({
      content,
      totalElements,
      totalPages: Math.ceil(totalElements / size),
      page,
      size,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error en productos paginados' }, { status: 500 });
  }
}
