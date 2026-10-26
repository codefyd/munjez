'use strict';

const api = window.munjez;
const $ = (s, r = document) => r.querySelector(s);

/* ============ أدوات ============ */
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pad = (n) => String(n).padStart(2, '0');
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => keyOf(new Date());
const dateOf = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (k, n) => { const d = dateOf(k); d.setDate(d.getDate() + n); return keyOf(d); };
const nowHM = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pctOf = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const hm = (h, m) => `${pad(h)}:${pad(m)}`;
const fmtTime = (hm) => { const [h, m] = hm.split(':').map(Number); return `${h % 12 || 12}:${pad(m)} ${h < 12 ? 'ص' : 'م'}`; };
const DAYS = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
const fmtGreg = new Intl.DateTimeFormat('ar-u-nu-latn-ca-gregory', { weekday: 'long', day: 'numeric', month: 'long' });
const fmtHijri = new Intl.DateTimeFormat('ar-SA-u-nu-latn-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' });
const fmtShort = new Intl.DateTimeFormat('ar-u-nu-latn-ca-gregory', { weekday: 'long', day: 'numeric', month: 'long' });

/* ============ أيقونات ============ */
const svg = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
const I = {
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 'stroke-width="3"'),
  grip: '<svg viewBox="0 0 10 16" fill="currentColor"><circle cx="2.5" cy="3" r="1.4"/><circle cx="7.5" cy="3" r="1.4"/><circle cx="2.5" cy="8" r="1.4"/><circle cx="7.5" cy="8" r="1.4"/><circle cx="2.5" cy="13" r="1.4"/><circle cx="7.5" cy="13" r="1.4"/></svg>',
  gripH: '<svg width="18" height="8" viewBox="0 0 18 8" fill="currentColor"><circle cx="3" cy="2" r="1.3"/><circle cx="9" cy="2" r="1.3"/><circle cx="15" cy="2" r="1.3"/><circle cx="3" cy="6.5" r="1.3"/><circle cx="9" cy="6.5" r="1.3"/><circle cx="15" cy="6.5" r="1.3"/></svg>',
  inward: svg('<path d="M15 6l-6 6 6 6"/>'),
  outward: svg('<path d="M9 6l6 6-6 6"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>', 'stroke-width="2.6"'),
  star: svg('<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/>'),
  starFill: svg('<path fill="currentColor" d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/>'),
  pen: svg('<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M14 6l4 4"/>'),
  trash: svg('<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>'),
  clock: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  chart: svg('<path d="M5 20V11M12 20V5M19 20v-6"/>', 'stroke-width="2.4"'),
  gear: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.6 1.6 0 00-1-1.5 1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H3a2 2 0 110-4h.1a1.6 1.6 0 001.5-1 1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H9a1.6 1.6 0 001-1.5V3a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V9a1.6 1.6 0 001.5 1H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z"/>', 'stroke-width="1.7"'),
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>'),
  moon: svg('<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/>'),
  x: svg('<path d="M6 6l12 12M18 6L6 18"/>', 'stroke-width="2.4"'),
  down: svg('<path d="M6 9l6 6 6-6"/>', 'stroke-width="2.4"'),
  toMini: svg('<path d="M4 14h6v6M20 10h-6V4M14 10l6-6M4 20l6-6"/>'),
  toBar: svg('<rect x="8" y="3" width="8" height="18" rx="3"/><path d="M12 8v.01M12 12v.01M12 16v.01" stroke-width="2.6"/>'),
  list: svg('<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01" stroke-width="3"/>'),
  cal: svg('<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
  next: svg('<path d="M20 12H6M11 6l-6 6 6 6"/>'),
};

