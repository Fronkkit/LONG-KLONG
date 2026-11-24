import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

/* ------------------------------------------------------------------ *
 *  LONG-KLONG — Loy Krathong Online
 *  Static SPA + Supabase (Postgres + Realtime). No build step.
 * ------------------------------------------------------------------ */

const BASES = {
  leaf:  { name: 'ใบตอง',      c: '#2F8F6A' },
  bread: { name: 'ขนมปัง',     c: '#C98B4A' },
  coco:  { name: 'กาบมะพร้าว', c: '#8A5A3C' },
  lotus: { name: 'ดอกบัว',     c: '#E6A8C4' },
};
const FLOWERS = {
  rose:     { name: 'กุหลาบ',   c: '#F28DB2' },
  marigold: { name: 'ดาวเรือง', c: '#F4B860' },
  orchid:   { name: 'กล้วยไม้', c: '#B9A7F0' },
  jasmine:  { name: 'มะลิ',     c: '#F3F1E8' },
};
const AVATAR_COLORS = ['#F4B860', '#F28DB2', '#B9A7F0', '#6BD49B', '#7FC8F8', '#F3F1E8', '#FFB38A'];

/* ของที่ลอยไปกับกระทง (ไอคอนวาดเอง ไม่ใช้รูปจากภายนอก) */
const CHARMS = {
  pdf:    { label: 'งาน', svg: '<rect x="6" y="3" width="20" height="26" rx="2" fill="#F3F1E8"/><path d="M20 3v6h6z" fill="#C5CAE3"/><rect x="6" y="9" width="14" height="7" fill="#E0485A"/><text x="13" y="14.6" font-size="5.5" font-weight="700" fill="#fff" text-anchor="middle">PDF</text><text x="16" y="25" font-size="7" font-weight="700" fill="#1A1200" text-anchor="middle">งาน</text>' },
  zip:    { label: 'ส่งพรุ่งนี้', svg: '<rect x="6" y="3" width="20" height="26" rx="2" fill="#F4B860"/><path d="M15 3h2v2h-2zM17 5h2v2h-2zM15 7h2v2h-2zM17 9h2v2h-2z" fill="#1A1200"/><rect x="14" y="11" width="4" height="4" rx="1" fill="#1A1200"/><text x="16" y="21.5" font-size="5" font-weight="700" fill="#1A1200" text-anchor="middle">ส่ง</text><text x="16" y="27" font-size="5" font-weight="700" fill="#1A1200" text-anchor="middle">พรุ่งนี้</text>' },
  boss:   { label: 'หัวหน้างาน', svg: '<path d="M8 29v-8a8 8 0 0 1 16 0v8z" fill="#2A3463"/><path d="M16 14l-1.5 2 1.5 6 1.5-6z" fill="#E0485A"/><circle cx="16" cy="8" r="5" fill="#F3D2B3"/><path d="M11 7q5-6 10 0" fill="#1A1200"/><rect x="4" y="20" width="24" height="7" rx="2" fill="#F3F1E8"/><text x="16" y="25.4" font-size="5" font-weight="700" fill="#1A1200" text-anchor="middle">หัวหน้า</text>' },
  dog:    { label: 'น้องหมา', svg: '<path d="M7 7q-4 8 2 12l2-9zM25 7q4 8-2 12l-2-9z" fill="#8A5A3C"/><ellipse cx="16" cy="17" rx="9" ry="10" fill="#C98B4A"/><ellipse cx="16" cy="22" rx="5" ry="4" fill="#F3D2B3"/><circle cx="12.5" cy="15" r="1.4" fill="#1A1200"/><circle cx="19.5" cy="15" r="1.4" fill="#1A1200"/><ellipse cx="16" cy="20" rx="2" ry="1.4" fill="#1A1200"/>' },
  cat:    { label: 'น้องแมว', svg: '<path d="M6 5l4 8H5zM26 5l-4 8h5z" fill="#F4B860"/><ellipse cx="16" cy="18" rx="10" ry="9" fill="#F4B860"/><circle cx="12" cy="17" r="1.4" fill="#1A1200"/><circle cx="20" cy="17" r="1.4" fill="#1A1200"/><path d="M15 20h2l-1 1.2z" fill="#E0485A"/><path d="M3 19h6M3 22h6M23 19h6M23 22h6" stroke="#1A1200" stroke-width=".7"/>' },
  mail:   { label: 'อีเมลด่วน', svg: '<rect x="3" y="9" width="24" height="17" rx="2" fill="#F3F1E8"/><path d="M3 10l12 9 12-9" fill="none" stroke="#A3AACB" stroke-width="1.5"/><rect x="17" y="3" width="13" height="8" rx="2" fill="#E0485A"/><text x="23.5" y="9" font-size="5.5" font-weight="700" fill="#fff" text-anchor="middle">ด่วน</text>' },
  bill:   { label: 'บิลค่าไฟ', svg: '<path d="M8 3h16v26l-2.7-2-2.6 2-2.7-2-2.7 2-2.6-2L8 29z" fill="#F3F1E8"/><text x="16" y="11" font-size="5.5" font-weight="700" fill="#1A1200" text-anchor="middle">ค่าไฟ</text><path d="M11 15h10M11 19h10" stroke="#A3AACB"/><text x="16" y="25" font-size="5" font-weight="700" fill="#E0485A" text-anchor="middle">฿฿฿</text>' },
  bug:    { label: 'บั๊ก', svg: '<path d="M9 14l-4-2M9 19H4M9 24l-4 2M23 14l4-2M23 19h5M23 24l4 2M14 5l-2-3M18 5l2-3" stroke="#6BD49B" stroke-width="1.4" stroke-linecap="round"/><ellipse cx="16" cy="18" rx="7" ry="9" fill="#6BD49B"/><path d="M16 10v17" stroke="#1E2650" stroke-width="1.2"/><circle cx="16" cy="8" r="3.5" fill="#2F8F6A"/>' },
  ex:     { label: 'แฟนเก่า', svg: '<path d="M16 28C16 28 3 20 3 11a6.5 6.5 0 0 1 13-2a6.5 6.5 0 0 1 13 2c0 9-13 17-13 17z" fill="#F28DB2"/><path d="M16 9l-2.5 6 4 3-3 5 1.5 5" fill="none" stroke="#0B1026" stroke-width="1.6" stroke-linejoin="round"/>' },
  ot:     { label: 'OT', svg: '<circle cx="15" cy="18" r="11" fill="#F3F1E8" stroke="#E0485A" stroke-width="2"/><path d="M15 11v7l4 3" stroke="#1A1200" stroke-width="1.8" stroke-linecap="round" fill="none"/><rect x="18" y="2" width="12" height="8" rx="2" fill="#E0485A"/><text x="24" y="8.2" font-size="5.5" font-weight="700" fill="#fff" text-anchor="middle">OT</text>' },
  lazy:   { label: 'ความขี้เกียจ', svg: '<rect x="3" y="13" width="26" height="14" rx="6" fill="#B9A7F0"/><text x="8" y="12" font-size="6" font-weight="700" fill="#EEF0FA">z</text><text x="13" y="9" font-size="7" font-weight="700" fill="#EEF0FA">z</text><text x="19" y="7" font-size="8" font-weight="700" fill="#EEF0FA">Z</text>' },
  monday: { label: 'วันจันทร์', svg: '<rect x="5" y="6" width="22" height="22" rx="3" fill="#F3F1E8"/><rect x="5" y="6" width="22" height="7" rx="3" fill="#F4B860"/><path d="M10 3v6M22 3v6" stroke="#1A1200" stroke-width="2" stroke-linecap="round"/><text x="16" y="24" font-size="6.5" font-weight="700" fill="#1A1200" text-anchor="middle">จันทร์</text>' },
};
const MAX_CHARMS = 3;
function charmSVG(id, size = 20) {
  const c = CHARMS[id];
  return c ? `<svg class="charm-ico" width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true">${c.svg}</svg>` : '';
}
function charmIds(list) { return (list || []).filter((c) => CHARMS[c]).slice(0, MAX_CHARMS); }
function charmLabels(list) { return charmIds(list).map((c) => CHARMS[c].label); }

