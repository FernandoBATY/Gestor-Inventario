import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const CODIGO_LEN = 8;
const DIAS_VALIDEZ = 7;
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

function generarCodigo(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(CODIGO_LEN));
  let codigo = '';
  for (let i = 0; i < CODIGO_LEN; i++) {
    codigo += ALFABETO[bytes[i] % ALFABETO.length];
  }
  return codigo;
}

// POST /api/carritos -> Guarda un carrito y devuelve un código corto
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = body?.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
    }

    const contenido = items
      .map((item: any) => ({
        producto_id: String(item?.producto_id || '').trim(),
        cantidad: Math.trunc(Number(item?.cantidad) || 0),
      }))
      .filter((i) => i.producto_id && i.cantidad > 0);

    if (contenido.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Sin conexión a la base de datos' }, { status: 500 });
    }

    const expira_en = new Date(Date.now() + DIAS_VALIDEZ * 24 * 60 * 60 * 1000).toISOString();

    // Reintenta si el código corto ya existe (colisión poco probable)
    for (let intento = 0; intento < 5; intento++) {
      const codigo = generarCodigo();
      const { error } = await supabase.from('carritos_compartidos').insert([{
        codigo,
        contenido,
        expira_en,
      }]);

      if (!error) {
        return NextResponse.json({ codigo }, { status: 201 });
      }
    }

    return NextResponse.json({ error: 'No se pudo generar el enlace, intenta de nuevo' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al compartir el carrito' }, { status: 500 });
  }
}

// GET /api/carritos?codigo=XXXX -> Recupera el contenido de un carrito compartido
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codigo = (searchParams.get('codigo') || '').trim();

    if (!codigo) {
      return NextResponse.json({ error: 'Falta el código del carrito' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Sin conexión a la base de datos' }, { status: 500 });
    }

    const { data: registro, error } = await supabase
      .from('carritos_compartidos')
      .select('contenido, expira_en')
      .eq('codigo', codigo)
      .maybeSingle();

    if (error || !registro) {
      return NextResponse.json({ error: 'Carrito no encontrado' }, { status: 404 });
    }

    if (new Date(registro.expira_en).getTime() < Date.now()) {
      return NextResponse.json({ error: 'Este carrito ya expiró' }, { status: 410 });
    }

    const items = Array.isArray(registro.contenido) ? registro.contenido : [];
    const ids = items.map((i: any) => i.producto_id).filter(Boolean);

    if (ids.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const { data: productos } = await supabase
      .from('productos')
      .select('*')
      .in('id', ids);

    const itemsConProducto = items
      .map((i: any) => {
        const producto = (productos || []).find((p: any) => p.id === i.producto_id);
        return producto ? { producto_id: i.producto_id, cantidad: i.cantidad, producto } : null;
      })
      .filter(Boolean);

    return NextResponse.json({ items: itemsConProducto });
  } catch (error) {
    return NextResponse.json({ error: 'Error al recuperar el carrito' }, { status: 500 });
  }
}