function ring(pct, size, stroke) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, h = size / 2;
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle class="ring-bg" cx="${h}" cy="${h}" r="${r}" stroke-width="${stroke}"/>
    <circle class="ring-fg" cx="${h}" cy="${h}" r="${r}" stroke-width="${stroke}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct / 100)}" transform="rotate(-90 ${h} ${h})"/>
  </svg>`;
}

/* ============ البيانات ============ */
const DEFAULTS = {
  side: 'right', y: 170, theme: 'system', collapse: 'bar', summaryTime: '19:00',
  shortcut: 'Ctrl+Alt+N', summaryShown: '', autoClose: true, addType: 'daily',
};
let S = null;

const ui = {
  open: false, view: 'tasks', prevMode: '',
  editing: null, editType: 'daily', editTime: '', editDate: '', editTitle: '', editFocus: false,
  confirming: null, expanded: new Set(), showUpcoming: true,
  add: { star: false, time: '', parsed: '', date: '' },
  tp: null, tpPm: null, dp: null, dpMonth: null,
  autostart: false, capture: false, msg: '', statsDay: null,
};

function day(k = today()) {
  const d = (S.days[k] ||= {});
  d.done ||= {}; d.sub ||= {}; d.notified ||= {};
  return d;
}

function todayList() {
  const k = today();
  return S.tasks
    .filter((t) => (t.type === 'daily'
      ? t.created <= k
      : (!t.doneOn || t.doneOn === k) && (!t.due || t.due <= k)))
    .sort((a, b) => a.order - b.order);
}

// تاريخ ظهور المهمة أول مرة: اليومية من تاريخ بدايتها، ومرة واحدة من موعدها
const startOf = (t) => (t.type === 'daily' ? t.created : t.due || t.created);

function upcomingList() {
  const k = today();
  return S.tasks
    .filter((t) => (t.type === 'daily' ? t.created > k : !t.doneOn && t.due > k))
    .sort((a, b) => startOf(a).localeCompare(startOf(b)) || a.order - b.order);
}

const isDone = (t) => (t.type === 'daily' ? !!day().done[t.id] : t.doneOn === today());
const isDue = (t) => !!t.time && !isDone(t) && nowHM() >= t.time;

function subDone(t, s) {
  return t.type === 'daily' ? !!(day().sub[t.id] || {})[s.id] : !!s.done;
}

function setSubDone(t, s, v) {
  if (t.type === 'daily') {
    const m = (day().sub[t.id] ||= {});
    if (v) m[s.id] = true; else delete m[s.id];
  } else s.done = v;
}

function setDone(t, v) {
  if (t.type === 'daily') {
    if (v) day().done[t.id] = true; else delete day().done[t.id];
  } else {
    t.doneOn = v ? today() : null;
  }
}

function progress() {
  const list = todayList();
  const done = list.filter(isDone).length;
  return { list, done, total: list.length, pct: pctOf(done, list.length) };
}

function streak(t) {
  let k = today();
  if (!S.days[k]?.done?.[t.id]) k = addDays(k, -1);
  let n = 0;
  while (S.days[k]?.done?.[t.id]) { n++; k = addDays(k, -1); }
  return n;
}

// لقطة لليوم الحالي تحفظ سجله حتى لو حذفت المهام لاحقًا
function snapshot() {
  const { list, done } = progress();
  const d = day();
  d.total = list.length;
  d.count = done;
  d.items = list.map((t) => ({ t: t.title, d: isDone(t) ? 1 : 0 }));
}

function save() {
  snapshot();
  api.save(S);
}

function nextOrder() {
  return S.tasks.reduce((m, t) => Math.max(m, t.order), 0) + 1;
}

// date: يوم مستقبلي (فاضي = اليوم). اليومية تبدأ منه، ومرة واحدة تظهر فيه
function addTask(title, type, star = false, time = '', date = '') {
  const later = date && date > today() ? date : '';
  S.tasks.push({
    id: uid(), title, type, star, time, subs: [],
    created: type === 'daily' && later ? later : today(),
    doneOn: null, due: type === 'once' && later ? later : null, order: nextOrder(),
  });
}

// ترحيل مهمة مرة واحدة غير منجزة لليوم التالي
function carry(t) {
  t.due = addDays(today(), 1);
  t.carried = true;
}

function seed() {
  addTask('اشرب 8 أكواب ماء 💧', 'daily');
  addTask('ورد القراءة اليومي 📖', 'daily', false, '21:00');
  addTask('رتّب أولويات الأسبوع', 'once', true);
  S.settings.summaryShown = today();
}

/* ============ المظهر والجهة ============ */
const darkMQ = matchMedia('(prefers-color-scheme: dark)');
const effTheme = () => (S.settings.theme === 'system' ? (darkMQ.matches ? 'dark' : 'light') : S.settings.theme);
function applyTheme() { document.documentElement.dataset.theme = effTheme(); }
darkMQ.addEventListener('change', () => { if (S) applyTheme(); });
function applySide() { document.body.classList.toggle('left', S.settings.side === 'left'); }

/* ============ الرسم ============ */
function render() {
  hideTip();
  const stage = $('#stage');
  const mode = ui.open ? 'panel' : S.settings.collapse;
  let dock = $('.dock');
  if (!dock || dock.dataset.mode !== mode || (mode === 'panel' && dock.dataset.view !== ui.view)) {
    dock = document.createElement('div');
    dock.className = `dock hit dock-${mode}`;
    dock.dataset.mode = mode;
    dock.dataset.view = ui.view;
    if (mode === 'panel') {
      dock.innerHTML = '<header class="ph" data-drag></header><div class="pv"></div>';
      if (ui.prevMode !== 'panel') dock.classList.add('enter');
    }
    stage.replaceChildren(dock);
  }
  ui.prevMode = mode;

  if (mode === 'bar') dock.innerHTML = barHTML();
  else if (mode === 'mini') renderMini(dock);
  else { renderHeader(dock); renderView(dock); }
  position(dock);
}

function position(dock) {
  dock.style.top = clamp(S.settings.y, 8, innerHeight - dock.offsetHeight - 8) + 'px';
}

function barHTML() {
  const { list, done, total } = progress();
  const nums = list.map((t, i) => {
    const d = isDone(t);
    const cls = ['num', d && 'done', t.star && 'star', isDue(t) && 'due'].filter(Boolean).join(' ');
    const tip = t.title + (t.time ? ` — ${fmtTime(t.time)}` : '');
    return `<button class="${cls}" data-act="toggle" data-id="${t.id}" data-tip="${esc(tip)}">${d ? I.check : i + 1}</button>`;
  }).join('');
  return `
    <div class="grip" data-drag data-tip="اسحب للأعلى أو الأسفل">${I.gripH}</div>
    <button class="count" data-act="open" data-tip="أنجزت ${done} من ${total}"><b>${done}</b><i></i><span>${total}</span></button>
    <div class="nums">${nums || '<span class="bar-empty">✨</span>'}</div>
    <button class="expand flip-x" data-act="open" data-tip="فتح القائمة">${I.inward}</button>
    <button class="expand" data-act="collapse" data-v="mini" data-tip="صغّره لمربع">${I.toMini}</button>`;
}

function renderMini(dock) {
  const { done, total, pct } = progress();
  const alert = todayList().some(isDue);
  dock.classList.toggle('alert', alert);
  dock.dataset.drag = '';
  dock.dataset.click = 'open';
  dock.dataset.tip = `أنجزت ${done} من ${total} (${pct}%)`;
  dock.innerHTML = `<div class="mini">${ring(pct, 56, 4.5)}<div class="mini-txt ltr"><b>${done}</b><span>/${total}</span></div></div>
    <button class="to-bar" data-act="collapse" data-v="bar" data-tip="رجّعه شريط">${I.toBar}</button>`;
}

function renderHeader(dock) {
  const { done, total, pct } = progress();
  const dark = effTheme() === 'dark';
  const v = ui.view;
  $('.ph', dock).innerHTML = `
    <div class="ph-ring">${ring(pct, 62, 6)}<b class="ltr">${pct}<small>%</small></b></div>
    <div class="ph-txt">
      <h1>مُنجز</h1>
      <div class="ph-main">${total ? `أنجزت ${done} من ${total}` : 'يومك فاضي'}</div>
      <div class="ph-date">${fmtGreg.format(new Date())}</div>
      <div class="ph-date">${fmtHijri.format(new Date())}</div>
    </div>
    <div class="ph-btns">
      <button class="ib ${v === 'stats' ? 'on' : ''}" data-act="view" data-v="stats" title="الإحصائيات">${I.chart}</button>
      <button class="ib ${v === 'settings' ? 'on' : ''}" data-act="view" data-v="settings" title="الإعدادات">${I.gear}</button>
      <button class="ib" data-act="theme" title="${dark ? 'الوضع الفاتح' : 'الوضع الليلي'}">${dark ? I.sun : I.moon}</button>
      <button class="ib flip-x" data-act="close" title="إغلاق (Esc)">${I.outward}</button>
    </div>`;
}

function renderView(dock) {
  const pv = $('.pv', dock);
  if (ui.view === 'tasks') {
    if (!$('.add', pv)) {
      pv.innerHTML = `
        <form class="add" autocomplete="off">
          <div class="add-row">
            <input id="addInput" maxlength="140" placeholder="أضف مهمة… مثلًا: اتصل بأحمد 4م">
            <button class="add-btn" type="submit" title="إضافة">${I.plus}</button>
          </div>
          <div class="add-opts"></div>
        </form>
        <ul class="list"></ul>
        <div class="carry-bar"></div>
        <div class="upcoming"></div>
        <div class="foot"><kbd>Ctrl+N</kbd> إضافة · <kbd>Esc</kbd> إغلاق · <kbd>${esc(S.settings.shortcut)}</kbd> من أي مكان</div>`;
    }
    renderAddOpts(pv);
    renderList(pv);
  } else if (ui.view === 'stats') pv.innerHTML = statsHTML();
  else if (ui.view === 'settings') pv.innerHTML = settingsHTML();
  else if (ui.view === 'summary') pv.innerHTML = summaryHTML();
}

function renderAddOpts(pv) {
  const type = S.settings.addType;
  $('.add-opts', pv).innerHTML = `
    <div class="seg">
      <button type="button" data-act="addtype" data-v="daily" class="${type === 'daily' ? 'on' : ''}">يومية</button>
      <button type="button" data-act="addtype" data-v="once" class="${type === 'once' ? 'on' : ''}">مرة واحدة</button>
    </div>
    <button type="button" class="chip ${ui.add.star ? 'on' : ''}" data-act="addstar">${ui.add.star ? I.starFill : I.star} مهمّة</button>
    ${timeChip('add', ui.add.time || ui.add.parsed, !ui.add.time && !!ui.add.parsed)}
    ${dateChip('add', ui.add.date)}
    ${ui.tp === 'add' ? tpHTML('add', ui.add.time || ui.add.parsed) : ''}
    ${ui.dp === 'add' ? dpHTML('add', ui.add.date) : ''}`;
}

function renderList(pv) {
  const list = todayList();
  const ul = $('.list', pv);
  ul.innerHTML = list.length
    ? list.map(itemHTML).join('')
    : '<div class="empty"><span class="big">✨</span>ما عندك مهام لليوم.<br>اكتب أول مهمة فوق واضغط Enter.</div>';

  const left = list.filter((t) => t.type === 'once' && !isDone(t)).length;
  $('.carry-bar', pv).innerHTML = left
    ? `<button class="btn carry-btn" data-act="carry">${I.next} رحّل غير المنجزة (${left}) لبكرا</button>`
    : '';

  const up = upcomingList();
  $('.upcoming', pv).innerHTML = up.length ? `
    <button class="up-head" data-act="upcoming">${I.cal} القادمة <b class="ltr">${up.length}</b><span class="chev ${ui.showUpcoming ? 'up' : ''}">${I.down}</span></button>
    ${ui.showUpcoming ? `<ul class="list">${up.map(upItemHTML).join('')}</ul>` : ''}` : '';

  const ed = $('.edit input[name="title"]', pv);
  if (ed && ui.editFocus) { ui.editFocus = false; ed.focus(); ed.select(); }
}

const dayLabel = (k) => {
  const n = Math.round((dateOf(k) - dateOf(today())) / 86400000);
  return n <= 0 ? 'اليوم' : n === 1 ? 'بكرا' : n === 2 ? 'بعد بكرا' : fmtShort.format(dateOf(k));
};

// مهمة قادمة: بدون إنجاز ولا سحب، بس تعديل وحذف
function upItemHTML(t) {
  if (ui.editing === t.id) return editHTML(t);
  return `<li class="item up ${t.star ? 'star' : ''}" data-id="${t.id}">
    <div class="row">
      <span class="up-ic">${I.cal}</span>
      <div class="body">
        <div class="title">${esc(t.title)}</div>
        <div class="meta">
          <span class="tag ${t.type}">${t.type === 'daily' ? 'يومية' : 'مرة واحدة'}</span>
          <span class="m when">${t.type === 'daily' ? 'تبدأ ' : ''}${dayLabel(startOf(t))}</span>
          ${t.time ? `<span class="m time">${I.clock}<span class="ltr">${fmtTime(t.time)}</span></span>` : ''}
        </div>
      </div>
      <div class="acts">
        <button data-act="edit" data-id="${t.id}" title="تعديل">${I.pen}</button>
        <button class="del" data-act="del" data-id="${t.id}" title="حذف">${I.trash}</button>
      </div>
    </div>
    ${confirmHTML(t)}
  </li>`;
}

function confirmHTML(t) {
  return ui.confirming === t.id ? `<div class="confirm"><span>تحذف «${esc(t.title)}»؟</span>
      <button class="btn danger" data-act="del-yes" data-id="${t.id}">حذف</button>
      <button class="btn" data-act="del-no">إلغاء</button></div>` : '';
}

function itemHTML(t) {
  if (ui.editing === t.id) return editHTML(t);
  const d = isDone(t), due = isDue(t);
  const st = t.type === 'daily' ? streak(t) : 0;
  const subs = t.subs || [];
  const sd = subs.filter((s) => subDone(t, s)).length;
  const open = ui.expanded.has(t.id);
  const cls = ['item', d && 'done', t.star && 'star', due && 'due', open && 'open'].filter(Boolean).join(' ');
  return `<li class="${cls}" data-id="${t.id}" draggable="true">
    <div class="row">
      <span class="handle" title="اسحب لتغيير الترتيب">${I.grip}</span>
      <button class="check" data-act="toggle" data-id="${t.id}" title="${d ? 'إلغاء الإنجاز' : 'إنجاز'}">${I.check}</button>
      <div class="body" data-act="expand" data-id="${t.id}">
        <div class="title">${esc(t.title)}</div>
        <div class="meta">
          <span class="tag ${t.type}">${t.type === 'daily' ? 'يومية' : 'مرة واحدة'}</span>
          ${t.time ? `<span class="m time">${I.clock}<span class="ltr">${fmtTime(t.time)}</span></span>` : ''}
          ${st >= 2 ? `<span class="m fire">🔥 ${st} يوم</span>` : ''}
          ${subs.length ? `<span class="m">${I.list}<span class="ltr">${sd}/${subs.length}</span></span>` : ''}
          ${t.carried && t.due === today() && !d ? '<span class="m carried">↩ من أمس</span>' : ''}
          <span class="chev">${I.down}</span>
        </div>
      </div>
      <div class="acts">
        ${t.type === 'once' && !d ? `<button data-act="carry1" data-id="${t.id}" title="رحّلها لبكرا">${I.next}</button>` : ''}
        <button class="${t.star ? 'on' : ''}" data-act="star" data-id="${t.id}" title="أولوية">${t.star ? I.starFill : I.star}</button>
        <button data-act="edit" data-id="${t.id}" title="تعديل">${I.pen}</button>
        <button class="del" data-act="del" data-id="${t.id}" title="حذف">${I.trash}</button>
      </div>
    </div>
    ${confirmHTML(t)}
    ${open ? subsHTML(t) : ''}
  </li>`;
}

function subsHTML(t) {
  return `<div class="subs">
    ${(t.subs || []).map((s) => `<div class="sub ${subDone(t, s) ? 'done' : ''}">
      <button class="scheck" data-act="subtoggle" data-id="${t.id}" data-sid="${s.id}">${I.check}</button>
      <span>${esc(s.title)}</span>
      <button class="sdel" data-act="subdel" data-id="${t.id}" data-sid="${s.id}" title="حذف الخطوة">${I.x}</button>
    </div>`).join('')}
    <form class="sub-add" data-id="${t.id}" autocomplete="off"><input maxlength="120" placeholder="+ أضف خطوة صغيرة…"></form>
  </div>`;
}

function editHTML(t) {
  const ty = ui.editType;
  return `<li class="item editing" data-id="${t.id}">
    <form class="edit" data-id="${t.id}" autocomplete="off">
      <input name="title" maxlength="140" value="${esc(ui.editTitle)}">
      <div class="edit-opts">
        <div class="seg">
          <button type="button" data-act="etype" data-v="daily" class="${ty === 'daily' ? 'on' : ''}">يومية</button>
          <button type="button" data-act="etype" data-v="once" class="${ty === 'once' ? 'on' : ''}">مرة واحدة</button>
        </div>
        ${timeChip('edit', ui.editTime)}
        ${dateChip('edit', ui.editDate)}
        ${ui.tp === 'edit' ? tpHTML('edit', ui.editTime) : ''}
        ${ui.dp === 'edit' ? dpHTML('edit', ui.editDate) : ''}
      </div>
      <div class="edit-btns">
        <button type="submit" class="btn primary">حفظ</button>
        <button type="button" class="btn" data-act="edit-cancel">إلغاء</button>
      </div>
    </form>
  </li>`;
}

/* ============ اختيار الوقت ============ */
function inMinutes(n) {
  const d = new Date(Math.ceil((Date.now() + n * 60000) / 300000) * 300000);
  return hm(d.getHours(), d.getMinutes());
}

function timeChip(ctx, val, auto = false) {
  return `<button type="button" class="chip ${val ? 'has-time' : ''} ${ui.tp === ctx ? 'active' : ''}" data-act="tp-open" data-ctx="${ctx}" title="وقت التذكير">
    ${I.clock}${val ? `<span class="ltr">${fmtTime(val)}</span>${auto ? '<small>من النص</small>' : ''}` : 'وقت'}</button>`;
}

const tpGet = (ctx) => (ctx === 'add' ? ui.add.time || ui.add.parsed : ui.editTime);
const tpIsPm = (ctx) => {
  if (ui.tpPm !== null) return ui.tpPm;
  const v = tpGet(ctx);
  return v ? +v.slice(0, 2) >= 12 : new Date().getHours() >= 12;
};

function tpHTML(ctx, val) {
  const cur = val ? val.split(':').map(Number) : null;
  const pm = tpIsPm(ctx);
  const b = (act, v, cls, label) => `<button type="button" class="${cls || ''}" data-act="${act}" data-ctx="${ctx}" data-v="${v}">${label}</button>`;
  const rel = [[15, '15 د'], [30, '30 د'], [60, 'ساعة'], [120, 'ساعتين']]
    .map(([n, l]) => { const v = inMinutes(n); return b('tp-set', v, '', `<b>بعد ${l}</b><span class="ltr">${fmtTime(v)}</span>`); }).join('');
  // قوائم تمرير: الساعة والدقيقة وص/م
  const hours = Array.from({ length: 12 }, (_, i) => i + 1)
    .map((h) => b('tp-hour', h, cur && (cur[0] % 12 || 12) === h ? 'on' : '', h)).join('');
  const mins = Array.from({ length: 60 }, (_, i) => i)
    .map((m) => b('tp-min', m, cur && cur[1] === m ? 'on' : '', pad(m))).join('');
  return `<div class="tp">
    <div class="tp-rel">${rel}</div>
    <div class="tp-cols">
      <div class="tp-col"><small>الساعة</small><div class="tp-scroll ltr">${hours}</div></div>
      <div class="tp-col"><small>الدقيقة</small><div class="tp-scroll ltr">${mins}</div></div>
      <div class="tp-col tp-per"><small>الفترة</small>${b('tp-period', 'am', pm ? '' : 'on', 'صباحًا')}${b('tp-period', 'pm', pm ? 'on' : '', 'مساءً')}</div>
    </div>
    <div class="tp-foot">
      ${val ? b('tp-clear', '', 'btn', 'بدون وقت') : '<span></span>'}
      <button type="button" class="btn primary" data-act="tp-close">تم</button>
    </div>
  </div>`;
}

function refreshTp() {
  const pv = $('.pv');
  if (!pv) return;
  if (ui.editing) renderList(pv); else if ($('.add-opts', pv)) renderAddOpts(pv);
  // نخلي المختار في نص قائمة التمرير
  $$('.tp-scroll', pv).forEach((col) => {
    const on = $('.on', col);
    if (on) col.scrollTop = on.offsetTop - (col.clientHeight - on.offsetHeight) / 2;
  });
  $('.tp, .dp', pv)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

/* ============ اختيار التاريخ ============ */
const fmtMonth = new Intl.DateTimeFormat('ar-u-nu-latn-ca-gregory', { month: 'long', year: 'numeric' });
const WEEK_HEAD = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];

function dateChip(ctx, val) {
  return `<button type="button" class="chip ${val ? 'has-time' : ''} ${ui.dp === ctx ? 'active' : ''}" data-act="dp-open" data-ctx="${ctx}" title="تاريخ المهمة">
    ${I.cal}${val ? dayLabel(val) : 'تحديد تاريخ'}</button>`;
}

// تقويم شهري: الأيام اللي راحت مقفلة، واليوم يرجّع المهمة لليوم
function calHTML(ctx, val) {
  const k = today();
  const month = ui.dpMonth || (val || k).slice(0, 7);
  const [y, mo] = month.split('-').map(Number);
  const first = new Date(y, mo - 1, 1);
  const n = new Date(y, mo, 0).getDate();
  const cells = Array.from({ length: first.getDay() }, () => '<span></span>');
  for (let i = 1; i <= n; i++) {
    const d = `${month}-${pad(i)}`;
    const cls = [(val || k) === d && 'on', d === k && 'today'].filter(Boolean).join(' ');
    cells.push(d < k
      ? `<span class="past">${i}</span>`
      : `<button type="button" class="${cls}" data-act="dp-set" data-ctx="${ctx}" data-v="${d === k ? '' : d}">${i}</button>`);
  }
  const canBack = month > k.slice(0, 7);
  return `<div class="cal">
    <div class="cal-head">
      <button type="button" data-act="dp-month" data-ctx="${ctx}" data-v="-1" ${canBack ? '' : 'disabled'} title="الشهر اللي قبل">${I.inward}</button>
      <b>${fmtMonth.format(first)}</b>
      <button type="button" data-act="dp-month" data-ctx="${ctx}" data-v="1" title="الشهر الجاي">${I.outward}</button>
    </div>
    <div class="cal-grid">${WEEK_HEAD.map((w) => `<small>${w}</small>`).join('')}${cells.join('')}</div>
  </div>`;
}

function dpHTML(ctx, val) {
  const k = today();
  const b = (v, label) => `<button type="button" class="${(val || '') === v ? 'on' : ''}" data-act="dp-set" data-ctx="${ctx}" data-v="${v}">${label}</button>`;
  const daily = (ctx === 'add' ? S.settings.addType : ui.editType) === 'daily';
  return `<div class="dp tp">
    <div class="tp-rel">${b('', '<b>اليوم</b>')}${b(addDays(k, 1), '<b>بكرا</b>')}${b(addDays(k, 7), '<b>بعد أسبوع</b>')}</div>
    ${calHTML(ctx, val)}
    <div class="tp-foot"><span class="hint">${daily ? 'اليومية تبدأ من هذا اليوم' : 'تظهر المهمة في يومها'}</span>
      <button type="button" class="btn primary" data-act="dp-close">تم</button></div>
  </div>`;
}

function dpSet(ctx, v, close) {
  if (ctx === 'add') ui.add.date = v; else ui.editDate = v;
  if (close) ui.dp = null;
  refreshTp();
}

function dpAct(name, el) {
  const ctx = el.dataset.ctx;
  switch (name) {
    case 'dp-open': ui.dp = ui.dp === ctx ? null : ctx; ui.tp = null; ui.dpMonth = null; refreshTp(); break;
    case 'dp-close': ui.dp = null; refreshTp(); break;
    case 'dp-month': {
      const cur = ui.dpMonth || ((ctx === 'add' ? ui.add.date : ui.editDate) || today()).slice(0, 7);
      const [y, m] = cur.split('-').map(Number);
      const d = new Date(y, m - 1 + +el.dataset.v, 1);
      ui.dpMonth = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      refreshTp(); break;
    }
    case 'dp-set': dpSet(ctx, el.dataset.v, true); break;
    default:
  }
}

function tpSet(ctx, v, close) {
  if (ctx === 'add') {
    ui.add.time = v;
    // مسح الوقت المكتوب بالنص كمان
    if (!v && ui.add.parsed) {
      const input = $('#addInput');
      input.value = parseTime(input.value).title;
      ui.add.parsed = '';
    }
  } else ui.editTime = v;
  if (close) { ui.tp = null; ui.tpPm = null; }
  refreshTp();
}

function tpAct(name, el) {
  const ctx = el.dataset.ctx;
  const v = tpGet(ctx);
  const [h, m] = v ? v.split(':').map(Number) : [new Date().getHours(), 0];
  switch (name) {
    case 'tp-open': ui.tp = ui.tp === ctx ? null : ctx; ui.tpPm = null; ui.dp = null; refreshTp(); break;
    case 'tp-close': ui.tp = null; ui.tpPm = null; refreshTp(); break;
    case 'tp-set': tpSet(ctx, el.dataset.v, true); break;
    case 'tp-clear': tpSet(ctx, '', true); break;
    case 'tp-period':
      ui.tpPm = el.dataset.v === 'pm';
      if (v) tpSet(ctx, hm((h % 12) + (ui.tpPm ? 12 : 0), m), false); else refreshTp();
      break;
    case 'tp-hour': tpSet(ctx, hm((+el.dataset.v % 12) + (tpIsPm(ctx) ? 12 : 0), v ? m : 0), false); break;
    case 'tp-min': tpSet(ctx, hm(v ? h : (h % 12) + (tpIsPm(ctx) ? 12 : 0), +el.dataset.v), false); break;
    default:
  }
}

/* ============ قراءة الوقت من نص المهمة ============ */
const AM_W = 'ص|صباحا|صباحًا|الصبح|الصباح|الفجر|am';
const PM_W = 'م|مساء|مساءً|المساء|بالليل|الليل|العصر|المغرب|العشاء|الظهر|pm';
const END = '(?=\\s|$|[.,،])';
const TIME_RE = new RegExp(`(?:^|\\s)(?:(?:الساعة|الساعه)\\s*)?(\\d{1,2})(?::(\\d{2}))?\\s*(${AM_W}|${PM_W})${END}`, 'i');
const AT_RE = new RegExp(`(?:^|\\s)(?:الساعة|الساعه)\\s*(\\d{1,2})(?::(\\d{2}))?${END}`);
const AFTER_RE = new RegExp(`(?:^|\\s)بعد\\s+(?:(\\d+)\\s*(دقيقة|دقيقه|دقايق|دقائق|د|ساعة|ساعه|ساعات|س)|(ساعتين)|(نص ساعة|نص ساعه|نصف ساعة)|(ربع ساعة|ربع ساعه)|(ساعة|ساعه))${END}`);
const AM_ONLY = new RegExp(`^(${AM_W})$`, 'i');

function parseTime(text) {
  const s = text.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/٫/g, ':');
  let m, time = '';
  if ((m = s.match(AFTER_RE))) {
    const n = m[1] ? +m[1] * (/^س|^ساع/.test(m[2]) ? 60 : 1) : m[3] ? 120 : m[4] ? 30 : m[5] ? 15 : 60;
    if (n > 0 && n <= 24 * 60) time = inMinutes(n);
  } else if ((m = s.match(TIME_RE))) {
    let h = +m[1];
    const mi = +(m[2] || 0), w = m[3].toLowerCase();
    if (h <= 23 && mi < 60) {
      if (h <= 12) {
        if (AM_ONLY.test(w)) h %= 12;
        else if (w === 'الظهر') h = h === 12 || h < 5 ? (h % 12) + 12 : h;
        else if ((w === 'الليل' || w === 'بالليل') && h === 12) h = 0;
        else h = (h % 12) + 12;
      }
      time = hm(h, mi);
    }
  } else if ((m = s.match(AT_RE))) {
    const h = +m[1], mi = +(m[2] || 0);
    if (h <= 23 && mi < 60) {
      // بدون ص/م: نختار أقرب وقت جاي
      const am = h % 12, now = nowHM();
      if (h > 12) time = hm(h, mi);
      else if (hm(am, mi) > now) time = hm(am, mi);
      else if (hm(am + 12, mi) > now) time = hm(am + 12, mi);
      else time = hm(am, mi);
    }
  }
  if (!time) return { title: text, time: '' };
  return { title: (text.slice(0, m.index) + ' ' + text.slice(m.index + m[0].length)).replace(/\s+/g, ' ').trim(), time };
}

/* ============ الإحصائيات ============ */
function rangeStats(n) {
  const k = today();
  let sum = 0, cnt = 0;
  for (let i = 0; i < n; i++) {
    const r = S.days[addDays(k, -i)];
    if (r && r.total) { sum += r.count / r.total; cnt++; }
  }
  return { pct: cnt ? Math.round((sum / cnt) * 100) : null, days: cnt };
}

function statsHTML() {
  const k = today();
  const s7 = rangeStats(7), s30 = rangeStats(30);
  const cols = [];
  for (let i = 6; i >= 0; i--) {
    const d = addDays(k, -i), r = S.days[d];
    const p = r && r.total ? pctOf(r.count, r.total) : null;
    cols.push(`<div class="col ${d === k ? 'today' : ''} ${ui.statsDay === d ? 'sel' : ''}" data-act="statday" data-d="${d}">
      <span class="p ltr">${p === null ? '–' : p + '%'}</span>
      <div class="barv ${p === null ? 'none' : ''}" style="height:${p === null ? 4 : Math.max(4, p)}%"></div>
      <span class="d">${d === k ? 'اليوم' : DAYS[dateOf(d).getDay()]}</span>
    </div>`);
  }
  const cells = [];
  for (let i = 29; i >= 0; i--) {
    const d = addDays(k, -i), r = S.days[d];
    const p = r && r.total ? r.count / r.total : null;
    const bg = p === null ? '' : `background:color-mix(in srgb, var(--accent) ${Math.round(18 + p * 82)}%, var(--hover))`;
    cells.push(`<div class="cell" style="${bg}" title="${d}${p === null ? '' : ' — ' + Math.round(p * 100) + '%'}"></div>`);
  }
  const totalDone = Object.values(S.days).reduce((a, r) => a + (r.count || 0), 0);
  const streaks = S.tasks.filter((t) => t.type === 'daily')
    .map((t) => ({ t, n: streak(t) })).filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n).slice(0, 5);

  let rec = '';
  if (ui.statsDay && S.days[ui.statsDay]?.items) {
    const r = S.days[ui.statsDay];
    rec = `<div class="day-rec"><h4>${fmtShort.format(dateOf(ui.statsDay))} — أنجزت ${r.count} من ${r.total}</h4>
      ${r.items.map((x) => `<div class="${x.d ? 'ok' : 'no'}">${x.d ? '✓' : '○'} <span>${esc(x.t)}</span></div>`).join('')}</div>`;
  } else if (ui.statsDay) {
    rec = '<div class="day-rec"><h4>ما فيه سجل لهذا اليوم</h4></div>';
  }

  return `
    <div class="sec">نسبة الإنجاز</div>
    <div class="cards">
      <div class="card accent"><div class="v ltr">${s7.pct === null ? '–' : s7.pct + '<small>%</small>'}</div><div class="l">آخر 7 أيام</div></div>
      <div class="card"><div class="v ltr">${s30.pct === null ? '–' : s30.pct + '<small>%</small>'}</div><div class="l">آخر 30 يوم</div></div>
    </div>
    <div class="sec">الأسبوع</div>
    <div class="chart">${cols.join('')}</div>
    ${rec}
    <div class="sec">آخر 30 يوم</div>
    <div class="strip">${cells.join('')}</div>
    <div class="legend"><span>قبل 30 يوم</span><span>اليوم</span></div>
    <div class="sec">سلاسل الإنجاز</div>
    ${streaks.length
      ? `<div class="streaks">${streaks.map((x) => `<div><span>${esc(x.t.title)}</span><b>🔥 ${x.n} يوم</b></div>`).join('')}</div>`
      : '<div class="streaks"><div><span style="color:var(--muted)">أنجز مهامك اليومية يومين ورا بعض وتبدأ السلسلة 🔥</span></div></div>'}
    <div class="cards" style="margin-top:8px">
      <div class="card"><div class="v ltr">${totalDone}</div><div class="l">مجموع ما أنجزت</div></div>
      <div class="card"><div class="v ltr">${s30.days}</div><div class="l">يوم نشط من 30</div></div>
    </div>
    <button class="link" data-act="view" data-v="summary">عرض ملخص اليوم</button>`;
}

/* ============ الإعدادات ============ */
function seg(key, opts) {
  return `<div class="seg">${opts.map(([v, l]) => `<button data-act="set" data-k="${key}" data-v="${v}" class="${S.settings[key] === v ? 'on' : ''}">${l}</button>`).join('')}</div>`;
}

function settingsHTML() {
  const st = S.settings;
  return `
    <div class="sec">الشكل</div>
    <div class="group">
      <div class="srow"><span>الجهة</span>${seg('side', [['right', 'يمين'], ['left', 'يسار']])}</div>
      <div class="srow"><span>الشكل المصغّر<span class="hint">إذا سكّرت القائمة</span></span>${seg('collapse', [['bar', 'شريط'], ['mini', 'مربع']])}</div>
      <div class="srow"><span>المظهر</span>${seg('theme', [['system', 'تلقائي'], ['light', 'فاتح'], ['dark', 'ليلي']])}</div>
    </div>
    <div class="sec">السلوك</div>
    <div class="group">
      <div class="srow"><span>التشغيل مع ويندوز</span><button class="switch ${ui.autostart ? 'on' : ''}" data-act="autostart"></button></div>
      <div class="srow"><span>إغلاق القائمة إذا ضغطت برا</span><button class="switch ${st.autoClose ? 'on' : ''}" data-act="toggle-set" data-k="autoClose"></button></div>
      <div class="srow"><span>وقت ملخص اليوم<span class="hint">رسالة بإنجازك آخر اليوم</span></span><input type="time" class="time-in" data-set="summaryTime" value="${st.summaryTime}"></div>
      <div class="srow"><span>اختصار الإضافة العام<span class="hint">يفتح حقل الإضافة من أي برنامج</span></span>
        <button class="keycap ${ui.capture ? 'wait' : ''}" data-act="capture">${ui.capture ? 'اضغط الاختصار…' : esc(st.shortcut || 'بدون')}</button></div>
    </div>
    ${ui.msg ? `<div class="msg">${esc(ui.msg)}</div>` : ''}
    <div class="sec">بياناتك</div>
    <div class="group">
      <div class="srow"><span>فتح مجلد البيانات</span><button class="btn" data-act="open-data">فتح</button></div>
      <div class="srow"><span class="quit">إغلاق مُنجز نهائيًا</span><button class="btn danger" data-act="quit">خروج</button></div>
    </div>
    <div class="privacy">🔒 كل شيء محفوظ على جهازك فقط — بدون حساب ولا خادم ولا إنترنت.</div>`;
}

/* ============ الملخص ============ */
function summaryHTML() {
  const { list, done, total, pct } = progress();
  const left = list.filter((t) => !isDone(t));
  const leftOnce = left.filter((t) => t.type === 'once');
  const msg = pct === 100 ? 'يومك كامل! خلّصت كل مهامك 🎉'
    : pct >= 70 ? 'شغل رهيب، باقي لك القليل 👏'
      : pct >= 40 ? 'خطوة طيبة، وبكرا أحسن 💪'
        : total ? 'ولا يهمك، بكرا يوم جديد 🌱' : 'ما كان عندك مهام اليوم';
  return `<div class="summary">
    <div class="sum-ring">${ring(pct, 120, 10)}<b class="ltr">${pct}%</b></div>
    <h2>أنجزت ${done} من ${total}</h2>
    <p>${msg}</p>
    ${left.length ? `<div class="left-list"><h4>ما خلصت:</h4>
      ${left.map((t) => `<div><span>○</span><span>${esc(t.title)}</span></div>`).join('')}
      ${left.some((t) => t.type === 'daily') ? '<div class="hint">المهام اليومية تتجدد بكرا تلقائيًا.</div>' : ''}
    </div>` : ''}
    <div class="sum-btns">
      ${leftOnce.length ? `<button class="btn primary wide" data-act="carry">انقل غير المنجزة (${leftOnce.length}) لبكرا</button>` : ''}
      <button class="btn wide" data-act="view" data-v="tasks">تمام</button>
    </div>
  </div>`;
}

/* ============ الإجراءات ============ */
function openPanel(view = 'tasks') {
  ui.open = true;
  ui.view = view;
  api.focus();
  render();
}

function closePanel() {
  ui.open = false;
  ui.editing = ui.confirming = null;
  if (ui.capture) stopCapture();
  render();
  api.blur();
}

function focusAdd() {
  openPanel('tasks');
  requestAnimationFrame(() => $('#addInput')?.focus());
}

function toggleTask(t) {
  const v = !isDone(t);
  setDone(t, v);
  if (v) (t.subs || []).forEach((s) => setSubDone(t, s, true));
  save();
}

function act(name, el) {
  const id = el.dataset.id;
  const t = id ? S.tasks.find((x) => x.id === id) : null;
  if (name.startsWith('tp-')) { tpAct(name, el); return; }
  if (name.startsWith('dp-')) { dpAct(name, el); return; }
  switch (name) {
    case 'open': openPanel('tasks'); return;
    case 'close': closePanel(); return;
    case 'view':
      ui.statsDay = null;
      openPanel(ui.view === el.dataset.v && el.dataset.v !== 'tasks' ? 'tasks' : el.dataset.v);
      return;
    case 'theme':
      S.settings.theme = effTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(); save(); break;
    case 'toggle': if (t) toggleTask(t); break;
    case 'star': if (t) { t.star = !t.star; save(); } break;
    case 'expand':
      if (ui.expanded.has(id)) ui.expanded.delete(id); else ui.expanded.add(id);
      render();
      if (ui.expanded.has(id)) $(`.sub-add[data-id="${id}"] input`)?.focus();
      return;
    case 'edit':
      if (t) {
        const st = startOf(t);
        Object.assign(ui, {
          editing: id, editType: t.type, editTime: t.time || '', editDate: st > today() ? st : '',
          editTitle: t.title, editFocus: true, confirming: null, tp: null, dp: null,
        });
      }
      break;
    case 'edit-cancel': ui.editing = null; ui.tp = ui.dp = null; break;
    case 'etype': ui.editType = el.dataset.v; $$('[data-act="etype"]').forEach((b) => b.classList.toggle('on', b === el)); return;
    case 'del': ui.confirming = id; break;
    case 'del-no': ui.confirming = null; break;
    case 'del-yes':
      S.tasks = S.tasks.filter((x) => x.id !== id);
      ui.confirming = null; ui.expanded.delete(id); save(); break;
    case 'subtoggle': {
      const s = t?.subs.find((x) => x.id === el.dataset.sid);
      if (!s) return;
      setSubDone(t, s, !subDone(t, s));
      const all = t.subs.every((x) => subDone(t, x));
      if (all !== isDone(t)) setDone(t, all);
      save(); break;
    }
    case 'subdel':
      if (t) { t.subs = t.subs.filter((x) => x.id !== el.dataset.sid); save(); }
      break;
    case 'addtype': S.settings.addType = el.dataset.v; save(); renderAddOpts($('.pv')); return;
    case 'addstar': ui.add.star = !ui.add.star; renderAddOpts($('.pv')); return;
    case 'statday': ui.statsDay = ui.statsDay === el.dataset.d ? null : el.dataset.d; break;
    case 'carry':
      todayList().filter((x) => !isDone(x) && x.type === 'once').forEach(carry);
      save(); ui.view = 'tasks'; break;
    case 'carry1': if (t) { carry(t); save(); } break;
    case 'upcoming': ui.showUpcoming = !ui.showUpcoming; break;
    case 'set': {
      const k = el.dataset.k, v = el.dataset.v;
      S.settings[k] = v;
      if (k === 'theme') applyTheme();
      if (k === 'side') { applySide(); api.setSide(v); }
      save(); break;
    }
    case 'toggle-set': S.settings[el.dataset.k] = !S.settings[el.dataset.k]; save(); break;
    case 'autostart':
      api.setAutostart(!ui.autostart).then((v) => { ui.autostart = v; render(); });
      return;
    case 'capture':
      if (ui.capture) stopCapture(); else { ui.capture = true; ui.msg = ''; api.pauseShortcut(); }
      break;
    case 'collapse': S.settings.collapse = el.dataset.v; save(); break;
    case 'open-data': api.openData(); return;
    case 'quit': api.quit(); return;
    default: return;
  }
  render();
}

const $$ = (s, r = document) => [...r.querySelectorAll(s)];

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (el) act(el.dataset.act, el);
});

document.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target;
  if (f.classList.contains('add')) {
    const input = $('#addInput', f);
    const raw = input.value.trim();
    if (!raw) return;
    const p = parseTime(raw);
    addTask(p.title || raw, S.settings.addType, ui.add.star, ui.add.time || p.time, ui.add.date);
    input.value = '';
    ui.add = { star: false, time: '', parsed: '', date: '' };
    ui.tp = ui.dp = null;
    save(); render();
    $('#addInput')?.focus();
  } else if (f.classList.contains('sub-add')) {
    const t = S.tasks.find((x) => x.id === f.dataset.id);
    const input = $('input', f);
    const title = input.value.trim();
    if (!t || !title) return;
    t.subs.push({ id: uid(), title, done: false });
    if (isDone(t)) setDone(t, false);
    save(); render();
    $(`.sub-add[data-id="${t.id}"] input`)?.focus();
  } else if (f.classList.contains('edit')) {
    const t = S.tasks.find((x) => x.id === f.dataset.id);
    let title = f.elements.title.value.trim();
    if (!t || !title) return;
    const p = parseTime(title);
    if (p.time && p.title) {
      title = p.title;
      if (ui.editTime === (t.time || '')) ui.editTime = p.time;
    }
    if (ui.editType !== t.type) {
      const wasDone = isDone(t);
      t.type = ui.editType;
      if (t.type === 'once') { t.doneOn = null; t.due = null; }
      setDone(t, wasDone);
    }
    const k = today(), later = ui.editDate > k ? ui.editDate : '';
    if (t.type === 'daily') {
      if (later) t.created = later; else if (t.created > k) t.created = k;
    } else if (later) {
      t.due = later; t.carried = false; t.doneOn = null;
    } else if (t.due > k) t.due = null;
    t.title = title;
    t.time = ui.editTime;
    ui.editing = null;
    ui.tp = ui.dp = null;
    save(); render();
  }
});

document.addEventListener('input', (e) => {
  const el = e.target;
  if (el.id === 'addInput') {
    const t = parseTime(el.value).time;
    if (t !== ui.add.parsed) { ui.add.parsed = t; renderAddOpts($('.pv')); }
  } else if (el.name === 'title' && el.closest('.edit')) ui.editTitle = el.value;
});

document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.dataset.set) { S.settings[el.dataset.set] = el.value; save(); }
});

/* ============ لوحة المفاتيح ============ */
const CODE_KEY = (code) => {
  if (/^Key[A-Z]$/.test(code)) return code.slice(3);
  if (/^Digit\d$/.test(code)) return code.slice(5);
  if (/^F\d{1,2}$/.test(code)) return code;
  return { Space: 'Space', Enter: 'Enter', Backquote: '`', Comma: ',', Period: '.', Slash: '/' }[code] || null;
};

