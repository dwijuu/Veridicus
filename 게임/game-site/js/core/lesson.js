/**
 * 보충 수업 (주간 토벌 · 일간 토벌)
 * ─────────────────────────────────────────────────────────────
 *  · 주간 토벌 : 매주 일요일 12시(낮)에 초기화 → 보스가 바뀌고 다시 도전 가능 (한 주에 1번 토벌)
 *                블랙 속성 보스만 등장 · 아군은 [블랙의 위압](statuses.js black_pressure)을 받고 시작
 *  · 일간 토벌 : 하루 4번 · 매일 0시에 초기화 · 날마다 상대가 바뀜
 *  · 횟수는 '승리했을 때'만 줄어듦 (패배 · 포기는 횟수를 쓰지 않음)
 *
 *  메인화면(로비 버튼의 남은 시간)과 게임(보충 수업 화면 · 전투)이 함께 씀
 *  저장: localStorage 'AGENT_GAME_LESSON' = { week: 주 번호, weeklyDone: bool, day: 'YYYY-MM-DD', daily: 이긴 횟수 }
 *
 *  보스 · 상대를 바꾸려면 아래 WEEKLY / DAILY 목록만 고치면 됩니다 (적 데이터는 js/data/enemies.js).
 */
window.G = window.G || {};