const SPEED = 12;          // px ต่อวินาที ที่กระทงลอยไปทางขวา
const CODE_RE = /^[A-Z0-9-]{4,20}$/;

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

const configured = SUPABASE_URL && !SUPABASE_URL.startsWith('YOUR_') && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.startsWith('YOUR_');
const sb = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const state = {
  me: safeGet('loy.name') || '',
  room: null,
  krathongs: [],            // sorted by created_at
  byId: new Map(),
  reactions: new Map(),     // krathong_id -> { fire, heart }
  seenReactions: new Set(),
  members: new Map(),       // name -> row
  online: new Set(),
  channel: null,
  selected: null,
  whoFilter: 'all',
  draft: { base: 'leaf', flower: 'rose', vis: 'room', tags: new Set(), charms: new Set() },
  els: new Map(),           // krathong_id -> element
  newIds: new Set(),
  raf: 0,
};

/* ---------------- utils ---------------- */
function safeGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } }
function hash(str) { let h = 2166136261; for (const ch of str) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function colorFor(name) { return AVATAR_COLORS[hash(name || '?') % AVATAR_COLORS.length]; }
function initial(name) { return [...(name || '?').trim()][0] || '?'; }
function clean(s, max = 40) { return (s || '').replace(/\s+/g, ' ').trim().slice(0, max); }
function timeOf(iso) { return new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }); }
function el(tag, props = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k === 'style') n.style.cssText = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid != null) n.append(kid);
  return n;
}
function avatar(name, extra = '') {
  return el('span', { class: `avatar ${extra}`, style: `background:${colorFor(name)}`, 'aria-hidden': 'true', text: initial(name) });
}
// SVG uses only colours from our fixed maps — never user text.
function krathongSVG(base, flower, w = 56) {
  const b = (BASES[base] || BASES.leaf).c;
  const f = (FLOWERS[flower] || FLOWERS.rose).c;
  const h = Math.round(w * 44 / 56);
  return `<svg width="${w}" height="${h}" viewBox="0 0 56 44" aria-hidden="true"><circle cx="28" cy="9" r="10" fill="#F4B860" fill-opacity="0.25"/><ellipse cx="28" cy="37" rx="25" ry="5.5" fill="${b}"/><path d="M7 35 Q13 21 19 35 Q23 17 28 35 Q33 17 37 35 Q43 21 49 35 Z" fill="${f}"/><rect x="26.5" y="13" width="3" height="13" rx="1.5" fill="#F7E7C6"/><path d="M28 4 Q32.5 9.5 28 13 Q23.5 9.5 28 4 Z" fill="#F4B860"><animate attributeName="opacity" values="1;.75;1" dur="1.6s" repeatCount="indefinite"/></path></svg>`;
}
function roomLink(code) { return `${location.origin}${location.pathname}#/r/${code}`; }
function lineShare(text) { return `https://line.me/R/share?text=${encodeURIComponent(text)}`; }
function thaiYear() { return new Date().getFullYear() + 543; }

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------------- sheets ---------------- */
let openSheetEl = null;
function openSheet(id) {
  closeSheet();
  openSheetEl = $(id);
  $('#backdrop').hidden = false;
  openSheetEl.hidden = false;
  const focusable = openSheetEl.querySelector('input, textarea, button:not([data-close])');
  focusable?.focus({ preventScroll: true });
}
function closeSheet() {
  if (!openSheetEl) return;
  if (openSheetEl.id === 'sheet-name' && !state.me) return; // ต้องมีชื่อก่อน
  openSheetEl.hidden = true;
  openSheetEl = null;
  $('#backdrop').hidden = true;
  state.selected = null;
}
$('#backdrop').addEventListener('click', closeSheet);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });
$$('[data-close]').forEach((b) => b.addEventListener('click', closeSheet));

