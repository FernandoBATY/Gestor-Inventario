import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { corteAbrirSchema, corteCerrarSchema } from '@/lib/schemas';

// GET /api/cortes-caja -> Devuelve el corte actual de hoy + historial completo
export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ actual: null, historial: [] });
    }

    const today = new Date().toISOString().slice(0, 10);

    // Corte de hoy
    const { data: corteHoy } = await supabase
      .from('cortes_caja')
      .select('*')
      .gte('fecha_apertura', today)
      .lte('fecha_apertura', `${today}T23:59:59`)
      .maybeSingle();

    // Historial completo
    const { data: historial } = await supabase
      .from('cortes_caja')
      .select('*')
      .order('fecha_apertura', { ascending: false });

    let actual = null;

    if (corteHoy) {
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

      actual = {
        ...corteHoy,
        total_ventas: totalVentas,
        total_gastos: totalGastos,
      };
    }

    return NextResponse.json({ actual, historial: historial || [] });
  } catch (error) {
    return NextResponse.json({ actual: null, historial: [] });
  }
}

// POST /api/cortes-caja -> Acciones: abrir (crear corte) o cerrar
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'No disponible' }, { status: 500 });
    }

    if (body.accion === 'abrir') {
      const parsed = corteAbrirSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Fondo inicial inválido' }, { status: 400 });
      }
      const fondoInicial = parsed.data.fondo_inicial;

      // Verificar que no haya un corte abierto hoy
      const today = new Date().toISOString().slice(0, 10);
      const { data: existente } = await supabase
        .from('cortes_caja')
        .select('id, estado')
        .gte('fecha_apertura', today)
        .lte('fecha_apertura', `${today}T23:59:59`)
        .maybeSingle();

      if (existente) {
        if (existente.estado === 'Abierto') {
          // Actualizar fondo_inicial si aún está abierto
          const { data, error } = await supabase
            .from('cortes_caja')
            .update({ fondo_inicial: fondoInicial })
            .eq('id', existente.id)
            .select()
            .single();

          if (!error && data) return NextResponse.json(data);
        }
        return NextResponse.json({ error: 'Ya hay un corte para hoy' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('cortes_caja')
        .insert([{ fondo_inicial: fondoInicial, fecha_apertura: new Date().toISOString() }])
        .select()
        .single();

      if (!error && data) return NextResponse.json(data, { status: 201 });
      return NextResponse.json({ error: 'Error al abrir corte' }, { status: 500 });
    }

    if (body.accion === 'cerrar') {
      const parsed = corteCerrarSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Datos de cierre inválidos' }, { status: 400 });
      }
      const { corte_id, monto_cierre } = parsed.data;
      if (!corte_id) {
        return NextResponse.json({ error: 'Falta corte_id' }, { status: 400 });
      }

      const { data: corte } = await supabase
        .from('cortes_caja')
        .select('*')
        .eq('id', corte_id)
        .eq('estado', 'Abierto')
        .single();

      if (!corte) {
        return NextResponse.json({ error: 'No hay corte de caja abierto' }, { status: 400 });
      }

      const today = new Date().toISOString().slice(0, 10);

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
      const montoCierre = monto_cierre;
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
