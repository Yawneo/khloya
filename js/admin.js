/* Хлоя · админка (мок-режим). Вход принимает любой непустой ключ. */
let adminAuthed = false;
let adminProducts = null;

async function loadAdmin(){
  const c = await api('/api/catalog');
  const d = await api('/api/delivery');
  adminProducts = c.products || [];
  window.__delivery = d;
  if(location.hash === '#admin') enterAdminMode();
}

function enterAdminMode(){
  document.getElementById('shop-view').classList.add('hidden');
  document.getElementById('admin-view').classList.remove('hidden');
  document.getElementById('admin-bar').classList.add('show');
  if(adminAuthed) renderAdmin(); else renderLogin();
}

function renderLogin(){
  document.getElementById('admin-panel').innerHTML = `
    <div class="admin-login">
      <h2>Вход в админку</h2>
      <p style="color:var(--text-muted);font-size:.88rem;margin-bottom:14px">Ключ администратора · <b>тестовый режим</b>: примите любой непустой ключ.</p>
      <div class="field"><input type="password" id="admin-key" placeholder="Ключ администратора"></div>
      <button class="btn btn--primary" id="admin-enter">Войти</button>
      <p id="admin-login-err" style="color:#B91C1C;font-size:.85rem;margin-top:10px"></p>
    </div>`;
  const doLogin = ()=>{
    if(document.getElementById('admin-key').value.trim()){
      adminAuthed = true; sessionStorage.setItem('hloya_admin','1'); renderAdmin();
    } else {
      document.getElementById('admin-login-err').textContent = 'Введите ключ.';
    }
  };
  document.getElementById('admin-enter').addEventListener('click', doLogin);
  document.getElementById('admin-key').addEventListener('keydown', e=>{ if(e.key==='Enter') doLogin(); });
}

function renderAdmin(){
  const p = document.getElementById('admin-panel');
  p.innerHTML = `
    <div class="admin-memo"><details><summary>Как пользоваться админкой</summary><p>
      <b>Товары</b> — добавить/изменить/скрыть/удалить, переключатели «В магазине», «Готов сейчас», «Где получить».<br>
      <b>Заказы</b> — смотреть заказы, «Оплачено — убрать» в архив, «Вернуть заказ» обратно.<br>
      <b>Категории</b> — название, описание, порядок. <b>Фото главной</b> — слайды баннера. <b>Поиск</b> — коды верификации.<br>
      Если что-то не так — обновите страницу (изменения мок-режима хранятся только в памяти).
    </p></details></div>
    <div class="admin-tabs">
      <button class="admin-tab active" data-tab="products">Товары</button>
      <button class="admin-tab" data-tab="orders">Заказы</button>
      <button class="admin-tab" data-tab="categories">Категории</button>
      <button class="admin-tab" data-tab="photos">Фото главной</button>
      <button class="admin-tab" data-tab="search">Поиск</button>
    </div>
    <div id="tab-products" class="admin-panel active"></div>
    <div id="tab-orders" class="admin-panel"></div>
    <div id="tab-categories" class="admin-panel"></div>
    <div id="tab-photos" class="admin-panel"></div>
    <div id="tab-search" class="admin-panel"></div>`;
  p.querySelectorAll('.admin-tab').forEach(t=>t.addEventListener('click', ()=>{
    p.querySelectorAll('.admin-tab').forEach(x=>x.classList.remove('active'));
    p.querySelectorAll('.admin-panel').forEach(x=>x.classList.remove('active'));
    t.classList.add('active'); document.getElementById('tab-'+t.dataset.tab).classList.add('active');
  }));
  renderProductsTab(); renderOrdersTab(); renderCategoriesTab(); renderPhotosTab(); renderSearchTab();
}

