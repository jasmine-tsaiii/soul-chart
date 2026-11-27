/*
 * 人類圖（自用版）
 * - 個性（黑）：出生時刻；設計（紅）：太陽往回 88° 的時刻
 * - 13 個天體：太陽、地球、北交、南交、月亮、水星、金星、火星、木星、土星、天王星、海王星、冥王星
 * - 交點用平均交點（多數軟體用真交點，差異約 1–2°，少數情況閘門會不同）
 * - 「Human Design」名稱與人體圖有商標與授權問題，這個版本只供自己研究使用
 */
(function (root) {
  'use strict';
  var isNode = typeof module !== 'undefined' && module.exports;
  var A = isNode ? require('../lib/astro.js') : root.Astro;

  // 輪盤順序：閘門 41 從 302°（水瓶座 2°）開始，每個閘門 5.625°
  var WHEEL = [41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35,
    45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
    28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60];
  var WHEEL_START = 302;

  var CENTERS = {
    head: { name: '頭頂中心', gates: [64, 61, 63] },
    ajna: { name: '邏輯中心', gates: [47, 24, 4, 17, 43, 11] },
    throat: { name: '喉嚨中心', gates: [62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16] },
    g: { name: 'G 中心', gates: [7, 1, 13, 25, 46, 2, 15, 10] },
    heart: { name: '意志力中心', gates: [21, 40, 26, 51] },
    sacral: { name: '薦骨中心', gates: [5, 14, 29, 59, 9, 3, 42, 27, 34] },
    solar: { name: '情緒中心', gates: [6, 37, 22, 36, 49, 55, 30] },
    spleen: { name: '直覺中心', gates: [48, 57, 44, 50, 32, 28, 18] },
    root: { name: '根部中心', gates: [53, 60, 52, 19, 39, 41, 58, 38, 54] }
  };
  var CHANNELS = [[1, 8], [2, 14], [3, 60], [4, 63], [5, 15], [6, 59], [7, 31], [9, 52], [10, 20], [10, 34], [10, 57],
    [11, 56], [12, 22], [13, 33], [16, 48], [17, 62], [18, 58], [19, 49], [20, 34], [20, 57], [21, 45], [23, 43],
    [24, 61], [25, 51], [26, 44], [27, 50], [28, 38], [29, 46], [30, 41], [32, 54], [34, 57], [35, 36], [37, 40],
    [39, 55], [42, 53], [47, 64]];
  var MOTORS = ['heart', 'solar', 'sacral', 'root'];
  var BODIES = [
    { id: 'sun', name: '太陽' }, { id: 'earth', name: '地球' }, { id: 'node', name: '北交點' }, { id: 'snode', name: '南交點' },
    { id: 'moon', name: '月亮' }, { id: 'mercury', name: '水星' }, { id: 'venus', name: '金星' }, { id: 'mars', name: '火星' },
    { id: 'jupiter', name: '木星' }, { id: 'saturn', name: '土星' }, { id: 'uranus', name: '天王星' },
    { id: 'neptune', name: '海王星' }, { id: 'pluto', name: '冥王星' }
  ];

  var gateCenter = {};
  Object.keys(CENTERS).forEach(function (c) { CENTERS[c].gates.forEach(function (g) { gateCenter[g] = c; }); });

  function gateOf(lon) {
    var off = A.norm(lon - WHEEL_START), idx = Math.floor(off / 5.625);
    return { gate: WHEEL[idx], line: Math.floor((off - idx * 5.625) / 0.9375) + 1 };
  }

  function bodyLon(id, jd) {
    if (id === 'earth') return A.norm(A.sunLongitude(jd) + 180);
    if (id === 'snode') return A.norm(A.meanNodeLongitude(jd) + 180);
    return A.longitude(id, jd);
  }

  function activations(jd) {
    return BODIES.map(function (b) { var g = gateOf(bodyLon(b.id, jd)); return { id: b.id, name: b.name, gate: g.gate, line: g.line }; });
  }

  function calculate(birth) {
    if (!birth.timeKnown) return { unknownTime: true };
    var jd = birth.jdUT;
    var sun = A.sunLongitude(jd);
    var designJd = A.sunLongitudeTime(A.norm(sun - 88), jd - 89);
    var personality = activations(jd), design = activations(designJd);

    var gates = {};
    personality.forEach(function (a) { gates[a.gate] = (gates[a.gate] || '') + 'P'; });
    design.forEach(function (a) { gates[a.gate] = (gates[a.gate] || '') + 'D'; });

    var channels = CHANNELS.filter(function (c) { return gates[c[0]] && gates[c[1]]; });
    var defined = {};
    channels.forEach(function (c) { defined[gateCenter[c[0]]] = true; defined[gateCenter[c[1]]] = true; });

    // 連通（並查集）
    var parent = {};
    Object.keys(defined).forEach(function (c) { parent[c] = c; });
    function find(x) { while (parent[x] !== x) x = parent[x] = parent[parent[x]]; return x; }
    channels.forEach(function (c) { var a = find(gateCenter[c[0]]), b = find(gateCenter[c[1]]); if (a !== b) parent[a] = b; });
    var groups = {};
    Object.keys(defined).forEach(function (c) { groups[find(c)] = true; });
    var nGroups = Object.keys(groups).length;
    function connected(a, b) { return defined[a] && defined[b] && find(a) === find(b); }

    var motorToThroat = MOTORS.some(function (m) { return connected(m, 'throat'); });
    var type;
    if (!Object.keys(defined).length) type = 'reflector';
    else if (defined.sacral) type = motorToThroat ? 'mg' : 'generator';
    else if (motorToThroat) type = 'manifestor';
    else type = 'projector';

    var authority;
    if (defined.solar) authority = 'emotional';
    else if (defined.sacral) authority = 'sacral';
    else if (defined.spleen) authority = 'splenic';
    else if (defined.heart) authority = connected('heart', 'throat') ? 'ego-manifested' : 'ego-projected';
    else if (defined.g && connected('g', 'throat')) authority = 'self';
    else if (type === 'reflector') authority = 'lunar';
    else authority = 'mental';

    var definition = ['無定義', '一分人', '二分人', '三分人', '四分人'][Math.min(nGroups, 4)];
    var profile = personality[0].line + '/' + design[0].line;

    var dd = A.fromJulianDay(designJd + birth.tzOffset / 24);
    return {
      personality: personality, design: design, type: type, authority: authority, profile: profile,
      definition: definition, channels: channels.map(function (c) {
        return { gates: c, centers: [CENTERS[gateCenter[c[0]]].name, CENTERS[gateCenter[c[1]]].name] };
      }),
      definedCenters: Object.keys(CENTERS).filter(function (c) { return defined[c]; }),
      gates: gates, designDate: dd.y + '.' + (dd.m < 10 ? '0' : '') + dd.m + '.' + (dd.d < 10 ? '0' : '') + dd.d,
      cross: [personality[0].gate, personality[1].gate, design[0].gate, design[1].gate]
    };
  }

  var api = { calculate: calculate, CENTERS: CENTERS, CHANNELS: CHANNELS, WHEEL: WHEEL, gateOf: gateOf, gateCenter: gateCenter };
  if (isNode) module.exports = api; else root.HumanDesign = api;
})(this);
