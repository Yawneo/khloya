# MOCKS.md — контракт данных (по нему пишется бэкенд этапа 2)

Слой данных — `js/api.js`: `const MOCK = true` читает встроенные данные
(работает и по `file://`); на этапе 2 меняется одна константа на `false` и
`api(path, options)` ходит на реальный бэкенд. Дубликат данных лежит в
`mock/*.json` для справки бэкендера.

| Мок | Будущий запрос | Поля |
| --- | --- | --- |
| `mock/catalog.json` | `GET /api/catalog` | `categories[]` (id, slug, name, description, image_url, image_alt, position, seo_h1/title/description/text) · `products[]` (id, slug, title, category, price, price_prefix, description, image_url, image_thumb_url, image_alt, is_new, badge, flower_types[], size, featured, showcase, hidden, no_delivery, pickup_branches[], discount_enabled/type/value, sale_price, discount_active, discount_label) |
| `mock/delivery.json` | `GET /api/delivery` | `zones[]` {id,name,price}, `surprise_zones[]`, `free_from`, `pickup[]` {id,name,short,address,details,hours,phone}, `payment_mode`, `slots[]` {start,minutes,label}, `pickup_slots[]`, `booking_days:60`, `lead_minutes:60`, `timezone:"Asia/Yekaterinburg"` |
| `mock/branches.json` | `GET /api/branches` | `branches[]` {id,name,address,details,hours,phone,lat,lng} |
| `mock/site.json` | `GET /api/site` | `hero_slides[]` {image_url, mobile_image_url, alt}, `offers_image_url` |
| `mock/orders.json` | `GET /api/admin/orders` | заказы со статусами pending/succeeded/canceled/mismatch, способами delivery/surprise/pickup |
| — | `POST /api/orders` | name, phone, email, address, delivery_method, delivery_zone, pickup_branch, delivery_date, delivery_slot, recipient_phone, comment, items[] {product_id, quantity}, data_consent, offer_accepted, consent_version, privacy_version, offer_version → 201 `{success, order_id}` |

## Структура фронта

```
khloya-shop/
  index.html  shop.html  catalog.html  product.html
  privacy.html  consent.html  offer.html  requisites.html
  css/  styles.css  market.css
  js/   api.js  app.js  home-catalog.js  market.js  admin.js
  mock/ catalog.json  delivery.json  branches.json  site.json  orders.json
  DESIGN.md  MOCKS.md
```

Локальный просмотр: открыть `index.html` (работает по `file://`), либо
`python -m http.server` из папки.

## Пока нет (этапы 2–3)

Бэкенд Go (сумму считает сервер), оплата ЮKassa, уведомления Telegram,
HEIC/WebP-загрузка фото, реальные реквизиты и тексты документов.
