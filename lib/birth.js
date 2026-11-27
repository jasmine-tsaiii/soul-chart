/*
 * 共用的出生資料：一個生日，給所有系統用
 */
(function (root) {
  'use strict';
  var A = (typeof module !== 'undefined' && module.exports) ? require('./astro.js') : root.Astro;

  // 出生地（緯度、經度、標準時區）。日光節約時間請另外勾選。
  var PLACES = [
    { id: 'taipei', name: '台北', lat: 25.04, lon: 121.56, tz: 8 },
    { id: 'newtaipei', name: '新北', lat: 25.01, lon: 121.46, tz: 8 },
    { id: 'keelung', name: '基隆', lat: 25.13, lon: 121.74, tz: 8 },
    { id: 'taoyuan', name: '桃園', lat: 24.99, lon: 121.30, tz: 8 },
    { id: 'hsinchu', name: '新竹', lat: 24.80, lon: 120.97, tz: 8 },
    { id: 'miaoli', name: '苗栗', lat: 24.56, lon: 120.82, tz: 8 },
    { id: 'taichung', name: '台中', lat: 24.15, lon: 120.67, tz: 8 },
    { id: 'changhua', name: '彰化', lat: 24.08, lon: 120.54, tz: 8 },
    { id: 'nantou', name: '南投', lat: 23.91, lon: 120.68, tz: 8 },
    { id: 'yunlin', name: '雲林', lat: 23.71, lon: 120.43, tz: 8 },
    { id: 'chiayi', name: '嘉義', lat: 23.48, lon: 120.45, tz: 8 },
    { id: 'tainan', name: '台南', lat: 22.99, lon: 120.21, tz: 8 },
    { id: 'kaohsiung', name: '高雄', lat: 22.63, lon: 120.30, tz: 8 },
    { id: 'pingtung', name: '屏東', lat: 22.67, lon: 120.49, tz: 8 },
    { id: 'yilan', name: '宜蘭', lat: 24.75, lon: 121.75, tz: 8 },
    { id: 'hualien', name: '花蓮', lat: 23.98, lon: 121.60, tz: 8 },
    { id: 'taitung', name: '台東', lat: 22.76, lon: 121.14, tz: 8 },
    { id: 'penghu', name: '澎湖', lat: 23.57, lon: 119.58, tz: 8 },
    { id: 'kinmen', name: '金門', lat: 24.43, lon: 118.32, tz: 8 },
    { id: 'matsu', name: '馬祖', lat: 26.16, lon: 119.95, tz: 8 },
    { id: 'hongkong', name: '香港', lat: 22.32, lon: 114.17, tz: 8 },
    { id: 'macau', name: '澳門', lat: 22.20, lon: 113.54, tz: 8 },
    { id: 'beijing', name: '北京', lat: 39.90, lon: 116.40, tz: 8 },
    { id: 'shanghai', name: '上海', lat: 31.23, lon: 121.47, tz: 8 },
    { id: 'guangzhou', name: '廣州', lat: 23.13, lon: 113.26, tz: 8 },
    { id: 'singapore', name: '新加坡', lat: 1.35, lon: 103.82, tz: 8 },
    { id: 'kualalumpur', name: '吉隆坡', lat: 3.14, lon: 101.69, tz: 8 },
    { id: 'bangkok', name: '曼谷', lat: 13.76, lon: 100.50, tz: 7 },
    { id: 'tokyo', name: '東京', lat: 35.68, lon: 139.69, tz: 9 },
    { id: 'seoul', name: '首爾', lat: 37.57, lon: 126.98, tz: 9 },
    { id: 'sydney', name: '雪梨', lat: -33.87, lon: 151.21, tz: 10 },
    { id: 'london', name: '倫敦', lat: 51.51, lon: -0.13, tz: 0 },
    { id: 'paris', name: '巴黎', lat: 48.86, lon: 2.35, tz: 1 },
    { id: 'newyork', name: '紐約', lat: 40.71, lon: -74.01, tz: -5 },
    { id: 'losangeles', name: '洛杉磯', lat: 34.05, lon: -118.24, tz: -8 },
    { id: 'vancouver', name: '溫哥華', lat: 49.28, lon: -123.12, tz: -8 },
    { id: 'toronto', name: '多倫多', lat: 43.65, lon: -79.38, tz: -5 }
  ];

  function findPlace(id) { for (var i = 0; i < PLACES.length; i++) if (PLACES[i].id === id) return PLACES[i]; return PLACES[0]; }

  /*
   * 建立出生資料
   * input: { y, m, d, hour, minute, timeKnown, placeId, dst, gender: 'F'|'M', trueSolar }
   */
  function create(input) {
    var place = findPlace(input.placeId);
    var timeKnown = input.timeKnown !== false;
    var hour = timeKnown ? input.hour : 12, minute = timeKnown ? input.minute : 0;
    var offset = place.tz + (input.dst ? 1 : 0);
    var jdUT = A.julianDay(input.y, input.m, input.d, hour + minute / 60 - offset);

    // 八字、紫微用的「當地時間」：預設用時鐘時間，勾選真太陽時則換算
    var local = { y: input.y, m: input.m, d: input.d, hour: hour, minute: minute };
    var solarShiftMin = 0;
    if (input.trueSolar && timeKnown) {
      solarShiftMin = (place.lon - offset * 15) * 4 + A.equationOfTime(jdUT);
      var t = A.fromJulianDay(A.julianDay(input.y, input.m, input.d, hour + minute / 60 + solarShiftMin / 60));
      var h = Math.round(t.h * 60) / 60;
      if (h >= 24) { h -= 24; var t2 = A.fromJulianDay(A.julianDay(t.y, t.m, t.d + 1, 0)); t.y = t2.y; t.m = t2.m; t.d = t2.d; }
      local = { y: t.y, m: t.m, d: t.d, hour: Math.floor(h), minute: Math.round((h - Math.floor(h)) * 60) };
    }

    return {
      y: input.y, m: input.m, d: input.d, hour: hour, minute: minute,
      timeKnown: timeKnown, gender: input.gender === 'M' ? 'M' : 'F',
      place: place, tzOffset: offset, jdUT: jdUT,
      local: local, trueSolar: !!input.trueSolar, solarShiftMin: solarShiftMin
    };
  }

  var api = { PLACES: PLACES, findPlace: findPlace, create: create };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Birth = api;
})(this);
