/*
 * 生日選擇器：把 <input type="date"> 換成「年／月／日」三個選單
 * - 預設國曆；可以切換成農曆（含閏月），會自動換算成國曆
 * - 手機上點開就是系統的滾輪選單（iPhone 滾輪、Android 清單）
 * - 不會出現今天以後的日期
 * - 原本的 input 保留（變成隱藏），值一律是「國曆」YYYY-MM-DD，其他程式不用改
 * - 農曆換算需要先載入 lib/astro.js、lib/chinese-calendar.js（沒載入就不顯示農曆選項）
 */
(function (root) {
  'use strict';
  var MIN_YEAR = 1920;
  var css = '' +
    '.bp { display: grid; grid-template-columns: 1.35fr 1fr 1fr; gap: 8px; }' +
    '.bp-mode { display: inline-flex; gap: 0; vertical-align: 1px; margin-left: 8px; border: 1px solid var(--line, #DED4C4); border-radius: 999px; overflow: hidden; letter-spacing: 0; }' +
    '.bp-mode button { font: inherit; font-size: 11.5px; line-height: 1.5; padding: 0 9px; border: 0; background: transparent; color: var(--muted, #8A8076); cursor: pointer; }' +
    '.bp-mode button.on { background: var(--accent-grad, #9B7535); color: #FFFBF2; }' +
    '.bp-sel { position: relative; }' +
    '.bp-sel::after { content: ""; position: absolute; right: 4px; top: 50%; width: 6px; height: 6px; margin-top: -5px; border-right: 1.5px solid currentColor; border-bottom: 1.5px solid currentColor; transform: rotate(45deg); opacity: .45; pointer-events: none; }' +
    '.bp select { width: 100%; font: inherit; font-size: 15px; padding: 7px 18px 7px 0; border: none; border-bottom: 1px solid var(--line, #DED4C4); background: transparent; color: inherit; border-radius: 0; -webkit-appearance: none; appearance: none; cursor: pointer; }' +
    '.bp select:focus { outline: none; border-bottom-color: var(--gold, #A88550); }' +
    '.bp select.empty { color: var(--muted, #8A8076); }' +
    '.bp-hint { grid-column: 1 / -1; font-size: 12px; color: var(--muted, #8A8076); min-height: 1em; }' +
    '.bp-hint.warn { color: var(--red, #A85A4A); }' +
    '.bp-cell { grid-column: span 2; }';

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function daysIn(y, m) { return new Date(y || 2000, m, 0).getDate(); }

  function attach(id) {
    var input = document.getElementById(id); if (!input || input._bp) return;
    if (!document.getElementById('bp-style')) { var st = document.createElement('style'); st.id = 'bp-style'; st.textContent = css; document.head.appendChild(st); }
    var CC = function () { return root.ChineseCalendar && root.ChineseCalendar.toSolar ? root.ChineseCalendar : null; };
    var today = new Date(), ty = today.getFullYear(), tm = today.getMonth() + 1, td = today.getDate();
    var todayKey = ty * 10000 + tm * 100 + td;
    var mode = 'solar';
    var wrap = document.createElement('div'); wrap.className = 'bp';
    var modeBox = document.createElement('div'); modeBox.className = 'bp-mode'; modeBox.setAttribute('role', 'group'); modeBox.setAttribute('aria-label', '曆法');
    modeBox.innerHTML = '<button type="button" data-m="solar" class="on">國曆</button><button type="button" data-m="lunar">農曆</button>';
    wrap.appendChild(modeBox);
    function mk(label, cls) {
      var box = document.createElement('div'); box.className = 'bp-sel';
      var s = document.createElement('select'); s.setAttribute('aria-label', label); s.className = cls;
      box.appendChild(s); wrap.appendChild(box); return s;
    }
    var sy = mk('出生年', 'bp-y'), sm = mk('出生月', 'bp-m'), sd = mk('出生日', 'bp-d');
    var hint = document.createElement('div'); hint.className = 'bp-hint'; wrap.appendChild(hint);
    // list: [[value, label]]
    var opts = function (sel, list, ph, cur) {
      cur = cur === undefined || cur === null ? '' : String(cur);
      sel.innerHTML = '<option value="">' + ph + '</option>' + list.map(function (o) { return '<option value="' + o[0] + '"' + (String(o[0]) === cur ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('');
      if (cur && !list.some(function (o) { return String(o[0]) === cur; })) sel.value = '';
      sel.classList.toggle('empty', !sel.value);
    };
    var range = function (a, b) { var r = []; for (var i = a; i <= b; i++) r.push(i); return r; };
    var years = range(MIN_YEAR, ty).reverse();
    function lunarMonthList(y) {
      var C = CC(); if (!C || !y) return range(1, 12).map(function (m) { return [String(m), C ? C.MONTH_NAMES[m - 1] + '月' : m + '月']; });
      return C.lunarMonths(y).map(function (mo) { return [(mo.leap ? 'L' : '') + mo.month, (mo.leap ? '閏' : '') + C.MONTH_NAMES[mo.month - 1] + '月', mo.days]; });
    }
    function refresh() {
      var y = +sy.value || 0, m = sm.value, d = sd.value;
      opts(sy, years.map(function (v) { return [v, v + '年']; }), mode === 'lunar' ? '農曆年' : '年', y || '');
      if (mode === 'solar') {
        opts(sm, range(1, y === ty ? tm : 12).map(function (v) { return [v, v + '月']; }), '月', m);
        var mm = +sm.value || 0;
        opts(sd, range(1, (y === ty && mm === tm) ? td : daysIn(y, mm || 1)).map(function (v) { return [v, v + '日']; }), '日', d);
      } else {
        var ml = lunarMonthList(y), C = CC();
        opts(sm, ml, '月', m);
        var cur = ml.filter(function (o) { return o[0] === sm.value; })[0], nd = cur && cur[2] ? cur[2] : 30;
        opts(sd, range(1, nd).map(function (v) { return [v, C ? C.DAY_NAMES[v - 1] : v + '日']; }), '日', d);
      }
    }
    var lab = document.querySelector('label[for="' + id + '"]'); if (lab) lab.setAttribute('for', id + '-y'); sy.id = id + '-y';
    if (lab) lab.appendChild(modeBox);   // 國曆／農曆放在「生日」標籤旁邊，選單才會和其他欄位對齊

    var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    function setHidden(v) { proto.set.call(input, v); }
    function showHint(v) {
      hint.classList.remove('warn');
      var C = CC(), p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
      if (!p) { hint.textContent = ''; return; }
      if (mode === 'lunar') hint.textContent = '＝ 國曆 ' + (+p[1]) + ' 年 ' + (+p[2]) + ' 月 ' + (+p[3]) + ' 日';
      else if (C) { var L = C.toLunar(+p[1], +p[2], +p[3]); hint.textContent = L ? '農曆 ' + L.text : ''; }
    }
    function selectedSolar() {
      var y = +sy.value; if (!y || !sm.value || !sd.value) return '';
      if (mode === 'solar') return y + '-' + pad(+sm.value) + '-' + pad(+sd.value);
      var C = CC(); if (!C) return '';
      var leap = sm.value.charAt(0) === 'L', m = +sm.value.replace('L', '');
      var s = C.toSolar(y, m, leap, +sd.value); if (!s) return '';
      return s.y + '-' + pad(s.m) + '-' + pad(s.d);
    }
    function fromSelects() {
      var v = selectedSolar();
      if (v) { var k = +v.replace(/-/g, ''); if (k > todayKey) { v = ''; hint.textContent = '這一天還沒到，請再確認一次'; hint.classList.add('warn'); } }
      if (v !== proto.get.call(input)) {
        setHidden(v);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (v) showHint(v);
    }
    function toSelects(v) {
      var p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
      sy.value = ''; sm.value = ''; sd.value = '';
      if (p) {
        var y = +p[1], m = String(+p[2]), d = String(+p[3]);
        if (mode === 'lunar' && CC()) { var L = CC().toLunar(y, +p[2], +p[3]); if (L) { y = L.year; m = (L.leap ? 'L' : '') + L.month; d = String(L.day); } }
        opts(sy, years.map(function (x) { return [x, x + '年']; }), '年', y); refresh();
        sm.value = m; refresh(); sd.value = d;
      }
      refresh(); showHint(v);
    }
    [sy, sm, sd].forEach(function (s) { s.addEventListener('change', function () { refresh(); fromSelects(); }); });
    modeBox.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || b.getAttribute('data-m') === mode) return;
      mode = b.getAttribute('data-m');
      modeBox.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
      toSelects(proto.get.call(input));   // 已經選好的日期，換成另一種曆法顯示
    });
    if (!CC()) modeBox.style.display = 'none';

    var initial = input.value;
    input.type = 'hidden';
    Object.defineProperty(input, 'value', {
      configurable: true,
      get: function () { return proto.get.call(input); },
      set: function (v) { setHidden(v); toSelects(v); }
    });
    input.parentNode.insertBefore(wrap, input);
    if (getComputedStyle(input.parentNode.parentNode).display === 'grid') input.parentNode.classList.add('bp-cell');
    input._bp = true;
    toSelects(initial);
    // 曆法程式比這支晚載入時，載入後再決定要不要顯示農曆選項
    if (!CC()) window.addEventListener('load', function () { if (CC()) { modeBox.style.display = ''; showHint(proto.get.call(input)); } });
  }
  root.BirthPicker = { attach: attach };
})(this);
