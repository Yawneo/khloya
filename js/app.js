/* Хлоя · общие утилиты: корзина, счётчик, шапка, док */
const HLOYA = {
  phone: '+7 (982) 418-44-25',
  phoneHref: 'tel:+79824184425',
  address: 'Комсомольский проспект, 15, 1 этаж',
  coords: [61.239634, 73.443997],
  mapUrl: 'https://yandex.ru/map-widget/v1/?ll=73.443997,61.239634&z=17&pt=73.443997,61.239634,pm2blm'
};

const Cart = {
  get(){ try { return JSON.parse(localStorage.getItem('hloya_cart')) || {}; } catch(e){ return {}; } },
  save(c){ localStorage.setItem('hloya_cart', JSON.stringify(c)); },
  add(id, qty){ const c = this.get(); c[id] = (c[id] || 0) + (qty || 1); this.save(c); updateCartCount(); },
  set(id, qty){ const c = this.get(); if(qty <= 0) delete c[id]; else c[id] = qty; this.save(c); updateCartCount(); },
  remove(id){ this.set(id, 0); },
  clear(){ this.save({}); updateCartCount(); },
  count(){ const c = this.get(); return Object.values(c).reduce((a,b)=>a+b, 0); },
  entries(){ return Object.entries(this.get()).map(([id,qty])=>({id, qty})); },
  items(catalog){ return this.entries().map(e=>{ const p = (catalog.products||[]).find(x=>x.id===e.id); return p ? {product:p, qty:e.qty} : null; }).filter(Boolean); },
  subtotal(catalog){ return this.items(catalog).reduce((s,it)=>s+it.product.price*it.qty, 0); }
};

function updateCartCount(){
  const n = Cart.count();
  document.querySelectorAll('.cart-count').forEach(el=>{ el.textContent = n; el.style.display = n ? '' : 'none'; });
}

function initApp(){
  updateCartCount();
  // бургер
  const burger = document.querySelector('.burger');
  if(burger){
    burger.addEventListener('click', ()=>{
      const nav = document.querySelector('.main-nav');
      nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', nav.classList.contains('open'));
    });
  }
  // кнопка корзины
  document.querySelectorAll('[data-cart-open]').forEach(b=>{
    b.addEventListener('click', ()=>{ if(typeof renderCart === 'function') renderCart(); const d = document.getElementById('cart'); if(d && typeof d.showModal === 'function') d.showModal(); });
  });
}

document.addEventListener('DOMContentLoaded', initApp);
