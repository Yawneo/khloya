/* Хлоя · слой данных. MOCK=true читает встроенные данные (работает и по file://).
   На этапе 2 меняется только MOCK на false — запросы пойдут на бэкенд. */
const MOCK = true;

/* Реальные фото студии — из карточки «Хлоя» на Яндекс Картах
   (yandex.ru/maps/org/khloya/34375427491/gallery), вырезаны под слоты сайта. */
const IMG = {
  red:   'assets/photos/shop/p1-krasnye-rozy.jpg',
  pink:  'assets/photos/shop/p2-vau-rozy.jpg',
  mix:   'assets/photos/shop/p12-kompoziciya-vesna.jpg',
  red1:  'assets/photos/shop/p4-25-roz.jpg',
  pink1: 'assets/photos/shop/p5-rozy.jpg',
  white: 'assets/photos/shop/p6-101-belaya-roza.jpg',
};

const MOCK_DB = {
  site: {
    hero_slides: [
      { image_url: 'assets/photos/shop/hero-bouquet-pastel.jpg', mobile_image_url: 'assets/photos/shop/hero-bouquet-pastel.jpg', alt: 'Букет из розовых роз в студии «Хлоя»' },
      { image_url: 'assets/photos/shop/hero-bouquet-peach.jpg',  mobile_image_url: 'assets/photos/shop/hero-bouquet-peach.jpg',  alt: 'Букет из персиковых роз' },
      { image_url: 'assets/photos/shop/hero-studio.jpg',         mobile_image_url: 'assets/photos/shop/hero-studio.jpg',         alt: 'Студия цветов «Хлоя» на Комсомольском проспекте' }
    ],
    offers_image_url: 'assets/photos/shop/offers.jpg'
  },
  catalog: {
    categories: [
      { id:'mono', slug:'monobukety', name:'Монобукеты', description:'Букеты из одного сорта цветов — лаконично и элегантно.', image_url:'assets/photos/shop/collection-monobukety.jpg', image_alt:'Монобукет из красных роз', position:0, seo_h1:'Монобукеты с доставкой по Сургуту', seo_title:'Монобукеты — купить в Сургуте | «Хлоя»', seo_description:'Монобукеты из роз и тюльпанов с доставкой по Сургуту.', seo_text:'Монобукет — букет из одного сорта цветов. Собираем вручную в день заказа.' },
      { id:'buket', slug:'bukety', name:'Букеты', description:'Авторские и составные букеты под любой повод.', image_url:'assets/photos/shop/collection-bukety.jpg', image_alt:'Авторский букет из роз и эустомы', position:1, seo_h1:'Букеты цветов с доставкой по Сургуту', seo_title:'Букеты цветов — купить в Сургуте | «Хлоя»', seo_description:'Авторские букеты из свежих цветов с доставкой по Сургуту в день заказа.', seo_text:'Собираем авторские и составные букеты под день рождения, годовщину или просто так.' },
      { id:'korobka', slug:'shlyapnye-korobki', name:'Шляпные коробки', description:'Композиции в шляпных коробках — цветы, которые не нужно ставить в вазу.', image_url:'assets/photos/shop/collection-shlyapnye-korobki.jpg', image_alt:'Шляпная коробка с белыми хризантемами', position:2, seo_h1:'Шляпные коробки с цветами в Сургуте', seo_title:'Шляпные коробки с цветами — Сургут | «Хлоя»', seo_description:'Композиции в шляпных коробках с доставкой по Сургуту.', seo_text:'Цветы в шляпной коробке — готовый подарок, который не требует вазы.' },
      { id:'korzina', slug:'cvety-v-korzine', name:'Цветы в корзине', description:'Композиции в корзинах — уютный подарок для дома.', image_url:'assets/photos/shop/collection-cvety-v-korzine.jpg', image_alt:'Корзина с белыми розами и эвкалиптом', position:3, seo_h1:'Цветы в корзине с доставкой в Сургуте', seo_title:'Цветы в корзине — купить в Сургуте | «Хлоя»', seo_description:'Композиции в корзинах с доставкой по Сургуту.', seo_text:'Композиции в корзинах — уютно, долго стоят, удобно дарить.' }
    ],
    products: [
      { id:'p1', slug:'krasnye-rozy', title:'Красные розы', category:'mono', price:2708, price_prefix:'', description:'Классический монобукет из свежих красных роз.', image_url:'assets/photos/shop/p1-krasnye-rozy.jpg', image_thumb_url:'assets/photos/shop/p1-krasnye-rozy.jpg', image_alt:'Букет красных роз в бумаге', is_new:false, badge:'', flower_types:['розы'], size:'средний', featured:false, showcase:true, hidden:false, no_delivery:false, pickup_branches:['koms'], discount_enabled:false, sale_price:null, discount_active:false, discount_label:'' },
      { id:'p2', slug:'vau-rozy', title:'Вау розы', category:'mono', price:3444, price_prefix:'', description:'Роскошный монобукет из роз сорта «Вау».', image_url:'assets/photos/shop/p2-vau-rozy.jpg', image_thumb_url:'assets/photos/shop/p2-vau-rozy.jpg', image_alt:'Букет ярко-розовых роз «Вау»', is_new:false, badge:'', flower_types:['розы'], size:'средний', featured:false, showcase:false, hidden:false, no_delivery:false, pickup_branches:['koms'], discount_enabled:false, sale_price:null, discount_active:false, discount_label:'' },
      { id:'p3', slug:'buket-51-roza', title:'Букет «51 роза»', category:'buket', price:3550, price_prefix:'', description:'Большой авторский букет из 51 розы.', image_url:'assets/photos/shop/p3-buket-51-roza.jpg', image_thumb_url:'assets/photos/shop/p3-buket-51-roza.jpg', image_alt:'Большой букет из персиковых роз', is_new:false, badge:'Акция', flower_types:['розы'], size:'большой', featured:true, showcase:false, hidden:false, no_delivery:false, pickup_branches:['koms'], discount_enabled:true, sale_price:3550, discount_active:true, discount_label:'−1 550 ₽', old_price:5100 },
      { id:'p4', slug:'25-roz', title:'25 роз', category:'buket', price:2500, price_prefix:'', description:'Букет из 25 роз в крафтовой упаковке.', image_url:'assets/photos/shop/p4-25-roz.jpg', image_thumb_url:'assets/photos/shop/p4-25-roz.jpg', image_alt:'Букет из 25 розовых роз', is_new:false, badge:'', flower_types:['розы'], size:'средний', featured:false, showcase:false, hidden:false, no_delivery:false, pickup_branches:['koms'], discount_enabled:false, sale_price:null, discount_active:false, discount_label:'' },
      { id:'p5', slug:'rozy', title:'Розы', category:'mono', price:6800, price_prefix:'от', description:'Большой монобукет роз — от 51 штуки.', image_url:'assets/photos/shop/p5-rozy.jpg', image_thumb_url:'assets/photos/shop/p5-rozy.jpg', image_alt:'Большой монобукет малиновых роз', is_new:false, badge:'', flower_types:['розы'], size:'большой', featured:false, showcase:false, hidden:false, no_delivery:false, pickup_branches:['koms'], discount_enabled:false, sale_price:null, discount_active:false, discount_label:'' },
      { id:'p6', slug:'101-belaya-roza', title:'101 белая роза', category:'mono', price:15035, price_prefix:'', description:'Парадный букет из 101 белой розы.', image_url:'assets/photos/shop/p6-101-belaya-roza.jpg', image_thumb_url:'assets/photos/shop/p6-101-belaya-roza.jpg', image_alt:'Букет из белых роз', is_new:false, badge:'', flower_types:['розы'], size:'большой', featured:true, showcase:false, hidden:false, no_delivery:false, pickup_branches:['koms'], discount_enabled:false, sale_price:null, discount_active:false, discount_label:'' },
      { id:'p7', slug:'shlyapnaya-korobka-rozovaya', title:'Шляпная коробка «Розовая нежность»', category:'korobka', price:4200, price_prefix:'', description:'Композиция из розовых роз в шляпной коробке.', image_url:'assets/photos/shop/p7-shlyapnaya-korobka-rozovaya.jpg', image_thumb_url:'assets/photos/shop/p7-shlyapnaya-korobka-rozovaya.jpg', image_alt:'Шляпная коробка с белыми цветами и розовым гипсофилом', is_new:false, badge:'', flower_types:['розы'], size:'средний', featured:true, showcase:true, hidden:false, no_delivery:false, pickup_branches:['koms'], discount_enabled:false, sale_price:null, discount_active:false, discount_label:'' },
      { id:'p8', slug:'shlyapnaya-korobka-belyy-sad', title:'Шляпная коробка «Белый сад»', category:'korobka', price:4500, price_prefix:'', description:'Белые розы и эвкалипт в шляпной коробке.', image_url:'assets/photos/shop/p8-shlyapnaya-korobka-belyy-sad.jpg', image_thumb_url:'assets/photos/shop/p8-shlyapnaya-korobka-belyy-sad.jpg', image_alt:'Композиция из белых роз и эвкалипта с лентой', is_new:true, badge:'Новинка', flower_types:['розы'], size:'средний', featured:false, showcase:false, hidden:false, no_delivery:false, pickup_branches:['koms'], discount_enabled:false, sale_price:null, discount_active:false, discount_label:'' },
      { id:'p9', slug:'korzina-piony-i-rozy', title:'Корзина «Пионы и розы»', category:'korzina', price:3900, price_prefix:'', description:'Композиция в корзине из пионов и роз. Только самовывоз.', image_url:'assets/photos/shop/p9-korzina-piony-i-rozy.jpg', image_thumb_url:'assets/photos/shop/p9-korzina-piony-i-rozy.jpg', image_alt:'Корзина с белыми розами и эвкалиптом', is_new:false, badge:'', flower_types:['розы','пионы'], size:'большой', featured:false, showcase:false, hidden:false, no_delivery:true, pickup_branches:['koms'], discount_enabled:false, sale_price:null, discount_active:false, discount_label:'' },
      { id:'p10', slug:'korzina-fruktovyy-sad', title:'Корзина «Фруктовый сад»', category:'korzina', price:3600, price_prefix:'', description:'Цветы и ягоды в корзине.', image_url:'assets/photos/shop/p10-korzina-fruktovyy-sad.jpg', image_thumb_url:'assets/photos/shop/p10-korzina-fruktovyy-sad.jpg', image_alt:'Корзина с белыми розами и зеленью', is_new:false, badge:'', flower_types:['розы'], size:'средний', featured:false, showcase:false, hidden:false, no_delivery:false, pickup_branches:['koms'], discount_enabled:false, sale_price:null, discount_active:false, discount_label:'' },
      { id:'p11', slug:'monobuket-tyulpanov', title:'Монобукет тюльпанов', category:'mono', price:2200, price_prefix:'', description:'Свежие тюльпаны — весна в вашем доме.', image_url:'assets/photos/shop/p11-monobuket-tyulpanov.jpg', image_thumb_url:'assets/photos/shop/p11-monobuket-tyulpanov.jpg', image_alt:'Монобукет розовых тюльпанов', is_new:true, badge:'Новинка', flower_types:['тюльпаны'], size:'средний', featured:false, showcase:false, hidden:false, no_delivery:false, pickup_branches:['koms'], discount_enabled:false, sale_price:null, discount_active:false, discount_label:'' },
      { id:'p12', slug:'kompoziciya-vesna', title:'Композиция «Весна»', category:'buket', price:3300, price_prefix:'', description:'Авторская композиция из сезонных цветов.', image_url:'assets/photos/shop/p12-kompoziciya-vesna.jpg', image_thumb_url:'assets/photos/shop/p12-kompoziciya-vesna.jpg', image_alt:'Авторский букет из роз и гвоздик', is_new:false, badge:'', flower_types:['микс'], size:'средний', featured:false, showcase:true, hidden:false, no_delivery:false, pickup_branches:['koms'], discount_enabled:false, sale_price:null, discount_active:false, discount_label:'' }
    ]
  },
  delivery: {
    zones: [
      { id:'city', name:'По городу', price:350 },
      { id:'zhd', name:'Ж/Д, Чёрный мыс', price:450 },
      { id:'gidrostroitel', name:'Гидростроитель', price:450 },
      { id:'airport', name:'Аэропорт', price:500 },
      { id:'bely-yar', name:'Белый Яр / Снежный', price:550 },
      { id:'barsovo', name:'Барсово', price:550 },
      { id:'solnechny', name:'пос. Солнечный', price:500 }
    ],
    surprise_zones: [
      { id:'sur-city', name:'Сюрприз по городу', price:500 },
      { id:'sur-out', name:'Сюрприз за городом', price:700 }
    ],
    free_from: 3000,
    pickup: [
      { id:'koms', name:'Студия на Комсомольском', short:'Комсомольский пр-т, 15', address:'Комсомольский проспект, 15, 1 этаж', details:'Восточный район, вход с Комсомольского проспекта', hours:'Ежедневно 09:00–20:00', phone:'+7 (982) 418-44-25' }
    ],
    payment_mode: 'off',
    slots: (() => { const a=[]; for(let h=9.5; h<=19.5; h++){ const hh=Math.floor(h), mm=(h%1)?30:0; const s=String(hh).padStart(2,'0')+':'+(mm?'30':'00'); const e=new Date(0,0,0,hh,mm+60); a.push({start:s,minutes:60,label:s+'–'+String(e.getHours()).padStart(2,'0')+':'+String(e.getMinutes()).padStart(2,'0')}); } return a; })(),
    pickup_slots: (() => { const a=[]; for(let h=9; h<=19; h++){ const s=String(h).padStart(2,'0')+':00'; a.push({start:s,minutes:60,label:s+'–'+String(h+1).padStart(2,'0')+':00'}); } return a; })(),
    booking_days: 60, lead_minutes: 60, timezone: 'Asia/Yekaterinburg'
  },
  branches: {
    branches: [
      { id:'koms', name:'Студия «Хлоя» на Комсомольском', address:'Комсомольский проспект, 15, 1 этаж', details:'Восточный район, вход с Комсомольского проспекта', hours:'Ежедневно 09:00–20:00', phone:'+7 (982) 418-44-25', lat:61.239634, lng:73.443997 }
    ]
  },
  orders: [
    { id:'HL-1001', created_at:'2026-11-21T08:12:00Z', status:'succeeded', name:'Тестовый покупатель', phone:'+7 900 000-00-01', email:'test@example.com', method:'delivery', zone:'По городу', delivery_price:350, address:'ул. Ленина, 1, кв. 5', recipient:'self', date:'2026-11-22', slot:'10:30–11:30', comment:'', items:[{product_id:'p1', title:'Красные розы', price:2708, qty:1}], total:3058, archived:false },
    { id:'HL-1002', created_at:'2026-11-21T09:30:00Z', status:'pending', name:'Тестовый покупатель', phone:'+7 900 000-00-02', email:'test2@example.com', method:'surprise', zone:'Сюрприз по городу', delivery_price:500, address:'', recipient_phone:'+7 900 000-00-03', recipient_hint:'Живёт в районе Восточный', date:'2026-11-23', slot:'14:30–15:30', comment:'Позвонить, не раскрывая сюрприз', items:[{product_id:'p7', title:'Шляпная коробка «Розовая нежность»', price:4200, qty:1}], total:4700, archived:false },
    { id:'HL-1003', created_at:'2026-11-20T15:00:00Z', status:'canceled', name:'Тестовый покупатель', phone:'+7 900 000-00-04', email:'test3@example.com', method:'pickup', branch:'Студия на Комсомольском', delivery_price:0, address:'', recipient:'self', date:'2026-11-21', slot:'12:00–13:00', comment:'', items:[{product_id:'p9', title:'Корзина «Пионы и розы»', price:3900, qty:1}], total:3900, archived:false }
  ]
};