/* ---------------- name ---------------- */
let nameResolver = null;
function ensureName() {
  if (state.me) return Promise.resolve(state.me);
  $('#my-name').value = '';
  openSheet('#sheet-name');
  return new Promise((res) => { nameResolver = res; });
}
$('#form-name').addEventListener('submit', (e) => {
  e.preventDefault();
  const n = clean($('#my-name').value);
  if (!n) return;
  state.me = n;
  safeSet('loy.name', n);
  closeSheet();
  nameResolver?.(n);
  nameResolver = null;
});

/* ---------------- routing ---------------- */
function route() {
  const m = location.hash.match(/^#\/r\/([A-Za-z0-9-]{4,20})$/);
  if (m) openRoom(m[1].toUpperCase());
  else showHome();
}
window.addEventListener('hashchange', route);

/* ---------------- home ---------------- */
let roomKind = 'couple';
function showHome() {
  leaveRoom();
  $('#view-room').hidden = true;
  $('#view-home').hidden = false;
  $('#home-date').textContent = `คืนวันเพ็ญ เดือนสิบสอง · ${thaiYear()}`;
  $('#config-warning').hidden = configured;
  document.title = 'LONG-KLONG — ลอยกระทงออนไลน์';
}
$$('.room-type[data-kind]').forEach((b) => b.addEventListener('click', () => {
  roomKind = b.dataset.kind;
  $$('.room-type[data-kind]').forEach((x) => {
    const on = x === b;
    x.classList.toggle('is-on', on);
    x.setAttribute('aria-checked', String(on));
  });
  if (roomKind === 'group' && $('#room-name').value === 'ห้องของเรา') $('#room-name').value = 'แก๊งลอยกระทง';
  if (roomKind === 'couple' && $('#room-name').value === 'แก๊งลอยกระทง') $('#room-name').value = 'ห้องของเรา';
}));

function randomCode() {
  const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const r = crypto.getRandomValues(new Uint32Array(4));
  return 'LOY-' + [...r].map((x) => A[x % A.length]).join('');
}
$('#btn-create').addEventListener('click', async () => {
  if (!sb) return toast('ยังไม่ได้ตั้งค่า Supabase ใน config.js');
  const btn = $('#btn-create');
  btn.disabled = true;
  try {
    const name = clean($('#room-name').value) || 'ห้องของเรา';
    for (let i = 0; i < 4; i++) {
      const code = randomCode();
      const { error } = await sb.from('rooms').insert({ code, name, kind: roomKind });
      if (!error) { location.hash = `#/r/${code}`; return; }
      if (error.code !== '23505') throw error; // 23505 = โค้ดซ้ำ ลองใหม่
    }
    throw new Error('สร้างโค้ดห้องไม่สำเร็จ');
  } catch (err) {
    console.error(err);
    toast('สร้างห้องไม่สำเร็จ ลองอีกครั้ง');
  } finally {
    btn.disabled = false;
  }
});
$('#form-join').addEventListener('submit', (e) => {
  e.preventDefault();
  let code = $('#join-code').value.trim().toUpperCase().replace(/\s+/g, '');
  if (/^[A-Z0-9]{4}$/.test(code)) code = 'LOY-' + code;
  if (!CODE_RE.test(code)) return toast('โค้ดห้องไม่ถูกต้อง');
  location.hash = `#/r/${code}`;
});

/* ---------------- room ---------------- */
async function openRoom(code) {
  if (!sb) { showHome(); return toast('ยังไม่ได้ตั้งค่า Supabase ใน config.js'); }
  if (state.room?.code === code) return;
  leaveRoom();
  $('#view-home').hidden = true;
  $('#view-room').hidden = false;
  $('#room-stats-text').textContent = 'กำลังเชื่อมต่อ…';

  const { data: room, error } = await sb.from('rooms').select('*').eq('code', code).maybeSingle();
  if (error || !room) {
    toast('ไม่พบห้องนี้ ลองเช็กโค้ดอีกครั้ง');
    location.hash = '#/';
    return;
  }
  state.room = room;
  $('#room-name-label').textContent = room.name;
  document.title = `${room.name} — LONG-KLONG`;
  $('#make-tie-wrap').hidden = false;

  await ensureName();
  if (state.room?.code !== code) return; // ผู้ใช้ออกไปแล้ว

  const [ks, rs, ms] = await Promise.all([
    sb.from('krathongs').select('*').eq('room_code', code).order('created_at').limit(500),
    sb.from('reactions').select('id, krathong_id, kind').eq('room_code', code).limit(5000),
    sb.from('members').select('*').eq('room_code', code).limit(500),
  ]);
  state.krathongs = [];
  state.byId.clear();
  (ks.data || []).forEach((k) => addKrathong(k, false));
  (rs.data || []).forEach((r) => applyReaction(r));
  (ms.data || []).forEach((m) => state.members.set(m.name, m));

  const mine = state.krathongs.some((k) => k.author === state.me);
  await upsertMember(mine ? 'floated' : 'joined');

  subscribe(code);
  renderAll();
  startLoop();
}

function leaveRoom() {
  if (state.channel) { sb?.removeChannel(state.channel); state.channel = null; }
  cancelAnimationFrame(state.raf);
  state.room = null;
  state.krathongs = [];
  state.byId.clear();
  state.reactions.clear();
  state.seenReactions.clear();
  state.members.clear();
  state.online.clear();
  state.els.forEach((n) => n.remove());
  state.els.clear();
  closeSheet();
}

async function upsertMember(status) {
  const row = { room_code: state.room.code, name: state.me, status, updated_at: new Date().toISOString() };
  const prev = state.members.get(state.me);
  if (prev?.status === 'floated' && status === 'joined') return;
  state.members.set(state.me, row);
  const { error } = await sb.from('members').upsert(row);
  if (error) console.warn('member upsert', error);
}

function subscribe(code) {
  const ch = sb.channel(`room-${code}`, { config: { presence: { key: state.me } } });
  ch.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'krathongs', filter: `room_code=eq.${code}` }, ({ new: k }) => {
    if (state.byId.has(k.id)) return;
    addKrathong(k, true);
    if (k.author !== state.me) toast(`${k.author} เพิ่งปล่อยกระทง`);
    renderAll();
  })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reactions', filter: `room_code=eq.${code}` }, ({ new: r }) => {
      applyReaction(r);
      if (state.selected === r.krathong_id) renderDetail();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'members', filter: `room_code=eq.${code}` }, ({ new: m }) => {
      if (m?.name) { state.members.set(m.name, m); renderHeader(); renderWho(); }
    })
    .on('presence', { event: 'sync' }, () => {
      state.online = new Set(Object.keys(ch.presenceState()));
      renderHeader();
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') await ch.track({ at: Date.now() });
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') $('#room-stats-text').textContent = 'การเชื่อมต่อสะดุด กำลังลองใหม่…';
    });
  state.channel = ch;
}

