/*
 * 天文計算（不依賴任何外部套件）
 * - 太陽：Meeus《Astronomical Algorithms》第 25 章（約 0.01°）
 * - 月亮：Meeus 第 47 章主要項（約 0.05°）
 * - 行星：JPL「Approximate Positions of the Planets」軌道根數（1800–2050 年，約 1′ 以內，冥王星稍差）
 * - 上升、天頂：恆星時公式
 * 所有角度都是度；時間用儒略日（JD，UT）。
 */
(function (root) {
  'use strict';
  var RAD = Math.PI / 180, DEG = 180 / Math.PI;

  function norm(x) { x %= 360; return x < 0 ? x + 360 : x; }
  function norm180(x) { x = norm(x); return x > 180 ? x - 360 : x; }
  function sin(d) { return Math.sin(d * RAD); }
  function cos(d) { return Math.cos(d * RAD); }

  // 公曆 → 儒略日（UT），h 為小時（可含小數）
  function julianDay(y, m, d, h) {
    if (m <= 2) { y -= 1; m += 12; }
    var A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5 + (h || 0) / 24;
  }

  // 儒略日 → 公曆（UT）
  function fromJulianDay(J) {
    var Z = Math.floor(J + 0.5), F = J + 0.5 - Z, A = Z;
    if (Z >= 2299161) { var a = Math.floor((Z - 1867216.25) / 36524.25); A = Z + 1 + a - Math.floor(a / 4); }
    var B = A + 1524, C = Math.floor((B - 122.1) / 365.25), D = Math.floor(365.25 * C), E = Math.floor((B - D) / 30.6001);
    var dayF = B - D - Math.floor(30.6001 * E) + F, d = Math.floor(dayF);
    var m = E < 14 ? E - 1 : E - 13, y = m > 2 ? C - 4716 : C - 4715;
    return { y: y, m: m, d: d, h: (dayF - d) * 24 };
  }

  // ΔT = TT − UT（秒），Espenak & Meeus 多項式
  function deltaT(year) {
    var t, u;
    if (year < 1900) { u = (year - 1820) / 100; return -20 + 32 * u * u; }
    if (year < 1920) { t = year - 1900; return -2.79 + 1.494119 * t - 0.0598939 * t * t + 0.0061966 * t * t * t - 0.000197 * t * t * t * t; }
    if (year < 1941) { t = year - 1920; return 21.20 + 0.84493 * t - 0.076100 * t * t + 0.0020936 * t * t * t; }
    if (year < 1961) { t = year - 1950; return 29.07 + 0.407 * t - t * t / 233 + t * t * t / 2547; }
    if (year < 1986) { t = year - 1975; return 45.45 + 1.067 * t - t * t / 260 - t * t * t / 718; }
    if (year < 2005) { t = year - 2000; return 63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t * t * t + 0.000651814 * Math.pow(t, 4) + 0.00002373599 * Math.pow(t, 5); }
    if (year < 2050) { t = year - 2000; return 62.92 + 0.32217 * t + 0.005589 * t * t; }
    u = (year - 1820) / 100; return -20 + 32 * u * u - 0.5628 * (2150 - year);
  }

  // UT 的儒略日 → TT 的儒略世紀數
  function centuriesTT(jdUT) {
    var year = 2000 + (jdUT - 2451545) / 365.25;
    return (jdUT + deltaT(year) / 86400 - 2451545) / 36525;
  }

  // 太陽視黃經（當日分點）
  function sunLongitude(jdUT) {
    var T = centuriesTT(jdUT);
    var L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    var M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    var C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * sin(M) + (0.019993 - 0.000101 * T) * sin(2 * M) + 0.000289 * sin(3 * M);
    var omega = 125.04 - 1934.136 * T;
    return norm(L0 + C - 0.00569 - 0.00478 * sin(omega));
  }

  // 月亮黃經（Meeus 47.A 主要項，單位 1e-6 度）[D, M, M', F, 係數]
  var MOON_TERMS = [
    [0, 0, 1, 0, 6288774], [2, 0, -1, 0, 1274027], [2, 0, 0, 0, 658314], [0, 0, 2, 0, 213618],
    [0, 1, 0, 0, -185116], [0, 0, 0, 2, -114332], [2, 0, -2, 0, 58793], [2, -1, -1, 0, 57066],
    [2, 0, 1, 0, 53322], [2, -1, 0, 0, 45758], [0, 1, -1, 0, -40923], [1, 0, 0, 0, -34720],
    [0, 1, 1, 0, -30383], [2, 0, 0, -2, 15327], [0, 0, 1, 2, -12528], [0, 0, 1, -2, 10980],
    [4, 0, -1, 0, 10675], [0, 0, 3, 0, 10034], [4, 0, -2, 0, 8548], [2, 1, -1, 0, -7888],
    [2, 1, 0, 0, -6766], [1, 0, -1, 0, -5163], [1, 1, 0, 0, 4987], [2, -1, 1, 0, 4036],
    [2, 0, 2, 0, 3994], [4, 0, 0, 0, 3861], [2, 0, -3, 0, 3665], [0, 1, -2, 0, -2689],
    [2, 0, -1, 2, -2602], [2, -1, -2, 0, 2390], [1, 0, 1, 0, -2348], [2, -2, 0, 0, 2236],
    [0, 1, 2, 0, -2120], [0, 2, 0, 0, -2069], [2, -2, -1, 0, 2048], [2, 0, 1, -2, -1773],
    [2, 0, 0, 2, -1595], [4, -1, -1, 0, 1215], [0, 0, 2, 2, -1110], [3, 0, -1, 0, -892],
    [2, 1, 1, 0, -810], [4, -1, -2, 0, 759], [0, 2, -1, 0, -713], [2, 2, -1, 0, -700],
    [2, 1, -2, 0, 691], [2, -1, 0, -2, 596], [4, 0, 1, 0, 549], [0, 0, 4, 0, 537],
    [4, -1, 0, 0, 520], [1, 0, -2, 0, -487], [2, 1, 0, -2, -399], [0, 0, 2, -2, -381],
    [1, 1, 1, 0, 351], [3, 0, -2, 0, -340], [4, 0, -3, 0, 330], [2, -1, 2, 0, 327],
    [0, 2, 1, 0, -323], [1, 1, -1, 0, 299], [2, 0, 3, 0, 294]
  ];

  function moonLongitude(jdUT) {
    var T = centuriesTT(jdUT);
    var Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T;
    var D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T;
    var M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T;
    var Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T;
    var F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T;
    var A1 = 119.75 + 131.849 * T, A2 = 53.09 + 479264.290 * T;
    var E = 1 - 0.002516 * T - 0.0000074 * T * T;
    var sum = 0;
    for (var i = 0; i < MOON_TERMS.length; i++) {
      var t = MOON_TERMS[i], c = t[4];
      if (Math.abs(t[1]) === 1) c *= E; else if (Math.abs(t[1]) === 2) c *= E * E;
      sum += c * sin(t[0] * D + t[1] * M + t[2] * Mp + t[3] * F);
    }
    sum += 3958 * sin(A1) + 1962 * sin(Lp - F) + 318 * sin(A2);
    var omega = 125.04452 - 1934.136261 * T;
    var nutation = -0.00478 * sin(omega); // 只取主項
    return norm(Lp + sum / 1e6 + nutation);
  }

  // 月亮平均北交點（羅睺）
  function meanNodeLongitude(jdUT) {
    var T = centuriesTT(jdUT);
    return norm(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T);
  }

  // JPL 行星軌道根數：[a, e, I, L, 近日點經度, 升交點經度] 與每世紀變化量
  var ELEMENTS = {
    mercury: [[0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593], [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081]],
    venus:   [[0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255], [0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418]],
    earth:   [[1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0], [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0]],
    mars:    [[1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891], [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343]],
    jupiter: [[5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909], [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106]],
    saturn:  [[9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448], [-0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794]],
    uranus:  [[19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.95427630, 74.01692503], [-0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589]],
    neptune: [[30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574], [0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.00508664]],
    pluto:   [[39.48211675, 0.24882730, 17.14001206, 238.92903833, 224.06891629, 110.30393684], [-0.00031596, 0.00005170, 0.00004818, 145.20780515, -0.04062942, -0.01183482]]
  };

  // 木星、土星的攝動修正（兩顆星互相拉扯造成的偏差）
  // 用瑞士星曆 1900–2100 每 30 天的日心黃經做最小平方擬合；誤差從約 4–20′ 降到 1′ 以內
  var PERT_PAIRS = [[2, -5], [2, -4], [1, -2], [2, -6], [1, -3], [1, -1], [2, -2], [3, -5], [2, -3], [1, -5], [3, -6], [3, -4], [1, 0], [2, 0], [0, 1], [0, 2], [3, -7], [4, -10], [1, -4], [4, -8]];
  var PERT = {
    jupiter: [-0.14989, 1.53899, -0.98768, 2.51281, -6e-05, 0.00518, -0.04478, -0.00476, 0.00055, -0.00108, -0.00283, -0.00503, -0.00355, 0.0209, -0.05101, -0.02157, 0.01453, 0.00076, 0.01031, 0.0198, 0.01876, 0.00862, 0.00044, -0.00015, -0.0036, 0.00207, 0.0098, 0.02918, 0.00064, 0.00016, -0.00406, 0.00244, 0.0006, -0.00074, -0.00418, 0.00431, 0.2537, 0.23063, -0.00082, 8e-05, 0.0009, 0.00161],
    saturn: [0.29616, -5.89492, 3.42984, -9.73945, -0.02315, -0.09431, 0.17371, -0.00363, 0.01646, 0.06078, 0.00067, 0.0318, 0.03358, -0.02328, 0.00814, 0.00397, -4e-05, -0.00017, 6e-05, 0.0092, -0.00116, -0.00027, -0.00871, -0.01869, 0.00118, -0.00069, 0.00039, 0.00112, -0.00023, 8e-05, 0.15736, 0.00427, 0.00133, -0.00308, 0.00931, -0.03078, -1.06213, -0.83786, -0.01269, 0.00858, 0.00218, 0.00142]
  };
  function perturbation(name, T) {
    var c = PERT[name]; if (!c) return 0;
    var j = ELEMENTS.jupiter, s = ELEMENTS.saturn;
    var M5 = j[0][3] + j[1][3] * T - (j[0][4] + j[1][4] * T), M6 = s[0][3] + s[1][3] * T - (s[0][4] + s[1][4] * T);
    var d = c[0] + c[1] * T;
    for (var i = 0; i < PERT_PAIRS.length; i++) {
      var arg = PERT_PAIRS[i][0] * M5 + PERT_PAIRS[i][1] * M6;
      d += c[2 + 2 * i] * sin(arg) + c[3 + 2 * i] * cos(arg);
    }
    return d;
  }

  function heliocentric(name, T) {
    var el = ELEMENTS[name], b = el[0], r = el[1];
    var a = b[0] + r[0] * T, e = b[1] + r[1] * T, I = b[2] + r[2] * T;
    var L = b[3] + r[3] * T, wbar = b[4] + r[4] * T, Om = b[5] + r[5] * T;
    var M = norm180(L - wbar), w = wbar - Om;
    var E = M + DEG * e * sin(M);
    for (var i = 0; i < 12; i++) {
      var dE = (M - (E - DEG * e * sin(E))) / (1 - e * cos(E));
      E += dE; if (Math.abs(dE) < 1e-8) break;
    }
    var xp = a * (cos(E) - e), yp = a * Math.sqrt(1 - e * e) * sin(E);
    var x = (cos(w) * cos(Om) - sin(w) * sin(Om) * cos(I)) * xp + (-sin(w) * cos(Om) - cos(w) * sin(Om) * cos(I)) * yp;
    var y = (cos(w) * sin(Om) + sin(w) * cos(Om) * cos(I)) * xp + (-sin(w) * sin(Om) + cos(w) * cos(Om) * cos(I)) * yp;
    var z = (sin(w) * sin(I)) * xp + (cos(w) * sin(I)) * yp;
    var dL = perturbation(name, T);
    if (dL) { var x2 = x * cos(dL) - y * sin(dL); y = x * sin(dL) + y * cos(dL); x = x2; }
    return { x: x, y: y, z: z };
  }

  // 行星的地心視黃經（當日分點，約略加上歲差）
  function planetLongitude(name, jdUT) {
    var T = centuriesTT(jdUT);
    var p = heliocentric(name, T), e = heliocentric('earth', T);
    // 光行時修正（一次迭代）
    var dist = Math.sqrt(Math.pow(p.x - e.x, 2) + Math.pow(p.y - e.y, 2) + Math.pow(p.z - e.z, 2));
    var p2 = heliocentric(name, T - dist * 0.0057755183 / 36525);
    var lon = Math.atan2(p2.y - e.y, p2.x - e.x) * DEG;
    return norm(lon + 1.3969713 * T); // J2000 → 當日分點
  }

  // 統一入口：sun, moon, mercury … pluto, node（北交點）
  function longitude(body, jdUT) {
    if (body === 'sun') return sunLongitude(jdUT);
    if (body === 'moon') return moonLongitude(jdUT);
    if (body === 'node') return meanNodeLongitude(jdUT);
    return planetLongitude(body, jdUT);
  }

  // 是否逆行（前後半天比較）
  function isRetrograde(body, jdUT) {
    if (body === 'sun' || body === 'moon') return false;
    if (body === 'node') return true;
    return norm180(longitude(body, jdUT + 0.5) - longitude(body, jdUT - 0.5)) < 0;
  }

  // 黃赤交角
  function obliquity(jdUT) { var T = centuriesTT(jdUT); return 23.439291 - 0.0130042 * T; }

  // 格林威治平恆星時（度）
  function gmst(jdUT) {
    var T = (jdUT - 2451545) / 36525;
    return norm(280.46061837 + 360.98564736629 * (jdUT - 2451545) + 0.000387933 * T * T - T * T * T / 38710000);
  }

  // 上升點與天頂；lat 北緯為正、lon 東經為正
  function angles(jdUT, lat, lon) {
    var ramc = norm(gmst(jdUT) + lon), eps = obliquity(jdUT);
    var mc = norm(Math.atan2(sin(ramc), cos(ramc) * cos(eps)) * DEG);
    var asc = norm(Math.atan2(cos(ramc), -(sin(ramc) * cos(eps) + Math.tan(lat * RAD) * sin(eps))) * DEG);
    return { asc: asc, mc: mc };
  }

  // 找太陽到達某黃經的時刻（從 guess 附近開始）
  function sunLongitudeTime(target, jdGuess) {
    var t = jdGuess;
    for (var i = 0; i < 20; i++) {
      var diff = norm180(target - sunLongitude(t));
      t += diff / 0.98564736;
      if (Math.abs(diff) < 1e-6) break;
    }
    return t;
  }

  // 找最接近 jdGuess 的新月（日月合朔）
  function newMoonNear(jdGuess) {
    var t = jdGuess;
    for (var i = 0; i < 20; i++) {
      var diff = norm180(moonLongitude(t) - sunLongitude(t));
      t -= diff / 12.190749;
      if (Math.abs(diff) < 1e-6) break;
    }
    return t;
  }

  // 均時差（分鐘），用來算真太陽時
  function equationOfTime(jdUT) {
    var T = centuriesTT(jdUT);
    var L0 = norm(280.46646 + 36000.76983 * T);
    var e = 0.016708634 - 0.000042037 * T, M = 357.52911 + 35999.05029 * T, eps = obliquity(jdUT);
    var y = Math.pow(Math.tan(eps / 2 * RAD), 2);
    var E = y * sin(2 * L0) - 2 * e * sin(M) + 4 * e * y * sin(M) * cos(2 * L0) - 0.5 * y * y * sin(4 * L0) - 1.25 * e * e * sin(2 * M);
    return E * DEG * 4;
  }

  var api = {
    norm: norm, norm180: norm180, julianDay: julianDay, fromJulianDay: fromJulianDay, deltaT: deltaT,
    sunLongitude: sunLongitude, moonLongitude: moonLongitude, meanNodeLongitude: meanNodeLongitude,
    planetLongitude: planetLongitude, longitude: longitude, isRetrograde: isRetrograde,
    obliquity: obliquity, gmst: gmst, angles: angles,
    sunLongitudeTime: sunLongitudeTime, newMoonNear: newMoonNear, equationOfTime: equationOfTime
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Astro = api;
})(this);
