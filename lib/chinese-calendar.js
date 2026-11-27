/*
 * 農曆與干支
 * - 農曆：以東八區（中原標準時間）的日期判斷朔日與中氣，冬至所在月為十一月，
 *   兩個冬至之間有 13 個月時，第一個沒有中氣的月份為閏月。
 * - 干支、節氣、納音等共用表格也放在這裡。
 */
(function (root) {
  'use strict';
  var A = (typeof module !== 'undefined' && module.exports) ? require('./astro.js') : root.Astro;

  var STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  var BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  var ZODIAC = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'];
  var STEM_ELEMENT = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];
  var BRANCH_ELEMENT = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'];
  var MONTH_NAMES = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '臘'];
  var DAY_NAMES = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
  var NAYIN = ['海中金', '爐中火', '大林木', '路旁土', '劍鋒金', '山頭火', '澗下水', '城頭土', '白蠟金', '楊柳木',
    '泉中水', '屋上土', '霹靂火', '松柏木', '長流水', '沙中金', '山下火', '平地木', '壁上土', '金箔金',
    '覆燈火', '天河水', '大驛土', '釵釧金', '桑柘木', '大溪水', '沙中土', '天上火', '石榴木', '大海水'];
  // 二十四節氣（從小寒開始，黃經 285° 起每 15°）
  var TERMS = ['小寒', '大寒', '立春', '雨水', '驚蟄', '春分', '清明', '穀雨', '立夏', '小滿', '芒種', '夏至',
    '小暑', '大暑', '立秋', '處暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'];

  var TZ_CN = 8 / 24;

  function ganzhi(i) { i = ((i % 60) + 60) % 60; return STEMS[i % 10] + BRANCHES[i % 12]; }
  function ganzhiIndex(stem, branch) { for (var i = 0; i < 60; i++) if (i % 10 === stem && i % 12 === branch) return i; return -1; }
  function nayin(i) { i = ((i % 60) + 60) % 60; return NAYIN[Math.floor(i / 2)]; }

  // 東八區的「日序號」（整數，可比較先後）
  function cnDay(jdUT) { return Math.floor(jdUT + 0.5 + TZ_CN); }

  // 某年冬至（太陽黃經 270°）
  function winterSolstice(year) { return A.sunLongitudeTime(270, A.julianDay(year, 12, 21, 0)); }

  // 某時刻之前（含當天）最近的朔日
  function newMoonOnOrBefore(jdUT) {
    var k = Math.floor((jdUT - 2451550.09766) / 29.530588861);
    var nm = A.newMoonNear(2451550.09766 + 29.530588861 * k);
    while (cnDay(nm) > cnDay(jdUT)) nm = A.newMoonNear(nm - 29.53);
    while (true) { var next = A.newMoonNear(nm + 29.53); if (cnDay(next) <= cnDay(jdUT)) nm = next; else break; }
    return nm;
  }

  // 從 year-1 年冬至所在月（十一月）到 year 年冬至所在月，列出每個月
  var cache = {};
  function monthsOfSuiYear(year) {
    if (cache[year]) return cache[year];
    var ws1 = winterSolstice(year - 1), ws2 = winterSolstice(year);
    var m11a = newMoonOnOrBefore(ws1), m11b = newMoonOnOrBefore(ws2);
    var starts = [m11a];
    while (cnDay(starts[starts.length - 1]) < cnDay(m11b)) starts.push(A.newMoonNear(starts[starts.length - 1] + 29.53));
    // starts[0] = 前一年十一月，starts[最後] = 今年十一月
    var leapIndex = -1;
    if (starts.length === 14) {
      for (var i = 1; i < 13; i++) {
        var a = cnDay(starts[i]), b = cnDay(starts[i + 1]);
        // 這個月裡有沒有中氣（黃經為 30 的倍數）
        var hasZhongqi = false;
        var lonA = A.sunLongitude(starts[i]);
        var target = Math.ceil(lonA / 30) * 30 % 360;
        var t = A.sunLongitudeTime(target, starts[i] + 15);
        if (cnDay(t) >= a && cnDay(t) < b) hasZhongqi = true;
        if (!hasZhongqi) { leapIndex = i; break; }
      }
    }
    var months = [], num = 11;
    for (var j = 0; j < starts.length - 1; j++) {
      var isLeap = (j === leapIndex);
      if (j > 0 && !isLeap) num = num % 12 + 1;
      months.push({ start: cnDay(starts[j]), end: cnDay(starts[j + 1]), month: num, leap: isLeap });
    }
    cache[year] = months;
    return months;
  }

  // 公曆日期（以東八區日期判斷）→ 農曆
  function toLunar(y, m, d) {
    var day = Math.floor(A.julianDay(y, m, d, 12) + 0.5);
    var list = monthsOfSuiYear(y).concat(monthsOfSuiYear(y + 1));
    for (var i = 0; i < list.length; i++) {
      var mo = list[i];
      if (day >= mo.start && day < mo.end) {
        // 農曆年 = 最近一個「正月初一」所在的公曆年；還沒過今年正月初一就算前一年
        var ny = list.filter(function (x) { return x.month === 1 && !x.leap && x.start <= day; });
        var lunarYear = ny.length ? A.fromJulianDay(ny[ny.length - 1].start).y : y - 1;
        var dd = day - mo.start + 1;
        var yearIdx = ((lunarYear - 4) % 60 + 60) % 60;
        return {
          year: lunarYear, month: mo.month, day: dd, leap: mo.leap, monthDays: mo.end - mo.start,
          yearGanzhi: ganzhi(yearIdx), yearStem: yearIdx % 10, yearBranch: yearIdx % 12,
          zodiac: ZODIAC[yearIdx % 12],
          text: ganzhi(yearIdx) + '年' + (mo.leap ? '閏' : '') + MONTH_NAMES[mo.month - 1] + '月' + DAY_NAMES[dd - 1]
        };
      }
    }
    return null;
  }

  var api = {
    STEMS: STEMS, BRANCHES: BRANCHES, ZODIAC: ZODIAC, STEM_ELEMENT: STEM_ELEMENT, BRANCH_ELEMENT: BRANCH_ELEMENT,
    TERMS: TERMS, MONTH_NAMES: MONTH_NAMES, DAY_NAMES: DAY_NAMES,
    ganzhi: ganzhi, ganzhiIndex: ganzhiIndex, nayin: nayin, toLunar: toLunar, winterSolstice: winterSolstice
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ChineseCalendar = api;
})(this);