function renderProductsTab(){
  const el = document.getElementById('tab-products');
  el.innerHTML = `
    <p class="admin-note">Переключатели срабатывают сразу; удаление — навсегда (в мок-режиме до перезагрузки).</p>
    <div class="addrow" style="display:grid;grid-template-columns:1.6fr 1fr .9fr .8fr auto;gap:8px;margin-bottom:18px">
      <input id="np-name" placeholder="Название товара">
      <select id="np-cat">${(CATALOG.categories||[]).map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select>
      <input id="np-price" type="number" placeholder="Цена ₽">
      <input id="np-img" placeholder="URL фото">
      <button class="btn btn--primary btn--small" id="np-add">+</button>
    </div>
    <table class="admin-table">
      <thead><tr><th>Фото</th><th>Название</th><th>Цена</th><th>В магазине</th><th>Готов сейчас</th><th>Доставка</th><th></th></tr></thead>
      <tbody>${adminProducts.map(p=>`
        <tr data-id="${p.id}">
          <td><img src="${p.image_thumb_url||p.image_url}" alt=""></td>
          <td>${p.title}<br><small style="color:var(--text-muted)">${p.category}</small></td>
          <td>${formatPrice(p.price)}</td>
          <td><button class="flag-btn ${p.hidden?'':'on'}" data-flag="hidden">${p.hidden?'Скрыт':'В магазине'}</button></td>
          <td><button class="flag-btn ${p.showcase?'on':''}" data-flag="showcase">${p.showcase?'Да':'Нет'}</button></td>
          <td><button class="flag-btn ${p.no_delivery?'':'on'}" data-flag="no_delivery">${p.no_delivery?'Только самовывоз':'Доставка'}</button></td>
          <td><button class="del" data-del="${p.id}" style="border:0;background:#FEE2E2;color:#B91C1C;border-radius:8px;padding:6px 10px">✕</button></td>
        </tr>`).join('')}</tbody>
    </table>`;
  document.getElementById('np-add').addEventListener('click', ()=>{
    const name = document.getElementById('np-name').value.trim();
    const price = +document.getElementById('np-price').value;
    if(!name || !price) return;
    adminProducts.push({ id:'p'+Date.now(), slug:name.toLowerCase().replace(/\s+/g,'-'), title:name, category:document.getElementById('np-cat').value, price, price_prefix:'', description:'', image_url:document.getElementById('np-img').value||IMG.red, image_thumb_url:document.getElementById('np-img').value||IMG.red, image_alt:name, is_new:true, badge:'Новинка', flower_types:['микс'], size:'средний', featured:false, showcase:false, hidden:false, no_delivery:false, pickup_branches:['koms'], discount_enabled:false, sale_price:null, discount_active:false, discount_label:'' });
    renderProductsTab();
  });
  el.querySelectorAll('[data-flag]').forEach(b=>b.addEventListener('click', ()=>{
    const p = adminProducts.find(x=>x.id===b.closest('tr').dataset.id);
    const f = b.dataset.flag;
    p[f] = !p[f];
    renderProductsTab();
  }));
  el.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click', ()=>{
    if(!confirm('Удалить товар навсегда?')) return;
    adminProducts = adminProducts.filter(x=>x.id!==b.dataset.del);
    renderProductsTab();
  }));
}

let adminOrders = null;
async function renderOrdersTab(){
  const el = document.getElementById('tab-orders');
  adminOrders = await api('/api/admin/orders');
  const vis = adminOrders.filter(o=>!o.archived);
  const statusLabel = {pending:'ожидает оплаты', succeeded:'оплачен', canceled:'отменён', mismatch:'сумма не совпала'};
  el.innerHTML = `
    <p class="admin-note">Тестовые заказы (мок). Архив — не удаление.</p>
    <table class="admin-table">
      <thead><tr><th>№</th><th>Дата/слот</th><th>Статус</th><th>Покупатель</th><th>Способ</th><th>Сумма</th><th></th></tr></thead>
      <tbody>${vis.map(o=>`
        <tr>
          <td>${o.id}</td><td>${o.date} · ${o.slot}</td>
          <td><span class="status-badge status-${o.status}">${statusLabel[o.status]||o.status}</span></td>
          <td>${o.name}<br><small style="color:var(--text-muted)">${o.phone}</small></td>
          <td>${o.method==='delivery'?'Доставка':o.method==='surprise'?'Сюрприз':'Самовывоз'}<br><small style="color:var(--text-muted)">${o.zone||o.branch||''}</small></td>
          <td>${formatPrice(o.total)}</td>
          <td><button class="btn btn--small btn--ghost" data-archive="${o.id}">Оплачено — убрать</button></td>
        </tr>`).join('') || '<tr><td colspan="7">Нет заказов</td></tr>'}</tbody>
    </table>
    <h3 style="margin:22px 0 10px">Архив</h3>
    <table class="admin-table"><tbody>${adminOrders.filter(o=>o.archived).map(o=>`<tr><td>${o.id}</td><td>${o.name}</td><td>${formatPrice(o.total)}</td><td><button class="btn btn--small btn--ghost" data-restore="${o.id}">Вернуть заказ</button></td></tr>`).join('') || '<tr><td>Архив пуст</td></tr>'}</tbody></table>`;
  el.querySelectorAll('[data-archive]').forEach(b=>b.addEventListener('click', ()=>{ const o=adminOrders.find(x=>x.id===b.dataset.archive); if(o) o.archived=true; renderOrdersTab(); }));
  el.querySelectorAll('[data-restore]').forEach(b=>b.addEventListener('click', ()=>{ const o=adminOrders.find(x=>x.id===b.dataset.restore); if(o) o.archived=false; renderOrdersTab(); }));
}

