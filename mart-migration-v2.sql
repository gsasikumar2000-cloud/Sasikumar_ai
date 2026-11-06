BEGIN;

CREATE TABLE IF NOT EXISTS public.mart_products (
 id BIGSERIAL PRIMARY KEY,
 name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 2 AND 140),
 description TEXT NOT NULL DEFAULT '',
 category TEXT NOT NULL DEFAULT 'General',
 sku TEXT NOT NULL DEFAULT '',
 price NUMERIC(12,2) NOT NULL CHECK (price > 0),
 cost_price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
 stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
 image_url TEXT NOT NULL DEFAULT '',
 is_active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mart_products
 ADD COLUMN IF NOT EXISTS cost_price NUMERIC(12,2) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.mart_orders (
 id BIGSERIAL PRIMARY KEY,
 customer_name TEXT NOT NULL,
 customer_phone TEXT NOT NULL,
 address TEXT NOT NULL,
 city TEXT NOT NULL DEFAULT '',
 pincode TEXT NOT NULL DEFAULT '',
 note TEXT NOT NULL DEFAULT '',
 total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
 delivery_cost NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (delivery_cost >= 0),
 other_cost NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (other_cost >= 0),
 status TEXT NOT NULL DEFAULT 'pending'
 CHECK (status IN ('pending','confirmed','packed','shipped','delivered','cancelled')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mart_orders
 ADD COLUMN IF NOT EXISTS delivery_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
 ADD COLUMN IF NOT EXISTS other_cost NUMERIC(12,2) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.mart_order_items (
 id BIGSERIAL PRIMARY KEY,
 order_id BIGINT NOT NULL REFERENCES public.mart_orders(id) ON DELETE CASCADE,
 product_id BIGINT REFERENCES public.mart_products(id) ON DELETE SET NULL,
 product_name TEXT NOT NULL,
 quantity INTEGER NOT NULL CHECK (quantity > 0),
 unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
 unit_cost NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (unit_cost >= 0),
 line_total NUMERIC(12,2) NOT NULL CHECK (line_total >= 0)
);

ALTER TABLE public.mart_order_items
 ADD COLUMN IF NOT EXISTS unit_cost NUMERIC(12,2) NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS mart_products_active_idx
 ON public.mart_products(is_active,created_at DESC);

CREATE INDEX IF NOT EXISTS mart_orders_created_idx
 ON public.mart_orders(created_at DESC);

CREATE INDEX IF NOT EXISTS mart_orders_status_idx
 ON public.mart_orders(status);

CREATE INDEX IF NOT EXISTS mart_order_items_order_idx
 ON public.mart_order_items(order_id);

COMMIT;
