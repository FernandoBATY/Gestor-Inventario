import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

// GET /api/uploads/[archivo] -> Obtener imagen del producto
export async function GET(
  request: Request,
  context: { params: Promise<{ archivo: string }> }
) {
  try {
    const { archivo } = await context.params;
    const supabase = getSupabaseServerClient();
    
    if (supabase) {
      const { data } = supabase.storage.from('productos').getPublicUrl(archivo);
      if (data?.publicUrl) {
        return NextResponse.redirect(data.publicUrl);
      }
    }

    // Default fallback image redirect
    return NextResponse.redirect('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&q=80');
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener la imagen' }, { status: 400 });
  }
}
