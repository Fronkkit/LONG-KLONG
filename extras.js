import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

/* ------------------------------------------------------------------ *
 *  LONG-KLONG extras: ดนตรีวันลอยกระทง · พลุ (realtime) · ซุ้มงานวัด
 *  Standalone module — app.js ไม่ต้องแก้
 * ------------------------------------------------------------------ */

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
const $ = (s, el = document) => el.querySelector(s);
const myName = () => (safeGet('loy.name') || 'ผู้มาเยือน').slice(0, 40);
const roomCode = () => (location.hash.match(/^#\/r\/([A-Za-z0-9-]{4,20})$/) || [])[1]?.toUpperCase() || null;
function safeGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } }
function h(tag, props = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k === 'style') n.style.cssText = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  kids.flat().forEach((c) => c != null && n.append(c));
  return n;
}
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ============================ styles ============================ */
document.head.append(h('style', { text: `
.fx-music{width:44px;height:44px;flex:none;border-radius:12px;border:1.5px solid var(--line);background:var(--surface);color:var(--text-2);display:inline-flex;align-items:center;justify-content:center}
.fx-music[aria-pressed="true"]{border-color:var(--gold);color:var(--gold)}
.fx-music[aria-pressed="true"] svg{animation:fxbob 1.2s ease-in-out infinite}
@keyframes fxbob{50%{transform:translateY(-2px) rotate(-6deg)}}
.home .fx-music{position:absolute;left:16px;top:14px;z-index:2}
.fx-canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3}
.fx-fabs{position:absolute;right:10px;top:10px;display:flex;flex-direction:column;gap:8px;z-index:4}
.fx-fab{min-width:64px;min-height:56px;padding:6px 10px;border-radius:16px;border:1.5px solid var(--line);background:rgba(11,16,38,.82);color:var(--text);font-size:12px;font-weight:600;display:flex;flex-direction:column;align-items:center;gap:2px;backdrop-filter:blur(6px)}
.fx-fab.gold{border-color:var(--gold);color:var(--gold)}
.fx-fab.pink{border-color:var(--pink);color:#F7C6D9}
.fx-modal{position:fixed;inset:0;z-index:30;background:rgba(5,8,20,.72);display:flex;align-items:flex-end;justify-content:center}
.fx-panel{width:100%;max-width:560px;max-height:92dvh;overflow-y:auto;background:var(--surface);border-radius:24px 24px 0 0;border-top:1px solid var(--line);padding:14px 18px calc(22px + var(--safe-b));display:flex;flex-direction:column;gap:14px;animation:up .22s ease-out}
.fx-head{display:flex;align-items:center;gap:8px}
.fx-head h2{margin:0;font-size:19px;flex:1}
.fx-booths{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.fx-booth{display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 6px 12px;border-radius:18px;border:1.5px solid var(--line);background:var(--bg);color:var(--text);font-size:14px;font-weight:600;position:relative;overflow:hidden}
.fx-booth::before{content:'';position:absolute;left:0;right:0;top:0;height:10px;background:repeating-linear-gradient(90deg,#E0485A 0 14px,#F7E7C6 14px 28px)}
.fx-booth span.sub{font-size:11px;color:var(--muted);font-weight:500}
.fx-board{background:var(--bg);border:1px solid var(--line);border-radius:16px;padding:12px 14px}
.fx-board h3{margin:0 0 8px;font-size:15px}
.fx-board ol{margin:0;padding-left:22px;display:flex;flex-direction:column;gap:4px;font-size:14px}
.fx-board li span{color:var(--gold);font-weight:700;margin-left:6px}
.fx-del{margin-left:8px;min-height:32px;padding:0 10px;border-radius:10px;border:1px solid #E0485A;background:transparent;color:#FF9AA8;font-size:12px;font-weight:600}
.fx-cols{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.fx-arena{position:relative;height:min(380px,52dvh);border-radius:18px;background:var(--river);border:1px solid var(--line);overflow:hidden;touch-action:manipulation;user-select:none}
.fx-hud{display:flex;justify-content:space-between;align-items:center;font-size:15px;font-weight:700}
.fx-hud .big{font-size:24px;color:var(--gold)}
.fx-balloon{position:absolute;left:0;top:0;width:58px;height:74px;pointer-events:none;will-change:transform}
.fx-balloon svg{display:block}
.fx-balloon.pop svg{transform:scale(1.5);opacity:0;transition:transform .15s,opacity .15s}
.fx-arena[role=application]{touch-action:none;-webkit-user-select:none;-webkit-touch-callout:none}
.fx-ring-track{position:absolute;left:16px;right:16px;bottom:120px;height:70px}
.fx-bottle{position:absolute;bottom:0;width:22px;height:64px;transform:translateX(-50%);border-radius:8px 8px 4px 4px;background:linear-gradient(#6BD49B,#2F8F6A)}
.fx-bottle::before{content:'';position:absolute;left:6px;top:-14px;width:10px;height:16px;border-radius:3px;background:#2F8F6A}
.fx-marker{position:absolute;bottom:80px;width:44px;height:14px;margin-left:-22px;border-radius:50%;border:4px solid var(--gold);box-sizing:border-box}
.fx-marker.throw{transition:bottom .35s ease-in,transform .35s;bottom:4px;transform:scale(.7)}
.fx-stars{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;padding:14px}
.fx-star{aspect-ratio:1;border-radius:16px;border:1.5px solid var(--line);background:#121A44;color:var(--gold);font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;text-align:center;padding:4px}
.fx-star:disabled{cursor:default}
.fx-star.won{background:var(--pink-soft);border-color:var(--pink);color:#F7C6D9}
.fx-result{text-align:center;display:flex;flex-direction:column;gap:6px;align-items:center}
.fx-result .score{font-size:44px;font-weight:700;color:var(--gold);line-height:1.1}
` }));

