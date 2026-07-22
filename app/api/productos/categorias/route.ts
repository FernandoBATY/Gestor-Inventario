import { NextResponse } from 'next/server';
import { ProductosService } from '@/services/productos.service';

// GET /api/productos/categorias
export async function GET() {
  try {
    const categories = await ProductosService.getCategorias();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar categorías' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const categories = await ProductosService.createCategoria(body.categoria);
    return NextResponse.json(categories, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear categoría' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const categories = await ProductosService.updateCategoria(body.oldCategoria, body.categoria);
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar categoría' }, { status: 500 });
  }
}
