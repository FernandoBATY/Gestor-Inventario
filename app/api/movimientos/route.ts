import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { mockStore } from '@/lib/mockStore';

// GET /api/movimientos -> Historial de movimientos
export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('movimientos_stock')
        .select('*, producto:productos(*)')
        .order('fecha', { ascending: false });

      if (!error && data) {
        return NextResponse.json(data);
      }
    }

    return NextResponse.json(mockStore.getMovements());
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar movimientos' }, { status: 500 });
  }
}

// POST /api/movimientos -> Registrar movimiento de inventario
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { producto_id, tipo, cantidad, motivo } = body;

    if (!producto_id || !tipo || !cantidad || !motivo) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    if (supabase) {
      // Fetch product current stock
      const { data: prodData } = await supabase
        .from('productos')
        .select('unidades')
        .eq('id', producto_id)
        .single();

      if (prodData) {
        let newUnits = prodData.unidades;
        const cantNum = Number(cantidad);
        if (tipo === 'Entrada') newUnits += cantNum;
        else if (tipo === 'Salida') newUnits = Math.max(0, newUnits - cantNum);
        else if (tipo === 'Ajuste') newUnits = cantNum;

        // Update product stock
        await supabase.from('productos').update({ unidades: newUnits }).eq('id', producto_id);
      }

      // Insert movement record
      const { data: movData, error: movErr } = await supabase
        .from('movimientos_stock')
        .insert([{ producto_id, tipo, cantidad: Number(cantidad), motivo }])
        .select()
        .single();

      if (!movErr && movData) {
        return NextResponse.json(movData, { status: 201 });
      }
    }

    const movement = mockStore.addMovement({ producto_id, tipo, cantidad: Number(cantidad), motivo });
    return NextResponse.json(movement, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al registrar movimiento' }, { status: 500 });
  }
}