const ICON = {
  note: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5l11-2v13" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="6.5" cy="18" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="16" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  spark: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v5M12 17v5M2 12h5M17 12h5M4.9 4.9l3.5 3.5M15.6 15.6l3.5 3.5M4.9 19.1l3.5-3.5M15.6 8.4l3.5-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  tent: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20h18M5 20V10l7-6 7 6v10M9 20v-6h6v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  close: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
};

/* ============================ ดนตรี ============================ *
 * ทำนองแต่งใหม่ด้วย Web Audio (บันไดเสียงเพนทาโทนิกแบบไทย)
 * เสียงระนาด + ฉิ่ง-ฉับ + กลองตะโพน วนลูปเบา ๆ ไม่ใช้ไฟล์เพลง        */
const Music = (() => {
  let ctx, master, timer, nextTime = 0, step = 0;
  const BPM = 100, EIGHTH = 60 / BPM / 2;
  const N = { C4: 261.63, D4: 293.66, E4: 329.63, G4: 392, A4: 440, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A3: 220, G3: 196 };
  // 8 ห้อง x 8 จังหวะ (null = พัก)
  const MEL = [
    'E5','D5','C5','A4','G4',null,'A4','C5',
    'D5',null,'E5','D5','C5',null,'A4',null,
    'G4','A4','C5','D5','E5','G5','E5','D5',
    'C5',null,'A4',null,'C5',null,null,null,
    'A4','C5','A4','G4','E4',null,'G4','A4',
    'C5','D5','C5','A4','G4',null,null,null,
    'E4','G4','A4','C5','D5','C5','A4','G4',
    'E4',null,'D4',null,'C4',null,null,null,
  ];
  const BASS = ['C4','G3','A3','G3','A3','C4','A3','C4'];
  function ranat(t, f, vel = 0.5) {
    for (const [mult, type, g] of [[1, 'triangle', 1], [2.01, 'sine', 0.35], [4.2, 'sine', 0.08]]) {
      const o = ctx.createOscillator(), a = ctx.createGain();
      o.type = type; o.frequency.value = f * mult;
      a.gain.setValueAtTime(0, t);
      a.gain.linearRampToValueAtTime(vel * g, t + 0.005);
      a.gain.exponentialRampToValueAtTime(0.0008, t + 0.55);
      o.connect(a).connect(master); o.start(t); o.stop(t + 0.6);
    }
  }
  function noise(t, dur, freq, q, vel) {
    const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), a = ctx.createGain();
    s.buffer = buf; bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q;
    a.gain.value = vel;
    s.connect(bp).connect(a).connect(master); s.start(t);
  }
  function ching(t, open) {
    const o = ctx.createOscillator(), a = ctx.createGain();
    o.type = 'sine'; o.frequency.value = open ? 2730 : 2400;
    a.gain.setValueAtTime(open ? 0.12 : 0.08, t);
    a.gain.exponentialRampToValueAtTime(0.0008, t + (open ? 0.9 : 0.08));
    o.connect(a).connect(master); o.start(t); o.stop(t + 1);
    noise(t, open ? 0.12 : 0.05, 6000, 2, open ? 0.08 : 0.12);
  }
  function drum(t, low) {
    const o = ctx.createOscillator(), a = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(low ? 110 : 170, t);
    o.frequency.exponentialRampToValueAtTime(low ? 55 : 120, t + 0.18);
    a.gain.setValueAtTime(low ? 0.55 : 0.3, t);
    a.gain.exponentialRampToValueAtTime(0.0008, t + 0.3);
    o.connect(a).connect(master); o.start(t); o.stop(t + 0.35);
  }
  function bass(t, f) {
    const o = ctx.createOscillator(), a = ctx.createGain();
    o.type = 'sine'; o.frequency.value = f / 2;
    a.gain.setValueAtTime(0.0001, t);
    a.gain.linearRampToValueAtTime(0.22, t + 0.02);
    a.gain.exponentialRampToValueAtTime(0.0008, t + EIGHTH * 7);
    o.connect(a).connect(master); o.start(t); o.stop(t + EIGHTH * 8);
  }
  function schedule() {
    while (nextTime < ctx.currentTime + 0.25) {
      const i = step % MEL.length, beat = step % 8;
      const n = MEL[i];
      if (n) ranat(nextTime, N[n], beat % 2 ? 0.32 : 0.45);
      if (step % 4 === 3 && n) ranat(nextTime + EIGHTH / 2, N[n] * 2, 0.12); // ตีกรอ
      if (beat === 0) bass(nextTime, N[BASS[Math.floor(i / 8)]]);
      if (beat === 2) ching(nextTime, true);   // ฉิ่ง
      if (beat === 6) ching(nextTime, false);  // ฉับ
      if (beat === 0 || beat === 5) drum(nextTime, true);
      if (beat === 3) drum(nextTime, false);
      nextTime += EIGHTH * (beat % 2 ? 0.92 : 1.08); // จังหวะหน่วงนิด ๆ ให้ฟังเป็นไทย
      step++;
    }
  }
  return {
    get on() { return !!timer; },
    start() {
      if (timer) return;
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      ctx.resume();
      master = ctx.createGain();
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 1.5);
      const comp = ctx.createDynamicsCompressor();
      master.connect(comp).connect(ctx.destination);
      nextTime = ctx.currentTime + 0.1; step = 0;
      timer = setInterval(schedule, 80);
    },
    stop() {
      if (!timer) return;
      clearInterval(timer); timer = null;
      const m = master;
      m.gain.cancelScheduledValues(ctx.currentTime);
      m.gain.setValueAtTime(m.gain.value, ctx.currentTime);
      m.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      setTimeout(() => m.disconnect(), 700);
    },
    blip(f = 880) { // เสียงเอฟเฟกต์เกม
      if (!ctx) return;
      const o = ctx.createOscillator(), a = ctx.createGain();
      o.frequency.value = f; a.gain.setValueAtTime(0.15, ctx.currentTime);
      a.gain.exponentialRampToValueAtTime(0.0008, ctx.currentTime + 0.15);
      o.connect(a).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.2);
    },
    boom() {
      if (!ctx || !timer) return;
      const t = ctx.currentTime + 0.9;
      noise(t, 0.5, 400, 0.7, 0.5);
    },
  };
})();