function addKrathong(k, isNew) {
  if (state.byId.has(k.id)) return;
  state.byId.set(k.id, k);
  state.krathongs.push(k);
  state.krathongs.sort((a, b) => a.created_at.localeCompare(b.created_at));
  if (isNew) state.newIds.add(k.id);
}
function applyReaction(r) {
  if (state.seenReactions.has(r.id)) return;
  state.seenReactions.add(r.id);
  const c = state.reactions.get(r.krathong_id) || { fire: 0, heart: 0 };
  c[r.kind] = (c[r.kind] || 0) + 1;
  state.reactions.set(r.krathong_id, c);
}

/* relations */
function partnerOf(k) {
  if (k.tied_to && state.byId.has(k.tied_to)) return state.byId.get(k.tied_to);
  return state.krathongs.find((x) => x.tied_to === k.id) || null;
}
function isTaken(k) { return !!partnerOf(k); }

/* ---------------- render ---------------- */
function renderAll() {
  renderHeader();
  renderRiver();
  renderWho();
}

function floatedNames() {
  const s = new Set();
  state.krathongs.forEach((k) => { s.add(k.author); if (k.for_name) s.add(k.for_name); });
  return s;
}

function renderHeader() {
  if (!state.room) return;
  const floated = floatedNames();
  const everyone = state.room.kind === 'public' ? floated : new Set([...state.members.keys(), ...floated]);
  const online = state.online.size;
  $('#room-stats-text').textContent = `สด · ลอยแล้ว ${floated.size} จาก ${everyone.size} คน${online ? ` · ออนไลน์ ${online}` : ''}`;
  const names = [...everyone].slice(0, 3);
  const box = $('#btn-who');
  box.replaceChildren(...names.map((n) => avatar(n)));
  if (everyone.size > 3) box.append(el('span', { class: 'avatar avatar-more', text: `+${everyone.size - 3}` }));
  const mine = state.krathongs.some((k) => k.author === state.me);
  $('#btn-make').textContent = mine ? 'ลอยอีกใบ' : 'ประดิษฐ์กระทง';
}

