/*
 * 八字（四柱）
 * - 年柱以立春為界，月柱以節（立春、驚蟄…）為界
 * - 日柱以 23:00 換日（子初換日），時柱用五鼠遁
 * - 大運：陽年男、陰年女順行；3 天折 1 年、1 天折 4 個月、1 個時辰折 10 天
 */
(function (root) {
  'use strict';
  var isNode = typeof module !== 'undefined' && module.exports;
  var A = isNode ? require('../lib/astro.js') : root.Astro;
  var C = isNode ? require('../lib/chinese-calendar.js') : root.ChineseCalendar;

  var S = C.STEMS, B = C.BRANCHES;
  var ELEMENTS = ['木', '火', '土', '金', '水'];
  var STEM_EL = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
  var BRANCH_EL = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
  // 地支藏干：本氣、中氣、餘氣（天干索引）
  var HIDDEN = [[9], [5, 9, 7], [0, 2, 4], [1], [4, 1, 9], [2, 6, 4], [3, 5], [5, 3, 1], [6, 8, 4], [7], [4, 7, 3], [8, 0]];
  var HIDDEN_WEIGHT = [1, 0.6, 0.3];
  var STAGES = ['長生', '沐浴', '冠帶', '臨官', '帝旺', '衰', '病', '死', '墓', '絕', '胎', '養'];
  var STAGE_START = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3];

  // 十神：以日干看其他天干
  function tenGod(dayStem, other) {
    var de = STEM_EL[dayStem], oe = STEM_EL[other], same = (dayStem % 2) === (other % 2);
    if (de === oe) return same ? '比肩' : '劫財';
    if ((de + 1) % 5 === oe) return same ? '食神' : '傷官';
    if ((de + 2) % 5 === oe) return same ? '偏財' : '正財';
    if ((oe + 2) % 5 === de) return same ? '七殺' : '正官';
    return same ? '偏印' : '正印';
  }

  function stage(stem, branch) {
    var s = STAGE_START[stem];
    var i = stem % 2 === 0 ? (branch - s + 12) % 12 : (s - branch + 12) % 12;
    return STAGES[i];
  }

  function jdn(y, m, d) { return Math.round(A.julianDay(y, m, d, 12)); }

  function addToDate(y, m, d, years, months, days) {
    var dt = new Date(Date.UTC(y + years, m - 1 + months, d + days));
    return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
  }

  function yearPillarIndex(jdUT, y) {
    var lichun = A.sunLongitudeTime(315, A.julianDay(y, 2, 4, 0));
    var year = jdUT >= lichun ? y : y - 1;
    return { year: year, idx: ((year - 4) % 60 + 60) % 60 };
  }

  function calculate(birth, opts) {
    opts = opts || {};
    var jd = birth.jdUT, L = birth.local;

    // 年柱
    var yp = yearPillarIndex(jd, birth.y);
    var yearIdx = yp.idx, yearStem = yearIdx % 10;

    // 月柱
    var lam = A.sunLongitude(jd);
    var mi = Math.floor(A.norm(lam - 315) / 30);
    var monthBranch = (2 + mi) % 12;
    var monthStem = (((yearStem % 5) * 2 + 2) + mi) % 10;
    var monthIdx = C.ganzhiIndex(monthStem, monthBranch);

    // 日柱（23:00 換日）
    var dd = { y: L.y, m: L.m, d: L.d };
    if (birth.timeKnown && L.hour >= 23) dd = addToDate(L.y, L.m, L.d, 0, 0, 1);
    var dayIdx = ((jdn(dd.y, dd.m, dd.d) + 49) % 60 + 60) % 60;
    var dayStem = dayIdx % 10;

    // 時柱
    var hourIdx = null;
    if (birth.timeKnown) {
      var hb = Math.floor((L.hour + 1) / 2) % 12;
      var hs = (((dayStem % 5) * 2) + hb) % 10;
      hourIdx = C.ganzhiIndex(hs, hb);
    }

    function pillar(label, idx) {
      if (idx === null) return { label: label, unknown: true };
      var st = idx % 10, br = idx % 12;
      return {
        label: label, stem: S[st], branch: B[br], ganzhi: S[st] + B[br], stemIndex: st, branchIndex: br,
        stemElement: ELEMENTS[STEM_EL[st]], branchElement: ELEMENTS[BRANCH_EL[br]],
        tenGod: label === '日柱' ? '日主' : tenGod(dayStem, st),
        hidden: HIDDEN[br].map(function (h) { return { stem: S[h], element: ELEMENTS[STEM_EL[h]], tenGod: tenGod(dayStem, h) }; }),
        nayin: C.nayin(idx), stage: stage(dayStem, br)
      };
    }
    var pillars = [pillar('年柱', yearIdx), pillar('月柱', monthIdx), pillar('日柱', dayIdx), pillar('時柱', hourIdx)];

    // 五行：字數，以及含藏干的加權分數
    var count = [0, 0, 0, 0, 0], weight = [0, 0, 0, 0, 0];
    pillars.forEach(function (p) {
      if (p.unknown) return;
      count[STEM_EL[p.stemIndex]] += 1; count[BRANCH_EL[p.branchIndex]] += 1;
      weight[STEM_EL[p.stemIndex]] += 1;
      HIDDEN[p.branchIndex].forEach(function (h, i) { weight[STEM_EL[h]] += HIDDEN_WEIGHT[i]; });
    });
    var dmEl = STEM_EL[dayStem];
    var support = weight[dmEl] + weight[(dmEl + 4) % 5]; // 比劫＋印
    var totalW = weight.reduce(function (a, b) { return a + b; }, 0);

    // 身強身弱（簡化判斷）：月令最重要，所以月支藏干算兩倍；日主自己不算
    var sealEl = (dmEl + 4) % 5, sup = 0, tot = 0, roots = [], sealRoots = [], helpers = [];
    pillars.forEach(function (p, pi) {
      if (p.unknown) return;
      if (pi !== 2) {
        tot += 1;
        if (STEM_EL[p.stemIndex] === dmEl || STEM_EL[p.stemIndex] === sealEl) { sup += 1; helpers.push(p.label + ' ' + S[p.stemIndex] + '（' + tenGod(dayStem, p.stemIndex) + '）'); }
      }
      var mul = pi === 1 ? 2 : 1, hasRoot = false, hasSeal = false;
      HIDDEN[p.branchIndex].forEach(function (h, i) {
        var w = HIDDEN_WEIGHT[i] * mul; tot += w;
        if (STEM_EL[h] === dmEl) { sup += w; hasRoot = true; }
        else if (STEM_EL[h] === sealEl) { sup += w; hasSeal = true; }
      });
      if (hasRoot) roots.push(p.label + ' ' + B[p.branchIndex]);
      if (hasSeal) sealRoots.push(p.label + ' ' + B[p.branchIndex]);
    });
    var mBranch = pillars[1].branchIndex, seasonEl = BRANCH_EL[mBranch];
    var state = seasonEl === dmEl ? '旺' : (seasonEl + 1) % 5 === dmEl ? '相' : (dmEl + 1) % 5 === seasonEl ? '休' : (dmEl + 2) % 5 === seasonEl ? '囚' : '死';
    var deLing = state === '旺' || state === '相';
    var ratio = tot ? sup / tot : 0;
    var label = ratio >= 0.55 ? '身強' : ratio >= 0.45 ? '偏強' : ratio >= 0.35 ? (deLing ? '中和偏強' : '中和偏弱') : ratio >= 0.25 ? '偏弱' : '身弱';
    var strong = label === '身強' || label === '偏強' || label === '中和偏強';
    var strength = {
      label: label, strong: strong, ratio: ratio,
      month: { branch: B[mBranch], season: ELEMENTS[seasonEl], state: state, deLing: deLing },
      roots: roots, sealRoots: sealRoots, helpers: helpers,
      favor: strong ? [ELEMENTS[(dmEl + 1) % 5] + '（食傷）', ELEMENTS[(dmEl + 2) % 5] + '（財）', ELEMENTS[(dmEl + 3) % 5] + '（官殺）']
                    : [ELEMENTS[sealEl] + '（印）', ELEMENTS[dmEl] + '（比劫）']
    };

    // 大運
    var yang = yearStem % 2 === 0;
    var forward = (yang && birth.gender === 'M') || (!yang && birth.gender === 'F');
    var k = (lam - 315) / 30;
    var target = A.norm(315 + 30 * (forward ? Math.floor(k) + 1 : Math.floor(k)));
    var guess = jd + A.norm180(target - lam) / 0.9856;
    var termJd = A.sunLongitudeTime(target, guess);
    if (forward && termJd <= jd) termJd = A.sunLongitudeTime(A.norm(target + 30), termJd + 30);
    if (!forward && termJd > jd) termJd = A.sunLongitudeTime(A.norm(target - 30), termJd - 30);
    var diffDays = Math.abs(termJd - jd);
    var months = diffDays * 4;
    var startY = Math.floor(months / 12), startM = Math.floor(months % 12), startD = Math.round((months - Math.floor(months)) * 30);
    var start = addToDate(birth.y, birth.m, birth.d, startY, startM, startD);
    var luck = [];
    for (var i = 0; i < 9; i++) {
      var idx = ((monthIdx + (forward ? i + 1 : -(i + 1))) % 60 + 60) % 60;
      var sy = start.y + 10 * i;
      luck.push({
        ganzhi: C.ganzhi(idx), stemGod: tenGod(dayStem, idx % 10),
        branchGod: tenGod(dayStem, HIDDEN[idx % 12][0]),
        startYear: sy, endYear: sy + 9, age: sy - birth.y + 1
      });
    }

    // 流年（今年、明年，以當年立春後為準）
    var nowYear = opts.year || new Date().getFullYear();
    var flow = [nowYear, nowYear + 1].map(function (yy) {
      var idx = ((yy - 4) % 60 + 60) % 60;
      return { year: yy, ganzhi: C.ganzhi(idx), stemGod: tenGod(dayStem, idx % 10), branchGod: tenGod(dayStem, HIDDEN[idx % 12][0]) };
    });

    return {
      pillars: pillars,
      dayMaster: { stem: S[dayStem], element: ELEMENTS[dmEl], yinYang: dayStem % 2 === 0 ? '陽' : '陰', index: dayStem },
      elements: ELEMENTS.map(function (e, i) { return { name: e, count: count[i], weight: Math.round(weight[i] * 10) / 10 }; }),
      supportRatio: totalW ? support / totalW : 0,
      strength: strength,
      luck: luck, forward: forward,
      luckStart: { years: startY, months: startM, days: startD, date: start },
      flow: flow,
      lunar: C.toLunar(birth.local.y, birth.local.m, birth.local.d),
      zodiac: C.ZODIAC[yearIdx % 12]
    };
  }

  var api = { calculate: calculate, tenGod: tenGod, stage: stage, ELEMENTS: ELEMENTS };
  if (isNode) module.exports = api; else root.Bazi = api;
})(this);