const musicButtons = [];
function setMusic(on) {
  if (on) Music.start(); else Music.stop();
  safeSet('loy.music', on ? 'on' : 'off');
  musicButtons.forEach((b) => {
    b.setAttribute('aria-pressed', String(on));
    b.setAttribute('aria-label', on ? 'ปิดเพลงลอยกระทง' : 'เปิดเพลงลอยกระทง');
  });
  if (on) toast('เปิดเพลงแล้ว');
}
function musicButton() {
  const b = h('button', { type: 'button', class: 'fx-music', 'aria-pressed': 'false', 'aria-label': 'เปิดเพลงลอยกระทง', onclick: () => setMusic(!Music.on) });
  b.innerHTML = ICON.note;
  musicButtons.push(b);
  return b;
}
$('#view-home')?.prepend(musicButton());
$('.room-head')?.insertBefore(musicButton(), $('#btn-who'));
// เคยเปิดเพลงไว้ → เริ่มเล่นเมื่อแตะหน้าจอครั้งแรก (เบราว์เซอร์ไม่ให้เล่นเองก่อนแตะ)
if (safeGet('loy.music') === 'on') {
  document.addEventListener('pointerdown', function once(e) {
    document.removeEventListener('pointerdown', once);
    if (!e.target.closest('.fx-music')) setMusic(true);
  });
}