function renderRiver() {
  const box = $('#river-items');
  for (const k of state.krathongs) {
    if (state.els.has(k.id)) continue;
    const isMine = k.author === state.me;
    const b = el('button', {
      type: 'button',
      class: `kt${isMine ? ' is-mine' : ''}${state.newIds.has(k.id) ? ' is-new' : ''}`,
      'aria-label': `กระทงของ ${k.author}`,
      onclick: () => openDetail(k.id),
    });
    b.insertAdjacentHTML('beforeend', krathongSVG(k.base, k.flower));
    const cs = charmIds(k.charms);
    if (cs.length) b.insertAdjacentHTML('beforeend', `<span class="kt-charms">${cs.map((c) => charmSVG(c, 18)).join('')}</span>`);
    b.append(el('span', { class: 'kt-name', text: k.author }));
    if (k.tied_to && state.byId.has(k.tied_to)) b.prepend(el('span', { class: 'kt-string', 'aria-hidden': 'true' }));
    box.append(b);
    state.els.set(k.id, b);
  }
  state.newIds.clear();
  $('#river-empty').hidden = state.krathongs.length > 0;
}

function startLoop() {
  cancelAnimationFrame(state.raf);
  const river = $('#river');
  const tick = () => {
    const W = river.clientWidth;
    const H = river.clientHeight;
    const span = W + 160;
    const now = Date.now();
    for (const k of state.krathongs) {
      const n = state.els.get(k.id);
      if (!n) continue;
      const leader = k.tied_to && state.byId.has(k.tied_to) ? state.byId.get(k.tied_to) : k;
      const age = Math.max(0, (now - Date.parse(leader.created_at)) / 1000);
      const seed = hash(leader.id) % 1000;
      let x = ((age * SPEED) % span + span) % span - 80;
      if (leader !== k) x += 64;
      const lane = Number.isFinite(leader.lane) ? leader.lane : 0.5;
      const y = 20 + lane * Math.max(60, H - 120) + Math.sin(now / 900 + seed) * 3;
      n.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }
    state.raf = requestAnimationFrame(tick);
  };
  tick();
}

/* ---------------- detail ---------------- */
function openDetail(id) {
  state.selected = id;
  renderDetail();
  openSheet('#sheet-detail');
  state.selected = id; // openSheet->closeSheet clears it
}
function renderDetail() {
  const k = state.byId.get(state.selected);
  if (!k) return;
  const av = $('#detail-avatar');
  av.textContent = initial(k.author);
  av.style.background = colorFor(k.author);
  $('#detail-name').textContent = k.author;
  const base = BASES[k.base]?.name || '';
  $('#detail-meta').textContent = `ลอยเมื่อ ${timeOf(k.created_at)} · กระทง${base}`;

  const wishBox = $('#detail-wish');
  const localWish = safeGet(`loy.wish.${k.id}`);
  if (k.wish) { wishBox.textContent = k.wish; wishBox.classList.remove('is-hidden'); }
  else if (localWish) { wishBox.textContent = `${localWish}  (เห็นแค่คุณ)`; wishBox.classList.remove('is-hidden'); }
  else { wishBox.textContent = 'คำอธิษฐานส่วนตัว'; wishBox.classList.add('is-hidden'); }

  const tags = [];
  const p = partnerOf(k);
  if (p) tags.push(`ลอยคู่กับ ${p.author}`);
  if (k.for_name) tags.push(`ลอยให้ ${k.for_name}`);
  (k.tags || []).forEach((t) => tags.push(`@${t}`));
  const cl = charmLabels(k.charms);
  if (cl.length) tags.push(`ลอยไปด้วย: ${cl.join(', ')}`);
  $('#detail-tags').replaceChildren(...tags.map((t) => el('span', { class: 'chip-static', text: t })));

  const c = state.reactions.get(k.id) || { fire: 0, heart: 0 };
  $('#detail-fire').textContent = c.fire || 0;
  $('#detail-heart').textContent = c.heart || 0;

  const tieBtn = $('#btn-tie-this');
  const canTie = k.author !== state.me && !isTaken(k);
  tieBtn.hidden = !canTie;
}
$$('.react').forEach((b) => b.addEventListener('click', async () => {
  const k = state.byId.get(state.selected);
  if (!k) return;
  const kind = b.dataset.react;
  b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
  const { data, error } = await sb.from('reactions').insert({ room_code: state.room.code, krathong_id: k.id, kind }).select('id, krathong_id, kind').single();
  if (error) return toast('ส่งไม่สำเร็จ');
  applyReaction(data);
  renderDetail();
}));
$('#btn-tie-this').addEventListener('click', () => {
  const id = state.selected;
  openMake(id);
});

