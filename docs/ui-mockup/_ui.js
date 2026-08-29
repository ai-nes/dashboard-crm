/* ============================================================
   ADMISSION COMMAND CENTER — khung dùng chung + trình vẽ biểu đồ
   Không phụ thuộc thư viện ngoài. Mọi biểu đồ là SVG dựng tay.
   ============================================================ */

const NAV = [
  ['A', 'Command & Market Intelligence', [
    ['M-01', 'Admission Command Center', 'M-01-admission-command-center.html'],
    ['M-02', 'Market Intelligence Map', 'M-02-market-intelligence-map.html'],
    ['M-03', 'School Intelligence', 'M-03-school-intelligence.html'],
    ['M-04', 'Demographic Explorer', 'M-04-demographic-explorer.html'],
  ]],
  ['B', 'Journey & Execution', [
    ['M-05', 'Admission Funnel', 'M-05-admission-funnel.html'],
    ['M-06', 'Sales Pipeline', 'M-06-sales-pipeline.html'],
    ['M-07', 'AI Next Best Action', 'M-07-ai-next-best-action.html'],
    ['M-08', 'Student 360', 'M-08-student-360.html'],
  ]],
  ['C', 'Performance', [
    ['M-09', 'Regional & Team', 'M-09-regional-performance.html'],
    ['M-10', 'SLA & Risk Center', 'M-10-sla-risk-center.html'],
    ['M-11', 'School & Field Activity', 'M-11-school-field-activity.html'],
  ]],
  ['D', 'Growth & Revenue', [
    ['M-12', 'Campaign Intelligence', 'M-12-campaign-intelligence.html'],
    ['M-13', 'Revenue & Forecast', 'M-13-revenue-forecast.html'],
  ]],
  ['E', 'Trust & Control', [
    ['M-14', 'AI Command Stream', 'M-14-ai-command-stream.html'],
    ['M-15', 'Ask Admission AI', 'M-15-ask-admission-ai.html'],
    ['M-16', 'AI Trust & Model Health', 'M-16-ai-trust-model-health.html'],
    ['M-17', 'Data Health & Sources', 'M-17-data-health-sources.html'],
    ['M-18', 'Alerts & Subscriptions', 'M-18-alerts-subscriptions.html'],
  ]],
];

const FILTERS = [
  ['Năm', '2026'],
  ['Kỳ', 'Từ đầu mùa'],
  ['Cơ sở', 'Tất cả'],
  ['Địa bàn', 'Toàn quốc'],
  ['Ngành', 'Tất cả'],
  ['Kênh', 'Tất cả'],
  ['Nhân sự', 'Tất cả'],
];