/* ============================ พลุ ============================ */
const river = $('#river');
const canvas = h('canvas', { class: 'fx-canvas', 'aria-hidden': 'true' });
river?.append(canvas);
const g = canvas.getContext('2d');
const parts = [];
let fxRaf = 0;

function resize() {
  const r = river.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, r.width * dpr);
  canvas.height = Math.max(1, r.height * dpr);
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);

function launch(relX, hue, label) {
  if (!river || river.offsetParent === null) return;
  resize();
  const W = canvas.clientWidth, H = canvas.clientHeight;
  const x = 30 + relX * (W - 60);
  const ty = H * (0.12 + Math.random() * 0.25);
  parts.push({ kind: 'rocket', x, y: H, vy: -Math.sqrt(2 * 0.12 * (H - ty)) * 1.0, ty, hue, label });
  Music.boom();
  if (!fxRaf) fxRaf = requestAnimationFrame(tick);
}
function burst(x, y, hue) {
  const n = 70, kind = Math.random() < 0.35 ? 'ring' : 'peony';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.1;
    const sp = kind === 'ring' ? 3.2 : 1 + Math.random() * 3.2;
    parts.push({ kind: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, hue: hue + (Math.random() * 30 - 15), decay: 0.012 + Math.random() * 0.01 });
  }
  parts.push({ kind: 'flash', x, y, life: 1 });
}
function tick() {
  const W = canvas.clientWidth, H = canvas.clientHeight;
  g.globalCompositeOperation = 'source-over';
  g.clearRect(0, 0, W, H);
  g.globalCompositeOperation = 'lighter';
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    if (p.kind === 'rocket') {
      p.y += p.vy; p.vy += 0.12;
      g.fillStyle = `hsl(${p.hue} 100% 75%)`;
      g.fillRect(p.x - 1.5, p.y, 3, 8);
      if (p.vy >= 0 || p.y <= p.ty) {
        burst(p.x, p.y, p.hue);
        if (p.label) parts.push({ kind: 'label', x: p.x, y: p.y + 26, text: p.label, life: 1 });
        parts.splice(i, 1);
      }
    } else if (p.kind === 'spark') {
      p.x += p.vx; p.y += p.vy; p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.035; p.life -= p.decay;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      g.fillStyle = `hsla(${p.hue} 100% ${55 + p.life * 25}% / ${p.life})`;
      g.beginPath(); g.arc(p.x, p.y, 1.6 + p.life, 0, 7); g.fill();
      // เงาสะท้อนบนน้ำ
      if (p.y < H * 0.5) { g.fillStyle = `hsla(${p.hue} 100% 60% / ${p.life * 0.12})`; g.fillRect(p.x, H - p.y * 0.35, 1.5, 3); }
    } else if (p.kind === 'flash') {
      p.life -= 0.08;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, 60);
      gr.addColorStop(0, `rgba(255,240,200,${p.life * 0.5})`); gr.addColorStop(1, 'rgba(255,240,200,0)');
      g.fillStyle = gr; g.fillRect(p.x - 60, p.y - 60, 120, 120);
    } else if (p.kind === 'label') {
      p.life -= 0.01;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      g.globalCompositeOperation = 'source-over';
      g.font = '600 12px Anuphan, sans-serif'; g.textAlign = 'center';
      g.fillStyle = `rgba(238,240,250,${p.life})`;
      g.fillText(p.text, p.x, p.y);
      g.globalCompositeOperation = 'lighter';
    }
  }
  fxRaf = parts.length ? requestAnimationFrame(tick) : 0;
  if (!fxRaf) g.clearRect(0, 0, W, H);
}

