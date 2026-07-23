import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ abierto: false });
    }

    const today = new Date().toISOString().slice(0, 10);

    // Look for an open corte
    let { data: corte } = await supabase
      .from('cortes_caja')
      .select('*')
      .eq('estado', 'Abierto')
      .maybeSingle();

    // If no open corte, check if there's one already created today
    if (!corte) {
      const { data: corteHoy } = await supabase
        .from('cortes_caja')
        .select('*')
        .gte('fecha_apertura', today)
        .lte('fecha_apertura', `${today}T23:59:59`)
        .maybeSingle();

      if (corteHoy) {
        corte = corteHoy;
      } else {
        // Auto-create a corte for today
        const { data: nuevo } = await supabase
          .from('cortes_caja')
          .insert([{ fondo_inicial: 0, fecha_apertura: new Date().toISOString() }])
          .select()
          .single();
        if (nuevo) corte = nuevo;
      }
    }

    if (!corte) {
      return NextResponse.json({ abierto: false });
    }

    const { data: ventasHoy } = await supabase
      .from('ventas')
      .select('total')
      .gte('fecha', today)
      .lte('fecha', `${today}T23:59:59`);

    const totalVentas = (ventasHoy || []).reduce((s, v) => s + Number(v.total), 0);

    const { data: gastosHoy } = await supabase
      .from('gastos')
      .select('monto')
      .gte('fecha', today)
      .lte('fecha', `${today}T23:59:59`);

    const totalGastos = (gastosHoy || []).reduce((s, g) => s + Number(g.monto), 0);
    const saldoEsperado = Number(corte.fondo_inicial) + totalVentas - totalGastos;

    return NextResponse.json({
      abierto: true,
      corte_actual_id: corte.id,
      fecha_apertura: corte.fecha_apertura,
      total_ventas: totalVentas,
      total_gastos: totalGastos,
      saldo_esperado: saldoEsperado,
    });
  } catch (error) {
    return NextResponse.json({ abierto: false });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'No disponible' }, { status: 500 });
    }

    const today = new Date().toISOString().slice(0, 10);

    if (body.accion === 'cerrar') {
      const corteId = body.corte_id;

      if (!corteId) {
        return NextResponse.json({ error: 'Falta corte_id' }, { status: 400 });
      }

      const { data: corte } = await supabase
        .from('cortes_caja')
        .select('*')
        .eq('id', corteId)
        .eq('estado', 'Abierto')
        .single();

      if (!corte) {
        return NextResponse.json({ error: 'No hay corte de caja abierto' }, { status: 400 });
      }

      const { data: ventasHoy } = await supabase
        .from('ventas')
        .select('total')
        .gte('fecha', today)
        .lte('fecha', `${today}T23:59:59`);

      const ingresos = (ventasHoy || []).reduce((s, v) => s + Number(v.total), 0);

      const { data: gastosHoy } = await supabase
        .from('gastos')
        .select('monto')
        .gte('fecha', today)
        .lte('fecha', `${today}T23:59:59`);

      const egresos = (gastosHoy || []).reduce((s, g) => s + Number(g.monto), 0);
      const totalEsperado = Number(corte.fondo_inicial) + ingresos - egresos;
      const montoCierre = Number(body.monto_cierre) || 0;
      const diferencia = montoCierre - totalEsperado;

      const { data, error } = await supabase
        .from('cortes_caja')
        .update({
          fecha_cierre: new Date().toISOString(),
          ingresos,
          egresos,
          total_esperado: totalEsperado,
          total_real: montoCierre,
          diferencia,
          estado: 'Cerrado',
        })
        .eq('id', corte.id)
        .select()
        .single();

      if (!error && data) return NextResponse.json(data);

      return NextResponse.json({ error: 'Error al cerrar corte' }, { status: 500 });
    }

    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al procesar corte' }, { status: 500 });
  }
}
