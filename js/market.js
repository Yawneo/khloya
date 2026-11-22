/* Хлоя · магазин: каталог, корзина, заказ */
let CATALOG = null, DELIVERY = null;

const S = {
  category: 'all', maxPrice: null, flower: 'all', size: 'all', onlyPickup: false,
  search: '', sort: 'popular', offers: false
};

function effPrice(p){ return (p.discount_active && p.sale_price != null) ? p.sale_price : p.price; }
function oldPrice(p){ return p.old_price || ((p.discount_active && p.sale_price != null) ? p.price : null); }

function nowYekat(){
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 5 * 3600000);
}
function isoDate(d){ return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }

function filteredProducts(){
  let list = (CATALOG.products || []).filter(p => !p.hidden);
  if(S.category !== 'all') list = list.filter(p => p.category === S.category);
  if(S.offers) list = list.filter(p => p.featured);
  if(S.flower !== 'all') list = list.filter(p => (p.flower_types||[]).includes(S.flower));
  if(S.size !== 'all') list = list.filter(p => p.size === S.size);
  if(S.onlyPickup) list = list.filter(p => p.no_delivery);
  if(S.maxPrice != null) list = list.filter(p => effPrice(p) <= S.maxPrice);
  if(S.search) { const q = S.search.toLowerCase(); list = list.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)); }
  if(S.sort === 'price-asc') list.sort((a,b)=>effPrice(a)-effPrice(b));
  else if(S.sort === 'price-desc') list.sort((a,b)=>effPrice(b)-effPrice(a));
  else if(S.sort === 'new') list.sort((a,b)=> (b.is_new?1:0)-(a.is_new?1:0));
  return list;
}

function cardHTML(p){
  const op = oldPrice(p);
  const badge = p.badge || (p.is_new ? 'Новинка' : '');
  return `<article class="product-card" data-id="${p.id}">
    <div class="photo">
      ${badge ? `<span class="badge ${p.is_new ? 'badge--new' : ''}">${badge}</span>` : ''}
      <img src="${p.image_url}" alt="${p.image_alt || p.title}" loading="lazy">
    </div>
    <div class="body">
      <h3><a href="product.html?slug=${p.slug}" data-detail>${p.title}</a></h3>
      <div class="price">${p.price_prefix ? `<span class="prefix">${p.price_prefix} </span>` : ''}${formatPrice(effPrice(p))}${op ? `<span class="old">${formatPrice(op)}</span>` : ''}</div>
      <button class="btn btn--primary btn--small" data-add style="margin-top:12px">В корзину</button>
    </div>
  </article>`;
}

function renderProducts(){
  const list = filteredProducts();
  const grid = document.getElementById('products-grid');
  if(!grid) return;
  grid.innerHTML = list.length ? list.map(cardHTML).join('') : '<p style="grid-column:1/-1;color:var(--text-muted)">Ничего не найдено. Сбросьте фильтры.</p>';
  document.getElementById('count').textContent = list.length + ' ' + plural(list.length);
  // ссылки карточек открывают диалог
  grid.querySelectorAll('[data-detail]').forEach(a=>{
    a.addEventListener('click', e=>{ e.preventDefault(); openDetail(a.closest('.product-card').dataset.id); });
  });
  grid.querySelectorAll('[data-add]').forEach(b=>{
    b.addEventListener('click', ()=>{ Cart.add(b.closest('.product-card').dataset.id); flash(b); });
  });
}
function plural(n){ const m = n%10, m2 = n%100; if(m===1 && m2!==11) return 'товар'; if(m>=2 && m<=4 && (m2<12||m2>14)) return 'товара'; return 'товаров'; }
function flash(b){ const t=b.textContent; b.textContent='✓ Добавлено'; setTimeout(()=>b.textContent=t, 1200); }