/* realtime: ทุกคนในห้องเห็นพลุของกันและกัน (broadcast ไม่ลงฐานข้อมูล) */
let fxChannel = null, fxCode = null, ambient = 0;
function joinFx() {
  const code = roomCode();
  if (code === fxCode) return;
  if (fxChannel) { sb.removeChannel(fxChannel); fxChannel = null; }
  clearInterval(ambient);
  fxCode = code;
  if (!code) return;
  fxChannel = sb.channel(`fx-${code}`, { config: { broadcast: { self: false } } })
    .on('broadcast', { event: 'fw' }, ({ payload: p }) => {
      if (typeof p?.x !== 'number') return;
      launch(Math.min(1, Math.max(0, p.x)), Number(p.hue) || 40, String(p.by || '').slice(0, 20));
    })
    .on('broadcast', { event: 'game' }, ({ payload: p }) => {
      if (p?.text) toast(String(p.text).slice(0, 80));
    })
    .subscribe();
  // แม่น้ำสาธารณะ: มีพลุประกอบฉากเป็นระยะ
  if (code === 'PUBLIC') ambient = setInterval(() => { if (!document.hidden) launch(Math.random(), Math.random() * 360, ''); }, 14000);
}
function sendFx(event, payload) { fxChannel?.send({ type: 'broadcast', event, payload }); }

let lastFw = 0;
function fireFirework() {
  const now = Date.now();
  if (now - lastFw < 1200) return;
  lastFw = now;
  const x = 0.1 + Math.random() * 0.8, hue = Math.floor(Math.random() * 360);
  launch(x, hue, myName());
  sendFx('fw', { x, hue, by: myName() });
}

/* ปุ่มลอยบนแม่น้ำ */
if (river) {
  const fw = h('button', { type: 'button', class: 'fx-fab gold', onclick: fireFirework, 'aria-label': 'จุดพลุ ทุกคนในห้องจะเห็น' });
  fw.innerHTML = ICON.spark; fw.append('จุดพลุ');
  const fair = h('button', { type: 'button', class: 'fx-fab pink', onclick: openFair, 'aria-label': 'เปิดซุ้มงานวัด' });
  fair.innerHTML = ICON.tent; fair.append('งานวัด');
  river.append(h('div', { class: 'fx-fabs' }, fw, fair));
}

/* ============================ ซุ้มงานวัด ============================ */
let modal = null, cleanup = null;
function openModal(title, body) {
  closeModal();
  const close = h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'ปิด', onclick: closeModal });
  close.innerHTML = ICON.close;
  modal = h('div', { class: 'fx-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': title, onclick: (e) => { if (e.target === modal) closeModal(); } },
    h('div', { class: 'fx-panel' }, h('div', { class: 'fx-head' }, h('h2', { text: title }), close), body));
  document.body.append(modal);
}
function closeModal() { cleanup?.(); cleanup = null; modal?.remove(); modal = null; }
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal) closeModal(); });

async function topScores(game) {
  const code = roomCode();
  if (!code) return [];
  const { data } = await sb.from('scores').select('name, score').eq('room_code', code).eq('game', game).order('score', { ascending: false }).limit(30);
  const seen = new Set(), out = [];
  for (const r of data || []) { if (!seen.has(r.name)) { seen.add(r.name); out.push(r); } if (out.length === 5) break; }
  return out;
}
function boardEl(title, rows) {
  const admin = safeGet('loy.admin');
  return h('div', { class: 'fx-board' }, h('h3', { text: title }),
    rows.length ? h('ol', {}, rows.map((r) => h('li', {}, r.name, h('span', { text: String(r.score) }),
      admin ? h('button', { type: 'button', class: 'fx-del', text: 'ลบ', 'aria-label': `ลบคะแนนของ ${r.name}`, onclick: (e) => adminDelScore(e.currentTarget, r.name) }) : null)))
      : h('p', { class: 'muted', style: 'margin:0', text: 'ยังไม่มีใครเล่น' }));
}
async function adminDelScore(btn, name) {
  if (btn.dataset.armed !== '1') { btn.dataset.armed = '1'; btn.textContent = 'ยืนยัน?'; return; }
  btn.disabled = true;
  const { error } = await sb.rpc('admin_delete_scores', { p_key: safeGet('loy.admin') || '', p_room: roomCode(), p_name: name });
  if (error) { btn.disabled = false; return toast('ลบไม่สำเร็จ (รหัสผู้ดูแลอาจไม่ถูกต้อง)'); }
  toast(`ลบคะแนนของ ${name} แล้ว`);
  openFair();
}
async function saveScore(game, score) {
  const code = roomCode();
  if (!code) return;
  await sb.from('scores').insert({ room_code: code, name: myName(), game, score });
}

