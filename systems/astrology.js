/*
 * 西洋占星（回歸黃道）與印度占星（恆星黃道，Lahiri 歲差）
 * - 宮位：整宮制（Whole Sign），西洋與印度都用；另外列出上升與天頂的度數
 * - 印度占星：月亮星宿（27 宿）、Vimshottari 大運
 */
(function (root) {
  'use strict';
  var isNode = typeof module !== 'undefined' && module.exports;
  var A = isNode ? require('../lib/astro.js') : root.Astro;

  var SIGNS = ['牡羊座', '金牛座', '雙子座', '巨蟹座', '獅子座', '處女座', '天秤座', '天蠍座', '射手座', '摩羯座', '水瓶座', '雙魚座'];
  var SIGN_ELEMENT = ['火', '土', '風', '水', '火', '土', '風', '水', '火', '土', '風', '水'];
  var SIGN_MODE = ['開創', '固定', '變動', '開創', '固定', '變動', '開創', '固定', '變動', '開創', '固定', '變動'];
  var BODIES = [
    { id: 'sun', name: '太陽' }, { id: 'moon', name: '月亮' }, { id: 'mercury', name: '水星' },
    { id: 'venus', name: '金星' }, { id: 'mars', name: '火星' }, { id: 'jupiter', name: '木星' },
    { id: 'saturn', name: '土星' }, { id: 'uranus', name: '天王星' }, { id: 'neptune', name: '海王星' },
    { id: 'pluto', name: '冥王星' }, { id: 'node', name: '北交點' }
  ];
  var ASPECTS = [
    { name: '合相', angle: 0, orb: 8 }, { name: '六分相', angle: 60, orb: 5 }, { name: '四分相', angle: 90, orb: 7 },
    { name: '三分相', angle: 120, orb: 7 }, { name: '對分相', angle: 180, orb: 8 }
  ];

  // 印度占星
  var RASHI = ['Mesha 白羊', 'Vrishabha 金牛', 'Mithuna 雙子', 'Karka 巨蟹', 'Simha 獅子', 'Kanya 處女',
    'Tula 天秤', 'Vrischika 天蠍', 'Dhanu 射手', 'Makara 摩羯', 'Kumbha 水瓶', 'Meena 雙魚'];
  var NAKSHATRA = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
    'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
  var NAKSHATRA_ZH = ['婁宿', '胃宿', '昴宿', '畢宿', '觜宿', '參宿', '井宿', '鬼宿', '柳宿', '星宿', '張宿', '翼宿', '軫宿', '角宿',
    '亢宿', '氐宿', '房宿', '心宿', '尾宿', '箕宿', '斗宿', '女宿', '虛宿', '危宿', '室宿', '壁宿', '奎宿'];
  var DASHA_LORDS = ['Ketu 計都', 'Venus 金星', 'Sun 太陽', 'Moon 月亮', 'Mars 火星', 'Rahu 羅睺', 'Jupiter 木星', 'Saturn 土星', 'Mercury 水星'];
  var DASHA_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17];
  var VEDIC_NAMES = { sun: 'Surya 太陽', moon: 'Chandra 月亮', mercury: 'Budha 水星', venus: 'Shukra 金星', mars: 'Mangala 火星',
    jupiter: 'Guru 木星', saturn: 'Shani 土星', node: 'Rahu 羅睺', ketu: 'Ketu 計都' };

  function signOf(lon) { return Math.floor(A.norm(lon) / 30); }
  function degText(lon) {
    var d = A.norm(lon) % 30, deg = Math.floor(d), min = Math.floor((d - deg) * 60);
    return deg + '°' + (min < 10 ? '0' : '') + min + '′';
  }

  // Lahiri 歲差（近似：J2000 為 23°51′，每年 50.27″）
  function ayanamsa(jdUT) { return 23.8531 + (jdUT - 2451545) / 365.25 * 0.0139639; }

  function western(birth) {
    var jd = birth.jdUT;
    var angles = birth.timeKnown ? A.angles(jd, birth.place.lat, birth.place.lon) : null;
    var ascSign = angles ? signOf(angles.asc) : null;
    var planets = BODIES.map(function (b) {
      var lon = A.longitude(b.id, jd), s = signOf(lon);
      return {
        id: b.id, name: b.name, lon: lon, sign: SIGNS[s], signIndex: s, deg: degText(lon),
        retro: A.isRetrograde(b.id, jd),
        house: ascSign === null ? null : ((s - ascSign + 12) % 12) + 1,
        moonUncertain: b.id === 'moon' && !birth.timeKnown
      };
    });
    // 相位（太陽到冥王星）
    var aspects = [];
    var main = planets.slice(0, 10);
    for (var i = 0; i < main.length; i++) {
      for (var j = i + 1; j < main.length; j++) {
        var diff = Math.abs(A.norm180(main[i].lon - main[j].lon));
        ASPECTS.forEach(function (a) {
          var orb = Math.abs(diff - a.angle);
          if (orb <= a.orb) aspects.push({ a: main[i].name, b: main[j].name, type: a.name, orb: Math.round(orb * 10) / 10 });
        });
      }
    }
    aspects.sort(function (x, y) { return x.orb - y.orb; });
    // 元素與模式（太陽到土星，再加上升）
    var el = { '火': 0, '土': 0, '風': 0, '水': 0 }, mode = { '開創': 0, '固定': 0, '變動': 0 };
    planets.slice(0, 7).forEach(function (p) { el[SIGN_ELEMENT[p.signIndex]]++; mode[SIGN_MODE[p.signIndex]]++; });
    if (ascSign !== null) { el[SIGN_ELEMENT[ascSign]]++; mode[SIGN_MODE[ascSign]]++; }

    return {
      planets: planets, aspects: aspects, elements: el, modes: mode,
      asc: angles ? { lon: angles.asc, sign: SIGNS[ascSign], signIndex: ascSign, deg: degText(angles.asc) } : null,
      mc: angles ? { lon: angles.mc, sign: SIGNS[signOf(angles.mc)], deg: degText(angles.mc) } : null
    };
  }

  function addYears(jd, years) { return jd + years * 365.25; }
  function jdToText(jd) { var d = A.fromJulianDay(jd); return d.y + '.' + (d.m < 10 ? '0' : '') + d.m + '.' + (d.d < 10 ? '0' : '') + d.d; }

  function vedic(birth, nowJd) {
    var jd = birth.jdUT, ay = ayanamsa(jd);
    var ids = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'node'];
    var lagna = birth.timeKnown ? A.norm(A.angles(jd, birth.place.lat, birth.place.lon).asc - ay) : null;
    var lagnaSign = lagna === null ? null : signOf(lagna);
    var grahas = ids.map(function (id) {
      var lon = A.norm(A.longitude(id, jd) - ay), s = signOf(lon);
      return { id: id, name: VEDIC_NAMES[id], lon: lon, rashi: RASHI[s], signIndex: s, deg: degText(lon),
        house: lagnaSign === null ? null : ((s - lagnaSign + 12) % 12) + 1, retro: A.isRetrograde(id, jd) && id !== 'node' };
    });
    var rahu = grahas[grahas.length - 1];
    var ketuLon = A.norm(rahu.lon + 180), ks = signOf(ketuLon);
    grahas.push({ id: 'ketu', name: VEDIC_NAMES.ketu, lon: ketuLon, rashi: RASHI[ks], signIndex: ks, deg: degText(ketuLon),
      house: lagnaSign === null ? null : ((ks - lagnaSign + 12) % 12) + 1 });

    // 月亮星宿與大運
    var moon = grahas[1].lon, span = 360 / 27;
    var nIdx = Math.floor(moon / span), within = moon - nIdx * span;
    var pada = Math.floor(within / (span / 4)) + 1;
    var lordIdx = nIdx % 9;
    var balance = (1 - within / span) * DASHA_YEARS[lordIdx];
    var dashas = [], t = jd;
    for (var i = 0; i < 9; i++) {
      var li = (lordIdx + i) % 9, len = i === 0 ? balance : DASHA_YEARS[li];
      var end = addYears(t, len);
      dashas.push({ lord: DASHA_LORDS[li], from: jdToText(t), to: jdToText(end), years: Math.round(len * 10) / 10,
        current: nowJd >= t && nowJd < end });
      t = end;
    }

    return {
      ayanamsa: ay, grahas: grahas,
      lagna: lagna === null ? null : { lon: lagna, rashi: RASHI[lagnaSign], signIndex: lagnaSign, deg: degText(lagna) },
      moonNakshatra: { index: nIdx, name: NAKSHATRA[nIdx], zh: NAKSHATRA_ZH[nIdx], pada: pada, lord: DASHA_LORDS[lordIdx] },
      dashas: dashas, moonUncertain: !birth.timeKnown
    };
  }

  var api = { western: western, vedic: vedic, SIGNS: SIGNS, RASHI: RASHI, NAKSHATRA: NAKSHATRA, signOf: signOf, degText: degText };
  if (isNode) module.exports = api; else root.Astrology = api;
})(this);