/* ---------- khung trang ---------- */
function mountShell(opts) {
  const cur = opts.code;
  const rail = document.createElement('nav');
  rail.className = 'rail';
  rail.innerHTML = `
    <div class="rail__brand">
      <div class="rail__mark" aria-hidden="true"></div>
      <div>
        <div class="rail__name">Admission<br>Command Center</div>
        <div class="rail__sub">Mockup v2.0</div>
      </div>
    </div>
    ${NAV.map(([letter, group, items]) => `
      <div class="rail__group">
        <div class="rail__glabel"><b>${letter}</b> ${group}</div>
        ${items.map(([code, name, href]) => `
          <a class="nav" href="${href}"${code === cur ? ' aria-current="page"' : ''}>
            <code>${code}</code><span>${name}</span>
          </a>`).join('')}
      </div>`).join('')}
    <div class="rail__foot">
      Bản mockup giao diện.<br>Toàn bộ số liệu là <b>dữ liệu mô phỏng</b>.<br>
      <a href="index.html" style="color:var(--s1)">Danh mục màn hình</a>
    </div>`;

  const main = document.createElement('div');
  main.className = 'main';
  const filters = (opts.filters || FILTERS)
    .map(([k, v, off]) => `<span class="fchip${off ? ' fchip--off' : ''}"><span>${k}</span><b>${v}</b></span>`).join('');

  main.innerHTML = `
    <header class="top">
      <div class="top__head">
        <div class="top__title">
          <code class="top__code">${opts.code}</code>
          <h1>${opts.title}</h1>
          <p>${opts.lede}</p>
        </div>
        <div class="top__tools">
          <span class="tag-sim">Dữ liệu mô phỏng</span>
          <button class="btn" id="themeBtn" type="button">Giao diện tối</button>
        </div>
      </div>
      <div class="filters">${filters}${opts.filterNote ? `<span class="fchip fchip--off"><span>ghi chú</span><b>${opts.filterNote}</b></span>` : ''}</div>
    </header>
    <div class="canvas" id="canvas"></div>`;

  const app = document.createElement('div');
  app.className = 'app';
  app.append(rail, main);
  document.body.prepend(app);

  const btn = main.querySelector('#themeBtn');
  const apply = (t) => {
    document.documentElement.setAttribute('data-theme', t);
    btn.textContent = t === 'dark' ? 'Giao diện sáng' : 'Giao diện tối';
  };
  let saved = null;
  try { saved = localStorage.getItem('acc-theme'); } catch (e) { /* bỏ qua */ }
  if (saved) apply(saved);
  else btn.textContent = matchMedia('(prefers-color-scheme: dark)').matches ? 'Giao diện sáng' : 'Giao diện tối';
  btn.addEventListener('click', () => {
    const now = document.documentElement.getAttribute('data-theme');
    const next = now === 'dark' ? 'light' : (now === 'light' ? 'dark' : (matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'dark'));
    apply(next);
    try { localStorage.setItem('acc-theme', next); } catch (e) { /* bỏ qua */ }
  });

  /* trên điện thoại, kéo mục đang mở vào tầm nhìn của dải điều hướng ngang */
  if (matchMedia('(max-width: 820px)').matches) {
    const cur2 = rail.querySelector('a.nav[aria-current="page"]');
    if (cur2) rail.scrollLeft = Math.max(0, cur2.offsetLeft - 90);
  }

  return main.querySelector('#canvas');
}

/* ---------- tiện ích ---------- */
const fmt = (n) => n.toLocaleString('vi-VN');
const pct = (n, d = 1) => n.toFixed(d).replace('.', ',') + '%';
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* tooltip dùng chung cho mọi biểu đồ */
let TIP;
function tipInit() {
  if (TIP) return TIP;
  TIP = document.createElement('div');
  TIP.style.cssText = 'position:fixed;z-index:99;pointer-events:none;opacity:0;transition:opacity .12s;' +
    'background:var(--ink);color:var(--page);font:500 11.5px/1.4 var(--ff-ui);padding:6px 9px;' +
    'border-radius:6px;max-width:240px;box-shadow:0 6px 20px -8px rgba(0,0,0,.5)';
  document.body.appendChild(TIP);
  return TIP;
}
function bindTip(root) {
  const t = tipInit();
  root.querySelectorAll('[data-tip]').forEach(el => {
    el.addEventListener('pointerenter', e => { t.innerHTML = el.dataset.tip; t.style.opacity = '1'; });
    el.addEventListener('pointermove', e => {
      t.style.left = Math.min(e.clientX + 14, innerWidth - 250) + 'px';
      t.style.top = (e.clientY + 18) + 'px';
    });
    el.addEventListener('pointerleave', () => { t.style.opacity = '0'; });
  });
}

