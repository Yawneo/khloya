/* Проверка: все пути картинок из api.js (MOCK_DB) и mock/*.json существуют,
   формат/пропорции файлов соответствуют слоту. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// --- 1. api.js -> MOCK_DB
const code = read('js/api.js') + '\n;globalThis.__DB = { site: MOCK_DB.site, catalog: MOCK_DB.catalog };';
const sandbox = { sessionStorage: { setItem() {}, getItem: () => null }, console };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const db = sandbox.__DB;

// --- 2. mock/*.json
const mockCatalog = JSON.parse(read('mock/catalog.json'));
const mockSite = JSON.parse(read('mock/site.json'));

// --- 3. jpeg size reader (без зависимостей)
function jpegSize(file) {
  const buf = fs.readFileSync(file);
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return null;
}

const expected = { hero: 2.2, collection: 1.6, product: 4 / 3, offers: 16 / 9 };
const problems = [];
const seen = new Set();

function check(url, slot, label) {
  if (!url) { problems.push(`${label}: пустой URL`); return; }
  const abs = path.join(ROOT, url);
  if (!fs.existsSync(abs)) { problems.push(`${label}: нет файла ${url}`); return; }
  const size = jpegSize(abs);
  if (!size) { problems.push(`${label}: не JPEG ${url}`); return; }
  const ratio = size.w / size.h;
  const want = expected[slot];
  if (want && Math.abs(ratio - want) / want > 0.02) {
    problems.push(`${label}: пропорции ${size.w}x${size.h} = ${ratio.toFixed(2)}, ждали ~${want.toFixed(2)}`);
  }
  seen.add(url);
  return `${size.w}x${size.h}`;
}

const report = [];
db.site.hero_slides.forEach((s, i) => report.push(`hero[${i}] ${s.image_url} -> ${check(s.image_url, 'hero', `hero[${i}]`)}`));
report.push(`offers ${db.site.offers_image_url} -> ${check(db.site.offers_image_url, 'offers', 'offers')}`);
db.catalog.categories.forEach((c) => report.push(`cat ${c.id} -> ${check(c.image_url, 'collection', `cat ${c.id}`)}`));
db.catalog.products.forEach((p) => report.push(`p ${p.id} -> ${check(p.image_url, 'product', `product ${p.id}`)}`));

// mock/*.json — те же имена, что в api.js
for (const c of mockCatalog.categories) {
  if (!db.catalog.categories.find((x) => x.id === c.id && x.image_url === c.image_url)) problems.push(`mock cat ${c.id} расходится с api.js`);
}
for (const p of mockCatalog.products) {
  const a = db.catalog.products.find((x) => x.id === p.id);
  if (!a) { problems.push(`mock product ${p.id} отсутствует в api.js`); continue; }
  if (a.image_url !== p.image_url) problems.push(`mock ${p.id}: image_url ${p.image_url} != ${a.image_url}`);
  if (a.image_thumb_url !== p.image_thumb_url) problems.push(`mock ${p.id}: image_thumb_url расходится`);
  if (a.image_alt !== p.image_alt) problems.push(`mock ${p.id}: image_alt расходится`);
}
mockSite.hero_slides.forEach((s, i) => {
  if (db.site.hero_slides[i]?.image_url !== s.image_url) problems.push(`mock hero[${i}] расходится с api.js`);
});

console.log(report.join('\n'));
console.log(`\nуникальных файлов: ${seen.size}`);
console.log(problems.length ? `\nПРОБЛЕМЫ (${problems.length}):\n- ` + problems.join('\n- ') : '\nOK: проблем нет');
process.exit(problems.length ? 1 : 0);