function openFair() {
  const boards = h('div', { class: 'fx-cols' }, boardEl('เซียนปาลูกโป่ง', []), boardEl('เซียนโยนห่วง', []));
  const booth = (name, sub, fn) => h('button', { type: 'button', class: 'fx-booth', onclick: fn }, h('span', { text: name }), h('span', { class: 'sub', text: sub }));
  openModal('ซุ้มงานวัด', h('div', { style: 'display:flex;flex-direction:column;gap:14px' },
    h('p', { class: 'muted', style: 'margin:0', text: 'เล่นได้ไม่จำกัด คะแนนดีสุดขึ้นป้ายให้ทุกคนในห้องเห็น' }),
    h('div', { class: 'fx-booths' },
      booth('ปาลูกโป่ง', '20 วินาที', gameBalloon),
      booth('โยนห่วง', '6 ห่วง', gameRing),
      booth('สอยดาว', 'ลุ้นรางวัล', gameStars)),
    boards));
  Promise.all([topScores('balloon'), topScores('ring')]).then(([a, b]) => {
    if (!modal) return;
    boards.replaceChildren(boardEl('เซียนปาลูกโป่ง', a), boardEl('เซียนโยนห่วง', b));
  }).catch(() => {});
}

function resultView(title, scoreText, again) {
  return h('div', { class: 'fx-result' },
    h('p', { class: 'muted', style: 'margin:0', text: title }),
    h('div', { class: 'score', text: scoreText }),
    h('div', { class: 'row', style: 'width:100%' },
      h('button', { type: 'button', class: 'btn btn-primary grow', text: 'เล่นอีกรอบ', onclick: again }),
      h('button', { type: 'button', class: 'btn btn-ghost grow', text: 'กลับซุ้ม', onclick: openFair })));
}

/* --- เกม 1: ปาลูกโป่ง ---
 * ขยับลูกโป่งด้วย JS และตรวจการแตะจากพิกัดนิ้วเอง (ระยะแตะกว้าง)
 * เพื่อให้เล่นบนมือถือทุกรุ่นได้ ไม่พึ่ง hit-test ของ element ที่กำลังเคลื่อนที่ */
