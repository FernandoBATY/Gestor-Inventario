import { Producto, MovimientoStock, Venta, DashboardStats } from '@/lib/types';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { mockStore } from '@/lib/mockStore';

export class ProductosService {
  static async getAll(): Promise<Producto[]> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('nombre', { ascending: true });
      if (!error && data) return data;
    }
    return mockStore.getProducts();
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

    let products = mockStore.getProducts();
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
    return mockStore.getProducts().filter(p => p.unidades <= p.stock_minimo);
  }

  static async getCategorias(): Promise<string[]> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase.from('productos').select('categoria');
      if (!error && data) {
        return Array.from(new Set(data.map((item: any) => item.categoria))).filter(Boolean);
      }
    }
    return Array.from(new Set(mockStore.getProducts().map(p => p.categoria)));
  }

  static async create(productData: any, imageFile?: File | null): Promise<Producto> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      let imageUrl = productData.fotografia || '';
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('productos')
          .upload(fileName, imageFile);

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage.from('productos').getPublicUrl(fileName);
          imageUrl = publicUrlData.publicUrl;
        }
      }

      const { data, error } = await supabase
        .from('productos')
        .insert([{ ...productData, fotografia: imageUrl }])
        .select()
        .single();
      if (!error && data) return data;
    }
    return mockStore.createProduct(productData);
  }

  static async update(id: string, updateFields: any): Promise<Producto | null> {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('productos')
        .update(updateFields)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data;
    }
    return mockStore.updateProduct(id, updateFields);
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
