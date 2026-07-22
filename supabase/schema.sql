-- ================================================================
-- GESTOR DE PAPELERIA - SUPABASE POSTGRESQL SCHEMA (LIMPIO SIN DEMO DATA)
-- ================================================================

-- 1. EXTENSIONS & FUNCTIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to handle updated_at timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. TABLA PRODUCTOS
CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    marca VARCHAR(100),
    categoria VARCHAR(100) NOT NULL,
    precio_compra DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    precio_venta DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    unidades INT NOT NULL DEFAULT 0,
    sku VARCHAR(50) UNIQUE NOT NULL,
    presentacion VARCHAR(100),
    fotografia TEXT,
    stock_minimo INT NOT NULL DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_productos_precios_no_negativos'
    ) THEN
        ALTER TABLE productos
            ADD CONSTRAINT chk_productos_precios_no_negativos CHECK (precio_compra >= 0 AND precio_venta >= 0);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_productos_stock_no_negativo'
    ) THEN
        ALTER TABLE productos
            ADD CONSTRAINT chk_productos_stock_no_negativo CHECK (unidades >= 0 AND stock_minimo >= 0);
    END IF;
END $$;

-- Trigger updated_at para productos
DROP TRIGGER IF EXISTS set_updated_at_productos ON productos;
CREATE TRIGGER set_updated_at_productos
BEFORE UPDATE ON productos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_sku ON productos(sku);
CREATE INDEX IF NOT EXISTS idx_productos_stock ON productos(unidades, stock_minimo);

-- 2b. TABLA CATEGORIAS
CREATE TABLE IF NOT EXISTS categorias (
    nombre VARCHAR(100) PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_updated_at_categorias ON categorias;
CREATE TRIGGER set_updated_at_categorias
BEFORE UPDATE ON categorias
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir todo a categorias" ON categorias;
CREATE POLICY "Permitir todo a categorias" ON categorias FOR ALL USING (true);

-- 3. TABLA HISTORIAL PRECIOS
CREATE TABLE IF NOT EXISTS historial_precios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    precio_compra_anterior DECIMAL(10, 2),
    precio_compra_nuevo DECIMAL(10, 2),
    precio_venta_anterior DECIMAL(10, 2),
    precio_venta_nuevo DECIMAL(10, 2),
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historial_precios_producto ON historial_precios(producto_id);

-- 3b. TABLA CONFIGURACION NEGOCIO
CREATE TABLE IF NOT EXISTS negocio_config (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    nombre_negocio VARCHAR(255) NOT NULL,
    rfc VARCHAR(50),
    telefono VARCHAR(50),
    direccion TEXT,
    leyenda_ticket TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_updated_at_negocio_config ON negocio_config;
CREATE TRIGGER set_updated_at_negocio_config
BEFORE UPDATE ON negocio_config
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE negocio_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir todo a negocio_config" ON negocio_config;
CREATE POLICY "Permitir todo a negocio_config" ON negocio_config FOR ALL USING (true);

-- 4. TABLA MOVIMIENTOS STOCK
CREATE TABLE IF NOT EXISTS movimientos_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Entrada', 'Salida', 'Ajuste')),
    cantidad INT NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movimientos_producto ON movimientos_stock(producto_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos_stock(fecha);

-- 5. TABLA VENTAS
CREATE TABLE IF NOT EXISTS ventas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    folio VARCHAR(50) UNIQUE NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha);

-- 6. TABLA DETALLE VENTAS
CREATE TABLE IF NOT EXISTS detalle_ventas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
    nombre_producto VARCHAR(255) NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_detalle_ventas_venta ON detalle_ventas(venta_id);

-- 7. SUPABASE STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public) 
VALUES ('productos', 'productos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Public Read
DROP POLICY IF EXISTS "Public Read Productos Storage" ON storage.objects;
CREATE POLICY "Public Read Productos Storage" ON storage.objects 
FOR SELECT USING (bucket_id = 'productos');

-- Storage Policy: Public/Auth Upload
DROP POLICY IF EXISTS "Auth Manage Productos Storage" ON storage.objects;
CREATE POLICY "Auth Manage Productos Storage" ON storage.objects 
FOR ALL USING (bucket_id = 'productos');

-- 8. ROW LEVEL SECURITY (RLS)
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_precios ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_ventas ENABLE ROW LEVEL SECURITY;

-- Politicas Permisivas de Acceso (Lectura y Escritura)
DROP POLICY IF EXISTS "Permitir lectura publica de productos" ON productos;
CREATE POLICY "Permitir lectura publica de productos" ON productos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir todo a productos" ON productos;
CREATE POLICY "Permitir todo a productos" ON productos FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir todo a historial_precios" ON historial_precios;
CREATE POLICY "Permitir todo a historial_precios" ON historial_precios FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir todo a movimientos_stock" ON movimientos_stock;
CREATE POLICY "Permitir todo a movimientos_stock" ON movimientos_stock FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir todo a ventas" ON ventas;
CREATE POLICY "Permitir todo a ventas" ON ventas FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir todo a detalle_ventas" ON detalle_ventas;
CREATE POLICY "Permitir todo a detalle_ventas" ON detalle_ventas FOR ALL USING (true);
