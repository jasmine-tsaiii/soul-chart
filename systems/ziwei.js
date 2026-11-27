/*
 * 紫微斗數（三合派常見安星法，主星十四顆＋常用輔星＋生年四化）
 * - 農曆月、日、時辰起命宮；23:00 後算隔天的子時
 * - 閏月：前半月（十五日以前）算本月，十六日以後算下個月
 * - 五行局由命宮干支的納音決定
 */
(function (root) {
  'use strict';
  var isNode = typeof module !== 'undefined' && module.exports;
  var C = isNode ? require('../lib/chinese-calendar.js') : root.ChineseCalendar;
  var A = isNode ? require('../lib/astro.js') : root.Astro;

  var B = C.BRANCHES, S = C.STEMS;
  var PALACES = ['命宮', '兄弟宮', '夫妻宮', '子女宮', '財帛宮', '疾厄宮', '遷移宮', '交友宮', '官祿宮', '田宅宮', '福德宮', '父母宮'];
  var JU = { '水': 2, '木': 3, '金': 4, '土': 5, '火': 6 };
  var JU_NAME = { 2: '水二局', 3: '木三局', 4: '金四局', 5: '土五局', 6: '火六局' };
  // 生年四化：祿、權、科、忌
  var SIHUA = [
    ['廉貞', '破軍', '武曲', '太陽'], ['天機', '天梁', '紫微', '太陰'], ['天同', '天機', '文昌', '廉貞'],
    ['太陰', '天同', '天機', '巨門'], ['貪狼', '太陰', '右弼', '天機'], ['武曲', '貪狼', '天梁', '文曲'],
    ['太陽', '武曲', '太陰', '天同'], ['巨門', '太陽', '文曲', '文昌'], ['天梁', '紫微', '左輔', '武曲'],
    ['破軍', '巨門', '太陰', '貪狼']
  ];
  var SIHUA_NAMES = ['化祿', '化權', '化科', '化忌'];
  var KUI_YUE = { 0: [1, 7], 4: [1, 7], 6: [1, 7], 1: [0, 8], 5: [0, 8], 2: [11, 9], 3: [11, 9], 7: [6, 2], 8: [3, 5], 9: [3, 5] };
  var LUCUN = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0];
  var MAIN = ['紫微', '天機', '太陽', '武曲', '天同', '廉貞', '天府', '太陰', '貪狼', '巨門', '天相', '天梁', '七殺', '破軍'];

  function mod12(x) { return ((x % 12) + 12) % 12; }

  function calculate(birth) {
    if (!birth.timeKnown) return { unknownTime: true };
    var L = birth.local;
    var y = L.y, m = L.m, d = L.d;
    if (L.hour >= 23) { var t = A.fromJulianDay(A.julianDay(y, m, d, 12) + 1); y = t.y; m = t.m; d = t.d; }
    var lunar = C.toLunar(y, m, d);
    var hour = Math.floor((L.hour + 1) / 2) % 12;
    var month = lunar.month;
    if (lunar.leap && lunar.day > 15) month = month % 12 + 1;
    var day = lunar.day, yearStem = lunar.yearStem, yearBranch = lunar.yearBranch;

    var ming = mod12(2 + (month - 1) - hour);
    var shen = mod12(2 + (month - 1) + hour);

    // 十二宮天干（五虎遁）
    var yinStem = ((yearStem % 5) * 2 + 2) % 10;
    function palaceStem(br) { return (yinStem + mod12(br - 2)) % 10; }

    // 五行局
    var mingIdx = C.ganzhiIndex(palaceStem(ming), ming);
    var nayin = C.nayin(mingIdx);
    var ju = JU[nayin.charAt(2)];

    // 紫微星位置
    var x = 0; while ((day + x) % ju !== 0) x++;
    var q = (day + x) / ju;
    var zi = mod12(2 + (q - 1) + (x % 2 === 0 ? x : -x));
    var fu = mod12(4 - zi);

    var stars = {}; // 地支 → 星曜陣列
    for (var i = 0; i < 12; i++) stars[i] = [];
    function put(name, br, kind) { stars[mod12(br)].push({ name: name, kind: kind }); }
    put('紫微', zi, 'main'); put('天機', zi - 1, 'main'); put('太陽', zi - 3, 'main'); put('武曲', zi - 4, 'main');
    put('天同', zi - 5, 'main'); put('廉貞', zi - 8, 'main');
    put('天府', fu, 'main'); put('太陰', fu + 1, 'main'); put('貪狼', fu + 2, 'main'); put('巨門', fu + 3, 'main');
    put('天相', fu + 4, 'main'); put('天梁', fu + 5, 'main'); put('七殺', fu + 6, 'main'); put('破軍', fu + 10, 'main');
    // 輔星
    put('文昌', 10 - hour, 'aux'); put('文曲', 4 + hour, 'aux');
    put('左輔', 4 + (month - 1), 'aux'); put('右弼', 10 - (month - 1), 'aux');
    put('天魁', KUI_YUE[yearStem][0], 'aux'); put('天鉞', KUI_YUE[yearStem][1], 'aux');
    var lu = LUCUN[yearStem];
    put('祿存', lu, 'aux'); put('擎羊', lu + 1, 'bad'); put('陀羅', lu - 1, 'bad');
    put('地空', 11 - hour, 'bad'); put('地劫', 11 + hour, 'bad');

    // 生年四化
    var sihua = SIHUA[yearStem].map(function (star, i) {
      var at = null;
      for (var b = 0; b < 12; b++) stars[b].forEach(function (s) { if (s.name === star) { s.hua = SIHUA_NAMES[i]; at = b; } });
      return { type: SIHUA_NAMES[i], star: star, branch: at };
    });

    // 宮位
    var palaces = [];
    for (var k = 0; k < 12; k++) {
      var br = mod12(ming - k);
      palaces.push({
        name: PALACES[k], branch: B[br], branchIndex: br, stem: S[palaceStem(br)],
        stars: stars[br], isShen: br === shen
      });
    }
    function palaceOf(br) { for (var p = 0; p < 12; p++) if (palaces[p].branchIndex === br) return palaces[p]; return null; }
    sihua.forEach(function (h) { h.palace = h.branch === null ? null : palaceOf(h.branch).name; });

    // 大限
    var yang = yearStem % 2 === 0;
    var forward = (yang && birth.gender === 'M') || (!yang && birth.gender === 'F');
    var decades = [];
    for (var n = 0; n < 12; n++) {
      var pb = mod12(ming + (forward ? n : -n));
      decades.push({ palace: palaceOf(pb).name, branch: B[pb], from: ju + 10 * n, to: ju + 10 * n + 9 });
    }

    var mingMain = stars[ming].filter(function (s) { return s.kind === 'main'; }).map(function (s) { return s.name; });
    var borrowed = false;
    if (!mingMain.length) {
      borrowed = true;
      mingMain = stars[mod12(ming + 6)].filter(function (s) { return s.kind === 'main'; }).map(function (s) { return s.name; });
    }

    return {
      lunar: lunar, hourBranch: B[hour], month: month,
      ju: ju, juName: JU_NAME[ju], mingBranch: B[ming], shenBranch: B[shen],
      shenPalace: palaceOf(shen).name,
      palaces: palaces, sihua: sihua, decades: decades, forward: forward,
      mingMainStars: mingMain, mingBorrowed: borrowed
    };
  }

  var api = { calculate: calculate, MAIN: MAIN, PALACES: PALACES, SIHUA: SIHUA, SIHUA_NAMES: SIHUA_NAMES };
  if (isNode) module.exports = api; else root.Ziwei = api;
})(this);