function renderFilters(){
  const cats = CATALOG.categories || [];
  const flowers = [...new Set((CATALOG.products||[]).flatMap(p=>p.flower_types||[]))];
  const sizes = [...new Set((CATALOG.products||[]).map(p=>p.size).filter(Boolean))];
  document.getElementById('f-category').innerHTML = '<label class="opt"><input type="radio" name="cat" value="all" ' + (S.category==='all'?'checked':'') + '> Все</label>' +
    cats.map(c=>`<label class="opt"><input type="radio" name="cat" value="${c.id}" ${S.category===c.id?'checked':''}> ${c.name}</label>`).join('');
  document.getElementById('f-flower').innerHTML = '<label class="opt"><input type="checkbox" value="all" checked> Все</label>' +
    flowers.map(f=>`<label class="opt"><input type="checkbox" value="${f}"> ${f}</label>`).join('');
  document.getElementById('f-size').innerHTML = '<label class="opt"><input type="radio" name="size" value="all" checked> Любой</label>' +
    sizes.map(s=>`<label class="opt"><input type="radio" name="size" value="${s}"> ${s}</label>`).join('');

  document.querySelectorAll('#f-category input[name=cat]').forEach(i=>i.addEventListener('change', ()=>{ S.category = i.value; renderProducts(); }));
  document.querySelectorAll('#f-size input[name=size]').forEach(i=>i.addEventListener('change', ()=>{ S.size = i.value; renderProducts(); }));
  document.querySelectorAll('#f-flower input').forEach(i=>i.addEventListener('change', ()=>{
    const sel = [...document.querySelectorAll('#f-flower input:checked')].map(x=>x.value);
    if(sel.includes('all')) S.flower = 'all'; else { S.flower = sel; }
    renderProducts();
  }));
  document.getElementById('f-price').addEventListener('input', e=>{ S.maxPrice = e.target.value ? +e.target.value : null; renderProducts(); });
  document.getElementById('f-pickup').addEventListener('change', e=>{ S.onlyPickup = e.target.checked; renderProducts(); });
  document.getElementById('search').addEventListener('input', e=>{ S.search = e.target.value; renderProducts(); });
  document.getElementById('sort').addEventListener('change', e=>{ S.sort = e.target.value; renderProducts(); });
}

/* ---- детальный просмотр ---- */
function availabilityLine(p){
  const minZone = Math.min(...(DELIVERY.zones||[]).map(z=>z.price));
  const branchName = p.pickup_branches && p.pickup_branches.length ? (DELIVERY.pickup.find(b=>b.id===p.pickup_branches[0])||{}).name || 'студия' : 'студия';
  if(p.no_delivery){
    const b = (DELIVERY.pickup||[]).find(x=>x.id===(p.pickup_branches||[])[0]);
    return 'Без доставки — только самовывоз из студии: ' + (b ? b.address : '[адрес студии]');
  }
  return `Доставка по Сургуту от ${formatPrice(minZone)}, бесплатно от ${formatPrice(DELIVERY.free_from)}. Самовывоз из ${(p.pickup_branches||[]).length ? 'студии на Комсомольском' : 'студии'}.`;
}

function openDetail(id){
  const p = (CATALOG.products||[]).find(x=>x.id===id);
  if(!p) return;
  const d = document.getElementById('detail');
  d.querySelector('.detail-grid').innerHTML = `
    <img src="${p.image_url}" alt="${p.image_alt||p.title}">
    <div>
      <h2>${p.title}</h2>
      <div class="price">${p.price_prefix?p.price_prefix+' ':''}${formatPrice(effPrice(p))}${oldPrice(p)?` <span style="text-decoration:line-through;color:var(--text-muted);font-size:1rem">${formatPrice(oldPrice(p))}</span>`:''}</div>
      <p class="desc">${p.description}</p>
      <p style="font-size:.85rem;margin-bottom:12px"><b>Состав:</b> ${(p.flower_types||[]).join(', ')} · <b>Размер:</b> ${p.size||'—'}</p>
      <div class="availability"><b>${availabilityLine(p)}</b></div>
      <button class="btn btn--primary" id="detail-add">В корзину</button>
    </div>`;
  d.querySelector('#detail-add').addEventListener('click', ()=>{ Cart.add(p.id); d.close(); flashAll(); });
  d.showModal();
}
function flashAll(){ document.querySelectorAll('[data-add]').forEach(b=>{ b.textContent='✓'; setTimeout(()=>b.textContent='В корзину',1000); }); }

