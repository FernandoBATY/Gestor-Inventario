import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { mockStore } from '@/lib/mockStore';

// GET /api/dashboard -> Estadísticas generales
export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const todayStr = new Date().toISOString().slice(0, 10);
      const startOfMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`;

      const { data: prods } = await supabase.from('productos').select('*');
      const { data: ventas } = await supabase.from('ventas').select('*, detalle_ventas(*)');

      if (prods && ventas) {
        let ventasDia = 0;
        let ventasMes = 0;
        let totalVendido = 0;

        ventas.forEach((v: any) => {
          const vTotal = Number(v.total) || 0;
          totalVendido += vTotal;
          if (v.fecha.startsWith(todayStr)) ventasDia += vTotal;
          if (v.fecha >= startOfMonthStr) ventasMes += vTotal;
        });

        const productosBajoStock = prods.filter((p: any) => p.unidades <= p.stock_minimo);

        return NextResponse.json({
          ventasDia,
          ventasMes,
          totalVendido,
          productosBajoStockCount: productosBajoStock.length,
          productosBajoStock,
          totalProductos: prods.length,
          totalVentasCount: ventas.length
        });
      }
    }

    // Mock calculations
    const prods = mockStore.getProducts();
    const ventas = mockStore.getVentas();
    const todayStr = new Date().toISOString().slice(0, 10);

    let ventasDia = 0;
    let ventasMes = 0;
    let totalVendido = 0;

    ventas.forEach(v => {
      totalVendido += v.total;
      if (v.fecha.startsWith(todayStr)) ventasDia += v.total;
      ventasMes += v.total;
    });

    const productosBajoStock = prods.filter(p => p.unidades <= p.stock_minimo);

    return NextResponse.json({
      ventasDia,
      ventasMes,
      totalVendido,
      productosBajoStockCount: productosBajoStock.length,
      productosBajoStock,
      totalProductos: prods.length,
      totalVentasCount: ventas.length
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar dashboard stats' }, { status: 500 });
  }
}