function stopCapture() {
  ui.capture = false;
  api.setShortcut(S.settings.shortcut);
}

document.addEventListener('keydown', async (e) => {
  if (ui.capture) {
    e.preventDefault();
    if (e.key === 'Escape') { stopCapture(); render(); return; }
    const key = CODE_KEY(e.code);
    if (!key) return;
    const mods = [e.ctrlKey && 'Ctrl', e.altKey && 'Alt', e.shiftKey && 'Shift', e.metaKey && 'Super'].filter(Boolean);
    if (!mods.length) { ui.msg = 'لازم يكون فيه Ctrl أو Alt أو Shift أو Win مع الحرف'; render(); return; }
    const acc = [...mods, key].join('+');
    ui.capture = false;
    if (await api.setShortcut(acc)) { S.settings.shortcut = acc; ui.msg = ''; save(); } else {
      ui.msg = `الاختصار ${acc} محجوز من ويندوز أو برنامج ثاني، جرّب غيره`;
      api.setShortcut(S.settings.shortcut);
    }
    render();
    return;
  }
  // e.code يشتغل حتى والكيبورد عربي
  if (e.ctrlKey && !e.altKey && !e.shiftKey && e.code === 'KeyN') { e.preventDefault(); focusAdd(); return; }
  if (e.key === 'Escape') {
    if (ui.tp || ui.dp) { ui.tp = ui.dp = null; refreshTp(); return; }
    if (ui.confirming || ui.editing) { ui.confirming = ui.editing = null; render(); } else if (ui.open && ui.view !== 'tasks') { ui.view = 'tasks'; render(); } else if (ui.open) closePanel();
  }
});

