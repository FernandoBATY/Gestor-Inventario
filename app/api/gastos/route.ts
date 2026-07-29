import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { gastoSchema } from '@/lib/schemas';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');

    const supabase = getSupabaseServerClient();
    if (supabase) {
      let query = supabase.from('gastos').select('*').order('fecha', { ascending: false });

      if (fechaInicio) {
        query = query.gte('fecha', fechaInicio);
      }
      if (fechaFin) {
        query = query.lte('fecha', fechaFin);
      }

      const { data, error } = await query;
      if (!error && data) return NextResponse.json(data);
    }
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar gastos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = gastoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const supabase = getSupabaseServerClient();
    const dataInsert = parsed.data;
    if (supabase) {
      const { data, error } = await supabase
        .from('gastos')
        .insert([{
          descripcion: dataInsert.descripcion,
          monto: dataInsert.monto,
          categoria: dataInsert.categoria || 'General',
          fecha: dataInsert.fecha || new Date().toISOString().slice(0, 10),
        }])
        .select()
        .single();
      if (!error && data) return NextResponse.json(data, { status: 201 });
    }
    return NextResponse.json({ error: 'Error al crear gasto' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear gasto' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    const supabase = getSupabaseServerClient();
    if (supabase) {
      await supabase.from('gastos').delete().eq('id', id);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'No disponible' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar gasto' }, { status: 500 });
  }
}
