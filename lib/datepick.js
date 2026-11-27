/*
 * 生日選擇器：把 <input type="date"> 換成「年／月／日」三個選單
 * - 手機上點開就是系統的滾輪選單（iPhone 滾輪、Android 清單）
 * - 不會出現今天以後的日期
 * - 原本的 input 保留（變成隱藏），值一樣是 YYYY-MM-DD，其他程式不用改
 */
(function (root) {
  'use strict';
  var MIN_YEAR = 1920;
  var css = '' +
    '.bp { display: grid; grid-template-columns: 1.35fr 1fr 1fr; gap: 8px; }' +
    '.bp-sel { position: relative; }' +
    '.bp-sel::after { content: ""; position: absolute; right: 4px; top: 50%; width: 6px; height: 6px; margin-top: -5px; border-right: 1.5px solid currentColor; border-bottom: 1.5px solid currentColor; transform: rotate(45deg); opacity: .45; pointer-events: none; }' +
    '.bp select { width: 100%; font: inherit; font-size: 15px; padding: 7px 18px 7px 0; border: none; border-bottom: 1px solid var(--line, #DED4C4); background: transparent; color: inherit; border-radius: 0; -webkit-appearance: none; appearance: none; cursor: pointer; }' +
    '.bp select:focus { outline: none; border-bottom-color: var(--gold, #A88550); }' +
    '.bp select.empty { color: var(--muted, #8A8076); }' +
    '.bp-cell { grid-column: span 2; }';

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function daysIn(y, m) { return new Date(y || 2000, m, 0).getDate(); }

  function attach(id) {
    var input = document.getElementById(id); if (!input || input._bp) return;
    if (!document.getElementById('bp-style')) { var st = document.createElement('style'); st.id = 'bp-style'; st.textContent = css; document.head.appendChild(st); }
    var today = new Date(), ty = today.getFullYear(), tm = today.getMonth() + 1, td = today.getDate();
    var wrap = document.createElement('div'); wrap.className = 'bp';
    function mk(label, cls) {
      var box = document.createElement('div'); box.className = 'bp-sel';
      var s = document.createElement('select'); s.setAttribute('aria-label', label); s.className = cls;
      box.appendChild(s); wrap.appendChild(box); return s;
    }
    var sy = mk('出生年', 'bp-y'), sm = mk('出生月', 'bp-m'), sd = mk('出生日', 'bp-d');
    var opts = function (sel, list, ph, cur) {
      sel.innerHTML = '<option value="">' + ph + '</option>' + list.map(function (v) { return '<option value="' + v + '"' + (v === cur ? ' selected' : '') + '>' + v + ph + '</option>'; }).join('');
      if (cur && list.indexOf(cur) < 0) sel.value = '';
      sel.classList.toggle('empty', !sel.value);
    };
    var range = function (a, b) { var r = []; for (var i = a; i <= b; i++) r.push(i); return r; };
    var years = range(MIN_YEAR, ty).reverse();
    function refresh() {
      var y = +sy.value || 0, m = +sm.value || 0, d = +sd.value || 0;
      opts(sy, years, '年', y);
      opts(sm, range(1, y === ty ? tm : 12), '月', m);
      m = +sm.value || 0;
      opts(sd, range(1, (y === ty && m === tm) ? td : daysIn(y, m || 1)), '日', d);
    }
    // 用 label 點「生日」時聚焦在年
    var lab = document.querySelector('label[for="' + id + '"]'); if (lab) lab.setAttribute('for', id + '-y'); sy.id = id + '-y';

    var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    function setHidden(v) { proto.set.call(input, v); }
    function fromSelects() {
      var y = +sy.value, m = +sm.value, d = +sd.value;
      var v = (y && m && d) ? y + '-' + pad(m) + '-' + pad(d) : '';
      if (v !== proto.get.call(input)) {
        setHidden(v);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    function toSelects(v) {
      var p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
      sy.value = ''; sm.value = ''; sd.value = '';
      if (p) { opts(sy, years, '年', +p[1]); sy.value = String(+p[1]); refresh(); sm.value = String(+p[2]); refresh(); sd.value = String(+p[3]); }
      refresh();
    }
    [sy, sm, sd].forEach(function (s) { s.addEventListener('change', function () { refresh(); fromSelects(); }); });

    var initial = input.value;
    input.type = 'hidden';
    // 其他程式直接設定 input.value 時（例如從主頁帶資料過來），三個選單跟著更新
    Object.defineProperty(input, 'value', {
      configurable: true,
      get: function () { return proto.get.call(input); },
      set: function (v) { setHidden(v); toSelects(v); }
    });
    input.parentNode.insertBefore(wrap, input);
    if (getComputedStyle(input.parentNode.parentNode).display === 'grid') input.parentNode.classList.add('bp-cell');
    input._bp = true;
    toSelects(initial);
  }
  root.BirthPicker = { attach: attach };
})(this);
