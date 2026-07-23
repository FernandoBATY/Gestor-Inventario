import { Producto, MovimientoStock, Venta, DashboardStats } from '@/lib/types';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { mockStore } from '@/lib/mockStore';

export class ProductosService {
  private static normalizeNumber(value: any, allowDecimals = true) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) return 0;
    return allowDecimals ? numeric : Math.trunc(numeric);
  }

  private static normalizeText(value: any) {
    return String(value ?? '').trim();
  }

  private static normalizeProductPayload(productData: any) {
    const payload: any = { ...productData };

    if ('nombre' in payload) payload.nombre = this.normalizeText(payload.nombre);
    if ('marca' in payload) payload.marca = this.normalizeText(payload.marca);
    if ('categoria' in payload) payload.categoria = this.normalizeText(payload.categoria);
    if ('sku' in payload) payload.sku = this.normalizeText(payload.sku);
    if ('presentacion' in payload) payload.presentacion = this.normalizeText(payload.presentacion);
    if ('fotografia' in payload) payload.fotografia = this.normalizeText(payload.fotografia);
    if ('precio_compra' in payload) payload.precio_compra = this.normalizeNumber(payload.precio_compra);
    if ('precio_venta' in payload) payload.precio_venta = this.normalizeNumber(payload.precio_venta);
    if ('unidades' in payload) payload.unidades = this.normalizeNumber(payload.unidades, false);
    if ('stock_minimo' in payload) payload.stock_minimo = this.normalizeNumber(payload.stock_minimo, false);

    return payload;
  }

  private static async syncCategory(categoria: string) {
    const cleanCategory = this.normalizeText(categoria);
    if (!cleanCategory) return;

    const supabase = getSupabaseServerClient();
    if (!supabase) return;

    await supabase.from('categorias').upsert([{ nombre: cleanCategory }], { onConflict: 'nombre' });
  }

  static async getAll(): Promise<Producto[]> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('nombre', { ascending: true });
      if (!error && data) return data;
    }
    return mockStore.getProducts() as Producto[];
  }

  static async getPaginated(page: number, size: number, search: string, categoria: string) {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      let query = supabase.from('productos').select('*', { count: 'exact' });
      if (search) query = query.or(`nombre.ilike.%${search}%,marca.ilike.%${search}%,sku.ilike.%${search}%`);
      if (categoria && categoria !== 'Todas') query = query.eq('categoria', categoria);

      const from = page * size;
      const to = from + size - 1;
      const { data, count, error } = await query.range(from, to).order('nombre', { ascending: true });

      if (!error && data) {
        return {
          content: data,
          totalElements: count || 0,
          totalPages: Math.ceil((count || 0) / size),
          page,
          size,
        };
      }
    }

    let products = mockStore.getProducts() as Producto[];
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(
        p => p.nombre.toLowerCase().includes(q) || p.marca.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      );
    }
    if (categoria && categoria !== 'Todas') {
      products = products.filter(p => p.categoria === categoria);
    }

    const totalElements = products.length;
    const start = page * size;
    return {
      content: products.slice(start, start + size),
      totalElements,
      totalPages: Math.ceil(totalElements / size),
      page,
      size,
    };
  }

  static async getLowStock(): Promise<Producto[]> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase.from('productos').select('*').order('unidades', { ascending: true });
      if (!error && data) return data.filter((p: any) => p.unidades <= p.stock_minimo);
    }
    return (mockStore.getProducts() as Producto[]).filter(p => p.unidades <= p.stock_minimo);
  }

  static async getCategorias(): Promise<string[]> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase.from('categorias').select('nombre').order('nombre', { ascending: true });
      if (!error && data) {
        return data.map((item: any) => item.nombre).filter(Boolean);
      }
    }
    return Array.from(new Set((mockStore.getProducts() as Producto[]).map(p => p.categoria)));
  }

  static async createCategoria(nombre: string): Promise<string[]> {
    const categoria = this.normalizeText(nombre);
    if (!categoria) return this.getCategorias();

    const supabase = getSupabaseServerClient();
    if (supabase) {
      await supabase.from('categorias').upsert([{ nombre: categoria }], { onConflict: 'nombre' });
      return this.getCategorias();
    }

    return Array.from(new Set([...(mockStore.getProducts() as Producto[]).map(p => p.categoria), categoria]));
  }

  static async updateCategoria(oldCategoria: string, nuevaCategoria: string): Promise<string[]> {
    const from = this.normalizeText(oldCategoria);
    const to = this.normalizeText(nuevaCategoria);
    if (!from || !to) return this.getCategorias();

    const supabase = getSupabaseServerClient();
    if (supabase) {
      await supabase.from('productos').update({ categoria: to }).eq('categoria', from);
      await supabase.from('categorias').delete().eq('nombre', from);
      await supabase.from('categorias').upsert([{ nombre: to }], { onConflict: 'nombre' });
      return this.getCategorias();
    }

    return Array.from(new Set((mockStore.getProducts() as Producto[]).map(p => p.categoria === from ? to : p.categoria)));
  }

  static async create(productData: any, imageFile?: File | null): Promise<Producto> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const normalized = this.normalizeProductPayload(productData);
      let imageUrl = normalized.fotografia || '';

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('productos')
          .upload(fileName, imageFile, {
            contentType: imageFile.type,
            upsert: false,
          });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage.from('productos').getPublicUrl(fileName);
          imageUrl = publicUrlData.publicUrl;
        }
      }

      await this.syncCategory(normalized.categoria);

      const { data, error } = await supabase
        .from('productos')
        .insert([{ ...normalized, fotografia: imageUrl }])
        .select()
        .single();
      if (!error && data) return data;
    }
    return mockStore.createProduct(this.normalizeProductPayload(productData));
  }

  static async update(id: string, updateFields: any): Promise<Producto | null> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const normalized = this.normalizeProductPayload(updateFields);
      if (normalized.categoria) {
        await this.syncCategory(normalized.categoria);
      }

      const { data: oldProduct } = await supabase
        .from('productos')
        .select('precio_compra, precio_venta')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('productos')
        .update(normalized)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const oldCompra = Number(oldProduct?.precio_compra) || 0;
        const newCompra = Number(data.precio_compra) || 0;
        const oldVenta = Number(oldProduct?.precio_venta) || 0;
        const newVenta = Number(data.precio_venta) || 0;

        if (oldCompra !== newCompra || oldVenta !== newVenta) {
          await supabase.from('historial_precios').insert([{
            producto_id: id,
            precio_compra_anterior: oldCompra,
            precio_compra_nuevo: newCompra,
            precio_venta_anterior: oldVenta,
            precio_venta_nuevo: newVenta,
          }]);
        }

        return data;
      }
    }
    return mockStore.updateProduct(id, this.normalizeProductPayload(updateFields));
  }

  static async delete(id: string): Promise<boolean> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      await supabase.from('productos').delete().eq('id', id);
      return true;
    }
    mockStore.deleteProduct(id);
    return true;
  }
}