G.lesson = (function () {
  const KEY = 'AGENT_GAME_LESSON';
  const DAILY_MAX = 4;
  const DAY = 86400000, WEEK = DAY * 7;
  /* 주 번호 기준점: 2026년 1월 4일(일) 12:00 */
  const EPOCH = new Date(2026, 0, 4, 12, 0, 0, 0).getTime();

  /* 주간 토벌 보스 (주마다 순서대로) */
  const WEEKLY = [
    { enemy: 'lesson_corusco', name: '코루스코', en: 'Corusco', sprite: 'assets/characters/Character_14/boss.webp',
      desc: '숲에서 마주쳤던 검은 손님. 이번에는 결말 없이 끝까지 싸운다. 번개를 모으는 속도가 빠르니 [찌릿]을 오래 두지 말 것.' },
    { enemy: 'lesson_tide', name: '검은 해일', en: 'Black Tide', sprite: '',
      desc: '물과 자연의 술식을 블랙의 기운으로 뒤틀어 쓰는 그림자. 분신으로 공격을 피하고, 큰 해일로 아군 전체를 덮친다.' },
    { enemy: 'lesson_warden', name: '그림자 감독관', en: 'Shadow Warden', sprite: '',
      desc: '빈 훈련장을 지키는 검은 형체. 세 번째 행동마다 강한 광역 공격을 쓰니 그 전에 보호막을 준비할 것.' }
  ];
  /* 일간 토벌 상대 (날마다 순서대로) */
  const DAILY = [
    { name: '숲길 순찰', en: 'Forest Patrol', enemies: ['forest_beast', 'forest_beast', 'forest_beast'], desc: '시내로 가는 숲길에 다시 나타난 마물 무리를 정리합니다.' },
    { name: '그림자 정리', en: 'Shade Sweep', enemies: ['shade', 'shade', 'shade'], desc: '밤사이 학교 복도에 스며든 검은 실루엣을 몰아냅니다.' },
    { name: '훈련장 정비', en: 'Drill Cleanup', enemies: ['dummy', 'dummy', 'dummy'], reserve: ['dummy', 'dummy', 'dummy'], desc: '고장 난 훈련용 마법 더미 6개를 모두 쓰러뜨립니다. 쓰러질 때마다 하나씩 다시 채워집니다.' }
  ];

  function now() { return Date.now(); }
  /* 이번 주가 시작된 시각 (가장 최근의 일요일 12:00) */
  function weekStart(t) {
    const d = new Date(t);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    if (d.getTime() > t) d.setDate(d.getDate() - 7);
    return d.getTime();
  }
  function weekIndex(t) { return Math.round((weekStart(t) - EPOCH) / WEEK); }
  function dayKey(t) { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function dayIndex(t) { const d = new Date(t); return Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - new Date(2026, 0, 1).getTime()) / DAY); }
  function mod(n, m) { return ((n % m) + m) % m; }

  /* 저장 값 (주 · 날이 바뀌었으면 초기화) */
  function load() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    const t = now(), w = weekIndex(t), dk = dayKey(t);
    if (!s || typeof s !== 'object') s = {};
    if (s.week !== w) { s.week = w; s.weeklyDone = false; }
    if (s.day !== dk) { s.day = dk; s.daily = 0; }
    s.daily = Math.max(0, Math.min(DAILY_MAX, s.daily | 0));
    s.weeklyDone = s.weeklyDone === true;
    return s;
  }
  function persist(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }

  function weekly() { return WEEKLY[mod(weekIndex(now()), WEEKLY.length)]; }
  function daily() { return DAILY[mod(dayIndex(now()), DAILY.length)]; }
  function weeklyLeft() { const t = now(); return weekStart(t) + WEEK - t; }
  function dailyLeft() { const d = new Date(now()); return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime() - d.getTime(); }
  function dailyRemain() { return DAILY_MAX - load().daily; }
  function weeklyDone() { return load().weeklyDone; }
  function canEnter(kind) { return kind === 'weekly' ? !weeklyDone() : dailyRemain() > 0; }
  function recordClear(kind) {
    const s = load();
    if (kind === 'weekly') s.weeklyDone = true;
    else s.daily = Math.min(DAILY_MAX, s.daily + 1);
    persist(s);
  }

  /* 남은 시간 글씨: '2일 03:12:44' · '03:12:44' (short: '2일' · '3시간' · '12분') */
  function fmt(ms, short) {
    const sec = Math.max(0, Math.floor(ms / 1000));
    const d = Math.floor(sec / 86400), h = Math.floor(sec % 86400 / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
    if (short) return d ? d + '일' : h ? h + '시간' : Math.max(1, m) + '분';
    const p = function (n) { return String(n).padStart(2, '0'); };
    return (d ? d + '일 ' : '') + p(h) + ':' + p(m) + ':' + p(s);
  }

  /* 게임 쪽: 보충 수업 스테이지 등록 (편성 · 전투 화면을 그대로 씀) */
  function registerStages() {
    if (!G.DATA || !G.DATA.stages || !G.DATA.enemies) return;
    const w = weekly(), dl = daily();
    G.DATA.stages['ls-weekly'] = {
      id: 'ls-weekly', chapter: 'lesson', lesson: 'weekly', backHash: '#/lesson',
      battleBg: 'assets/bg/corridor.webp', battleBgDim: 0.55,
      name: 'WEEKLY', subtitle: '주간 토벌 · ' + w.name, desc: w.desc,
      boss: true,
      enemies: [w.enemy],
      allyStart: [{ status: 'black_pressure' }],
      objectives: [w.name + ' 토벌'],
      battleHint: '[블랙의 위압] 아군 전원 공격력 −15% · 받는 피해 +15% (해제 불가)'
    };
    G.DATA.stages['ls-daily'] = {
      id: 'ls-daily', chapter: 'lesson', lesson: 'daily', backHash: '#/lesson',
      battleBg: 'assets/bg/training.webp', battleBgDim: 0.4,
      name: 'DAILY', subtitle: '일간 토벌 · ' + dl.name, desc: dl.desc,
      enemies: dl.enemies.slice(), reserve: dl.reserve ? dl.reserve.slice() : null,
      objectives: [dl.name]
    };
  }
  registerStages();

  return {
    DAILY_MAX: DAILY_MAX, WEEKLY: WEEKLY, DAILY: DAILY, refresh: registerStages,
    weekly: weekly, daily: daily, weeklyLeft: weeklyLeft, dailyLeft: dailyLeft,
    dailyRemain: dailyRemain, weeklyDone: weeklyDone, canEnter: canEnter, recordClear: recordClear, fmt: fmt
  };
})();
