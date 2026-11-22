/* Хлоя · главная: слайдер, коллекции, студии, «готовы сейчас» */
let HOME_SITE = null, HOME_CATALOG = null, HOME_BRANCHES = null;

async function loadHome(){
  HOME_SITE = await api('/api/site');
  HOME_CATALOG = await api('/api/catalog');
  HOME_BRANCHES = await api('/api/branches');
  renderHero();
  renderShowcase();
  renderCollections();
  renderStudios();
}

function renderHero(){
  const slides = HOME_SITE.hero_slides || [];
  const track = document.getElementById('hero-track');
  const dots = document.getElementById('hero-dots');
  if(!slides.length) return;
  track.innerHTML = slides.map((s,i)=>`
    <div class="hero-slide">
      <img src="${s.image_url}" alt="${s.alt}" ${i>0?'loading="lazy"':''}>
      <div class="container"><div class="hero-copy">
        <h1>${i===0 ? 'Цветы, которые дарят улыбку' : 'Свежие букеты каждый день'}</h1>
        <p>«Хлоя» — студия цветов на Комсомольском проспекте. Собираем букеты вручную и привозим по Сургуту в день заказа.</p>
        <div class="hero-ctas"><a class="btn btn--primary" href="shop.html">В каталог</a><a class="btn btn--ghost" style="color:#fff;border-color:#fff" href="tel:+79824184425">Позвонить</a></div>
      </div></div>
    </div>`).join('');
  dots.innerHTML = slides.map((_,i)=>`<button data-dot="${i}" ${i===0?'class="active"':''} aria-label="Слайд ${i+1}"></button>`).join('');
  let cur = 0;
  const go = i=>{ cur = (i+slides.length)%slides.length; track.style.transform = `translateX(-${cur*100}%)`; dots.querySelectorAll('button').forEach((d,j)=>d.classList.toggle('active', j===cur)); };
  dots.querySelectorAll('button').forEach((d,i)=>d.addEventListener('click', ()=>go(i)));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduced && slides.length>1){
    let timer = setInterval(()=>go(cur+1), 5000);
    const hero = document.querySelector('.hero');
    hero.addEventListener('mouseenter', ()=>clearInterval(timer));
    hero.addEventListener('mouseleave', ()=>{ timer = setInterval(()=>go(cur+1), 5000); });
  }
}

function renderShowcase(){
  const items = (HOME_CATALOG.products||[]).filter(p=>p.showcase && !p.hidden);
  const sec = document.getElementById('showcase-sec');
  if(!items.length){ sec.classList.add('hidden'); return; }
  sec.classList.remove('hidden');
  document.getElementById('showcase-grid').innerHTML = items.map(p=>`
    <article class="product-card" data-id="${p.id}">
      <div class="photo">${p.badge?`<span class="badge">${p.badge}</span>`:''}<img src="${p.image_url}" alt="${p.image_alt||p.title}" loading="lazy"></div>
      <div class="body"><h3><a href="shop.html">${p.title}</a></h3><div class="price">${formatPrice(p.price)}</div></div>
    </article>`).join('');
}

function renderCollections(){
  const cats = (HOME_CATALOG.categories||[]).slice().sort((a,b)=>a.position-b.position);
  document.getElementById('collections-grid').innerHTML = cats.map(c=>`
    <a class="collection-card" href="shop.html?category=${c.id}">
      <img src="${c.image_url}" alt="${c.image_alt||c.name}" loading="lazy">
      <div class="info"><h3>${c.name}</h3><p>${c.description}</p></div>
    </a>`).join('');
}

function renderStudios(){
  const branches = HOME_BRANCHES.branches || [];
  document.getElementById('studios-list').innerHTML = branches.map(b=>`
    <div class="studio-card">
      <h3>${b.name}</h3>
      <div class="row"><b>Адрес:</b> ${b.address}</div>
      <div class="row"><b>Вход:</b> ${b.details}</div>
      <div class="row"><b>Часы:</b> ${b.hours}</div>
      <div class="row"><a href="tel:+79824184425">${b.phone}</a></div>
    </div>`).join('');
  const map = document.getElementById('studio-map');
  if(branches.length){
    const b = branches[0];
    map.innerHTML = `<iframe src="https://yandex.ru/map-widget/v1/?ll=${b.lng},${b.lat}&z=17&pt=${b.lng},${b.lat},pm2blm" loading="lazy" title="Студия «Хлоя» на карте"></iframe>
    <p style="margin:10px 0 0;font-size:.85rem;color:var(--text-muted)"><a href="https://yandex.ru/maps/org/khloya/34375427491/" target="_blank" rel="noopener">Открыть в Яндекс Картах ↗</a></p>`;
  }
}

document.addEventListener('DOMContentLoaded', ()=>{ if(document.getElementById('hero-track')) loadHome(); });