/* ---------------- make ---------------- */
function openMake(tieTo = null) {
  const d = state.draft;
  d.tags = new Set();
  d.charms = new Set();
  $('#make-wish').value = '';
  $('#make-tags').value = '';
  $('#make-for').value = '';
  renderMakeChoices();

  // ตัวเลือกผูกด้ายแดง: กระทงของคนอื่นที่ยังไม่มีคู่
  const sel = $('#make-tie');
  const options = state.krathongs.filter((k) => k.author !== state.me && !isTaken(k));
  sel.replaceChildren(
    el('option', { value: '', text: 'ไม่ผูก — ลอยเดี่ยว' }),
    ...options.map((k) => el('option', { value: k.id, text: `ผูกกับกระทงของ ${k.author} (${timeOf(k.created_at)})` })),
  );
  if (tieTo && options.some((k) => k.id === tieTo)) sel.value = tieTo;
  else if (state.room.kind === 'couple' && options.length === 1) sel.value = options[0].id;
  else sel.value = '';

  // แนะนำแท็กจากคนในห้อง
  const people = [...new Set([...state.members.keys(), ...state.krathongs.map((k) => k.author)])].filter((n) => n !== state.me);
  $('#make-tag-suggest').replaceChildren(...people.slice(0, 12).map((n) => {
    const c = el('button', { type: 'button', class: 'chip', 'aria-pressed': 'false', text: `@${n}` });
    c.addEventListener('click', () => {
      if (d.tags.has(n)) d.tags.delete(n); else d.tags.add(n);
      const on = d.tags.has(n);
      c.classList.toggle('is-on', on);
      c.setAttribute('aria-pressed', String(on));
    });
    return c;
  }));
  $('#make-tag-suggest').hidden = people.length === 0;
  openSheet('#sheet-make');
}
function renderMakeChoices() {
  const d = state.draft;
  $('#make-preview').innerHTML = krathongSVG(d.base, d.flower, 150) + (d.charms.size ? `<span class="preview-charms">${[...d.charms].map((c) => charmSVG(c, 40)).join('')}</span>` : '');
  $('#make-charms').replaceChildren(...Object.entries(CHARMS).map(([id, c]) => {
    const on = d.charms.has(id);
    const b = el('button', { type: 'button', class: `charm${on ? ' is-on' : ''}`, 'aria-pressed': String(on) });
    b.insertAdjacentHTML('beforeend', charmSVG(id, 34));
    b.append(el('span', { text: c.label }));
    b.addEventListener('click', () => {
      if (d.charms.has(id)) d.charms.delete(id);
      else if (d.charms.size >= MAX_CHARMS) return toast(`เลือกได้สูงสุด ${MAX_CHARMS} อย่าง`);
      else d.charms.add(id);
      renderMakeChoices();
    });
    return b;
  }));
  $('#make-bases').replaceChildren(...Object.entries(BASES).map(([id, b]) => {
    const c = el('button', { type: 'button', class: `chip${d.base === id ? ' is-on' : ''}`, 'aria-pressed': String(d.base === id), text: b.name });
    c.addEventListener('click', () => { d.base = id; renderMakeChoices(); });
    return c;
  }));
  $('#make-flowers').replaceChildren(...Object.entries(FLOWERS).map(([id, f]) => {
    const c = el('button', { type: 'button', class: `swatch${d.flower === id ? ' is-on' : ''}`, 'aria-pressed': String(d.flower === id) },
      el('span', { class: 'swatch-dot', style: `background:${f.c}` }), f.name);
    c.addEventListener('click', () => { d.flower = id; renderMakeChoices(); });
    return c;
  }));
}
$$('#sheet-make .seg button').forEach((b) => b.addEventListener('click', () => {
  state.draft.vis = b.dataset.vis;
  $$('#sheet-make .seg button').forEach((x) => {
    const on = x === b;
    x.classList.toggle('is-on', on);
    x.setAttribute('aria-checked', String(on));
  });
}));
$('#btn-make').addEventListener('click', () => openMake());