/* ---- корзина ---- */
function renderCart(){
  const items = Cart.items(CATALOG);
  const box = document.getElementById('cart-items');
  box.innerHTML = items.length ? items.map(it=>`
    <div class="cart-item">
      <img src="${it.product.image_thumb_url}" alt="">
      <div><div class="t">${it.product.title}</div><div class="p">${formatPrice(effPrice(it.product))} × ${it.qty}</div></div>
      <div class="qty">
        <button data-dec="${it.product.id}">−</button><span>${it.qty}</span><button data-inc="${it.product.id}">+</button>
      </div>
      <button data-rm="${it.product.id}" style="border:0;background:none;color:#B91C1C;font-size:1rem">✕</button>
    </div>`).join('') : '<p style="color:var(--text-muted);padding:16px 0">Корзина пуста</p>';
  const sub = Cart.subtotal(CATALOG);
  document.getElementById('cart-total').textContent = formatPrice(sub);
  document.getElementById('cart-count-inner').textContent = items.length + ' ' + plural(items.length);
  document.getElementById('to-order').disabled = !items.length;
  box.querySelectorAll('[data-inc]').forEach(b=>b.addEventListener('click', ()=>{ Cart.add(b.dataset.inc); renderCart(); }));
  box.querySelectorAll('[data-dec]').forEach(b=>b.addEventListener('click', ()=>{ const c=Cart.get(); if(c[b.dataset.dec]>1) Cart.set(b.dataset.dec, c[b.dataset.dec]-1); else Cart.remove(b.dataset.dec); renderCart(); }));
  box.querySelectorAll('[data-rm]').forEach(b=>b.addEventListener('click', ()=>{ Cart.remove(b.dataset.rm); renderCart(); }));
}

/* ---- заказ ---- */
let selectedDate = null, selectedSlot = null, method = 'delivery';

function renderCalendar(){
  const cal = document.getElementById('calendar');
  const n = nowYekat();
  const today = new Date(n.getFullYear(), n.getMonth(), n.getDate());
  const days = DELIVERY.booking_days || 60;
  const names = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
  let html = '';
  for(let i=0;i<days;i++){
    const d = new Date(today); d.setDate(today.getDate()+i);
    html += `<button data-date="${isoDate(d)}">${d.getDate()}<small>${names[d.getDay()]}</small></button>`;
  }
  cal.innerHTML = html;
  cal.querySelectorAll('button[data-date]').forEach(b=>{
    b.addEventListener('click', ()=>{
      cal.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));
      b.classList.add('selected');
      selectedDate = b.dataset.date;
      selectedSlot = null;
      renderSlots();
    });
  });
  if(!selectedDate) selectedDate = isoDate(today);
  const firstBtn = cal.querySelector('button[data-date="'+selectedDate+'"]') || cal.querySelector('button[data-date]');
  if(firstBtn) firstBtn.classList.add('selected');
  renderSlots();
}

function renderSlots(){
  const slots = document.getElementById('slots');
  const list = method === 'pickup' ? DELIVERY.pickup_slots : DELIVERY.slots;
  const n = nowYekat();
  const isToday = selectedDate === isoDate(n);
  const curMin = n.getHours()*60 + n.getMinutes() + (DELIVERY.lead_minutes||60);
  slots.innerHTML = list.map(s=>{
    const [h,m] = s.start.split(':').map(Number);
    const dis = isToday && (h*60+m) < curMin;
    return `<button data-slot="${s.label}" ${dis?'disabled':''}>${s.label}</button>`;
  }).join('');
  slots.querySelectorAll('button').forEach(b=>{
    b.addEventListener('click', ()=>{
      slots.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));
      b.classList.add('selected');
      selectedSlot = b.dataset.slot;
      updateTotal();
    });
  });
  if(selectedSlot && ![...slots.querySelectorAll('button')].some(b=>b.dataset.slot===selectedSlot && !b.disabled)){ selectedSlot=null; }
}

function deliveryPrice(){
  if(method === 'pickup') return 0;
  const sel = document.querySelector('input[name=zone]:checked');
  if(!sel) return 0;
  const z = [...(DELIVERY.zones||[]), ...(DELIVERY.surprise_zones||[])].find(x=>x.id===sel.value);
  return z ? z.price : 0;
}
function subtotal(){ return Cart.subtotal(CATALOG); }
function updateTotal(){
  const sub = subtotal();
  let dp = deliveryPrice();
  if(dp && sub >= DELIVERY.free_from) dp = 0;
  document.getElementById('sum-products').textContent = formatPrice(sub);
  document.getElementById('sum-delivery').textContent = dp ? formatPrice(dp) : (method==='delivery' ? 'бесплатно' : '—');
  document.getElementById('sum-total').textContent = formatPrice(sub + dp);
}