function gameBalloon() {
  let score = 0, left = 20, alive = true, raf = 0, last = performance.now();
  const balloons = [];
  const scoreEl = h('span', { class: 'big', text: '0' });
  const timeEl = h('span', { text: '20 วิ' });
  const arena = h('div', { class: 'fx-arena', role: 'application', 'aria-label': 'แตะลูกโป่งให้แตก' });
  const wrap = h('div', { style: 'display:flex;flex-direction:column;gap:10px' },
    h('div', { class: 'fx-hud' }, h('span', {}, 'แตกแล้ว ', scoreEl), timeEl), arena,
    h('p', { class: 'muted', style: 'margin:0;text-align:center', text: 'แตะลูกโป่งให้แตกมากที่สุดใน 20 วินาที' }));
  openModal('ปาลูกโป่ง', wrap);
  const colors = ['#F28DB2', '#F4B860', '#6BD49B', '#7FC8F8', '#B9A7F0', '#E0485A'];
  function spawn() {
    if (!alive) return;
    const W = arena.clientWidth, H = arena.clientHeight;
    const c = colors[Math.floor(Math.random() * colors.length)];
    const el = h('div', { class: 'fx-balloon', 'aria-hidden': 'true' });
    el.innerHTML = `<svg width="58" height="74" viewBox="0 0 58 74"><ellipse cx="29" cy="28" rx="22" ry="26" fill="${c}"/><ellipse cx="21" cy="18" rx="5" ry="8" fill="#fff" fill-opacity=".35"/><path d="M26 53h6l-3 5z" fill="${c}"/><path d="M29 58q-4 8 0 16" fill="none" stroke="#C5CAE3" stroke-width="1.2"/></svg>`;
    const dur = Math.max(2, 3.4 + Math.random() * 2.2 - (20 - left) * 0.06);
    const b = { el, x: 4 + Math.random() * Math.max(10, W - 66), y: H + 10, v: (H + 100) / dur, popped: false };
    el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0)`;
    arena.append(el);
    balloons.push(b);
  }
  function loop(t) {
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    for (let i = balloons.length - 1; i >= 0; i--) {
      const b = balloons[i];
      if (b.popped) continue;
      b.y -= b.v * dt;
      if (b.y < -90) { b.el.remove(); balloons.splice(i, 1); continue; }
      b.el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0)`;
    }
    if (alive) raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);
  function hit(clientX, clientY) {
    if (!alive) return;
    const r = arena.getBoundingClientRect();
    const px = clientX - r.left, py = clientY - r.top;
    let best = null, bestD = 52;
    for (const b of balloons) {
      if (b.popped) continue;
      const d = Math.hypot(px - (b.x + 29), py - (b.y + 30));
      if (d < bestD) { best = b; bestD = d; }
    }
    if (!best) return;
    best.popped = true;
    best.el.classList.add('pop');
    score++; scoreEl.textContent = score;
    Music.blip(700 + Math.random() * 400);
    if (navigator.vibrate) navigator.vibrate(15);
    setTimeout(() => { best.el.remove(); const k = balloons.indexOf(best); if (k >= 0) balloons.splice(k, 1); }, 160);
  }
  if (window.PointerEvent) {
    arena.addEventListener('pointerdown', (e) => { e.preventDefault(); hit(e.clientX, e.clientY); });
  } else {
    arena.addEventListener('touchstart', (e) => { e.preventDefault(); for (const tc of e.changedTouches) hit(tc.clientX, tc.clientY); }, { passive: false });
    arena.addEventListener('mousedown', (e) => hit(e.clientX, e.clientY));
  }
  const spawner = setInterval(spawn, 420);
  spawn();
  const clock = setInterval(() => {
    left--; timeEl.textContent = `${left} วิ`;
    if (left <= 0) finish();
  }, 1000);
  function finish() {
    if (!alive) return;
    alive = false; clearInterval(spawner); clearInterval(clock); cancelAnimationFrame(raf);
    saveScore('balloon', score).catch(() => {});
    sendFx('game', { text: `${myName()} ปาลูกโป่งแตก ${score} ลูก!` });
    wrap.replaceWith(resultView('ปาลูกโป่งแตก', `${score} ลูก`, gameBalloon));
  }
  cleanup = () => { alive = false; clearInterval(spawner); clearInterval(clock); cancelAnimationFrame(raf); };
}

/* --- เกม 2: โยนห่วง --- */
function gameRing() {
  const BOTTLES = [0.18, 0.5, 0.82], ZONE = 0.05, TOTAL = 6;
  let pos = 0, dir = 1, speed = 0.55, thrown = 0, hits = 0, busy = false, alive = true, raf = 0, last = performance.now();
  const hud = h('span', { class: 'big', text: '0' });
  const ringsLeft = h('span', { text: `เหลือ ${TOTAL} ห่วง` });
  const track = h('div', { class: 'fx-ring-track' }, ...BOTTLES.map((b) => h('span', { class: 'fx-bottle', style: `left:${b * 100}%` })));
  const marker = h('span', { class: 'fx-marker', 'aria-hidden': 'true' });
  track.append(marker);
  const arena = h('div', { class: 'fx-arena' }, track,
    h('p', { class: 'muted', style: 'position:absolute;left:0;right:0;top:16px;text-align:center;margin:0', text: 'กดโยนตอนห่วงอยู่ตรงขวดพอดี' }));
  const throwBtn = h('button', { type: 'button', class: 'btn btn-primary', text: 'โยน!', onclick: doThrow });
  const wrap = h('div', { style: 'display:flex;flex-direction:column;gap:10px' },
    h('div', { class: 'fx-hud' }, h('span', {}, 'ลง ', hud), ringsLeft), arena, throwBtn);
  openModal('โยนห่วง', wrap);
  function loop(t) {
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    if (!busy) {
      pos += dir * speed * dt;
      if (pos > 1) { pos = 1; dir = -1; } if (pos < 0) { pos = 0; dir = 1; }
      marker.style.left = `${pos * 100}%`;
    }
    if (alive) raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);
  function doThrow() {
    if (busy || !alive) return;
    busy = true; thrown++;
    const hit = BOTTLES.some((b) => Math.abs(b - pos) <= ZONE);
    marker.classList.add('throw');
    setTimeout(() => {
      if (hit) { hits++; hud.textContent = hits; Music.blip(1046); toast('ลงขวด!'); } else Music.blip(220);
      ringsLeft.textContent = `เหลือ ${TOTAL - thrown} ห่วง`;
      marker.classList.remove('throw');
      speed += 0.12; busy = false;
      if (thrown >= TOTAL) finish();
    }, 450);
  }
  function finish() {
    alive = false; cancelAnimationFrame(raf);
    saveScore('ring', hits).catch(() => {});
    sendFx('game', { text: `${myName()} โยนห่วงลง ${hits} จาก ${TOTAL}!` });
    wrap.replaceWith(resultView('โยนห่วงลงขวด', `${hits} / ${TOTAL}`, gameRing));
  }
  cleanup = () => { alive = false; cancelAnimationFrame(raf); };
}