$('#form-make').addEventListener('submit', async (e) => {
  e.preventDefault();
  const d = state.draft;
  const btn = $('#btn-float');
  btn.disabled = true;
  btn.textContent = 'กำลังปล่อย…';
  try {
    const wish = ($('#make-wish').value || '').trim().slice(0, 200);
    const typed = $('#make-tags').value.split(/[\s,]+/).map((t) => clean(t.replace(/^@/, ''))).filter(Boolean);
    const tags = [...new Set([...d.tags, ...typed])].filter((t) => t !== state.me).slice(0, 20);
    const tie = $('#make-tie').value || null;
    const row = {
      room_code: state.room.code,
      author: state.me,
      base: d.base,
      flower: d.flower,
      wish: d.vis === 'room' && wish ? wish : null,
      tied_to: tie && state.byId.has(tie) && !isTaken(state.byId.get(tie)) ? tie : null,
      tags,
      charms: [...d.charms].filter((c) => CHARMS[c]).slice(0, MAX_CHARMS),
      for_name: clean($('#make-for').value) || null,
      lane: Math.round((0.08 + Math.random() * 0.84) * 1000) / 1000,
    };
    const { data, error } = await sb.from('krathongs').insert(row).select().single();
    if (error) throw error;
    if (d.vis === 'me' && wish) safeSet(`loy.wish.${data.id}`, wish);
    addKrathong(data, true);
    closeSheet();
    renderAll();
    await upsertMember('floated');
    toast(row.tied_to ? 'ปล่อยกระทงคู่แล้ว ผูกด้ายแดงเรียบร้อย' : 'ปล่อยกระทงแล้ว ทุกคนในห้องเห็นแล้ว');
  } catch (err) {
    console.error(err);
    toast('ปล่อยกระทงไม่สำเร็จ ลองอีกครั้ง');
  } finally {
    btn.disabled = false;
    btn.textContent = 'ปล่อยกระทง';
  }
});

/* ---------------- who ---------------- */
$('#btn-who').addEventListener('click', () => { renderWho(); openSheet('#sheet-who'); });
$$('#who-filters .chip').forEach((b) => b.addEventListener('click', () => {
  state.whoFilter = b.dataset.f;
  $$('#who-filters .chip').forEach((x) => {
    const on = x === b;
    x.classList.toggle('is-on', on);
    x.setAttribute('aria-selected', String(on));
  });
  renderWho();
}));

function renderWho() {
  if (!state.room) return;
  const floated = floatedNames();
  const everyone = state.room.kind === 'public' ? floated : new Set([...state.members.keys(), ...floated]);
  const total = Math.max(everyone.size, 1);
  const count = $('#who-count');
  count.replaceChildren(String(floated.size), el('small', { text: ` / ${everyone.size} คนลอยแล้ว` }));
  const bar = $('#who-progress');
  bar.setAttribute('aria-valuenow', floated.size);
  bar.setAttribute('aria-valuemax', everyone.size);
  bar.firstElementChild.style.width = `${(floated.size / total) * 100}%`;

  const f = state.whoFilter;
  const me = state.me;
  const rows = state.krathongs.filter((k) => {
    const p = partnerOf(k);
    if (f === 'me') return (k.tags || []).includes(me) || k.for_name === me || (p && p.author === me && k.author !== me);
    if (f === 'couple') return !!p;
    if (f === 'for') return !!k.for_name;
    return true;
  }).slice().reverse();

  const list = $('#who-list');
  if (!rows.length) list.replaceChildren(el('li', { class: 'empty', text: f === 'all' ? 'ยังไม่มีใครลอย — เป็นคนแรกเลย' : 'ยังไม่มีใครในหมวดนี้' }));
  else list.replaceChildren(...rows.map((k) => {
    const p = partnerOf(k);
    const bits = [];
    if (p) bits.push(`ลอยคู่กับ ${p.author}`);
    if (k.for_name) bits.push(`ลอยให้ ${k.for_name}`);
    if (k.tags?.length) bits.push(`ลอยกับ ${k.tags.map((t) => '@' + t).join(' ')}`);
    const cl = charmLabels(k.charms);
    if (cl.length) bits.push(`ลอย${cl.join(', ')}ไปด้วย`);
    const badge = p ? ['ลอยคู่', 'badge badge-couple'] : k.for_name ? ['ลอยให้', 'badge badge-for'] : k.tags?.length ? ['แท็ก', 'badge'] : null;
    const li = el('li', { class: 'who-item' },
      avatar(k.author),
      el('div', { class: 'who-main' },
        el('div', { class: 'who-name', text: k.author === me ? `${k.author} (คุณ)` : k.author }),
        bits.length ? el('div', { class: 'who-sub', text: bits.join(' · ') }) : null),
      el('div', { class: 'who-side' }, el('span', { text: timeOf(k.created_at) }), badge ? el('span', { class: badge[1], text: badge[0] }) : null));
    li.style.cursor = 'pointer';
    li.addEventListener('click', () => openDetail(k.id));
    return li;
  }));

  const pending = state.room.kind === 'public' ? [] : [...state.members.keys()].filter((n) => !floated.has(n));
  $('#who-pending-wrap').hidden = pending.length === 0;
  $('#who-pending-title').textContent = `ยังไม่ลอย ${pending.length} คน`;
  const link = roomLink(state.room.code);
  $('#who-pending').replaceChildren(...pending.map((n) => el('li', { class: 'who-item who-pending' },
    avatar(n),
    el('div', { class: 'who-main' }, el('div', { class: 'who-name', text: n === me ? `${n} (คุณ)` : n }), el('div', { class: 'muted', style: 'margin:0', text: 'อยู่ในห้องแล้ว แต่ยังไม่ปล่อยกระทง' })),
    n === me ? null : el('a', { class: 'nudge', href: lineShare(`${n} มาลอยกระทงด้วยกัน รออยู่นะ ${link}`), target: '_blank', rel: 'noopener', text: 'สะกิด' }),
  )));
}