window.addEventListener('blur', () => {
  if (!S || !S.settings.autoClose || !ui.open || ui.capture) return;
  setTimeout(() => { if (!document.hasFocus() && ui.open) closePanel(); }, 180);
});

/* ============ النقر عبر النافذة الشفافة ============ */
let ignoring = true;
let drag = null;
function setIgnore(v) { if (v !== ignoring) { ignoring = v; api.ignore(v); } }
document.addEventListener('mousemove', (e) => {
  if (drag) return;
  setIgnore(!e.target.closest('.hit'));
});
document.documentElement.addEventListener('mouseleave', () => { if (!drag) { setIgnore(true); hideTip(); } });

/* ============ السحب العمودي ============ */
document.addEventListener('pointerdown', (e) => {
  const h = e.target.closest('[data-drag]');
  if (!h || e.button !== 0 || e.target.closest('button:not([data-drag]), input')) return;
  const dock = $('.dock');
  drag = { sy: e.clientY, st: dock.offsetTop, moved: false, h, dock, pid: e.pointerId };
});
document.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dy = e.clientY - drag.sy;
  if (!drag.moved && Math.abs(dy) < 4) return;
  if (!drag.moved) { drag.moved = true; drag.h.setPointerCapture(drag.pid); hideTip(); document.body.style.cursor = 'grabbing'; }
  drag.dock.style.top = clamp(drag.st + dy, 8, innerHeight - drag.dock.offsetHeight - 8) + 'px';
});
document.addEventListener('pointerup', (e) => {
  if (!drag) return;
  const d = drag;
  drag = null;
  document.body.style.cursor = '';
  if (d.moved) {
    S.settings.y = d.dock.offsetTop;
    save();
  } else if (d.h.dataset.click) {
    act(d.h.dataset.click, d.h);
  }
  setIgnore(!document.elementFromPoint(e.clientX, e.clientY)?.closest('.hit'));
});