function setMethod(m){
  method = m;
  document.querySelectorAll('.method-tab').forEach(t=>t.classList.toggle('active', t.dataset.method===m));
  document.getElementById('block-delivery').classList.toggle('hidden', m!=='delivery');
  document.getElementById('block-surprise').classList.toggle('hidden', m!=='surprise');
  document.getElementById('block-pickup').classList.toggle('hidden', m!=='pickup');
  selectedSlot = null;
  renderSlots();
  updateTotal();
  // слоты доступны по времени: доставка 09:30-20:30, самовывоз 09:00-20:00
  document.querySelector('.slot-note').textContent = m==='pickup' ? 'Время · по Екатеринбургу (UTC+5) · 09:00–20:00' : 'Время · по Екатеринбургу (UTC+5) · 09:30–20:30';
}

function validate(){
  const errs = [];
  const name = document.getElementById('o-name').value.trim();
  const phone = document.getElementById('o-phone').value.trim();
  const digits = (phone.match(/\d/g)||[]).join('');
  if(name.length < 2){ errs.push({el:'o-name', msg:'Имя — минимум 2 символа'}); }
  if(digits.length < 10){ errs.push({el:'o-phone', msg:'Телефон — минимум 10 цифр'}); }
  if(method==='delivery' && !document.getElementById('o-address').value.trim()){ errs.push({el:'o-address', msg:'Укажите адрес доставки'}); }
  if(method==='delivery' && !document.getElementById('o-self').checked){
    const rpd = (document.getElementById('o-recipient-delivery').value.match(/\d/g)||[]).join('');
    if(rpd.length < 10){ errs.push({el:'o-recipient-delivery', msg:'Телефон получателя — минимум 10 цифр'}); }
  }
  if(method==='surprise'){
    const rp = (document.getElementById('o-recipient-s').value.match(/\d/g)||[]).join('');
    if(rp.length < 10){ errs.push({el:'o-recipient-s', msg:'Телефон получателя — минимум 10 цифр'}); }
  }
  if(!selectedDate){ errs.push({el:'calendar', msg:'Выберите дату'}); }
  if(!selectedSlot){ errs.push({el:'slots', msg:'Выберите время'}); }
  if(!document.getElementById('consent-data').checked){ errs.push({el:'consent-data', msg:'Нужно согласие на обработку данных'}); }
  if(!document.getElementById('consent-offer').checked){ errs.push({el:'consent-offer', msg:'Нужно принять оферту'}); }
  return errs;
}

async function submitOrder(){
  document.querySelectorAll('.field').forEach(f=>f.classList.remove('invalid'));
  const errs = validate();
  if(errs.length){
    errs.forEach(e=>{ const el = document.getElementById(e.el) || document.querySelector('[data-field="'+e.el+'"]'); if(el) el.closest('.field').classList.add('invalid'); });
    const first = errs[0];
    const el = document.getElementById(first.el) || document.querySelector('[data-field="'+first.el+'"]');
    if(el) el.closest('.field')?.querySelector('input,textarea')?.focus();
    document.getElementById('order-result').textContent = 'Проверьте выделенные поля.';
    document.getElementById('order-result').setAttribute('aria-live','assertive');
    return;
  }
  const zoneEl = document.querySelector('input[name=zone]:checked');
  const payload = {
    name: document.getElementById('o-name').value.trim(),
    phone: document.getElementById('o-phone').value.trim(),
    email: document.getElementById('o-email').value.trim(),
    delivery_method: method,
    delivery_zone: method==='delivery' ? (zoneEl?zoneEl.dataset.name:null) : (method==='surprise' ? (zoneEl?zoneEl.dataset.name:null) : null),
    delivery_surprise_zone: method==='surprise' ? (zoneEl?zoneEl.dataset.name:null) : null,
    pickup_branch: method==='pickup' ? document.querySelector('input[name=branch]:checked')?.dataset.name : null,
    address: method==='delivery' ? document.getElementById('o-address').value.trim() : '',
    recipient_phone: method==='surprise' ? document.getElementById('o-recipient-s').value.trim() : (method==='delivery' && !document.getElementById('o-self').checked ? document.getElementById('o-recipient-delivery').value.trim() : ''),
    recipient_hint: method==='surprise' ? document.getElementById('o-hint').value.trim() : '',
    delivery_date: selectedDate,
    delivery_slot: selectedSlot,
    comment: document.getElementById('o-comment').value.trim(),
    items: Cart.entries().map(e=>{ const p=(CATALOG.products||[]).find(x=>x.id===e.id); return {product_id:e.id, title:p?p.title:'', price:p?effPrice(p):0, qty:e.qty}; }),
    total: subtotal() + (subtotal() >= DELIVERY.free_from && method!=='pickup' ? 0 : deliveryPrice()),
    data_consent: true, offer_accepted: true,
    consent_version: 'draft', privacy_version: 'draft', offer_version: 'draft'
  };
  const res = await api('/api/orders', {method:'POST', body: JSON.stringify(payload)});
  if(res && res.success){
    document.getElementById('order-form-body').classList.add('hidden');
    document.getElementById('order-success').classList.remove('hidden');
    document.getElementById('order-id').textContent = res.order_id;
    Cart.clear();
  }
}

