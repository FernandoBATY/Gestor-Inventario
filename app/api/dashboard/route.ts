import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { mockStore } from '@/lib/mockStore';

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const todayStr = new Date().toISOString().slice(0, 10);
      const startOfMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`;
      const last7Days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        return date.toISOString().slice(0, 10);
      });
      const last90Days = new Date();
      last90Days.setDate(last90Days.getDate() - 90);

      const { data: prods } = await supabase
        .from('productos')
        .select('id, nombre, marca, categoria, precio_compra, precio_venta, unidades, sku, stock_minimo, fotografia');

      const { data: ventasLight } = await supabase
        .from('ventas')
        .select('fecha, total');

      const { data: ventasDetalles } = await supabase
        .from('ventas')
        .select('fecha, total, detalle_ventas(nombre_producto, cantidad, subtotal)')
        .gte('fecha', last90Days.toISOString().slice(0, 10));

      if (prods && ventasLight) {
        let ventasDia = 0;
        let ventasMes = 0;
        let totalVendido = 0;
        const ventasPorDia = new Map<string, number>(last7Days.map((date) => [date, 0]));
        const productosMasVendidos = new Map<string, { nombre: string; cantidad: number; total: number }>();
        let ultimaVentaFecha: string | null = null;

        ventasLight.forEach((v: any) => {
          const vTotal = Number(v.total) || 0;
          totalVendido += vTotal;
          if (!ultimaVentaFecha || v.fecha > ultimaVentaFecha) ultimaVentaFecha = v.fecha;
          if (v.fecha.startsWith(todayStr)) ventasDia += vTotal;
          if (v.fecha >= startOfMonthStr) ventasMes += vTotal;

          const saleDate = v.fecha.slice(0, 10);
          if (ventasPorDia.has(saleDate)) {
            ventasPorDia.set(saleDate, (ventasPorDia.get(saleDate) || 0) + vTotal);
          }
        });

        (ventasDetalles || []).forEach((v: any) => {
          v.detalle_ventas?.forEach((detalle: any) => {
            const current = productosMasVendidos.get(detalle.nombre_producto) || {
              nombre: detalle.nombre_producto,
              cantidad: 0,
              total: 0,
            };
            current.cantidad += Number(detalle.cantidad) || 0;
            current.total += Number(detalle.subtotal) || 0;
            productosMasVendidos.set(detalle.nombre_producto, current);
          });
        });

        const productosBajoStock = prods.filter((p: any) => p.unidades <= p.stock_minimo);
        const totalCategorias = new Set(prods.map((p: any) => p.categoria).filter(Boolean)).size;
        const totalVentasCount = ventasLight.length;
        const ticketPromedio = totalVentasCount > 0 ? totalVendido / totalVentasCount : 0;

        const costoTotalInventario = prods.reduce((sum, p) => sum + (Number(p.precio_compra) || 0) * (Number(p.unidades) || 0), 0);
        const precioVentaTotal = prods.reduce((sum, p) => sum + (Number(p.precio_venta) || 0) * (Number(p.unidades) || 0), 0);
        const gananciaPotencial = precioVentaTotal - costoTotalInventario;

        return NextResponse.json({
          ventasDia,
          ventasMes,
          totalVendido,
          productosBajoStockCount: productosBajoStock.length,
          productosBajoStock,
          totalProductos: prods.length,
          totalVentasCount,
          totalCategorias,
          ticketPromedio,
          ultimaVentaFecha,
          ventasUltimos7Dias: Array.from(ventasPorDia.entries()).map(([fecha, total]) => ({ fecha, total })),
          productosMasVendidos: Array.from(productosMasVendidos.values())
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 5),
          costoTotalInventario,
          precioVentaTotal,
          gananciaPotencial,
        }, {
          headers: { 'Cache-Control': 'public, max-age=30, s-maxage=60' },
        });
      }
    }

    const prods = mockStore.getProducts() as any[];
    const ventas = mockStore.getVentas() as any[];
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
    const totalCategorias = new Set(prods.map(p => p.categoria).filter(Boolean)).size;
    const totalVentasCount = ventas.length;
    const ticketPromedio = totalVentasCount > 0 ? totalVendido / totalVentasCount : 0;

    const costoTotalInventario = prods.reduce((sum, p) => sum + (Number(p.precio_compra) || 0) * (Number(p.unidades) || 0), 0);
    const precioVentaTotal = prods.reduce((sum, p) => sum + (Number(p.precio_venta) || 0) * (Number(p.unidades) || 0), 0);
    const gananciaPotencial = precioVentaTotal - costoTotalInventario;

    return NextResponse.json({
      ventasDia, ventasMes, totalVendido,
      productosBajoStockCount: productosBajoStock.length,
      productosBajoStock, totalProductos: prods.length,
      totalVentasCount, totalCategorias, ticketPromedio,
      ultimaVentaFecha: ventas.at(-1)?.fecha || null,
      ventasUltimos7Dias: [], productosMasVendidos: [],
      costoTotalInventario, precioVentaTotal, gananciaPotencial,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar dashboard stats' }, { status: 500 });
  }
}