/* ---------- biểu đồ cột nhóm / chồng ---------- */
function barChart({ data, series, height = 190, stacked = false, valueFmt = fmt, yLabel = '' }) {
  const W = 720, H = height, P = { t: 14, r: 8, b: 26, l: 46 };
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const totals = data.map(d => stacked ? series.reduce((a, s) => a + d[s.key], 0) : Math.max(...series.map(s => d[s.key])));
  const max = Math.max(...totals) * 1.12;
  const bw = iw / data.length;
  const ticks = 4;
  let g = '';
  for (let i = 0; i <= ticks; i++) {
    const y = P.t + ih - (ih * i / ticks);
    g += `<line class="grid-l" x1="${P.l}" y1="${y}" x2="${W - P.r}" y2="${y}"/>
          <text class="axis-t" x="${P.l - 7}" y="${y + 3}" text-anchor="end">${valueFmt(Math.round(max * i / ticks))}</text>`;
  }
  let bars = '';
  data.forEach((d, i) => {
    const x0 = P.l + i * bw;
    if (stacked) {
      let acc = 0;
      series.forEach(s => {
        const h = (d[s.key] / max) * ih;
        const y = P.t + ih - acc - h;
        bars += `<rect x="${x0 + bw * .18}" y="${y}" width="${bw * .64}" height="${Math.max(h - 2, 0)}" rx="3"
                  fill="var(--${s.c})" data-tip="<b>${esc(d.label)}</b><br>${esc(s.name)}: ${valueFmt(d[s.key])}"/>`;
        acc += h;
      });
    } else {
      const n = series.length, gw = (bw * .68) / n;
      series.forEach((s, j) => {
        const h = (d[s.key] / max) * ih;
        bars += `<rect x="${x0 + bw * .16 + j * gw}" y="${P.t + ih - h}" width="${gw - 2}" height="${Math.max(h, 0)}" rx="3"
                  fill="var(--${s.c})" data-tip="<b>${esc(d.label)}</b><br>${esc(s.name)}: ${valueFmt(d[s.key])}"/>`;
      });
    }
    bars += `<text class="axis-t" x="${x0 + bw / 2}" y="${H - 8}" text-anchor="middle">${esc(d.label)}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(yLabel || 'Biểu đồ cột')}">
    ${g}<line class="axis-l" x1="${P.l}" y1="${P.t + ih}" x2="${W - P.r}" y2="${P.t + ih}"/>${bars}</svg>`;
}

/* ---------- biểu đồ đường ---------- */
function lineChart({ data, series, height = 200, valueFmt = fmt, band = null, yLabel = '' }) {
  const W = 720, H = height, P = { t: 14, r: 46, b: 26, l: 48 };
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  let allv = [];
  series.forEach(s => data.forEach(d => { if (d[s.key] != null) allv.push(d[s.key]); }));
  if (band) data.forEach(d => { if (d[band.hi] != null) allv.push(d[band.hi]); });
  const max = Math.max(...allv) * 1.1, min = 0;
  const X = i => P.l + (iw * i) / (data.length - 1);
  const Y = v => P.t + ih - ((v - min) / (max - min)) * ih;
  let g = '';
  for (let i = 0; i <= 4; i++) {
    const y = P.t + ih - (ih * i / 4);
    g += `<line class="grid-l" x1="${P.l}" y1="${y}" x2="${W - P.r}" y2="${y}"/>
          <text class="axis-t" x="${P.l - 7}" y="${y + 3}" text-anchor="end">${valueFmt(Math.round(max * i / 4))}</text>`;
  }
  let bandEl = '';
  if (band) {
    const up = data.map((d, i) => d[band.hi] == null ? null : `${X(i)},${Y(d[band.hi])}`).filter(Boolean);
    const lo = data.map((d, i) => d[band.lo] == null ? null : `${X(i)},${Y(d[band.lo])}`).filter(Boolean).reverse();
    bandEl = `<polygon points="${up.concat(lo).join(' ')}" fill="var(--s1)" opacity=".13"/>`;
  }
  let paths = '', dots = '', labels = '';
  series.forEach(s => {
    const pts = data.map((d, i) => d[s.key] == null ? null : [X(i), Y(d[s.key])]).filter(Boolean);
    paths += `<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="var(--${s.c})"
               stroke-width="2" stroke-linejoin="round" stroke-linecap="round"${s.dash ? ' stroke-dasharray="5 4"' : ''}/>`;
    const last = pts[pts.length - 1];
    labels += `<text class="axis-t" x="${last[0] + 6}" y="${last[1] + 3.5}" fill="var(--${s.c})" style="font-weight:600">${esc(s.name)}</text>`;
    data.forEach((d, i) => {
      if (d[s.key] == null) return;
      dots += `<circle cx="${X(i)}" cy="${Y(d[s.key])}" r="8" fill="transparent"
                data-tip="<b>${esc(d.label)}</b><br>${esc(s.name)}: ${valueFmt(d[s.key])}"/>`;
    });
  });
  let xt = '';
  data.forEach((d, i) => { if (i % Math.ceil(data.length / 8) === 0 || i === data.length - 1) xt += `<text class="axis-t" x="${X(i)}" y="${H - 8}" text-anchor="middle">${esc(d.label)}</text>`; });
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(yLabel || 'Biểu đồ đường')}">
    ${g}${bandEl}<line class="axis-l" x1="${P.l}" y1="${P.t + ih}" x2="${W - P.r}" y2="${P.t + ih}"/>${paths}${dots}${labels}${xt}</svg>`;
}

/* ---------- đường xu hướng thu nhỏ ---------- */
function spark(vals, color = 's1', w = 92, h = 24) {
  const max = Math.max(...vals), min = Math.min(...vals), r = (max - min) || 1;
  const pts = vals.map((v, i) => `${(w * i) / (vals.length - 1)},${h - 2 - ((v - min) / r) * (h - 5)}`).join(' ');
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">
    <polyline points="${pts}" fill="none" stroke="var(--${color})" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/* ---------- bảng nhiệt ---------- */
function heat({ rows, cols, values, fmtV = (v) => pct(v, 0), title = '' }) {
  const steps = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'];
  const flat = values.flat().filter(v => v != null);
  const max = Math.max(...flat), min = Math.min(...flat);
  const step = v => steps[Math.min(6, Math.max(0, Math.round(((v - min) / ((max - min) || 1)) * 6)))];
  let h = `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>${esc(title)}</th>${cols.map(c => `<th class="num">${esc(c)}</th>`).join('')}</tr></thead><tbody>`;
  rows.forEach((r, i) => {
    h += `<tr><td class="name">${esc(r)}</td>` + cols.map((c, j) => {
      const v = values[i][j];
      if (v == null) return `<td class="num subtle">—</td>`;
      const s = step(v);
      return `<td class="num qt${s.slice(1)}" data-tip="<b>${esc(r)} · ${esc(c)}</b><br>${fmtV(v)}"
        style="border-bottom-color:var(--surface)">${fmtV(v)}</td>`;
    }).join('') + `</tr>`;
  });
  return h + '</tbody></table></div>';
}

/* ---------- phễu ---------- */
function funnel(stages, opts = {}) {
  const max = stages[0].n;
  let h = '<div class="funnel">';
  stages.forEach((s, i) => {
    const w = (s.n / max) * 100;
    h += `<div class="frow">
      <div class="frow__l">${esc(s.name)}<span>${esc(s.note || '')}</span></div>
      <div class="frow__bar"><i style="width:${w}%;background:var(--${s.c || 'q' + Math.min(7, i + 2)})"
        data-tip="<b>${esc(s.name)}</b><br>${fmt(s.n)} hồ sơ"></i></div>
      <div class="frow__n"><b>${fmt(s.n)}</b></div>
    </div>`;
    if (i < stages.length - 1) {
      const cv = (stages[i + 1].n / s.n) * 100;
      const flag = opts.leak === i ? ` · <span class="down" style="font-weight:600">điểm rò rỉ lớn nhất</span>` : '';
      h += `<div class="fgap"><span></span><span>chuyển đổi <b>${pct(cv)}</b>${stages[i + 1].prev != null ? ` · kỳ trước <b>${pct(stages[i + 1].prev)}</b>` : ''}${flag}</span><span></span></div>`;
    }
  });
  return h + '</div>';
}
