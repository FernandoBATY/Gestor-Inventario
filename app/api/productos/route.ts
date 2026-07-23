import { NextResponse } from 'next/server';
import { ProductosService } from '@/services/productos.service';
import { requireAuth } from '@/lib/auth';

// GET /api/productos -> Service Delegation
export async function GET() {
  try {
    const data = await ProductosService.getAll();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=30, s-maxage=60' },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar productos' }, { status: 500 });
  }
}

// POST /api/productos -> Service Delegation
export async function POST(request: Request) {
  const authErr = await requireAuth();
  if (authErr) return authErr;

  try {
    const contentType = request.headers.get('content-type') || '';
    let bodyData: any = {};
    let imageFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      bodyData = {
        nombre: formData.get('nombre'),
        marca: formData.get('marca'),
        categoria: formData.get('categoria'),
        precio_compra: Number(formData.get('precio_compra')),
        precio_venta: Number(formData.get('precio_venta')),
        unidades: Number(formData.get('unidades')),
        sku: formData.get('sku'),
        presentacion: formData.get('presentacion'),
        stock_minimo: Number(formData.get('stock_minimo')),
        fotografia: formData.get('fotografia') || '',
      };
      const file = formData.get('fotografia_file');
      if (file && file instanceof File) {
        imageFile = file;
      }
    } else {
      bodyData = await request.json();
    }

    const created = await ProductosService.create(bodyData, imageFile);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear el producto' }, { status: 500 });
  }
}

// PUT /api/productos -> Service Delegation
export async function PUT(request: Request) {
  const authErr = await requireAuth();
  if (authErr) return authErr;

  try {
    const contentType = request.headers.get('content-type') || '';
    let bodyData: any = {};
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      bodyData = {
        id: formData.get('id'),
        nombre: formData.get('nombre'),
        marca: formData.get('marca'),
        categoria: formData.get('categoria'),
        precio_compra: Number(formData.get('precio_compra')),
        precio_venta: Number(formData.get('precio_venta')),
        unidades: Number(formData.get('unidades')),
        sku: formData.get('sku'),
        presentacion: formData.get('presentacion'),
        stock_minimo: Number(formData.get('stock_minimo')),
        fotografia: formData.get('fotografia') || '',
      };
    } else {
      bodyData = await request.json();
    }

    const { id, ...updateFields } = bodyData;
    if (!id) {
      return NextResponse.json({ error: 'ID de producto requerido' }, { status: 400 });
    }

    const updated = await ProductosService.update(id, updateFields);
    return NextResponse.json(updated || { error: 'Producto no encontrado' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 });
  }
}

// DELETE /api/productos -> Service Delegation
export async function DELETE(request: Request) {
  const authErr = await requireAuth();
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    await ProductosService.delete(id);
    return NextResponse.json({ success: true, message: 'Producto eliminado' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 });
  }
}
