/* Скачивание всех фото организации с Яндекс Карт.
   Использование: node tools/photos/fetch_photos.mjs
   Результат: _tmp_photos/raw/pNN.jpg (по одному файлу на фото, порядок как на карте). */
import fs from 'node:fs/promises';

const ORG = '34375427491';            // permalink организации «Хлоя», Сургут
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const PAGE = `https://yandex.ru/maps/org/khloya/${ORG}/gallery/`;
const RAW_DIR = new URL('../../_tmp_photos/raw/', import.meta.url);

/* DJB2-хеш строки запроса — так же считается параметр s в бандле карт. */
function hash(s) {
  let n = 5381;
  for (let i = 0; i < s.length; i++) n = (Math.imul(33, n) ^ s.charCodeAt(i)) >>> 0;
  return String(n >>> 0);
}

function encodeQs(obj) {
  return Object.keys(obj)
    .filter((k) => obj[k] !== undefined && obj[k] !== null)
    .sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`)
    .join('&');
}

const jar = new Map();
function absorb(res) {
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const [pair] = c.split(';');
    const eq = pair.indexOf('=');
    if (eq > 0) jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
  }
}
const cookie = () => [...jar].map(([k, v]) => `${k}=${v}`).join('; ');

// 1. Страница галереи: сессионные cookies, sessionId и csrfToken
const page = await fetch(PAGE, { headers: { 'User-Agent': UA, Accept: 'text/html' } });
absorb(page);
const html = await page.text();
const sessionId = html.match(/"sessionId":"([^"]+)"/)?.[1];
if (!sessionId) throw new Error('не нашёл sessionId в разметке — вёрстка карт изменилась');

// 2. Внутренний API фото: первый вызов отдаёт csrf-токен, второй — данные
async function callPhotos(token) {
  const params = { csrfToken: token, sessionId, host_config: '{}', ajax: '1', lang: 'ru_RU', id: ORG };
  const qs = encodeQs(params);
  const res = await fetch(`https://yandex.ru/maps/api/photos/getByBusinessId?${qs}&s=${hash(qs)}`, {
    headers: {
      'User-Agent': UA,
      Accept: 'application/json, text/plain, */*',
      Referer: PAGE,
      'X-Retpath-Y': PAGE,
      Cookie: cookie(),
    },
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

let { status, body } = await callPhotos(undefined);
if (status !== 200) throw new Error(`API вернул ${status}: ${JSON.stringify(body)}`);
if (body?.csrfToken) ({ status, body } = await callPhotos(body.csrfToken));
if (!Array.isArray(body?.data)) throw new Error('API не отдал список фото');

console.log(`фото в карточке: ${body.data.length}`);

// 3. Скачивание в размере XXXL (максимум, что отдаёт CDN, обычно 960–1280 px)
await fs.mkdir(RAW_DIR, { recursive: true });
let ok = 0;
for (const [i, photo] of body.data.entries()) {
  const url = photo.url.replace(/\/(?:XXXL|XXL|orig|[A-Za-z_]+)$/, '/XXXL');
  const res = await fetch(url, { headers: { 'User-Agent': UA, Referer: 'https://yandex.ru/maps/' } });
  if (!res.ok) { console.warn(`  p${i}: HTTP ${res.status}`); continue; }
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(new URL(`p${String(i).padStart(2, '0')}.jpg`, RAW_DIR), buf);
  ok++;
}
console.log(`скачано в _tmp_photos/raw: ${ok}`);
