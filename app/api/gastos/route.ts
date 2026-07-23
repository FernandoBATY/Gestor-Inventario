import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('gastos')
        .select('*')
        .order('fecha', { ascending: false });
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
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('gastos')
        .insert([{
          descripcion: body.descripcion,
          monto: Number(body.monto) || 0,
          categoria: body.categoria || 'General',
          fecha: body.fecha || new Date().toISOString().slice(0, 10),
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
