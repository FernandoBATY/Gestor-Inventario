import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

// GET /api/mermas -> Historial de mermas
export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('mermas')
        .select('*, producto:productos(*)')
        .order('fecha', { ascending: false });

      if (!error && data) {
        return NextResponse.json(data);
      }
    }
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar mermas' }, { status: 500 });
  }
}

// POST /api/mermas -> Registrar merma (descuenta stock y deja rastro en movimientos)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { producto_id, cantidad, motivo, observacion } = body;

    if (!producto_id || !cantidad || !motivo) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const cantidadNum = Math.trunc(Number(cantidad));
    if (!Number.isFinite(cantidadNum) || cantidadNum <= 0) {
      return NextResponse.json({ error: 'La cantidad debe ser un número mayor a 0' }, { status: 400 });
    }

    const motivosValidos = ['Dañado', 'Vencido', 'Extraviado', 'Otro'];
    if (!motivosValidos.includes(motivo)) {
      return NextResponse.json({ error: 'Motivo de merma inválido' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data: prodData, error: prodErr } = await supabase
        .from('productos')
        .select('unidades, nombre')
        .eq('id', producto_id)
        .single();

      if (prodErr || !prodData) {
        return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
      }

      if (prodData.unidades <= 0) {
        return NextResponse.json({ error: 'El producto no tiene existencias' }, { status: 400 });
      }

      const newUnits = Math.max(0, prodData.unidades - cantidadNum);

      await supabase.from('productos').update({ unidades: newUnits }).eq('id', producto_id);

      await supabase.from('movimientos_stock').insert([{
        producto_id,
        tipo: 'Salida',
        cantidad: cantidadNum,
        motivo: `Merma (${motivo})`,
      }]);

      const { data: mermaData, error: mermaErr } = await supabase
        .from('mermas')
        .insert([{
          producto_id,
          cantidad: cantidadNum,
          motivo,
          observacion: String(observacion || '').trim() || null,
        }])
        .select()
        .single();

      if (!mermaErr && mermaData) {
        return NextResponse.json(mermaData, { status: 201 });
      }
      return NextResponse.json({ error: 'Error al registrar merma' }, { status: 500 });
    }

    return NextResponse.json({ error: 'Sin conexión a la base de datos' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al registrar merma' }, { status: 500 });
  }
}
