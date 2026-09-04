// api/order.js — Vercel Serverless Function
// Fetches order data from Shopify Admin API server-side
// Called by Shopify App Proxy: /apps/order-status?order_id=XXX

export default async function handler(req, res) {

  // ── CORS — allow only your store
  res.setHeader('Access-Control-Allow-Origin', 'https://shieldshop.in');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { order_id } = req.query;

  if (!order_id) {
    return res.status(400).json({ error: 'order_id is required' });
  }

  // ── Config from Vercel Environment Variables
  const SHOP    = process.env.SHOPIFY_SHOP_DOMAIN;   // shieldshop.myshopify.com
  const TOKEN   = process.env.SHOPIFY_ADMIN_TOKEN;   // shpat_xxx (Admin API token)

  if (!SHOP || !TOKEN) {
    return res.status(500).json({ error: 'Server config missing' });
  }

  try {
    const url = `https://${SHOP}/admin/api/2024-01/orders/${order_id}.json?fields=id,order_number,email,currency,subtotal_price,total_price,total_tax,total_discounts,financial_status,shipping_address,billing_address,shipping_lines,line_items,customer,payment_gateway`;

    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 404) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Shopify API error' });
    }

    const data = await response.json();
    const order = data.order;

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // ── Return clean order object
    return res.status(200).json({
      success: true,
      order: {
        orderNumber:     order.order_number,
        email:           order.email,
        currency:        order.currency,
        subtotalPrice:   order.subtotal_price,
        totalPrice:      order.total_price,
        totalTax:        order.total_tax,
        totalDiscounts:  order.total_discounts,
        financialStatus: order.financial_status,
        paymentGateway:  order.payment_gateway,
        customer: order.customer ? {
          firstName: order.customer.first_name,
          lastName:  order.customer.last_name,
        } : null,
        shippingAddress: order.shipping_address || null,
        billingAddress:  order.billing_address  || null,
        shippingLines:   (order.shipping_lines || []).map(s => ({
          title:         s.title,
          price:         s.price,
          originalPrice: s.price
        })),
        lineItems: (order.line_items || []).map(item => ({
          title:       item.title,
          quantity:    item.quantity,
          price:       item.price,
          linePrice:   item.line_price || (parseFloat(item.price) * item.quantity).toFixed(2),
          variantTitle: item.variant_title && item.variant_title !== 'Default Title' ? item.variant_title : null,
          image:       item.properties?.find(p => p.name === '_image')?.value || null,
          productId:   item.product_id,
          variantId:   item.variant_id,
        }))
      }
    });

  } catch (err) {
    console.error('Order fetch error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