function bindOrder(){
  document.querySelectorAll('.method-tab').forEach(t=>t.addEventListener('click', ()=>setMethod(t.dataset.method)));
  // зоны
  const zbox = document.getElementById('zones');
  zbox.innerHTML = [...(DELIVERY.zones||[])].map(z=>`<label class="radio-row"><input type="radio" name="zone" value="${z.id}" data-name="${z.name}" ${z.id==='city'?'checked':''}> ${z.name} — ${formatPrice(z.price)}</label>`).join('');
  document.getElementById('surprise-zones').innerHTML = (DELIVERY.surprise_zones||[]).map(z=>`<label class="radio-row"><input type="radio" name="zone" value="${z.id}" data-name="${z.name}"> ${z.name} — ${formatPrice(z.price)}</label>`).join('');
  document.getElementById('branches').innerHTML = (DELIVERY.pickup||[]).map(b=>`<label class="radio-row"><input type="radio" name="branch" value="${b.id}" data-name="${b.name}" checked> ${b.name} · ${b.address} · ${b.hours}</label>`).join('');
  // галочка «получу сам»
  const selfChk = document.getElementById('o-self');
  const recField = document.getElementById('field-recipient-delivery');
  function toggleRecipient(){ recField.classList.toggle('hidden', selfChk.checked); }
  selfChk.addEventListener('change', toggleRecipient); toggleRecipient();
  document.querySelectorAll('input[name=zone]').forEach(i=>i.addEventListener('change', updateTotal));
  document.getElementById('order-submit').addEventListener('click', submitOrder);
  document.getElementById('order-again').addEventListener('click', ()=>{
    document.getElementById('order-form-body').classList.remove('hidden');
    document.getElementById('order-success').classList.add('hidden');
    document.querySelectorAll('#order-form-body input[type=text],#order-form-body input[type=tel],#order-form-body input[type=email],#order-form-body textarea').forEach(i=>i.value='');
  });
  setMethod('delivery');
  renderCalendar();
  updateTotal();
}

async function loadShop(){
  const params = new URLSearchParams(location.search);
  if(params.get('category')) S.category = params.get('category');
  if(params.get('offers') === '1') S.offers = true;
  CATALOG = await api('/api/catalog');
  DELIVERY = await api('/api/delivery');
  renderFilters();
  renderProducts();
  renderCart();
  bindOrder();
  // кнопки диалогов
  document.getElementById('open-cart')?.addEventListener('click', ()=>{ renderCart(); document.getElementById('cart').showModal(); });
  document.getElementById('to-order').addEventListener('click', ()=>{ document.getElementById('cart').close(); updateTotal(); document.getElementById('order').showModal(); });
  document.querySelectorAll('.dialog-close').forEach(b=>b.addEventListener('click', ()=>b.closest('dialog').close()));
  updateCartCount();
}

document.addEventListener('DOMContentLoaded', ()=>{ if(document.getElementById('products-grid')) loadShop(); });
