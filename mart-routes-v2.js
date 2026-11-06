export function registerMartRoutes(app, pool, auth) {
  if (!pool) {
    console.warn('[MART] DATABASE_URL not configured; MART APIs disabled.');
    return;
  }

  const statuses = ['pending','confirmed','packed','shipped','delivered','cancelled'];

  // Limit public MART orders: 20 attempts per IP per 15 minutes.
  const orderRateBuckets = new Map();
  const ORDER_RATE_WINDOW_MS = 15 * 60 * 1000;
  const ORDER_RATE_MAX = 20;

  function martOrderRateLimit(req, res, next) {
    const ip = req.get('cf-connecting-ip') || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    let bucket = orderRateBuckets.get(ip);

    if (!bucket || now - bucket.start >= ORDER_RATE_WINDOW_MS) {
      bucket = { start: now, count: 0 };
    }

    if (bucket.count >= ORDER_RATE_MAX) {
      const retryAfter = Math.max(1, Math.ceil(
        (bucket.start + ORDER_RATE_WINDOW_MS - now) / 1000
      ));
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({
        error: 'அதிகமான Order முயற்சிகள். 15 நிமிடங்கள் கழித்து மீண்டும் முயற்சிக்கவும்.'
      });
    }

    bucket.count++;
    orderRateBuckets.set(ip, bucket);

    if (orderRateBuckets.size > 5000) {
      for (const [key, value] of orderRateBuckets) {
        if (now - value.start >= ORDER_RATE_WINDOW_MS) orderRateBuckets.delete(key);
      }
    }
    next();
  }

  app.get('/api/mart/products', async (req,res) => {
    try {
      const r = await pool.query(`
        SELECT id,name,description,category,price,stock,image_url
        FROM public.mart_products
        WHERE is_active=TRUE AND stock>0
        ORDER BY created_at DESC
      `);
      res.set('Cache-Control','no-store');
      res.json({products:r.rows});
    } catch(e) {
      console.error('[MART products]',e.message);
      res.status(500).json({error:'பொருட்களை ஏற்ற முடியவில்லை.'});
    }
  });

  app.post('/api/mart/orders', martOrderRateLimit, async (req,res) => {
    const b=req.body||{};
    const name=String(b.customer_name||'').trim();
    const phone=String(b.customer_phone||'').trim();
    const address=String(b.address||'').trim();
    const items=Array.isArray(b.items)?b.items:[];

    if(name.length<2||name.length>100||
       !/^[+\d()\s-]{7,20}$/.test(phone)||
       address.length<8||address.length>500||
       !items.length||items.length>30) {
      return res.status(400).json({
        error:'பெயர், சரியான மொபைல் எண், முழு முகவரி மற்றும் பொருட்களைச் சரிபார்க்கவும்.'
      });
    }

    let client;
    try {
      client=await pool.connect();
      await client.query('BEGIN');

      const quantities=new Map();

      for(const item of items) {
        const id=Number(item.product_id);
        const qty=Number(item.quantity);

        if(!Number.isSafeInteger(id)||id<1||
           !Number.isSafeInteger(qty)||qty<1||qty>50) {
          throw new Error('Invalid product or quantity.');
        }

        quantities.set(id,(quantities.get(id)||0)+qty);
      }

      for(const qty of quantities.values()) {
        if(qty>250) throw new Error('ஒரு பொருளின் அதிகபட்ச அளவு 250 மட்டுமே.');
      }

      const lines=[];
      let totalCents=0;

      // Lock product rows in sorted ID order to reduce deadlocks.
      for(const id of [...quantities.keys()].sort((a,b)=>a-b)) {
        const qty=quantities.get(id);
        const pr=await client.query(`
          SELECT id,name,price,cost_price,stock,is_active
          FROM public.mart_products
          WHERE id=$1
          FOR UPDATE
        `,[id]);

        if(!pr.rowCount||!pr.rows[0].is_active||
           Number(pr.rows[0].stock)<qty) {
          throw new Error('ஒரு பொருளின் Stock போதவில்லை. Cart புதுப்பித்து மீண்டும் முயற்சிக்கவும்.');
        }

        const p=pr.rows[0];
        const price=Number(p.price);
        const cost=Number(p.cost_price||0);
        const lineCents=Math.round(price*qty*100);

        totalCents+=lineCents;
        lines.push({p,qty,price,cost,lineCents});
      }

      const total=totalCents/100;

      const order=await client.query(`
        INSERT INTO public.mart_orders
          (customer_name,customer_phone,address,city,pincode,note,total_amount,status)
        VALUES($1,$2,$3,$4,$5,$6,$7,'pending')
        RETURNING id,total_amount,status,created_at
      `,[
        name,phone,address,
        String(b.city||'').slice(0,100),
        String(b.pincode||'').slice(0,12),
        String(b.note||'').slice(0,500),
        total
      ]);

      for(const x of lines) {
        await client.query(`
          INSERT INTO public.mart_order_items
            (order_id,product_id,product_name,quantity,unit_price,unit_cost,line_total)
          VALUES($1,$2,$3,$4,$5,$6,$7)
        `,[
          order.rows[0].id,x.p.id,x.p.name,
          x.qty,x.price,x.cost,x.lineCents/100
        ]);

        await client.query(`
          UPDATE public.mart_products
          SET stock=stock-$1,updated_at=NOW()
          WHERE id=$2
        `,[x.qty,x.p.id]);
      }

      await client.query('COMMIT');
      res.status(201).json({order:order.rows[0]});

    } catch(e) {
      if(client) {
        try { await client.query('ROLLBACK'); } catch {}
      }
      console.error('[MART create order]',e.message);
      res.status(400).json({error:e.message||'Order பதிவு செய்ய முடியவில்லை.'});
    } finally {
      client?.release();
    }
  });

  app.get('/api/mart/admin/orders',auth.requireAdmin,async(req,res)=>{
    try {
      const r=await pool.query(`
        SELECT
          o.id,o.customer_name,o.customer_phone,o.address,o.city,o.pincode,
          o.total_amount,o.delivery_cost,o.other_cost,o.status,o.created_at,
          COALESCE(SUM(i.unit_cost*i.quantity),0) AS product_cost,
          COUNT(i.id)::int AS item_lines,
          COALESCE(string_agg(
            i.product_name||' × '||i.quantity,', ' ORDER BY i.id
          ),'') AS items_text
        FROM public.mart_orders o
        LEFT JOIN public.mart_order_items i ON i.order_id=o.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT 300
      `);

      res.set('Cache-Control','no-store');
      res.json({orders:r.rows});
    } catch(e) {
      console.error('[MART admin orders]',e.message);
      res.status(500).json({error:'Orders ஏற்ற முடியவில்லை.'});
    }
  });

  app.patch('/api/mart/admin/orders/:id',auth.requireAdmin,async(req,res)=>{
    const id=Number(req.params.id);
    const status=String(req.body?.status||'');
    const b=req.body||{};

    if(!Number.isSafeInteger(id)||id<1||!statuses.includes(status)) {
      return res.status(400).json({error:'Invalid order or status.'});
    }

    const hasDelivery=b.delivery_cost!==undefined;
    const hasOther=b.other_cost!==undefined;
    const delivery=Number(b.delivery_cost);
    const other=Number(b.other_cost);

    if(hasDelivery&&(!Number.isFinite(delivery)||delivery<0||delivery>10000000))
      return res.status(400).json({error:'Invalid delivery cost.'});

    if(hasOther&&(!Number.isFinite(other)||other<0||other>10000000))
      return res.status(400).json({error:'Invalid other cost.'});

    let client;
    try {
      client=await pool.connect();
      await client.query('BEGIN');

      const locked=await client.query(
        'SELECT id,status FROM public.mart_orders WHERE id=$1 FOR UPDATE',
        [id]
      );

      if(!locked.rowCount) {
        await client.query('ROLLBACK');
        return res.status(404).json({error:'Order கிடைக்கவில்லை.'});
      }

      const previous=locked.rows[0].status;

      // Shipped and delivered orders require a separate return workflow.
      if(['shipped','delivered'].includes(previous) && status==='cancelled') {
        await client.query('ROLLBACK');
        return res.status(409).json({
          error:'Shipped / Delivered Order-ஐ நேரடியாக Cancel செய்ய முடியாது. Return workflow தேவை.'
        });
      }

      if(previous!==status) {
        const lines=await client.query(`
          SELECT product_id,quantity
          FROM public.mart_order_items
          WHERE order_id=$1 AND product_id IS NOT NULL
          ORDER BY product_id
        `,[id]);

        // Restore stock exactly once when cancelling.
        if(status==='cancelled'&&previous!=='cancelled') {
          for(const line of lines.rows) {
            await client.query(`
              UPDATE public.mart_products
              SET stock=stock+$1,updated_at=NOW()
              WHERE id=$2
            `,[line.quantity,line.product_id]);
          }
        }

        // Re-deduct stock when reopening a cancelled order.
        if(previous==='cancelled'&&status!=='cancelled') {
          for(const line of lines.rows) {
            const update=await client.query(`
              UPDATE public.mart_products
              SET stock=stock-$1,updated_at=NOW()
              WHERE id=$2 AND is_active=TRUE AND stock >= $1
              RETURNING id
            `,[line.quantity,line.product_id]);

            if(!update.rowCount) {
              throw new Error('Stock போதவில்லை. இந்த Order-ஐ மீண்டும் செயல்படுத்த முடியாது.');
            }
          }
        }
      }

      const updated=await client.query(`
        UPDATE public.mart_orders
        SET status=$1,
            delivery_cost=CASE WHEN $2 THEN $3 ELSE delivery_cost END,
            other_cost=CASE WHEN $4 THEN $5 ELSE other_cost END,
            updated_at=NOW()
        WHERE id=$6
        RETURNING id,status,delivery_cost,other_cost
      `,[status,hasDelivery,delivery,hasOther,other,id]);

      await client.query('COMMIT');
      res.json({order:updated.rows[0]});

    } catch(e) {
      if(client) {
        try { await client.query('ROLLBACK'); } catch {}
      }
      console.error('[MART status]',e.message);
      res.status(400).json({error:e.message||'Status மாற்ற முடியவில்லை.'});
    } finally {
      client?.release();
    }
  });

  app.get('/api/mart/admin/profit',auth.requireAdmin,async(req,res)=>{
    try {
      const r=await pool.query(`
        SELECT
          COUNT(*)::int AS delivered_orders,
          COALESCE(SUM(o.total_amount),0) AS sales,
          COALESCE(SUM(c.product_cost),0) AS product_cost,
          COALESCE(SUM(o.delivery_cost),0) AS delivery_cost,
          COALESCE(SUM(o.other_cost),0) AS other_cost,
          COALESCE(
            SUM(o.total_amount-COALESCE(c.product_cost,0)-o.delivery_cost-o.other_cost),0
          ) AS net_profit
        FROM public.mart_orders o
        LEFT JOIN (
          SELECT order_id,SUM(unit_cost*quantity) AS product_cost
          FROM public.mart_order_items
          GROUP BY order_id
        ) c ON c.order_id=o.id
        WHERE o.status='delivered'
      `);

      res.set('Cache-Control','no-store');
      res.json({report:r.rows[0]});
    } catch(e) {
      console.error('[MART profit]',e.message);
      res.status(500).json({error:'Profit Report ஏற்ற முடியவில்லை.'});
    }
  });

  app.get('/api/mart/admin/products',auth.requireAdmin,async(req,res)=>{
    try {
      const r=await pool.query(
        'SELECT * FROM public.mart_products ORDER BY created_at DESC'
      );
      res.json({products:r.rows});
    } catch(e) {
      res.status(500).json({error:'Products ஏற்ற முடியவில்லை.'});
    }
  });

  app.post('/api/mart/admin/products',auth.requireAdmin,async(req,res)=>{
    const b=req.body||{};
    const name=String(b.name||'').trim();
    const price=Number(b.price);
    const cost=Number(b.cost_price);
    const stock=Number(b.stock);

    if(name.length<2||name.length>140||
       !Number.isFinite(price)||price<=0||price>10000000||
       !Number.isFinite(cost)||cost<0||cost>10000000||
       !Number.isSafeInteger(stock)||stock<0||stock>1000000) {
      return res.status(400).json({error:'பெயர், வாங்கிய விலை, விற்பனை விலை மற்றும் Stock சரிபார்க்கவும்.'});
    }

    try {
      const r=await pool.query(`
        INSERT INTO public.mart_products
          (name,description,category,sku,price,cost_price,stock,image_url,is_active)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,TRUE)
        RETURNING *
      `,[
        name,String(b.description||'').slice(0,1000),
        String(b.category||'General').slice(0,80),
        String(b.sku||'').slice(0,80),
        price,cost,stock,String(b.image_url||'').slice(0,1000)
      ]);

      res.status(201).json({product:r.rows[0]});
    } catch(e) {
      console.error('[MART create product]',e.message);
      res.status(500).json({error:'பொருளைச் சேர்க்க முடியவில்லை.'});
    }
  });

  app.patch('/api/mart/admin/products/:id',auth.requireAdmin,async(req,res)=>{
    const id=Number(req.params.id);
    const b=req.body||{};

    if(!Number.isSafeInteger(id)||id<1)
      return res.status(400).json({error:'Invalid product ID.'});

    if(b.stock!==undefined&&
       (!Number.isSafeInteger(Number(b.stock))||Number(b.stock)<0||Number(b.stock)>1000000))
      return res.status(400).json({error:'Invalid stock.'});

    if(b.cost_price!==undefined&&
       (!Number.isFinite(Number(b.cost_price))||Number(b.cost_price)<0||Number(b.cost_price)>10000000))
      return res.status(400).json({error:'Invalid purchase price.'});

    if(b.is_active!==undefined&&typeof b.is_active!=='boolean')
      return res.status(400).json({error:'Invalid active status.'});

    try {
      const r=await pool.query(`
        UPDATE public.mart_products
        SET stock=COALESCE($1,stock),
            cost_price=COALESCE($2,cost_price),
            is_active=COALESCE($3,is_active),
            updated_at=NOW()
        WHERE id=$4
        RETURNING *
      `,[
        b.stock===undefined?null:Number(b.stock),
        b.cost_price===undefined?null:Number(b.cost_price),
        b.is_active===undefined?null:b.is_active,
        id
      ]);

      if(!r.rowCount)
        return res.status(404).json({error:'Product கிடைக்கவில்லை.'});

      res.json({product:r.rows[0]});
    } catch(e) {
      console.error('[MART update product]',e.message);
      res.status(500).json({error:'பொருளை மாற்ற முடியவில்லை.'});
    }
  });
}