/* ============ ترتيب المهام بالسحب ============ */
let dragId = null;
document.addEventListener('dragstart', (e) => {
  const li = e.target.closest?.('.item');
  if (!li || ui.editing) { e.preventDefault(); return; }
  dragId = li.dataset.id;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', dragId);
  requestAnimationFrame(() => li.classList.add('dragging'));
});
document.addEventListener('dragover', (e) => {
  if (!dragId) return;
  const li = e.target.closest('.item');
  $$('.drop-before, .drop-after').forEach((x) => x.classList.remove('drop-before', 'drop-after'));
  if (!li || li.dataset.id === dragId) return;
  e.preventDefault();
  const r = li.getBoundingClientRect();
  li.classList.add(e.clientY < r.top + r.height / 2 ? 'drop-before' : 'drop-after');
});
document.addEventListener('drop', (e) => {
  if (!dragId) return;
  e.preventDefault();
  const li = $('.drop-before, .drop-after');
  if (li) {
    const ids = todayList().map((t) => t.id).filter((x) => x !== dragId);
    let i = ids.indexOf(li.dataset.id);
    if (li.classList.contains('drop-after')) i++;
    ids.splice(i, 0, dragId);
    const orders = todayList().map((t) => t.order).sort((a, b) => a - b);
    ids.forEach((id, n) => { S.tasks.find((t) => t.id === id).order = orders[n]; });
    save();
  }
  dragId = null;
  render();
});
document.addEventListener('dragend', () => {
  if (!dragId) return;
  dragId = null;
  render();
});

