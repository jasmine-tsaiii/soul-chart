/*
 * 綜合整理：把六個系統放在一起看
 * 做法：每個系統的結果，對應到幾個共同的「主題」（例如思考洞察、穩定務實）。
 *   - 幾個系統都指向同一個主題 → 共同點
 *   - 互相拉扯的主題同時出現（例如穩定 vs 自由）→ 不同的聲音
 *   - 再依面向（性格、工作、金錢、感情、功課、這幾年）列出各系統怎麼說
 * 主題對照和文字都是草稿，請 Jasmine 依自己的觀點修改。
 */
(function (root) {
  'use strict';

  var THEMES = {
    think:   { name: '思考洞察', text: '你習慣看懂本質、把事情想透，洞察力是你很大的資產。' },
    express: { name: '表達創作', text: '你需要把內在的東西說出來、做出來，表達本身就會讓你發亮。' },
    teach:   { name: '學習傳授', text: '你喜歡學習，也很適合把自己懂的東西整理好、教給別人。' },
    stable:  { name: '穩定務實', text: '你重視踏實和按部就班，事情一步一步累積起來，最能發揮。' },
    feel:    { name: '感受直覺', text: '你感受力強、直覺敏銳，對看不見的東西也很有感。' },
    care:    { name: '照顧連結', text: '你很在乎人，懂得照顧和陪伴，關係是你的重要能量來源。' },
    act:     { name: '行動開創', text: '你有衝勁和持久力，想到就想去做、去開創。' },
    free:    { name: '自由變化', text: '你需要變化和空間，被框住的時候最容易失去動力。' },
    lead:    { name: '主見領導', text: '你有自己的主見，適合帶頭和做決定。' },
    wealth:  { name: '經營資源', text: '你對資源、金錢和價值有概念，懂得經營。' }
  };

  // 總覽用的文字：每個主題的形容詞、名詞，以及在工作、金錢、感情裡的一句話（草稿）
  var COPY = {
    think:   { adj: '洞察力強的', noun: '思考者', key: '洞察',
      work: '工作上，你最強的是看懂本質，把複雜的事情理清楚、說明白。',
      money: '面對錢和資源，你習慣先研究、想清楚再出手，靠判斷力累積。',
      love: '在關係裡，你需要能聊得深的人，被理解比被照顧更重要。' },
    express: { adj: '有表達力的', noun: '創作者', key: '表達',
      work: '你的才華要被看見才會發光，適合需要說、寫、創作或站上台的工作。',
      money: '你的收入很容易跟「表達」連在一起，作品、內容、個人品牌都是你的資源。',
      love: '在關係裡，你需要可以自在說出感受的空間，悶著不說最傷你。' },
    teach:   { adj: '愛學習的', noun: '引導者', key: '傳授',
      work: '你很適合把懂的東西整理成系統教給別人，教學、諮詢、寫作都順手。',
      money: '你的錢多半來自專業和知識，越願意分享，資源越會流向你。',
      love: '在關係裡，你欣賞能一起成長、彼此學習的人。' },
    stable:  { adj: '踏實的', noun: '實踐者', key: '穩定',
      work: '你適合按部就班、能長期累積的工作，時間會站在你這邊。',
      money: '理財上你偏穩健，慢慢存、慢慢累積最適合你。',
      love: '在關係裡，你需要安全感和穩定的陪伴，承諾對你很重要。' },
    feel:    { adj: '直覺敏銳的', noun: '感受者', key: '直覺',
      work: '你的直覺本身就是專業，適合需要感受力、同理心或療癒的工作。',
      money: '金錢上，跟著直覺和「感覺對不對」做決定，往往比硬算更準。',
      love: '在關係裡你很細膩，感覺得到對方沒說出口的情緒，也需要對方懂你的細膩。' },
    care:    { adj: '溫暖的', noun: '陪伴者', key: '照顧',
      work: '你擅長照顧人、建立連結，跟人有關的工作會讓你有成就感。',
      money: '你的資源常常透過人脈和關係流進來，好的合作就是你的財富。',
      love: '在關係裡你很會付出，也要記得留一點照顧給自己。' },
    act:     { adj: '有行動力的', noun: '開創者', key: '行動',
      work: '你適合自己開路、從零開始做事，想法要盡快動手試。',
      money: '你敢衝也敢試，錢多半是靠主動爭取和開創來的。',
      love: '在關係裡你直接、主動，喜歡一起去做事、一起冒險。' },
    free:    { adj: '自由的', noun: '探索者', key: '自由',
      work: '你需要有彈性和變化的工作，太固定的流程會讓你失去動力。',
      money: '你的收入來源可能很多元，多條路對你比單一穩定更自在。',
      love: '在關係裡你需要空間，能尊重彼此自由的人最適合你。' },
    lead:    { adj: '有主見的', noun: '領航者', key: '主見',
      work: '你適合自己做決定、帶頭做事，當主導者比聽命行事更能發揮。',
      money: '你對錢有主見，適合自己掌握方向，例如創業或經營自己的品牌。',
      love: '在關係裡你有自己的想法，需要被尊重，而不是被安排。' },
    wealth:  { adj: '懂經營的', noun: '經營者', key: '經營',
      work: '你對價值和資源很敏銳，適合需要規劃、經營或管理的角色。',
      money: '你天生有金錢概念，懂得讓資源流動、累積。',
      love: '在關係裡，你重視實際的付出和一起經營的感覺。' }
  };


  // ---- 讓描述更精準：具體情境、你比較不是、太陽月亮組合（草稿）----
  // 具體情境：用生活畫面取代形容詞
  var SCENE = {
    think:   '遇到一件事，你會先在腦中把來龍去脈想一遍，甚至查資料、列清單；別人還在憑感覺，你已經在找「為什麼」。',
    express: '心裡有感覺時，你很想把它說出來、寫下來或做成作品；如果一直悶著不能表達，你會明顯沒精神。',
    teach:   '朋友常來問你意見；你學到新東西時，第一個念頭常常是「這個可以整理起來分享給別人」。',
    stable:  '你喜歡有計畫、有節奏的生活，臨時被打亂行程會讓你不太舒服；一件事你願意慢慢做、做很久。',
    feel:    '走進一個空間，你常常第一秒就感覺到氣氛對不對；朋友還沒開口，你就知道他今天心情不太好。',
    care:    '身邊的人不舒服時，你常常是第一個發現、也第一個伸出手的人；有時候忙著照顧別人，忘了自己也累了。',
    act:     '想到一個點子，你會想馬上動手試試看，等太久反而會失去興趣；「先做再說」比「想清楚再做」更像你。',
    free:    '同一份工作、同一種生活過太久，你會開始坐立難安；你需要時不時換個環境、學點新東西。',
    lead:    '討論卡住時，你常常是那個說「那就這樣決定吧」的人；你不太喜歡被安排，比較想自己掌握方向。',
    wealth:  '你對價格、價值和資源很有感，買東西會比較、做事會算成本；你相信資源要經營，才會越滾越多。'
  };
  // 你比較不是：六個系統幾乎沒提到的主題
  var NOT_YOU = {
    think:   '你比較不是會花很多時間分析、研究的人，憑感覺和經驗做判斷，對你來說更自然。',
    express: '你比較不是需要站上台、被大家看見的人，在幕後默默把事情做好，反而比較自在。',
    teach:   '你比較不是愛講道理、帶著別人學習的類型，比起教別人，你更喜歡自己去體驗。',
    stable:  '你比較不是按表操課、一成不變的人，太固定的生活和規則，很容易讓你覺得悶。',
    feel:    '你比較不是靠直覺和情緒做決定的人，你更相信看得到的事實和邏輯。',
    care:    '你比較不是時時照顧別人情緒的類型，你會把界線畫得比較清楚，先顧好自己的事。',
    act:     '你比較不是衝第一、想到就做的人，你習慣先觀察、等時機成熟再出手。',
    free:    '你比較不是追求變化和冒險的人，穩定、熟悉的環境才會讓你安心發揮。',
    lead:    '你比較不是喜歡當主導者的人，在團隊裡支援、協調，反而是你的舒適位置。',
    wealth:  '你比較不是對錢很精打細算的人，你做事更看重意義和感覺，有時候會忘了算成本。'
  };
  // 強度：幾個系統提到，語氣就不同
  function intensity(n) { return n >= 5 ? '非常明顯' : n >= 3 ? '很明顯' : '有一點'; }
  // 西洋占星：太陽（你想成為的樣子）× 月亮（你內在的需求）的元素組合
  var EL_NAME = ['火', '土', '風', '水'];
  var SUN_MOON = {
    '火火': '外在熱情、內在也急著燃燒，你的能量很直接，想要的東西會馬上去追；要小心一次衝太多、把自己燒乾。',
    '火土': '外表熱情有衝勁，內心卻需要踏實和安全感；你會先衝出去，但真正讓你安心的，是看得到成果的那一刻。',
    '火風': '外在熱情、內在需要新鮮和交流，你很會帶動氣氛、點燃大家；最怕無聊和一成不變。',
    '火水': '外表看起來勇敢直接，內心其實很敏感，很在意別人的感受；常常表面沒事，回家才慢慢消化情緒。',
    '土火': '外表穩重、做事踏實，內心卻有一團想衝的火；你不是不想冒險，只是習慣先把路鋪好再出發。',
    '土土': '裡外都很踏實，你相信一步一腳印，給人可靠的感覺；要留意的是太在意穩定，錯過該轉彎的時機。',
    '土風': '外表穩重務實，內心卻很需要聊天、交流和新想法；你會在可靠的生活裡，偷偷留一扇看世界的窗。',
    '土水': '外表穩定可靠，內心柔軟細膩，你會默默用行動照顧身邊的人；你的溫柔常常藏在做的事裡，而不是說的話裡。',
    '風火': '外在聰明、好溝通，內心卻有很強的熱情和行動力；你會先想清楚，一旦決定就很有爆發力。',
    '風土': '外表輕鬆好聊、想法很多，內心卻需要踏實和秩序；你的點子很多，真正讓你安心的是把它們一件件落實。',
    '風風': '裡外都很需要交流和新鮮感，你思考快、朋友多，對很多事都好奇；要小心想太多、做太少。',
    '風水': '外表理性、好溝通，內心其實很感性，常常用頭腦整理自己的情緒；你很能理解別人，但不一定說出自己的感受。',
    '水火': '外表溫柔敏感，內心卻有一股不服輸的火；看起來好說話，真的在乎的事，你會很堅持。',
    '水土': '外表溫柔、好親近，內心需要安全感和穩定的關係；你很重感情，也很需要被好好對待。',
    '水風': '外表感性、有同理心，內心卻需要空間和交流；你懂別人的情緒，但也需要有人能和你聊想法、不只聊心情。',
    '水水': '裡外都很感性，你的直覺和同理心特別強，很容易接收到別人的情緒；記得常常回到自己，分清楚哪些感受是你的。'
  };

  var PAIRS = [
    { a: 'stable', b: 'free', title: '穩定 vs 自由', text: '有的系統說你要穩、要扎根，有的說你需要變化和空間。這不是矛盾，比較像是你需要「一個穩定的基地，加上一塊可以探索的空間」，兩個都有的時候你最舒服。' },
    { a: 'think', b: 'act', title: '想透 vs 去做', text: '一邊是想清楚再走，一邊是想到就做。可以給自己一個界線：想到七成就先動，剩下的邊做邊修。' },
    { a: 'care', b: 'lead', title: '照顧別人 vs 堅持自己', text: '你同時有體貼別人和堅持主見的一面。練習在照顧關係的同時，也把自己的立場說出來。' },
    { a: 'feel', b: 'think', title: '感受 vs 分析', text: '你既靠直覺，也靠分析。最好的決定，通常是直覺和腦袋都點頭的時候。' }
  ];

  var ASPECTS = [
    { id: 'core', name: '核心性格', lead: '你是一個怎樣的人' },
    { id: 'work', name: '天賦與工作', lead: '你擅長什麼、適合怎麼工作' },
    { id: 'money', name: '金錢與資源', lead: '你和錢、資源的關係' },
    { id: 'love', name: '感情與關係', lead: '你在關係裡需要什麼' },
    { id: 'lesson', name: '功課與提醒', lead: '可以多練習、多留意的地方' },
    { id: 'now', name: '現在這幾年', lead: '目前走到人生的哪個階段' }
  ];

  // ---- 各系統的主題對照 ----
  var CHAKRA_TAGS = { root: ['stable'], sacral: ['feel', 'express'], solar: ['act', 'lead'], heart: ['care'], throat: ['express', 'teach'], thirdEye: ['think', 'feel'], crown: ['feel', 'teach'] };
  var TYPE_TAGS = { insight: ['think', 'feel'], action: ['act', 'stable'], connect: ['act', 'think'] };
  var STEM_TAGS = { '甲': ['lead', 'care'], '乙': ['free', 'care'], '丙': ['express', 'act'], '丁': ['care', 'think'], '戊': ['stable', 'care'],
    '己': ['stable', 'care'], '庚': ['act', 'lead'], '辛': ['think', 'express'], '壬': ['free', 'think'], '癸': ['feel', 'think'] };
  var GOD_TAGS = { '比肩': ['lead'], '劫財': ['act', 'lead'], '食神': ['express'], '傷官': ['express', 'free'], '偏財': ['wealth', 'free'],
    '正財': ['wealth', 'stable'], '七殺': ['act', 'lead'], '正官': ['stable', 'lead'], '偏印': ['think', 'feel'], '正印': ['teach', 'care'] };
  var STAR_TAGS = { '紫微': ['lead'], '天機': ['think', 'teach'], '太陽': ['express', 'care'], '武曲': ['wealth', 'act'], '天同': ['care', 'feel'],
    '廉貞': ['lead', 'express'], '天府': ['stable', 'wealth'], '太陰': ['feel', 'care'], '貪狼': ['free', 'express'], '巨門': ['think', 'express'],
    '天相': ['care', 'stable'], '天梁': ['teach', 'care'], '七殺': ['act', 'lead'], '破軍': ['act', 'free'] };
  var SIGN_TAGS = [['act', 'lead'], ['stable', 'wealth'], ['express', 'think'], ['care', 'feel'], ['express', 'lead'], ['think', 'stable'],
    ['care', 'express'], ['feel', 'think'], ['free', 'teach'], ['stable', 'lead'], ['free', 'think'], ['feel', 'care']];
  var GRAHA_TAGS = { sun: ['lead'], moon: ['care', 'feel'], mars: ['act'], mercury: ['think', 'express'], jupiter: ['teach'], venus: ['care', 'express'],
    saturn: ['stable'], node: ['free'], ketu: ['feel'] };
  var HD_TYPE_TAGS = { generator: ['act', 'stable'], mg: ['act', 'free'], manifestor: ['act', 'lead'], projector: ['teach', 'think'], reflector: ['feel', 'care'] };
  var LINE_TAGS = { 1: ['think'], 2: ['free'], 3: ['act'], 4: ['care'], 5: ['teach'], 6: ['teach', 'lead'] };
  var CHANNEL_TAGS = { '1-8': ['express'], '2-14': ['wealth', 'lead'], '3-60': ['free', 'act'], '4-63': ['think'], '5-15': ['stable'], '6-59': ['care'],
    '7-31': ['lead'], '9-52': ['stable', 'think'], '10-20': ['free'], '10-34': ['lead', 'act'], '10-57': ['feel'], '11-56': ['teach', 'express'],
    '12-22': ['express', 'feel'], '13-33': ['teach', 'care'], '16-48': ['teach', 'express'], '17-62': ['think', 'teach'], '18-58': ['think'],
    '19-49': ['care', 'feel'], '20-34': ['act'], '20-57': ['feel', 'express'], '21-45': ['wealth', 'lead'], '23-43': ['think', 'express'],
    '24-61': ['think', 'feel'], '25-51': ['act', 'free'], '26-44': ['wealth', 'express'], '27-50': ['care'], '28-38': ['act'], '29-46': ['act'],
    '30-41': ['feel', 'free'], '32-54': ['wealth', 'act'], '34-57': ['act', 'feel'], '35-36': ['free', 'feel'], '37-40': ['care'],
    '39-55': ['feel', 'express'], '42-53': ['stable'], '47-64': ['think'] };
  var RASHI_TO_SIGN = ['牡羊座', '金牛座', '雙子座', '巨蟹座', '獅子座', '處女座', '天秤座', '天蠍座', '射手座', '摩羯座', '水瓶座', '雙魚座'];

  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
  function first(s) { return String(s || '').split('。')[0].split('，').slice(0, 2).join('，'); }
  // 每個系統只留一個標籤，最多兩個依據
  function bySystem(ev) {
    var g = {}, order = [];
    ev.forEach(function (e) { if (!g[e.sys]) { g[e.sys] = []; order.push(e.sys); } if (g[e.sys].indexOf(e.label) === -1) g[e.sys].push(e.label); });
    return order.map(function (k) { return k + '：' + g[k].slice(0, 2).join('、'); });
  }

  function build(R, TX) {
    var T = TX.T, X = TX.X, E = TX.E;
    var items = [];
    function add(sys, aspect, label, text, tags, brief) { if (TX.only && TX.only.indexOf(sys) === -1) return; items.push({ sys: sys, aspect: aspect, label: label, text: text, tags: uniq(tags || []), brief: brief }); }

    // 一、生命靈數
    var nu = R.nu, gift = nu.lifePathChakras[0];
    add('生命靈數', 'core', T.types[nu.energyType].name, T.types[nu.energyType].line, TYPE_TAGS[nu.energyType]);
    add('生命靈數', 'work', '天賦：' + T.chakras[gift].name, T.chakras[gift].scenes.work, CHAKRA_TAGS[gift]);
    add('生命靈數', 'money', '最亮：' + T.chakras[nu.brightest].name, T.aspects[nu.brightest].money, CHAKRA_TAGS[nu.brightest]);
    add('生命靈數', 'love', '最亮：' + T.chakras[nu.brightest].name, T.chakras[nu.brightest].scenes.love, CHAKRA_TAGS[nu.brightest]);
    if (nu.potential) add('生命靈數', 'lesson', '潛在：' + T.chakras[nu.potential].name, T.chakras[nu.potential].potential, []);
    var py = nu.personalYear;
    add('生命靈數', 'now', py.year + ' 流年 ' + py.number, T.personalYear[py.number].theme + '：' + T.personalYear[py.number].line, [], '今年是「' + T.personalYear[py.number].theme + '」的一年');

    // 二、八字
    var bz = R.bz, dm = bz.dayMaster, P = bz.pillars, day = P[2];
    add('八字', 'core', dm.stem + dm.element + '日主', X.bazi.dayMaster[dm.stem], STEM_TAGS[dm.stem]);
    var score = {};
    P.forEach(function (p) {
      if (p.unknown) return;
      if (p.label !== '日柱') score[p.tenGod] = (score[p.tenGod] || 0) + 1;
      p.hidden.forEach(function (h, i) { score[h.tenGod] = (score[h.tenGod] || 0) + (i === 0 ? 1 : 0.5); });
    });
    var order = Object.keys(X.bazi.tenGods);
    var top = Object.keys(score).filter(function (g) { return g !== '日主'; })
      .sort(function (a, c) { return score[c] - score[a] || order.indexOf(a) - order.indexOf(c); }).slice(0, 2);
    add('八字', 'work', '最明顯：' + top.join('、'), top.map(function (g) { return g + '代表' + X.bazi.tenGods[g]; }).join('；') + '。',
      [].concat.apply([], top.map(function (g) { return GOD_TAGS[g]; })));
    var cai = (score['正財'] || 0) + (score['偏財'] || 0);
    add('八字', 'money', '財星 ' + (cai >= 2.5 ? '明顯' : cai >= 1 ? '中等' : '不多'),
      cai >= 2.5 ? '命裡的財星（正財、偏財）明顯，對錢和機會很敏感，懂得經營資源。' :
      cai >= 1 ? '命裡有財星但不算多，錢比較是做好喜歡的事之後跟著來的。' :
      '命裡財星不多，比起追錢，價值感和興趣更能帶動你，錢會跟著能力來。', cai >= 1 ? ['wealth'] : []);
    var spouseGod = day.hidden[0].tenGod;
    add('八字', 'love', '夫妻宮「' + day.branch + '」主氣' + spouseGod, '你的內在和伴侶關係帶著「' + X.bazi.tenGods[spouseGod] + '」的特質。', GOD_TAGS[spouseGod]);
    var lack = bz.elements.filter(function (e) { return e.count === 0; });
    if (!lack.length) lack = [bz.elements.slice().sort(function (a, c) { return a.weight - c.weight; })[0]];
    add('八字', 'lesson', '五行少' + lack.map(function (e) { return e.name; }).join('、'), lack.map(function (e) { return E.bazi.elementLack[e.name].replace(/^命裡.少：/, ''); }).join(''), []);
    var nowYear = TX.nowYear, cur = bz.luck.filter(function (l) { return nowYear >= l.startYear && nowYear <= l.endYear; })[0];
    if (cur) add('八字', 'now', cur.ganzhi + '大運（' + cur.startYear + '–' + cur.endYear + '）', '外在是' + cur.stemGod + '（' + X.bazi.tenGods[cur.stemGod] + '），內在是' + cur.branchGod + '（' + X.bazi.tenGods[cur.branchGod] + '）。', []);

    // 三、紫微
    var zw = R.zw;
    if (!zw.unknownTime) {
      var palace = function (name) { return zw.palaces.filter(function (p) { return p.name === name; })[0]; };
      var mainsOf = function (name) {
        var p = palace(name), m = p.stars.filter(function (s) { return s.kind === 'main'; }).map(function (s) { return s.name; });
        if (m.length) return { stars: m, borrowed: false };
        var opp = zw.palaces.filter(function (q) { return q.branchIndex === (p.branchIndex + 6) % 12; })[0];
        return { stars: opp.stars.filter(function (s) { return s.kind === 'main'; }).map(function (s) { return s.name; }), borrowed: true };
      };
      var starItem = function (aspect, pname, prefix) {
        var m = mainsOf(pname);
        if (!m.stars.length) return;
        add('紫微斗數', aspect, pname + '：' + m.stars.join('、') + (m.borrowed ? '（借對宮）' : ''),
          prefix + m.stars.map(function (s) { return s + '是' + first(X.ziwei.stars[s]); }).join('；') + '。',
          [].concat.apply([], m.stars.map(function (s) { return STAR_TAGS[s] || []; })));
      };
      starItem('core', '命宮', '');
      starItem('work', '官祿宮', '工作上，');
      starItem('money', '財帛宮', '賺錢方式上，');
      starItem('love', '夫妻宮', '感情裡，');
      var ji = zw.sihua.filter(function (h) { return h.type === '化忌'; })[0];
      if (ji && ji.palace) add('紫微斗數', 'lesson', ji.star + '化忌在' + ji.palace, '最在意、也最需要用心經營的是「' + X.ziwei.palaces[ji.palace] + '」。', []);
      var age = nowYear - TX.birthYear + 1, dec = zw.decades.filter(function (d) { return age >= d.from && age <= d.to; })[0];
      if (dec) add('紫微斗數', 'now', '大限走' + dec.palace + '（' + dec.from + '–' + dec.to + ' 歲）', '這十年的重心在「' + X.ziwei.palaces[dec.palace] + '」。', [], '這十年的重心在「' + X.ziwei.palaces[dec.palace] + '」');
    }

    // 四、西洋占星
    var we = R.we, W = E.western, sun = we.planets[0], moon = we.planets[1], ven = we.planets[3], sat = we.planets[6];
    add('西洋占星', 'core', sun.sign.replace('座', '') + '太陽' + (we.asc ? '・' + we.asc.sign.replace('座', '') + '上升' : ''),
      '核心是「' + W.signStyle[sun.sign] + '」' + (we.asc ? '，給人的第一印象是「' + W.signStyle[we.asc.sign] + '」' : '') + '。',
      SIGN_TAGS[sun.signIndex].concat(we.asc ? SIGN_TAGS[we.asc.signIndex] : []));
    var bySign = {};
    we.planets.slice(0, 10).forEach(function (p) { (bySign[p.signIndex] = bySign[p.signIndex] || []).push(p.name); });
    Object.keys(bySign).forEach(function (k) {
      if (bySign[k].length >= 3) add('西洋占星', 'core', '星群：' + RASHI_TO_SIGN[k], bySign[k].join('、') + '都在' + RASHI_TO_SIGN[k] + '，「' + W.signStyle[RASHI_TO_SIGN[k]] + '」是你很明顯的樣子。', SIGN_TAGS[k]);
    });
    if (we.mc) {
      var mcIdx = RASHI_TO_SIGN.indexOf(we.mc.sign);
      var tenth = we.planets.filter(function (p) { return p.house === 10; }).map(function (p) { return p.name; });
      add('西洋占星', 'work', '天頂' + we.mc.sign + (tenth.length ? '・第 10 宮有' + tenth.join('、') : ''),
        '事業上想被看見的是「' + W.signStyle[we.mc.sign] + '」的樣子。', SIGN_TAGS[mcIdx]);
    }
    add('西洋占星', 'money', '金星' + ven.sign + (ven.house ? '・第 ' + ven.house + ' 宮' : ''),
      '你重視、願意花錢的地方帶著「' + W.signStyle[ven.sign] + '」的味道' + (ven.house ? '，和「' + W.houses[ven.house] + '」有關' : '') + '。', SIGN_TAGS[ven.signIndex]);
    add('西洋占星', 'love', '月亮' + moon.sign + (moon.house ? '・第 ' + moon.house + ' 宮' : ''),
      '你需要「' + W.signStyle[moon.sign] + '」才會安心' + (moon.house === 7 ? '，而且情緒和伴侶關係綁得很緊' : '') + '。', SIGN_TAGS[moon.signIndex]);
    add('西洋占星', 'lesson', '土星' + sat.sign + (sat.house ? '・第 ' + sat.house + ' 宮' : ''),
      W.planetLine.saturn[0].replace('{s}', W.signStyle[sat.sign]) + (sat.house ? W.planetLine.saturn[1].replace('{h}', W.houses[sat.house]) : '') + '。', []);

    // 五、印度占星
    var ve = R.ve, V = E.vedic, n = ve.moonNakshatra;
    var lagnaText = ve.lagna ? ve.lagna.rashi.split(' ')[1] + '上升・' : '';
    add('印度占星', 'core', lagnaText + n.name, '月亮星宿' + n.zh + '：' + X.vedic.nakshatra[n.index] + '。',
      ve.lagna ? SIGN_TAGS[ve.lagna.signIndex] : SIGN_TAGS[ve.grahas[1].signIndex]);
    if (ve.lagna) {
      var inHouse = function (h) { return ve.grahas.filter(function (g) { return g.house === h; }); };
      var houseItem = function (aspect, houses, title) {
        var gs = [].concat.apply([], houses.map(inHouse));
        if (!gs.length) return;
        add('印度占星', aspect, title + '有' + gs.map(function (g) { return g.name.split(' ')[1]; }).join('、'),
          gs.map(function (g) { return g.name.split(' ')[1] + '代表' + V.grahas[g.name]; }).join('；') + '。',
          [].concat.apply([], gs.map(function (g) { return GRAHA_TAGS[g.id] || []; })));
      };
      houseItem('work', [10], '第 10 宮（事業）');
      houseItem('money', [2, 11], '第 2、11 宮（金錢、收入）');
      houseItem('love', [7], '第 7 宮（伴侶）');
      var shani = ve.grahas.filter(function (g) { return g.id === 'saturn'; })[0];
      add('印度占星', 'lesson', '土星在第 ' + shani.house + ' 宮', '需要紀律和時間慢慢經營的是「' + V.houses[shani.house] + '」。', []);
    }
    var cd = ve.dashas.filter(function (d) { return d.current; })[0];
    if (cd) add('印度占星', 'now', cd.lord + ' 大運（' + cd.from.slice(0, 4) + '–' + cd.to.slice(0, 4) + '）', X.vedic.dasha[cd.lord] + '。', []);

    // 六、人類圖
    var hd = R.hd;
    if (!hd.unknownTime) {
      var t = X.hd.types[hd.type], ln = hd.profile.split('/');
      add('人類圖', 'core', t.name + '・' + hd.profile, t.desc.split('。')[0] + '。', HD_TYPE_TAGS[hd.type].concat(LINE_TAGS[ln[0]], LINE_TAGS[ln[1]]));
      var chs = hd.channels.map(function (c) { var k = c.gates.slice().sort(function (x, y) { return x - y; }).join('-'); return { k: k, info: E.hd.channels[k] }; });
      add('人類圖', 'work', '策略：' + t.strategy + (chs.length ? '・' + chs.map(function (c) { return c.info[0]; }).join('、') + '通道' : ''),
        (chs.length ? '天生穩定的才華：' + chs.map(function (c) { return c.info[1]; }).join('；') + '。' : t.desc),
        [].concat.apply([], chs.map(function (c) { return CHANNEL_TAGS[c.k] || []; })));
      var au = X.hd.authorities[hd.authority];
      var gOpen = hd.definedCenters.indexOf('g') === -1;
      add('人類圖', 'love', au.name + (gOpen ? '・G 中心開放' : ''), au.desc + (gOpen ? '「在對的地方、跟對的人在一起」對你特別重要。' : ''),
        hd.authority === 'emotional' ? ['feel'] : []);
      var open = Object.keys(E.hd.centers).filter(function (c) { return hd.definedCenters.indexOf(c) === -1; });
      if (open.length) add('人類圖', 'lesson', '開放：' + open.map(function (c) { return TX.centerName(c); }).join('、'), E.hd.centers[open[0]].off, []);
    }

    // ---- 共同點：核心、工作、金錢、感情裡，被最多系統提到的主題 ----
    var counted = items.filter(function (it) { return ['core', 'work', 'money', 'love'].indexOf(it.aspect) !== -1; });
    var stat = {};
    counted.forEach(function (it) {
      it.tags.forEach(function (tg) {
        stat[tg] = stat[tg] || { tag: tg, systems: [], hits: 0, evidence: [] };
        stat[tg].hits++;
        if (stat[tg].systems.indexOf(it.sys) === -1) stat[tg].systems.push(it.sys);
        stat[tg].evidence.push({ sys: it.sys, label: it.label });
      });
    });
    var ranked = Object.keys(stat).map(function (k) { return stat[k]; })
      .sort(function (a, c) { return c.systems.length - a.systems.length || c.hits - a.hits; });
    var common = ranked.filter(function (s) { return s.systems.length >= 3; }).slice(0, 3);
    if (common.length < 2) common = ranked.slice(0, 2);
    common = common.map(function (s) { return { tag: s.tag, name: THEMES[s.tag].name, text: THEMES[s.tag].text, systems: s.systems, evidence: bySystem(s.evidence) }; });

    // ---- 不同的聲音 ----
    var tensions = [];
    PAIRS.forEach(function (p) {
      if (!stat[p.a] || !stat[p.b]) return;
      var key = function (e) { return e.sys + e.label; };
      var bKeys = stat[p.b].evidence.map(key), aKeys = stat[p.a].evidence.map(key);
      // 同一個結果同時屬於兩邊的，不算拉扯
      var ea = stat[p.a].evidence.filter(function (e) { return bKeys.indexOf(key(e)) === -1; });
      var eb = stat[p.b].evidence.filter(function (e) { return aKeys.indexOf(key(e)) === -1; });
      var ns = function (ev) { return uniq(ev.map(function (e) { return e.sys; })).length; };
      if (ns(ea) >= 2 && ns(eb) >= 2) tensions.push({ title: p.title, text: p.text,
        a: { name: THEMES[p.a].name, evidence: bySystem(ea) }, b: { name: THEMES[p.b].name, evidence: bySystem(eb) } });
    });
    tensions = tensions.slice(0, 2);

    // ---- 各面向 ----
    var aspects = ASPECTS.map(function (a) {
      var its = items.filter(function (it) { return it.aspect === a.id; });
      var tc = {};
      its.forEach(function (it) { it.tags.forEach(function (tg) { tc[tg] = tc[tg] || []; if (tc[tg].indexOf(it.sys) === -1) tc[tg].push(it.sys); }); });
      var shared = Object.keys(tc).filter(function (k) { return tc[k].length >= 2; })
        .sort(function (x, y) { return tc[y].length - tc[x].length; }).slice(0, 2)
        .map(function (k) { return { tag: k, name: THEMES[k].name, systems: tc[k] }; });
      var top = Object.keys(tc).sort(function (x, y) { return tc[y].length - tc[x].length; });
      return { id: a.id, name: a.name, lead: a.lead, items: its, shared: shared, top: top };
    });

    // ---- 總覽：一句標題、三個特質（含強度、情境、依據）、你比較不是、組合解讀、各面向一句話 ----
    var ct = common.map(function (c) { return c.tag; });
    var portrait = null;
    var evOf = function (tag, aspectIds) { // 某主題的命盤依據（每個系統取一個）
      var seen = {}, out = [];
      items.forEach(function (it) {
        if (it.tags.indexOf(tag) === -1 || seen[it.sys]) return;
        if (aspectIds && aspectIds.indexOf(it.aspect) === -1) return;
        seen[it.sys] = 1; out.push(it.sys + '：' + it.label);
      });
      return out;
    };
    if (ct.length) {
      var title = ct.length >= 2 ? COPY[ct[0]].adj + COPY[ct[1]].noun : COPY[ct[0]].adj + COPY[ct[0]].noun;
      if (ct[2]) title += '，透過' + COPY[ct[2]].key + '發光';
      var traits = common.map(function (c) {
        return { tag: c.tag, name: c.name, n: c.systems.length, level: intensity(c.systems.length), scene: SCENE[c.tag], evidence: evOf(c.tag, ['core', 'work', 'money', 'love']) };
      });
      // 你比較不是：在性格、工作、金錢、感情裡，幾乎沒有系統提到的主題
      var nots = Object.keys(THEMES).filter(function (k) { return ct.indexOf(k) === -1; })
        .map(function (k) { return { tag: k, n: stat[k] ? stat[k].systems.length : 0 }; })
        .sort(function (a, b) { return a.n - b.n; })
        .filter(function (x, i) { return x.n <= 1 || (i === 0 && x.n <= 2); }).slice(0, 2)
        .map(function (x) { return { name: THEMES[x.tag].name, text: (x.n >= 2 ? '相對來說，' : '') + NOT_YOU[x.tag], n: x.n }; });
      // 太陽 × 月亮組合
      var combo = null;
      if (R.we && R.we.planets) {
        var se = R.we.planets[0].signIndex % 4, me = R.we.planets[1].signIndex % 4;
        combo = { label: R.we.planets[0].sign + '太陽 × ' + R.we.planets[1].sign + '月亮', text: SUN_MOON[EL_NAME[se] + EL_NAME[me]] };
      }
      var tension = tensions.length ? { title: tensions[0].a.name + ' × ' + tensions[0].b.name, text: tensions[0].text,
        a: tensions[0].a.evidence, b: tensions[0].b.evidence } : null;
      var used = {}, lines = [];
      var pick = function (asp) {
        var cands = asp.shared.map(function (x) { return x.tag; }).concat(asp.top).filter(function (k) { return COPY[k]; });
        return cands.filter(function (k) { return !used[k]; })[0] || cands[0];
      };
      aspects.forEach(function (asp) {
        if (asp.id === 'core') {
          var ck = asp.shared.map(function (x) { return x.tag; }).concat(asp.top).filter(function (k) { return ct.indexOf(k) === -1; })[0] || ct[0];
          lines.push({ id: 'core', name: asp.name, text: '你是' + title.split('，')[0] + '。' + SCENE[ck], evidence: evOf(ck, ['core']) });
        } else if (asp.id === 'work' || asp.id === 'money' || asp.id === 'love') {
          var k = pick(asp); if (!k) return; used[k] = true;
          lines.push({ id: asp.id, name: asp.name, text: COPY[k][asp.id], evidence: evOf(k, [asp.id]) });
        } else if (asp.id === 'lesson') {
          var t = tensions[0];
          var lessonText = t ? '在「' + t.a.name + '」和「' + t.b.name + '」之間找到平衡，兩邊都照顧到時，你最有力量。' : (asp.items[0] ? asp.items[0].text : '');
          if (lessonText) lines.push({ id: 'lesson', name: asp.name, text: lessonText, evidence: asp.items.slice(0, 3).map(function (it) { return it.sys + '：' + it.label; }) });
        } else if (asp.id === 'now') {
          var nowItems = asp.items.filter(function (it) { return it.brief; });
          if (nowItems.length) lines.push({ id: 'now', name: asp.name, text: nowItems.map(function (it) { return it.brief; }).join('；') + '。', evidence: nowItems.map(function (it) { return it.sys + '：' + it.label; }) });
        }
      });
      var para = [common[0].systems.length + ' 個系統不約而同提到你的「' + common[0].name + '」。' + common.map(function (c) { return c.text; }).join('')];
      portrait = { title: title, keywords: common.map(function (c) { return c.name; }), traits: traits, nots: nots, combo: combo, tension: tension, paragraphs: para, lines: lines };
    }

    return { portrait: portrait, themes: THEMES, common: common, tensions: tensions, aspects: aspects, systemsUsed: uniq(items.map(function (i) { return i.sys; })) };
  }

  var api = { build: build, THEMES: THEMES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Synthesis = api;
})(this);