let __orders = JSON.parse(JSON.stringify(MOCK_DB.orders));

async function api(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  await new Promise(r => setTimeout(r, 120)); // лёгкая задержка как у сети

  if (path === '/api/catalog') return JSON.parse(JSON.stringify(MOCK_DB.catalog));
  if (path === '/api/delivery') return JSON.parse(JSON.stringify(MOCK_DB.delivery));
  if (path === '/api/branches') return JSON.parse(JSON.stringify(MOCK_DB.branches));
  if (path === '/api/site') return JSON.parse(JSON.stringify(MOCK_DB.site));
  if (path === '/api/admin/orders') return JSON.parse(JSON.stringify(__orders));

  if (path === '/api/orders' && method === 'POST') {
    const o = options.body ? JSON.parse(options.body) : {};
    const order = {
      id: 'HL-' + (1004 + Math.floor(Math.random() * 900)),
      created_at: new Date().toISOString(),
      agreed_at: new Date().toISOString(),
      status: 'pending',
      archived: false,
      ...o
    };
    __orders.unshift(order);
    try { sessionStorage.setItem('hloya_orders', JSON.stringify(__orders)); } catch(e){}
    return { success: true, order_id: order.id };
  }
  if (path.startsWith('/api/admin/orders/') && method === 'PATCH') {
    const id = path.split('/').pop();
    const o = __orders.find(x => x.id === id);
    if (o) Object.assign(o, options.body || {});
    return { success: true };
  }
  return null;
}

function formatPrice(n){ return (n||0).toLocaleString('ru-RU') + ' ₽'; }