function renderCategoriesTab(){
  const el = document.getElementById('tab-categories');
  el.innerHTML = `<table class="admin-table">
    <thead><tr><th>Порядок</th><th>Название</th><th>Описание</th><th></th></tr></thead>
    <tbody>${(CATALOG.categories||[]).map((c,i)=>`
      <tr data-id="${c.id}">
        <td>${c.position}</td>
        <td><input value="${c.name}" data-f="name" style="width:100%;padding:6px 8px;border-radius:8px;border:1.5px solid var(--border-card)"></td>
        <td><input value="${c.description}" data-f="description" style="width:100%;padding:6px 8px;border-radius:8px;border:1.5px solid var(--border-card)"></td>
        <td><button class="btn btn--small btn--ghost" data-save>Сохранить</button></td>
      </tr>`).join('')}</tbody></table>`;
  el.querySelectorAll('[data-save]').forEach(b=>b.addEventListener('click', ()=>{
    const tr = b.closest('tr'); const c = CATALOG.categories.find(x=>x.id===tr.dataset.id);
    c.name = tr.querySelector('[data-f=name]').value; c.description = tr.querySelector('[data-f=description]').value;
    b.textContent='✓'; setTimeout(()=>b.textContent='Сохранить', 900);
  }));
}

function renderPhotosTab(){
  const el = document.getElementById('tab-photos');
  const slides = (MOCK_DB.site.hero_slides || []);
  el.innerHTML = `<p class="admin-note">Слайды баннера по порядку (мок — изменения в памяти).</p>` +
    slides.map((s,i)=>`<div style="display:flex;gap:12px;align-items:center;margin-bottom:10px">
      <img src="${s.image_url}" style="width:90px;height:60px;object-fit:cover;border-radius:8px">
      <input value="${s.alt}" data-alt="${i}" style="flex:1;padding:8px;border-radius:8px;border:1.5px solid var(--border-card)">
      <button class="btn btn--small btn--ghost" data-save-alt="${i}">Сохранить</button>
      <button class="btn btn--small" style="color:#B91C1C" data-del-slide="${i}">✕</button>
    </div>`).join('') +
    `<button class="btn btn--primary btn--small" id="add-slide">Добавить слайд</button>`;
  el.querySelectorAll('[data-save-alt]').forEach(b=>b.addEventListener('click', ()=>{ MOCK_DB.site.hero_slides[+b.dataset.saveAlt].alt = el.querySelector(`[data-alt="${b.dataset.saveAlt}"]`).value; b.textContent='✓'; setTimeout(()=>b.textContent='Сохранить',900); }));
  el.querySelectorAll('[data-del-slide]').forEach(b=>b.addEventListener('click', ()=>{ MOCK_DB.site.hero_slides.splice(+b.dataset.delSlide,1); renderPhotosTab(); }));
  document.getElementById('add-slide').addEventListener('click', ()=>{ MOCK_DB.site.hero_slides.push({image_url:IMG.pink, mobile_image_url:IMG.pink, alt:'Новый слайд'}); renderPhotosTab(); });
}

function renderSearchTab(){
  const el = document.getElementById('tab-search');
  el.innerHTML = `
    <p class="admin-note">Коды верификации для поисковых систем (на этапе 1 не сохраняются на сервер).</p>
    <div class="field"><label>Яндекс Вебмастер</label><input id="yandex-code" placeholder="Метатег или имя HTML-файла"></div>
    <div class="field"><label>Google Search Console</label><input id="google-code" placeholder="Метатег или имя HTML-файла"></div>
    <button class="btn btn--primary" id="save-codes">Сохранить коды</button>
    <p style="margin-top:16px;font-size:.88rem">Файл карты сайта: <b>/sitemap.xml</b> (генерирует сервер на этапе 2).</p>`;
  document.getElementById('save-codes').addEventListener('click', ()=>{ el.querySelector('#save-codes').textContent='✓ Сохранено'; });
}

document.addEventListener('DOMContentLoaded', ()=>{ if(document.getElementById('admin-view')) loadAdmin(); });
window.addEventListener('hashchange', ()=>{ if(location.hash === '#admin' && document.getElementById('admin-view')) enterAdminMode(); });