/* ============ التلميحات ============ */
const tip = $('#tip');
function hideTip() { tip.classList.remove('on'); }
document.addEventListener('mouseover', (e) => {
  const el = e.target.closest('[data-tip]');
  if (!el || ui.open || drag) { hideTip(); return; }
  const r = el.getBoundingClientRect();
  const dr = $('.dock').getBoundingClientRect();
  tip.textContent = el.dataset.tip;
  if (S.settings.side === 'left') { tip.style.left = dr.right + 10 + 'px'; tip.style.right = 'auto'; } else { tip.style.right = innerWidth - dr.left + 10 + 'px'; tip.style.left = 'auto'; }
  tip.style.top = r.top + r.height / 2 + 'px';
  tip.classList.add('on');
});

/* ============ المؤقت: يوم جديد، تذكيرات، ملخص ============ */
let lastDay = '';
let lastDue = '';
function tick() {
  const k = today();
  let changed = false;
  if (k !== lastDay) {
    if (lastDay) { ui.editing = null; save(); }
    lastDay = k;
    changed = true;
  }
  const list = todayList();
  const dd = day();
  let sig = '';
  for (const t of list) {
    if (!isDue(t)) continue;
    sig += t.id;
    if (!dd.notified[t.id]) {
      dd.notified[t.id] = true;
      api.notify(`⏰ ${t.title}`, 'حان وقت المهمة — من مُنجز');
      save();
    }
  }
  if (sig !== lastDue) { lastDue = sig; changed = true; }
  if (S.settings.summaryTime && nowHM() >= S.settings.summaryTime && S.settings.summaryShown !== k && list.length) {
    S.settings.summaryShown = k;
    save();
    ui.open = true;
    ui.view = 'summary';
    changed = true;
  }
  if (!changed) return;
  // لا نخرّب الكتابة إذا المستخدم في نص حقل
  const a = document.activeElement;
  if (a && a.tagName === 'INPUT' && ui.open && ui.view === 'tasks') {
    renderHeader($('.dock'));
    if (!a.closest('.list')) renderList($('.pv'));
  } else render();
}

