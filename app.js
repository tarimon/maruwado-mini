(() => {
  'use strict';

  // Astronomical constants for lunar phase calculation
  const SYNODIC_MONTH = 29.530588853; // days
  const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14, 0); // 2000-01-06 18:14 UTC
  const MS_PER_DAY = 86400000;

  // SVG moon geometry constants
  const MOON_CX = 110;
  const MOON_CY = 110;
  const MOON_R = 54;
  const RING_R = 76;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R;

  const WEEKDAYS_JA = ['日', '月', '火', '水', '木', '金', '土'];

  // Full Japanese Shichijuni-kou (七十二候 / 略本暦) table — 72 micro-seasons
  // Ordered chronologically within the calendar year (1/1 – 12/31) for direct lookup
  const SHICHIJUNI_KOU = [
    { month: 1,  day: 1,  sekki: '冬至', order: '末候', name: '雪下出麦', reading: 'ゆきわたりてむぎのびる' },
    { month: 1,  day: 5,  sekki: '小寒', order: '初候', name: '芹乃栄',   reading: 'せりすなわちさかう' },
    { month: 1,  day: 10, sekki: '小寒', order: '次候', name: '水泉動',   reading: 'しみずあたたかをふくむ' },
    { month: 1,  day: 15, sekki: '小寒', order: '末候', name: '雉始雊',   reading: 'きじはじめてなく' },
    { month: 1,  day: 20, sekki: '大寒', order: '初候', name: '款冬華',   reading: 'ふきのはなさく' },
    { month: 1,  day: 25, sekki: '大寒', order: '次候', name: '水沢腹堅', reading: 'さわみずこおりつめる' },
    { month: 1,  day: 30, sekki: '大寒', order: '末候', name: '鶏始乳',   reading: 'にわとりはじめてとやにつく' },
    { month: 2,  day: 4,  sekki: '立春', order: '初候', name: '東風解凍', reading: 'はるかぜこおりをとく' },
    { month: 2,  day: 9,  sekki: '立春', order: '次候', name: '黄鶯睍睆', reading: 'うぐいすなく' },
    { month: 2,  day: 14, sekki: '立春', order: '末候', name: '魚上氷',   reading: 'うおこおりをいずる' },
    { month: 2,  day: 19, sekki: '雨水', order: '初候', name: '土脉潤起', reading: 'つちのしょううるおいおこる' },
    { month: 2,  day: 24, sekki: '雨水', order: '次候', name: '霞始靆',   reading: 'かすみはじめてたなびく' },
    { month: 3,  day: 1,  sekki: '雨水', order: '末候', name: '草木萌動', reading: 'そうもくめばえいずる' },
    { month: 3,  day: 6,  sekki: '啓蟄', order: '初候', name: '蟄虫啓戸', reading: 'すごもりむしとをひらく' },
    { month: 3,  day: 11, sekki: '啓蟄', order: '次候', name: '桃始笑',   reading: 'ももはじめてさく' },
    { month: 3,  day: 16, sekki: '啓蟄', order: '末候', name: '菜虫化蝶', reading: 'なむしちょうとなる' },
    { month: 3,  day: 21, sekki: '春分', order: '初候', name: '雀始巣',   reading: 'すずめはじめてすくう' },
    { month: 3,  day: 26, sekki: '春分', order: '次候', name: '桜始開',   reading: 'さくらはじめてひらく' },
    { month: 3,  day: 31, sekki: '春分', order: '末候', name: '雷乃発声', reading: 'かみなりすなわちこえをはっす' },
    { month: 4,  day: 5,  sekki: '清明', order: '初候', name: '玄鳥至',   reading: 'つばめきたる' },
    { month: 4,  day: 10, sekki: '清明', order: '次候', name: '鴻雁北',   reading: 'こうがんかえる' },
    { month: 4,  day: 15, sekki: '清明', order: '末候', name: '虹始見',   reading: 'にじはじめてあらわる' },
    { month: 4,  day: 20, sekki: '穀雨', order: '初候', name: '葭始生',   reading: 'あしはじめてしょうず' },
    { month: 4,  day: 25, sekki: '穀雨', order: '次候', name: '霜止出苗', reading: 'しもやみてなえいずる' },
    { month: 4,  day: 30, sekki: '穀雨', order: '末候', name: '牡丹華',   reading: 'ぼたんはなさく' },
    { month: 5,  day: 5,  sekki: '立夏', order: '初候', name: '蛙始鳴',   reading: 'かわずはじめてなく' },
    { month: 5,  day: 10, sekki: '立夏', order: '次候', name: '蚯蚓出',   reading: 'みみずいずる' },
    { month: 5,  day: 15, sekki: '立夏', order: '末候', name: '竹笋生',   reading: 'たけのこしょうず' },
    { month: 5,  day: 21, sekki: '小満', order: '初候', name: '蚕起食桑', reading: 'かいこおきてくわをはむ' },
    { month: 5,  day: 26, sekki: '小満', order: '次候', name: '紅花栄',   reading: 'べにばなさかう' },
    { month: 5,  day: 31, sekki: '小満', order: '末候', name: '麦秋至',   reading: 'むぎのときいたる' },
    { month: 6,  day: 6,  sekki: '芒種', order: '初候', name: '螳螂生',   reading: 'かまきりしょうず' },
    { month: 6,  day: 11, sekki: '芒種', order: '次候', name: '腐草為蛍', reading: 'くされたるくさほたるとなる' },
    { month: 6,  day: 16, sekki: '芒種', order: '末候', name: '梅子黄',   reading: 'うめのみきばむ' },
    { month: 6,  day: 21, sekki: '夏至', order: '初候', name: '乃東枯',   reading: 'なつかれくさかるる' },
    { month: 6,  day: 26, sekki: '夏至', order: '次候', name: '菖蒲華',   reading: 'あやめはなさく' },
    { month: 7,  day: 1,  sekki: '夏至', order: '末候', name: '半夏生',   reading: 'はんげしょうず' },
    { month: 7,  day: 7,  sekki: '小暑', order: '初候', name: '温風至',   reading: 'あつかぜいたる' },
    { month: 7,  day: 12, sekki: '小暑', order: '次候', name: '蓮始開',   reading: 'はすはじめてひらく' },
    { month: 7,  day: 17, sekki: '小暑', order: '末候', name: '鷹乃学習', reading: 'たかすなわちわざをならう' },
    { month: 7,  day: 23, sekki: '大暑', order: '初候', name: '桐始結花', reading: 'きりはじめてはなをむすぶ' },
    { month: 7,  day: 28, sekki: '大暑', order: '次候', name: '土潤溽暑', reading: 'つちうるおうてむしあつし' },
    { month: 8,  day: 2,  sekki: '大暑', order: '末候', name: '大雨時行', reading: 'たいうときどきふる' },
    { month: 8,  day: 7,  sekki: '立秋', order: '初候', name: '涼風至',   reading: 'すずかぜいたる' },
    { month: 8,  day: 12, sekki: '立秋', order: '次候', name: '寒蝉鳴',   reading: 'ひぐらしなく' },
    { month: 8,  day: 17, sekki: '立秋', order: '末候', name: '蒙霧升降', reading: 'ふかききりまとう' },
    { month: 8,  day: 23, sekki: '処暑', order: '初候', name: '綿柎開',   reading: 'わたのはなしべひらく' },
    { month: 8,  day: 28, sekki: '処暑', order: '次候', name: '天地始粛', reading: 'てんちはじめてさむし' },
    { month: 9,  day: 2,  sekki: '処暑', order: '末候', name: '禾乃登',   reading: 'こくものすなわちみのる' },
    { month: 9,  day: 8,  sekki: '白露', order: '初候', name: '草露白',   reading: 'くさのつゆしろし' },
    { month: 9,  day: 13, sekki: '白露', order: '次候', name: '鶺鴒鳴',   reading: 'せきれいなく' },
    { month: 9,  day: 18, sekki: '白露', order: '末候', name: '玄鳥去',   reading: 'つばめさる' },
    { month: 9,  day: 23, sekki: '秋分', order: '初候', name: '雷乃収声', reading: 'かみなりすなわちこえをおさむ' },
    { month: 9,  day: 28, sekki: '秋分', order: '次候', name: '蟄虫坏戸', reading: 'むしかくれてとをふさぐ' },
    { month: 10, day: 3,  sekki: '秋分', order: '末候', name: '水始涸',   reading: 'みずはじめてかるる' },
    { month: 10, day: 8,  sekki: '寒露', order: '初候', name: '鴻雁来',   reading: 'こうがんきたる' },
    { month: 10, day: 13, sekki: '寒露', order: '次候', name: '菊花開',   reading: 'きくのはなひらく' },
    { month: 10, day: 18, sekki: '寒露', order: '末候', name: '蟋蟀在戸', reading: 'きりぎりすとにあり' },
    { month: 10, day: 23, sekki: '霜降', order: '初候', name: '霜始降',   reading: 'しもはじめてふる' },
    { month: 10, day: 28, sekki: '霜降', order: '次候', name: '霎時施',   reading: 'こさめときどきふる' },
    { month: 11, day: 2,  sekki: '霜降', order: '末候', name: '楓蔦黄',   reading: 'もみじつたきばむ' },
    { month: 11, day: 7,  sekki: '立冬', order: '初候', name: '山茶始開', reading: 'つばきはじめてひらく' },
    { month: 11, day: 12, sekki: '立冬', order: '次候', name: '地始凍',   reading: 'ちはじめてこおる' },
    { month: 11, day: 17, sekki: '立冬', order: '末候', name: '金盞香',   reading: 'きんせんかさく' },
    { month: 11, day: 22, sekki: '小雪', order: '初候', name: '虹蔵不見', reading: 'にじかくれてみえず' },
    { month: 11, day: 27, sekki: '小雪', order: '次候', name: '朔風払葉', reading: 'きたかぜこのはをはらう' },
    { month: 12, day: 2,  sekki: '小雪', order: '末候', name: '橘始黄',   reading: 'たちばなはじめてきばむ' },
    { month: 12, day: 7,  sekki: '大雪', order: '初候', name: '閉塞成冬', reading: 'そらさむくふゆとなる' },
    { month: 12, day: 12, sekki: '大雪', order: '次候', name: '熊蟄穴',   reading: 'くまあなにこもる' },
    { month: 12, day: 17, sekki: '大雪', order: '末候', name: '鱖魚群',   reading: 'さけのうおむらがる' },
    { month: 12, day: 22, sekki: '冬至', order: '初候', name: '乃東生',   reading: 'なつかれくさしょうず' },
    { month: 12, day: 27, sekki: '冬至', order: '次候', name: '麋角解',   reading: 'さわしかのつのおつる' }
  ];

  function toLocalMidnight(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function isSameDate(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function getMoonPhaseName(age) {
    if (age < 1.0 || age >= SYNODIC_MONTH - 1.0) return '新月';
    if (age < 6.4) return '三日月';
    if (age < 8.4) return '上弦の月';
    if (age < 13.8) return '十三夜';
    if (age < 15.8) return '満月';
    if (age < 21.1) return '更待月';
    if (age < 23.1) return '下弦の月';
    return '有明の月';
  }

  function computeMoonData(date) {
    // Evaluate moon age at local noon (正午月齢) for the selected calendar date
    const noonMs = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      12,
      0,
      0
    ).getTime();

    const elapsedDays = (noonMs - KNOWN_NEW_MOON_UTC) / MS_PER_DAY;
    const age = ((elapsedDays % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
    const phase = age / SYNODIC_MONTH; // 0 = new, 0.5 = full
    const illumination = (1 - Math.cos(2 * Math.PI * phase)) / 2;

    return {
      age,
      phase,
      illumination,
      phaseName: getMoonPhaseName(age)
    };
  }

  function buildMoonPhasePath(cx, cy, r, phase, illumination) {
    if (illumination < 0.002) {
      return '';
    }
    if (illumination > 0.998) {
      return (
        `M ${cx} ${cy - r} ` +
        `A ${r} ${r} 0 1 1 ${cx} ${cy + r} ` +
        `A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`
      );
    }

    const theta = 2 * Math.PI * phase;
    const rx = r * Math.abs(Math.cos(theta));
    const topY = cy - r;
    const botY = cy + r;

    if (phase < 0.5) {
      // Waxing: right limb lit (sweep=1 top -> right -> bottom)
      // Crescent (phase < 0.25): terminator bows right (sweep=0 bottom -> right -> top)
      // Gibbous (phase >= 0.25): terminator bows left (sweep=1 bottom -> left -> top)
      const termSweep = phase < 0.25 ? 0 : 1;
      return (
        `M ${cx} ${topY} ` +
        `A ${r} ${r} 0 0 1 ${cx} ${botY} ` +
        `A ${rx.toFixed(3)} ${r} 0 0 ${termSweep} ${cx} ${topY} Z`
      );
    }

    // Waning: left limb lit (sweep=0 top -> left -> bottom)
    // Gibbous (phase < 0.75): terminator bows right (sweep=0 bottom -> right -> top)
    // Crescent (phase >= 0.75): terminator bows left (sweep=1 bottom -> left -> top)
    const termSweep = phase < 0.75 ? 0 : 1;
    return (
      `M ${cx} ${topY} ` +
      `A ${r} ${r} 0 0 0 ${cx} ${botY} ` +
      `A ${rx.toFixed(3)} ${r} 0 0 ${termSweep} ${cx} ${topY} Z`
    );
  }

  function getShichijuniKou(date) {
    const year = date.getFullYear();
    const targetMD = (date.getMonth() + 1) * 100 + date.getDate();

    let matchIndex = SHICHIJUNI_KOU.length - 1;
    for (let i = 0; i < SHICHIJUNI_KOU.length; i++) {
      const entry = SHICHIJUNI_KOU[i];
      const entryMD = entry.month * 100 + entry.day;
      if (entryMD <= targetMD) {
        matchIndex = i;
      } else {
        break;
      }
    }

    const current = SHICHIJUNI_KOU[matchIndex];
    const next = SHICHIJUNI_KOU[(matchIndex + 1) % SHICHIJUNI_KOU.length];
    const nextYear = matchIndex === SHICHIJUNI_KOU.length - 1 ? year + 1 : year;
    const endDate = new Date(nextYear, next.month - 1, next.day - 1);

    return {
      ...current,
      rangeLabel: `${current.month}/${current.day}–${endDate.getMonth() + 1}/${endDate.getDate()}`
    };
  }

  function formatJapaneseDate(date) {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const w = WEEKDAYS_JA[date.getDay()];
    return `${y}年${m}月${d}日（${w}）`;
  }

  function formatISODate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // DOM references
  const illumRingEl = document.getElementById('illum-ring');
  const moonLitEl = document.getElementById('moon-lit');
  const moonHaloEl = document.getElementById('moon-halo');
  const moonSvgTitleEl = document.getElementById('moon-svg-title');
  const moonAgeEl = document.getElementById('moon-age');
  const moonIllumEl = document.getElementById('moon-illum');
  const moonPhaseNameEl = document.getElementById('moon-phase-name');
  const kouTermEl = document.getElementById('kou-term');
  const kouNameEl = document.getElementById('kou-name');
  const kouReadingEl = document.getElementById('kou-reading');
  const selectedDateEl = document.getElementById('selected-date');
  const prevBtn = document.getElementById('prev-day');
  const nextBtn = document.getElementById('next-day');
  const todayBtn = document.getElementById('today-btn');

  // Initialize illumination ring dash array
  illumRingEl.style.strokeDasharray = `${RING_CIRCUMFERENCE.toFixed(2)}`;

  let selectedDate = toLocalMidnight(new Date());

  function render() {
    const moon = computeMoonData(selectedDate);
    const kou = getShichijuniKou(selectedDate);
    const illumPercent = Math.round(moon.illumination * 100);
    const ageFormatted = moon.age.toFixed(1);

    // Update SVG moon phase disc
    const moonPath = buildMoonPhasePath(
      MOON_CX,
      MOON_CY,
      MOON_R,
      moon.phase,
      moon.illumination
    );
    moonLitEl.setAttribute('d', moonPath);

    // Update illumination ring (arc length proportional to moon illumination)
    const dashOffset = RING_CIRCUMFERENCE * (1 - moon.illumination);
    illumRingEl.style.strokeDashoffset = `${dashOffset.toFixed(2)}`;
    illumRingEl.style.opacity = moon.illumination < 0.005 ? '0.15' : '1';

    // Modulate soft halo brightness by illumination
    moonHaloEl.setAttribute('opacity', (0.18 + moon.illumination * 0.82).toFixed(2));

    // Accessible SVG description
    moonSvgTitleEl.textContent =
      `月齢 ${ageFormatted}日、照度 ${illumPercent}%（${moon.phaseName}）`;

    // Update text labels
    moonAgeEl.textContent = `月齢 ${ageFormatted}日`;
    moonIllumEl.textContent = `照度 ${illumPercent}%`;
    moonPhaseNameEl.textContent = moon.phaseName;

    kouTermEl.textContent = `${kou.sekki}${kou.order} · ${kou.rangeLabel}`;
    kouNameEl.textContent = kou.name;
    kouReadingEl.textContent = kou.reading;

    selectedDateEl.textContent = formatJapaneseDate(selectedDate);
    selectedDateEl.setAttribute('datetime', formatISODate(selectedDate));

    const today = toLocalMidnight(new Date());
    todayBtn.hidden = isSameDate(selectedDate, today);
  }

  function shiftDate(deltaDays) {
    selectedDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate() + deltaDays
    );
    render();
  }

  prevBtn.addEventListener('click', () => shiftDate(-1));
  nextBtn.addEventListener('click', () => shiftDate(1));
  todayBtn.addEventListener('click', () => {
    selectedDate = toLocalMidnight(new Date());
    render();
  });

  window.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      shiftDate(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      shiftDate(1);
    }
  });

  render();

  // Register Service Worker for offline PWA support
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {
        // Ignore registration errors in unsupported contexts (e.g. file://)
      });
    });
  }
})();