/* ---------------- invite ---------------- */
$('#btn-invite').addEventListener('click', () => {
  const code = state.room.code;
  const link = roomLink(code);
  const text = state.room.kind === 'couple'
    ? `มาลอยกระทงคู่กันนะ ผูกด้ายแดงไว้แล้ว ${link}`
    : `มาลอยกระทงด้วยกันใน "${state.room.name}" ${link}`;
  $('#invite-code').textContent = code;
  $('#invite-qr').src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=0&data=${encodeURIComponent(link)}`;
  $('#invite-line').href = lineShare(text);
  $('#invite-share').hidden = !navigator.share;
  $('#invite-share').onclick = () => navigator.share({ title: 'LONG-KLONG', text, url: link }).catch(() => {});
  $('#invite-copy').onclick = async () => {
    try { await navigator.clipboard.writeText(link); toast('คัดลอกลิงก์แล้ว'); }
    catch { prompt('คัดลอกลิงก์นี้', link); }
  };
  openSheet('#sheet-invite');
});

/* ---------------- memory card ---------------- */
$('#btn-memory').addEventListener('click', () => {
  const me = state.me;
  const mine = [...state.krathongs].reverse().find((k) => k.author === me);
  const partner = mine ? partnerOf(mine) : null;
  $('#memory-year').textContent = `ลอยกระทง ${thaiYear()}`;
  const kt = $('#memory-krathongs');
  kt.innerHTML = '';
  if (mine) kt.insertAdjacentHTML('beforeend', krathongSVG(mine.base, mine.flower, 72) + charmIds(mine.charms).map((c) => charmSVG(c, 26)).join(''));
  if (partner) {
    kt.append(el('span', { class: 'tie' }));
    kt.insertAdjacentHTML('beforeend', krathongSVG(partner.base, partner.flower, 72));
  }
  if (!mine) kt.insertAdjacentHTML('beforeend', krathongSVG('leaf', 'rose', 72));
  $('#memory-names').textContent = partner ? `${me} & ${partner.author}` : me;
  const others = [...floatedNames()].filter((n) => n !== me && n !== partner?.author).length;
  $('#memory-others').textContent = others ? `และอีก ${others} คนลอยด้วยกันคืนนี้` : 'คืนวันเพ็ญ เดือนสิบสอง';
  $('#memory-room').textContent = state.room.name;
  openSheet('#sheet-memory');
});
$('#btn-save-card').addEventListener('click', async () => {
  const btn = $('#btn-save-card');
  btn.disabled = true;
  try {
    const { default: html2canvas } = await import('https://esm.sh/html2canvas@1.4.1');
    await document.fonts?.ready;
    const canvas = await html2canvas($('#memory-card'), { backgroundColor: '#0B1026', scale: 3 });
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
    const file = new File([blob], `LONG-KLONG-${thaiYear()}.png`, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'LONG-KLONG' }).catch(() => {});
    } else {
      const a = el('a', { href: URL.createObjectURL(blob), download: file.name });
      document.body.append(a); a.click(); a.remove();
      toast('บันทึกรูปแล้ว');
    }
  } catch (err) {
    console.error(err);
    toast('บันทึกไม่สำเร็จ — แคปหน้าจอการ์ดได้เลย');
  } finally {
    btn.disabled = false;
  }
});
$('#btn-share-card').addEventListener('click', () => $('#btn-invite').click());

/* ---------------- boot ---------------- */
route();
