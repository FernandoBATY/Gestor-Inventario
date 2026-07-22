import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { DEFAULT_NEGOCIO_CONFIG, negocioStore } from '@/lib/negocioStore';

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('negocio_config')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return NextResponse.json(data);
      }
    }

    return NextResponse.json(negocioStore.getConfig());
  } catch (error) {
    return NextResponse.json(DEFAULT_NEGOCIO_CONFIG, { status: 200 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const payload = {
      nombre_negocio: String(body.nombre_negocio ?? '').trim() || DEFAULT_NEGOCIO_CONFIG.nombre_negocio,
      rfc: String(body.rfc ?? '').trim(),
      telefono: String(body.telefono ?? '').trim(),
      direccion: String(body.direccion ?? '').trim(),
      leyenda_ticket: String(body.leyenda_ticket ?? '').trim(),
    };

    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('negocio_config')
        .upsert([{ id: 1, ...payload }], { onConflict: 'id' })
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json(data);
      }
    }

    const updated = negocioStore.updateConfig(payload);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Error al guardar configuración del negocio' }, { status: 500 });
  }
}