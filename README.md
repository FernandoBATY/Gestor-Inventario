# Gestor de Papeleria - Sistema de Administracion e Inventario

Sistema web completo para la administracion de una papeleria, desarrollado con Next.js 15 (App Router), React 19, Node.js y Supabase (PostgreSQL, Auth y Storage).

## Requisitos Previos

- Node.js version 18.17.0 o superior
- Administrador de paquetes npm
- Cuenta en Supabase para base de datos y almacenamiento (opcional en modo de prueba)

## Estructura del Proyecto

```text
gestor-papeleria/
├── app/                  # Rutas del frontend y endpoints de la API
│   ├── (public)/         # Catalogo publico para clientes (/)
│   ├── admin/            # Panel de administracion (/admin/*)
│   └── api/              # Rutas API de Next.js
├── components/           # Componentes UI reutilizables
├── lib/                  # Clientes de Supabase, tipos TypeScript y Mock Store
├── services/             # Lógica de negocio del backend
└── supabase/             # Script SQL de base de datos y politicas RLS
```

## Variables de Entorno

Crea un archivo llamado `.env.local` en la raiz del proyecto con el siguiente contenido:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
DATABASE_URL=postgresql://postgres:password@db.tu-proyecto.supabase.co:5432/postgres
```

Nota: Si no se configuran las llaves de Supabase de inmediato, el sistema utilizara automaticamente un motor de datos de prueba en memoria para permitir la evaluacion local sin errores.

## Instalacion y Ejecucion Local

1. Clonar o navegar al directorio del proyecto:
   ```bash
   cd Gestor-Inventario
   ```

2. Instalar las dependencias del proyecto:
   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo local:
   ```bash
   npm run dev
   ```

4. Abrir en el navegador:
   - Sitio Publico (Clientes): http://localhost:3000
   - Panel Administrativo: http://localhost:3000/admin/dashboard
   - Login Administrativo: http://localhost:3000/admin/login

## Configuracion de la Base de Datos en Supabase

1. Accede a tu consola de Supabase en https://app.supabase.com
2. Ve a la seccion SQL Editor.
3. Copia el contenido del archivo `supabase/schema.sql` ubicado en la raiz de este proyecto.
4. Ejecuta el script. Esto creara las tablas (`productos`, `ventas`, `detalle_ventas`, `movimientos_stock`, `historial_precios`), los indices, las funciones trigger para `updated_at`, el bucket de almacenamiento `productos` y las politicas RLS de seguridad.

## Funcionalidades Principales

- Catalogo publico de consulta sin requerir inicio de sesion.
- Dashboard con metricas KPI de ventas del dia, mes, total y alerta de bajo stock.
- CRUD completo de productos con carga de imagenes.
- Registro de movimientos de inventario (Entrada, Salida y Ajuste).
- Punto de venta (POS) rapido con descuento automatico de existencias.
- Impresion de ticket termico en formato de 80 mm.
- Reportes filtrables y exportacion a formato CSV.
- Descarga de respaldo en formato JSON, restauracion y limpieza de datos.

## Despliegue en Vercel

El proyecto esta preparado para desplegarse directamente en Vercel:

1. Subir el repositorio a GitHub.
2. Importar el proyecto en Vercel.
3. Configurar las Variables de Entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
4. Hacer clic en Deploy.
