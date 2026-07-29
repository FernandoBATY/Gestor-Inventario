import { z } from 'zod';

export const ventaSchema = z.object({
  detalles: z.array(z.object({
    producto_id: z.string().uuid(),
    cantidad: z.number().int().positive(),
  })).min(1, 'Debe incluir al menos un producto'),
  monto_recibido: z.number().min(0).optional().default(0),
});

export const productoSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(255),
  marca: z.string().max(100).optional().default(''),
  categoria: z.string().min(1, 'Categoría requerida').max(100),
  precio_compra: z.number().min(0),
  precio_venta: z.number().min(0),
  unidades: z.number().int().min(0),
  sku: z.string().min(1).max(50),
  presentacion: z.string().max(100).optional().default(''),
  fotografia: z.string().optional().default(''),
  stock_minimo: z.number().int().min(0).optional().default(5),
});

export const gastoSchema = z.object({
  descripcion: z.string().min(1, 'Descripción requerida').max(255),
  monto: z.number().positive('El monto debe ser mayor a 0'),
  categoria: z.string().max(100).optional().default('General'),
  fecha: z.string().optional(),
});

export const devolucionSchema = z.object({
  venta_id: z.string().uuid('ID de venta inválido'),
});

export const corteAbrirSchema = z.object({
  accion: z.literal('abrir'),
  fondo_inicial: z.number().min(0).optional().default(0),
});

export const corteCerrarSchema = z.object({
  accion: z.literal('cerrar'),
  corte_id: z.string().uuid(),
  monto_cierre: z.number().min(0),
});

export const negocioSchema = z.object({
  nombre_negocio: z.string().min(1).max(255),
  rfc: z.string().max(50).optional().default(''),
  telefono: z.string().max(50).optional().default(''),
  direccion: z.string().optional().default(''),
  leyenda_ticket: z.string().optional().default(''),
});