function handleCmd(cmd) {
  if (cmd === 'add') focusAdd();
  else if (cmd === 'open') openPanel('tasks');
  else if (cmd === 'stats') openPanel('stats');
  else if (cmd === 'flip') {
    S.settings.side = S.settings.side === 'left' ? 'right' : 'left';
    applySide(); api.setSide(S.settings.side); save(); render();
  }
}

/* ============ البداية ============ */
(async () => {
  const init = await api.getState();
  S = init.state || { v: 1, tasks: [], days: {}, settings: {} };
  S.tasks ||= [];
  S.days ||= {};
  S.settings = { ...DEFAULTS, ...S.settings };
  ui.autostart = init.autostart;
  if (!init.state) { seed(); save(); }
  // v2: الملخص صار 7 مساءً بدل 9، ونحدّث اللي ما غيّروا الوقت الافتراضي
  if ((S.v || 1) < 2) {
    if (S.settings.summaryTime === '21:00') S.settings.summaryTime = '19:00';
    S.v = 2;
    save();
  }
  applyTheme();
  applySide();
  api.onCmd(handleCmd);
  if (location.hash === '#panel') { ui.open = true; ui.view = 'tasks'; }
  tick();
  render();
  setInterval(tick, 15000);
  window.addEventListener('resize', render);
})();
