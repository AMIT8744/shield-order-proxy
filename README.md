# Shield Healthcare — Thank You Page Setup

## Files in this folder:
- `api/order.js` → Vercel serverless function (fetches order from Shopify)
- `vercel.json` → Vercel config
- `package.json` → Node config
- `thank-you.liquid` → Shopify page template

---

## STEP 1 — Shopify Admin API Token banao

1. Shopify Admin → Settings → Apps and sales channels
2. "Develop apps" → Create an app → naam: "Thank You Order API"
3. Configuration tab → Admin API integration → Edit
4. Enable karo: `read_orders`, `read_customers`, `read_products`
5. Save → Install app
6. API credentials tab → Admin API access token → Copy karo (`shpat_xxx`)

---

## STEP 2 — Vercel pe deploy karo

### Option A — GitHub se (recommended)
1. GitHub pe naya repo banao: `shield-order-proxy`
2. Yeh 3 files upload karo:
   - `api/order.js`
   - `vercel.json`
   - `package.json`
3. vercel.com → Login with GitHub → Add New Project → us repo ko import karo
4. Deploy karo

### Option B — Vercel CLI se
```bash
npm i -g vercel
cd shield-proxy
vercel --prod
```

---

## STEP 3 — Environment Variables set karo (IMPORTANT)

Vercel Dashboard → tumhara project → Settings → Environment Variables

Add karo:
| Key | Value |
|-----|-------|
| `SHOPIFY_SHOP_DOMAIN` | `shieldshop.myshopify.com` |
| `SHOPIFY_ADMIN_TOKEN` | `shpat_xxxxx` (Step 1 se) |

Save karo → Redeploy karo (Settings → Deployments → Redeploy)

---

## STEP 4 — Vercel URL thank-you.liquid mein update karo

thank-you.liquid file mein yeh line dhundho:
```javascript
var PROXY_URL = 'https://YOUR-PROJECT.vercel.app/api/order';
```

Replace karo apne actual Vercel URL se:
```javascript
var PROXY_URL = 'https://shield-order-proxy.vercel.app/api/order';
```

---

## STEP 5 — Shopify mein page template add karo

1. Shopify Admin → Online Store → Themes → Edit code
2. Templates folder → Add new template → Page → naam: `thank-you`
3. `thank-you.liquid` ka content paste karo → Save

---

## STEP 6 — Page create karo

1. Shopify Admin → Online Store → Pages → Add page
2. Title: "Thank You"
3. Template: `page.thank-you` select karo
4. Handle: `thank-you` (URL: `/pages/thank-you`)
5. Save

---

## STEP 7 — Test karo

Browser mein kholo:
```
https://shieldshop.in/pages/thank-you?order_id=6775326179370&order_number=1785
```

Order details dikhne chahiye!

---

## Troubleshooting

**"Order details not found" aa raha hai:**
- Vercel function logs check karo (Vercel Dashboard → Functions → Logs)
- Environment variables sahi set hain?
- Admin API token mein `read_orders` scope hai?

**CORS error aa raha hai:**
- `vercel.json` mein domain sahi hai?
- Vercel pe redeploy kiya?