/* --- เกม 3: สอยดาว --- */
const PRIZES = [
  ['ตุ๊กตาหมีตัวใหญ่', 2], ['พัดลมตั้งโต๊ะ', 3], ['ขันน้ำพลาสติก', 10], ['บะหมี่กึ่งสำเร็จรูป 1 แพ็ก', 12],
  ['น้ำปลา 1 ขวด', 10], ['ตุ๊กตาไม้ล้มลุก', 8], ['ลูกโป่งสวรรค์', 10], ['ปลาทองในถุง', 6],
  ['สายไหม 1 ถุง', 10], ['ไม่ได้อะไร แต่ได้ใจ', 15], ['คูปองลอยกระทงคู่ปีหน้า', 4],
];
function drawPrize() {
  const total = PRIZES.reduce((s, p) => s + p[1], 0);
  let r = Math.random() * total;
  for (const [name, w] of PRIZES) { r -= w; if (r <= 0) return name; }
  return PRIZES[0][0];
}
function gameStars() {
  let picks = 3;
  const won = [];
  const info = h('span', { text: `สอยได้อีก ${picks} ดวง` });
  const grid = h('div', { class: 'fx-stars' });
  for (let i = 0; i < 12; i++) {
    const s = h('button', { type: 'button', class: 'fx-star', 'aria-label': `ดาวดวงที่ ${i + 1}` });
    s.innerHTML = '<svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z" fill="currentColor"/></svg>';
    s.addEventListener('click', () => {
      if (picks <= 0 || s.disabled) return;
      picks--; s.disabled = true;
      const p = drawPrize(); won.push(p);
      s.classList.add('won'); s.textContent = p;
      Music.blip(p === 'ไม่ได้อะไร แต่ได้ใจ' ? 330 : 988);
      info.textContent = picks ? `สอยได้อีก ${picks} ดวง` : 'หมดสิทธิ์แล้ว';
      if (!picks) {
        const best = won.find((w) => w !== 'ไม่ได้อะไร แต่ได้ใจ') || 'ใจ';
        sendFx('game', { text: `${myName()} สอยดาวได้ ${best}!` });
        setTimeout(() => {
          grid.querySelectorAll('.fx-star:not(:disabled)').forEach((b) => { b.disabled = true; b.style.opacity = '.4'; });
          wrap.append(h('div', { class: 'row' },
            h('button', { type: 'button', class: 'btn btn-primary grow', text: 'สอยอีกรอบ', onclick: gameStars }),
            h('button', { type: 'button', class: 'btn btn-ghost grow', text: 'กลับซุ้ม', onclick: openFair })));
        }, 400);
      }
    });
    grid.append(s);
  }
  const wrap = h('div', { style: 'display:flex;flex-direction:column;gap:10px' },
    h('div', { class: 'fx-hud' }, h('span', { text: 'เลือกดาว 3 ดวง' }), info),
    h('div', { class: 'fx-arena', style: 'height:auto' }, grid));
  openModal('สอยดาว', wrap);
}

/* ============================ boot ============================ */
window.addEventListener('hashchange', () => { closeModal(); joinFx(); });
joinFx();
