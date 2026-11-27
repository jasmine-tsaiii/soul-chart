/*
 * 生命靈數 × 脈輪 計算引擎
 * 規則來源：Obsidian「生命靈數脈輪測驗/生命靈數脈輪測驗.md」（2026-11-18 版）
 * 純計算，不含任何文字解讀；瀏覽器（全域 NumerologyEngine）與 Node（require）都能用。
 */
(function (root) {
  'use strict';

  // 七個脈輪與對應數字（下三輪 5 個數字、心輪 1 個、上三輪 3 個）
  var CHAKRAS = [
    { id: 'root',     name: '海底輪',     nums: [4],    tier: 'lower'  },
    { id: 'sacral',   name: '臍輪',       nums: [2, 5], tier: 'lower'  },
    { id: 'solar',    name: '太陽神經叢', nums: [1, 8], tier: 'lower'  },
    { id: 'heart',    name: '心輪',       nums: [6],    tier: 'center' },
    { id: 'throat',   name: '喉輪',       nums: [3],    tier: 'upper'  },
    { id: 'thirdEye', name: '眉心輪',     nums: [7],    tier: 'upper'  },
    { id: 'crown',    name: '頂輪',       nums: [9],    tier: 'upper'  }
  ];

  // 大師數對應兩個脈輪
  var MASTER = { 11: ['thirdEye', 'crown'], 22: ['root', 'crown'], 33: ['heart', 'crown'] };

  var UPPER_NUMS = [3, 7, 9];
  var LOWER_NUMS = [4, 2, 5, 1, 8];
  var TYPE_THRESHOLD = 0.3;

  function digitSum(n) {
    return String(n).split('').reduce(function (s, d) { return s + Number(d); }, 0);
  }

  // 加到一位數；keepMaster 為 true 時保留 11、22、33
  function reduce(n, keepMaster) {
    while (n > 9) {
      if (keepMaster && MASTER[n]) return n;
      n = digitSum(n);
    }
    return n;
  }

  function pad(n, len) { var s = String(n); while (s.length < len) s = '0' + s; return s; }

  function toDigits(y, m, d) { return pad(y, 4) + pad(m, 2) + pad(d, 2); }

  function chakraOfNumber(n) {
    if (MASTER[n]) return MASTER[n].slice();
    for (var i = 0; i < CHAKRAS.length; i++) {
      if (CHAKRAS[i].nums.indexOf(n) !== -1) return [CHAKRAS[i].id];
    }
    return [];
  }

  // 生命靈數：生日 8 碼全部加總，保留大師數
  function lifePath(y, m, d) {
    return reduce(digitSum(toDigits(y, m, d)), true);
  }

  // 流年：出生月日 + 當年年份加總，加到一位數（不保留大師數，待 Jasmine 確認）
  function personalYear(m, d, year) {
    return reduce(digitSum(pad(m, 2) + pad(d, 2) + pad(year, 4)), false);
  }

  // 數字 1–9 各出現幾次 → 換成各脈輪的次數
  function countsFromNumbers(nums) {
    var numCounts = {};
    for (var k = 1; k <= 9; k++) numCounts[k] = 0;
    nums.forEach(function (n) { if (n >= 1 && n <= 9) numCounts[n] += 1; });
    var chakraCounts = {};
    CHAKRAS.forEach(function (c) {
      chakraCounts[c.id] = c.nums.reduce(function (s, n) { return s + numCounts[n]; }, 0);
    });
    return { numCounts: numCounts, chakraCounts: chakraCounts };
  }

  // 做法 A：數生日 8 碼裡 1–9 各出現幾次（0 不算）
  function numbersMethodA(y, m, d) {
    return toDigits(y, m, d).split('').map(Number).filter(function (n) { return n !== 0; });
  }

  // 做法 B：七個衍生數字，各加到一位數（不保留大師數）
  function numbersMethodB(y, m, d) {
    var Y = reduce(digitSum(y), false);
    var M = reduce(digitSum(m), false);
    var D = reduce(digitSum(d), false);
    return [
      Y, M, D,
      reduce(Y + M, false),
      reduce(Y + D, false),
      reduce(M + D, false),
      reduce(digitSum(toDigits(y, m, d)), false)
    ];
  }

  // 能量類型：上三輪次數 ÷ 3 vs 下三輪次數 ÷ 5，相差 ≥ 0.3
  function energyType(numCounts) {
    var up = UPPER_NUMS.reduce(function (s, n) { return s + numCounts[n]; }, 0) / UPPER_NUMS.length;
    var low = LOWER_NUMS.reduce(function (s, n) { return s + numCounts[n]; }, 0) / LOWER_NUMS.length;
    var type = 'connect';
    if (up - low >= TYPE_THRESHOLD) type = 'insight';
    else if (low - up >= TYPE_THRESHOLD) type = 'action';
    return { type: type, upperAvg: up, lowerAvg: low };
  }

  // ===== 族群統計：1965–2010 每一天的生日 =====
  var populationCache = {};

  function eachDate(fromYear, toYear, fn) {
    for (var y = fromYear; y <= toYear; y++) {
      for (var m = 1; m <= 12; m++) {
        var days = new Date(Date.UTC(y, m, 0)).getUTCDate();
        for (var d = 1; d <= days; d++) fn(y, m, d);
      }
    }
  }

  function population(method) {
    if (populationCache[method]) return populationCache[method];
    var getNums = method === 'B' ? numbersMethodB : numbersMethodA;
    var dist = {}; // dist[chakraId][count] = 人數
    CHAKRAS.forEach(function (c) { dist[c.id] = {}; });
    var total = 0;
    var digit4 = 0;
    var types = { insight: 0, action: 0, connect: 0 };
    var combos = {}; // 能量類型＋天賦脈輪 的組合人數
    eachDate(1965, 2010, function (y, m, d) {
      var r = countsFromNumbers(getNums(y, m, d));
      CHAKRAS.forEach(function (c) {
        var k = r.chakraCounts[c.id];
        dist[c.id][k] = (dist[c.id][k] || 0) + 1;
      });
      if (r.numCounts[4] > 0) digit4 += 1;
      var t = energyType(r.numCounts).type;
      types[t] += 1;
      var key = comboKey(t, chakraOfNumber(lifePath(y, m, d)));
      combos[key] = (combos[key] || 0) + 1;
      total += 1;
    });
    var zeroRate = {};
    CHAKRAS.forEach(function (c) { zeroRate[c.id] = (dist[c.id][0] || 0) / total; });
    populationCache[method] = { dist: dist, total: total, zeroRate: zeroRate, digit4Rate: digit4 / total, types: types, combos: combos };
    return populationCache[method];
  }

  function comboKey(type, giftIds) { return type + '|' + giftIds.join('+'); }

  // 比幾 % 的人亮：次數嚴格少於這個人的比例
  function brighterThan(method, chakraId, count) {
    var p = population(method);
    var lower = 0;
    Object.keys(p.dist[chakraId]).forEach(function (k) {
      if (Number(k) < count) lower += p.dist[chakraId][k];
    });
    return lower / p.total;
  }

  // ===== 完整計算 =====
  function calculate(y, m, d, options) {
    options = options || {};
    var method = options.method === 'B' ? 'B' : 'A';
    var year = options.year || new Date().getFullYear();

    var lp = lifePath(y, m, d);
    var nums = method === 'B' ? numbersMethodB(y, m, d) : numbersMethodA(y, m, d);
    var counts = countsFromNumbers(nums);
    var type = energyType(counts.numCounts);
    var pop = population(method);

    var chakras = CHAKRAS.map(function (c) {
      var count = counts.chakraCounts[c.id];
      return {
        id: c.id, name: c.name, tier: c.tier, nums: c.nums, count: count,
        brighterThan: brighterThan(method, c.id, count),
        zeroRate: pop.zeroRate[c.id]
      };
    });

    // 最亮：次數最多；同分時取比較少人有的（brighterThan 較高）
    var brightest = chakras.slice().sort(function (a, b) {
      return (b.count - a.count) || (b.brighterThan - a.brighterThan);
    })[0];

    // 天賦脈輪
    var giftIds = chakraOfNumber(lp);
    // 天賦也是功課：做法 A 是天賦脈輪在生日裡 0 次；做法 B 是剛好只有 1 次
    var giftIsLesson = giftIds.every(function (id) {
      var c = counts.chakraCounts[id];
      return method === 'B' ? c <= 1 : c === 0;
    });

    // 潛在脈輪：0 次的脈輪裡，一般人最少是 0 的那個
    var zeros = chakras.filter(function (c) { return c.count === 0; });
    var potential = zeros.length
      ? zeros.slice().sort(function (a, b) { return a.zeroRate - b.zeroRate; })[0]
      : null;

    var thisYear = personalYear(m, d, year);
    var nextYear = personalYear(m, d, year + 1);

    return {
      input: { year: y, month: m, day: d, method: method, reportYear: year },
      lifePath: lp,
      lifePathChakras: giftIds,
      giftIsLesson: giftIsLesson,
      numbersUsed: nums,
      numCounts: counts.numCounts,
      chakras: chakras,
      energyType: type.type,
      upperAvg: type.upperAvg,
      lowerAvg: type.lowerAvg,
      healer: counts.chakraCounts.heart >= 2,
      // 跟你同能量類型、同天賦脈輪的人，佔全部的比例
      comboRate: (pop.combos[comboKey(type.type, giftIds)] || 0) / pop.total,
      brightest: brightest.id,
      potential: potential ? potential.id : null,
      personalYear: { year: year, number: thisYear, chakras: chakraOfNumber(thisYear) },
      personalYearNext: { year: year + 1, number: nextYear, chakras: chakraOfNumber(nextYear) }
    };
  }

  var api = {
    CHAKRAS: CHAKRAS, MASTER: MASTER,
    reduce: reduce, lifePath: lifePath, personalYear: personalYear,
    numbersMethodA: numbersMethodA, numbersMethodB: numbersMethodB,
    countsFromNumbers: countsFromNumbers, energyType: energyType,
    chakraOfNumber: chakraOfNumber, population: population,
    brighterThan: brighterThan, calculate: calculate
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.NumerologyEngine = api;
})(this);
