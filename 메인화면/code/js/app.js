/**
 * 메인화면 (CHARACTER CODEX)
 * ─────────────────────────────────────────────────────────────
 *  화면 3개 · 주소(#)로 이동 — 뒤로가기 / 새로고침 유지
 *   (없음)               메인 화면 (로비)
 *   #archive             캐릭터 선택 (CD 목록)
 *   #codex/<캐릭터 id>   캐릭터 정보 · 스킬
 *
 *  · 캐릭터 · 스킬 데이터 : 게임의 G.DATA.characters / G.DATA.roster  (../게임/game-site/js/data/characters.js)
 *  · 메인화면 전용 값      : code/js/data.js (MAIN.PLAYER · MAIN.LOBBY · MAIN.CODEX)
 *  · 설정 창 · 툴팁 · 버튼 : 게임의 G.settings · G.tip · .g-btn 을 그대로 사용
 */
(function () {
  const U = G.util;
  /* 궁극기 이름 앞의 '최종 술식 -' 은 빼고 이름만 (칸이 좁아 잘리지 않도록) */
  function skName(n) { return String(n || '').replace(/^최종\s*술식\s*[-–—:]\s*/, ''); }
  const $ = function (id) { return document.getElementById(id); };
  const GAME_SITE = '../게임/game-site/';
  const GAME_URL = GAME_SITE + 'index.html';

  const ELEMENTS = G.DATA.elements;
  function EL(k) { return ELEMENTS[k] || { name: k, icon: 'burst', color: '#555' }; }
  function gamePath(p) { return p ? (/^(\.\.|https?:|data:)/.test(p) ? p : GAME_SITE + p) : ''; }

  /* 캐릭터 목록 = 게임 데이터 + 메인화면 이미지 */
  const CHARS = G.DATA.roster.map(function (id, i) {
    const c = G.DATA.characters[id];
    const v = MAIN.CODEX[id] || {};
    return {
      id: id, no: i + 1, data: c,
      sprite: v.base || gamePath(c.images && c.images.full),
      spriteAtk: v.attack || '',
      placeholder: !!v.placeholder,
      cd: v.cd || '',
      playlist: v.playlist || []
    };
  });
  function byId(id) { return CHARS.find(function (x) { return x.id === id; }); }

  const state = { view: null, filterElem: null, query: '', sort: 'no', current: null, skill: 0 };
  const views = { lobby: $('view-lobby'), select: $('view-select'), detail: $('view-detail'), records: $('view-records') };
  const stage = $('stage');

  /* ── 공통 ───────────────────────────────────────────── */
  function fillIcons(root) {
    root.querySelectorAll('[data-icon]').forEach(function (n) { n.innerHTML = MAIN.icon(n.dataset.icon); });
  }
  function sideTag(c) {  // (속성 이름 목록)
    return [c.element, c.subElement].filter(Boolean).map(function (k) { return EL(k).name; }).join(' · ');
  }

  /* 기록 내보내기 · 불러오기: 게임과 같은 파일 (../게임/game-site/js/core/saveio.js · G.saveIO) */

  /* ── 화면 전환 ─────────────────────────────────────── */
  function show(name) {
    G.tip.hide();
    if (state.view === name) return;
    if (state.view === 'detail') MAIN.player.pause();
    if (state.view === 'records') MAIN.records.close();
    state.view = name;
    Object.keys(views).forEach(function (k) {
      views[k].hidden = k !== name;
      if (k === name) { views[k].classList.remove('g-fade-in'); void views[k].offsetWidth; views[k].classList.add('g-fade-in'); }
    });
  }
  let lastRoute = null;
  function route() {
    const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    if (h === lastRoute) return;   // hashchange · popstate 가 함께 와도 한 번만
    lastRoute = h;
    if (h === 'archive') { renderSelect(); show('select'); return; }
    if (h === 'records') { show('records'); MAIN.records.open(); return; }
    const m = h.match(/^codex\/(.+)$/);
    if (m && byId(m[1])) { openDetail(byId(m[1])); show('detail'); return; }
    show('lobby');
  }
  function go(hash) {
    if (hash) { location.hash = hash; route(); return; }
    history.pushState(null, '', location.pathname + location.search);
    route();
  }

  /* ════════════════════════════════════════════════════
     1. 메인 화면
     ════════════════════════════════════════════════════ */
  function initLobby() {
    const P = MAIN.PLAYER, L = MAIN.LOBBY;
    $('lb-level').textContent = P.level;
    $('lb-nick').textContent = P.nick;
    $('lb-uid').textContent = P.uid;
    $('lb-level-meter').style.width = (P.levelProgress * 100) + '%';
    $('lb-bg').style.backgroundImage = 'url("' + L.background + '")';
    $('lb-hero').src = L.hero;
    views.lobby.querySelectorAll('[data-card]').forEach(function (n) {
      const src = L.cards[n.dataset.card];
      if (src) n.style.backgroundImage = 'url("' + src + '")';
    });

    views.lobby.querySelectorAll('[data-locked]').forEach(function (b) {
      b.classList.add('is-locked');
    });
    views.lobby.querySelectorAll('.lb-card.is-locked').forEach(function (b) {
      const l = U.el('span', 'lb-card-lock', { html: MAIN.icon('lock') + '<span>LOCKED</span>' });
      b.appendChild(l);
    });

    $('btn-story').addEventListener('click', function () {
      const back = location.href.split('#')[0];
      G.loading.go(new URL(GAME_URL, location.href).href + '?return=' + encodeURIComponent(back));   // 로딩 화면 + 기록 함께 보냄
    });
    $('btn-manage').addEventListener('click', function () { go('#archive'); });
    /* 보충 수업: 게임 사이트의 보충 수업 화면(#/lesson)으로 — 왼쪽 위에 주간 토벌 초기화까지 남은 시간 */
    $('btn-lesson').addEventListener('click', function () {
      const back = location.href.split('#')[0];
      G.loading.go(new URL(GAME_URL, location.href).href + '?return=' + encodeURIComponent(back) + '#/lesson');
    });
    function lessonLeft() { $('lb-lesson-left').textContent = '주간 토벌 ' + G.lesson.fmt(G.lesson.weeklyLeft(), true); }
    lessonLeft();
    setInterval(lessonLeft, 30000);
    $('lb-notice').addEventListener('click', function () { MAIN.notice.open(stage); });   // 공지: 수정 내역 (패치노트)
    $('lb-guide').addEventListener('click', function () { MAIN.guide.open(stage); });     // 가이드: 메인 화면 버튼 설명
    $('lb-records').addEventListener('click', function () { go('#records'); });   // 축음기 → 배경 음악 고르기
    $('lb-settings').addEventListener('click', function (e) { e.stopPropagation(); G.settings.open(stage); });

    initBanner(L.banners);
  }

  function initBanner(list) {
    const view = $('lb-banner-view'), dots = $('lb-banner-dots');
    let idx = 0, timer = 0;
    view.innerHTML = list.map(function (b, i) {
      return '<article class="lb-slide' + (i === 0 ? ' is-on' : '') + '">' +
        '<span class="lb-slide-img" style="background-image:url(&quot;' + b.image + '&quot;)"></span>' +
        '<div class="lb-slide-txt"><em>' + U.esc(b.tag) + '</em><b>' + U.esc(b.name) + '</b><small>' + U.esc(b.date) + '</small></div></article>';
    }).join('');
    dots.innerHTML = list.map(function (b, i) { return '<button type="button" data-sfx="none" aria-label="배너 ' + (i + 1) + '"' + (i === 0 ? ' class="is-on"' : '') + '></button>'; }).join('');
    function set(n) {
      idx = (n + list.length) % list.length;
      view.querySelectorAll('.lb-slide').forEach(function (s, i) { s.classList.toggle('is-on', i === idx); });
      dots.querySelectorAll('button').forEach(function (d, i) { d.classList.toggle('is-on', i === idx); });
    }
    function loop() { clearInterval(timer); timer = setInterval(function () { set(idx + 1); }, 6000); }
    dots.querySelectorAll('button').forEach(function (d, i) { d.addEventListener('click', function () { set(i); loop(); }); });
    loop();
  }

  /* ════════════════════════════════════════════════════
     2. 캐릭터 선택 — 탁자 위 세로 사진
     ════════════════════════════════════════════════════ */
  function initSelect() {
    $('sl-back').addEventListener('click', function () { go(''); });
    $('sl-set').addEventListener('click', function (e) { e.stopPropagation(); G.settings.open(stage); });

    const used = [];
    CHARS.forEach(function (c) { [c.data.element, c.data.subElement].forEach(function (e) { if (e && used.indexOf(e) === -1) used.push(e); }); });
    const box = $('sl-elems');
    used.forEach(function (k) {
      const b = U.el('button', 'sl-elem', { type: 'button', 'data-k': k, 'aria-label': EL(k).name, html: G.icons.svg(EL(k).icon) });
      b.style.setProperty('--el', EL(k).color);
      b.addEventListener('click', function () { state.filterElem = state.filterElem === k ? null : k; renderSelect(); });
      box.appendChild(b);
    });
    $('sl-search').addEventListener('input', function (e) { state.query = e.target.value.trim(); renderSelect(); });
    $('sl-sort').querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        state.sort = b.dataset.sort;
        $('sl-sort').querySelectorAll('button').forEach(function (x) { x.classList.toggle('is-on', x === b); });
        renderSelect();
      });
    });
  }

  function filtered() {
    const q = state.query.toLowerCase();
    const list = CHARS.filter(function (c) {
      if (state.filterElem && c.data.element !== state.filterElem && c.data.subElement !== state.filterElem) return false;
      if (q && (c.data.name + ' ' + (c.data.nameEn || '')).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
    if (state.sort === 'name') list.sort(function (a, b) { return a.data.name.localeCompare(b.data.name, 'ko'); });
    return list;
  }

  function renderSelect() {
    const list = filtered();
    $('sl-count').textContent = list.length + ' / ' + CHARS.length;
    $('sl-elems').querySelectorAll('.sl-elem').forEach(function (b) { b.classList.toggle('is-on', b.dataset.k === state.filterElem); });
    const grid = $('sl-grid');
    grid.classList.remove('is-locked');
    grid.innerHTML = '';
    if (!list.length) { grid.innerHTML = '<p class="sl-empty">조건에 맞는 캐릭터가 없습니다.</p>'; return; }
    list.forEach(function (c, i) { grid.appendChild(makePhoto(c, i)); });
  }

  /* 타로카드 한 장 (게임/테두리 폴더의 그림 · images/card/)
   *  아래부터: 배경(블랙 · 화이트) → 캐릭터 → 속성 색 그라데이션 · 별 6개 · 이름 → 테두리(커튼) → 장식(리스)
   *  · 블랙 속성 캐릭터(메인 · 서브 중 하나라도 black)는 달 무늬 배경 · 달 장식, 나머지는 별 무늬 · 별 장식
   *  · 그라데이션 색 = 캐릭터의 메인 속성 색 (G.DATA.elements) */
  const STAR8 = (function () {
    let p = '';
    for (let k = 0; k < 16; k++) { const r = k % 2 ? 4.2 : 10, a = Math.PI / 8 * k - Math.PI / 2; p += (k ? 'L' : 'M') + (12 + r * Math.cos(a)).toFixed(2) + ' ' + (12 + r * Math.sin(a)).toFixed(2); }
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + p + 'Z"/></svg>';
  })();
  function makePhoto(c) {
    const d = c.data;
    const black = d.element === 'black' || d.subElement === 'black';
    const card = U.el('button', 'tc' + (black ? ' is-black' : ''), { type: 'button', 'data-sfx': 'card_pick', 'aria-label': d.name });
    card.style.setProperty('--el', EL(d.element).color);
    card.innerHTML =
      '<span class="tc-art">' +
        '<img class="tc-back" src="images/card/back_' + (black ? 'black' : 'white') + '.webp" alt="">' +
        '<img class="tc-char' + (c.placeholder ? ' is-ph' : '') + '" src="' + c.sprite + '" alt="">' +
        '<span class="tc-grad"></span>' +
        '<span class="tc-cap"><span class="tc-stars">' + new Array(7).join(STAR8) + '</span><span class="tc-name">' + U.esc(d.name) + '</span></span>' +
      '</span>' +
      '<img class="tc-frame" src="images/card/frame.webp" alt="">' +
      '<img class="tc-wreath" src="images/card/wreath_' + (black ? 'black' : 'white') + '.webp" alt="">';
    card.addEventListener('click', function (e) {
      const grid = $('sl-grid');
      if (grid.classList.contains('is-locked')) return;
      grid.classList.add('is-locked');
      card.classList.add('is-burning');
      const r = card.getBoundingClientRect();
      const x = r.width ? (e.clientX - r.left) / r.width : 0.5, y = r.height ? (e.clientY - r.top) / r.height : 0.7;
      MAIN.burn(card, { x: e.clientX ? x : 0.5, y: e.clientY ? y : 0.8, duration: 560 }, function () {
        setTimeout(function () { go('#codex/' + encodeURIComponent(c.id)); }, 60);
      });
    });
    return card;
  }

  /* ════════════════════════════════════════════════════
     3. 캐릭터 정보 · 스킬
     ════════════════════════════════════════════════════ */
  function initDetail() {
    $('dt-back').addEventListener('click', function () { go('#archive'); });
    $('dt-home').addEventListener('click', function () { go(''); });
    $('dt-set').addEventListener('click', function (e) { e.stopPropagation(); G.settings.open(stage); });
    document.addEventListener('keydown', function (e) {
      if (stage.querySelector('.g-settings, .cs-io')) return;
      if (e.key === 'Escape') { if (state.view === 'detail') go('#archive'); else if (state.view === 'select' || state.view === 'records') go(''); }
      if (state.view !== 'detail') return;
      if (e.key === 'ArrowLeft') shift(-1);
      else if (e.key === 'ArrowRight') shift(1);
      else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); pickSkill((state.skill + (e.key === 'ArrowUp' ? 3 : 1)) % 4); }
    });
  }
  function shift(d) {
    const i = CHARS.indexOf(state.current);
    const n = CHARS[(i + d + CHARS.length) % CHARS.length];
    swapTo(n);
  }

  /* 정보 창 안에서 캐릭터 바꾸기 (히스토리를 쌓지 않음) */
  function swapTo(c) {
    lastRoute = 'codex/' + c.id;
    history.replaceState(null, '', '#codex/' + encodeURIComponent(c.id));
    openDetail(c);
  }

  function openDetail(c) {
    const d = c.data, prev = state.current;
    state.current = c;
    if (prev !== c) state.skill = 0;
    views.detail.style.setProperty('--char', d.themeColor);

    /* 속성 문장 (원 · 둘레 글자 · 아이콘) */
    const ring = (d.element + ' · ' + (d.nameEn || '') + ' · ' + String(c.no).padStart(2, '0') + ' · ').toUpperCase();
    $('dt-emblem').innerHTML =
      '<svg viewBox="0 0 112 112" aria-hidden="true"><defs><path id="em-p" d="M56 56m-45 0a45 45 0 1 1 90 0a45 45 0 1 1-90 0"/></defs>' +
      '<circle class="em-bg" cx="56" cy="56" r="55"/><circle class="em-ring" cx="56" cy="56" r="36"/>' +
      '<text><textPath href="#em-p">' + U.esc(ring + ring).slice(0, 64) + '</textPath></text></svg>' +
      G.icons.svg(EL(d.element).icon);

    $('dt-name').textContent = d.name;
    $('dt-name-ico').innerHTML = G.icons.svg(EL(d.element).icon);
    $('dt-name-ico').style.color = EL(d.element).color;
    $('dt-no').textContent = 'No. ' + String(c.no).padStart(2, '0');
    $('dt-en').textContent = d.nameEn || '';
    $('dt-role').textContent = d.role || '';
    $('dt-tags').innerHTML = [d.element, d.subElement].filter(Boolean).map(function (k, i) {
      return '<span style="--el:' + EL(k).color + '">' + G.icons.svg(EL(k).icon) + EL(k).name + (i ? ' (서브)' : '') + '</span>';
    }).join('');

    const cb = d.combat || {}, R = G.DATA.rules || {};
    const stats = [
      ['sword', '공격력', cb.atk], ['shield', '방어력', cb.def],
      ['heal', 'HP', cb.hp], ['pierce', '치명타', cb.crit != null ? Math.round(cb.crit * 100) + '%' : null],
      ['mana', '마력', cb.mp || R.MP_DEFAULT], ['star', '궁극기 열의', d.ultPoints || R.MOXIE_MAX]
    ].filter(function (s) { return s[2] != null; });
    $('dt-stats').innerHTML = stats.map(function (s) {
      return '<div><dt>' + G.icons.svg(s[0]) + s[1] + '</dt><dd>' + s[2] + '</dd></div>';
    }).join('');

    /* 특성(메커니즘): 이름 + 설명 */
    /*  카드에는 한 줄 요약(short)만 → 잘리지 않고 바로 보임 · 자세한 설명은 마우스를 올리거나 길게 누르면 */
    $('dt-mechs').innerHTML = (d.mechanics || []).map(function (m) {
      return '<li' + (m.element ? ' class="is-elem is-' + m.element + '"' : '') + '><span class="mc-ico">' + G.icons.svg(m.icon || 'burst') + '</span><div><b>' + U.esc(m.name) + '</b><p>' + U.esc(m.short || m.desc) + '</p></div></li>';
    }).join('');
    Array.prototype.forEach.call($('dt-mechs').children, function (li, i) {
      const m = d.mechanics[i];
      li._tip = function () { return '<div class="tt-title">' + U.esc(m.name) + '</div>' + U.esc(m.desc); };
    });

    /* 가운데 캐릭터 */
    const hero = $('dt-hero-img');
    hero.classList.toggle('is-ph', c.placeholder);
    /* 왼쪽 끝 캐릭터 아이콘 */
    $('dt-rail').innerHTML = '';
    CHARS.forEach(function (x) {
      const b = U.el('button', 'dt-rail-item' + (x === c ? ' is-on' : ''), { type: 'button', 'aria-label': x.data.name, 'data-sfx': 'page' });
      b.style.setProperty('--char', x.data.themeColor);
      b.innerHTML = '<img src="' + x.sprite + '" alt=""' + (x.placeholder ? ' class="is-ph"' : '') + '>';
      b.addEventListener('click', function () { if (x !== state.current) swapTo(x); });
      $('dt-rail').appendChild(b);
    });

    renderSkills();

    /* 음악 */
    MAIN.player.setPlaylist(c.playlist, c.cd || c.sprite);
  }

  const TYPE = { attack: '공격', buff: '버프', debuff: '디버프', heal: '회복' };
  function skillsOf(d) { return d.skills.concat([d.ultimate]).filter(Boolean); }

  function renderSkills() {
    const d = state.current.data, list = skillsOf(d);
    const box = $('dt-sk-list');
    box.innerHTML = '';
    list.forEach(function (s, i) {
      const ult = i === list.length - 1 && s === d.ultimate;
      const b = U.el('button', 'dt-sk' + (ult ? ' is-ult' : '') + (i === state.skill ? ' is-on' : ''), { type: 'button', 'data-sfx': 'page' });
      b.innerHTML =
        '<span class="dt-sk-art">' + (s.art ? '<img src="' + gamePath(s.art) + '" alt="">' : G.icons.svg(s.icon || 'burst')) + '</span>' +
        '<span class="dt-sk-txt"><em>' + (ult ? 'ULTIMATE' : 'SKILL ' + (i + 1)) + '</em><b>' + U.esc(skName(s.name)) + '</b><small>' + U.esc(s.nameEn || '') + '</small></span>' +
        '<span class="dt-sk-cost">' + (ult ? '열의 ' + (d.ultPoints || (G.DATA.rules || {}).MOXIE_MAX || 5) : 'MP ' + (s.mp || 0)) + '</span>';
      b.addEventListener('click', function () { pickSkill(i); });
      box.appendChild(b);
    });
    pickSkill(Math.min(state.skill, list.length - 1));
  }

  function pickSkill(i) {
    const c = state.current, d = c.data, list = skillsOf(d), s = list[i];
    if (!s) return;
    state.skill = i;
    $('dt-sk-list').querySelectorAll('.dt-sk').forEach(function (b, j) { b.classList.toggle('is-on', j === i); });
    const ult = s === d.ultimate;
    const tags = [ult ? '궁극기' : (TYPE[s.type] || '스킬')];
    if (s.element) tags.push(EL(s.element).name);
    $('dt-sk-detail').innerHTML =
      '<header><b>' + U.esc(skName(s.name)) + '</b><em>' + U.esc(s.nameEn || '') + '</em></header>' +
      '<div class="dt-sk-tags">' + tags.map(function (t, k) { return '<span' + (k === 1 ? ' style="--el:' + EL(s.element).color + '"' : '') + '>' + t + '</span>'; }).join('') +
        (s.category ? '<span class="is-cat">' + U.esc(s.category) + '</span>' : '') + '</div>' +
      '<p>' + U.esc(s.desc || '') + '</p>' +
      (s.note ? '<p class="dt-sk-note">' + U.esc(s.note) + '</p>' : '') +
      '<footer>' + (ult ? '마력 소모 없음 · 열의 ' + (d.ultPoints || (G.DATA.rules || {}).MOXIE_MAX || 5) + ' 필요' : '마력 ' + (s.mp || 0) + ' 소모' + (s.hpCost ? ' · 최대 체력의 ' + Math.round(s.hpCost * 100) + '% 소모' : '')) + '</footer>';
    /* 공격 스킬을 고르면 공격 자세 스프라이트 */
    const atk = (ult || s.type === 'attack') && c.spriteAtk;
    $('dt-hero-img').src = atk ? c.spriteAtk : c.sprite;
  }

  /* ── 시작 ─────────────────────────────────────────── */
  function boot() {
    G.save.load();
    G.util.bindFit();
    G.tip.init();
    G.sfx.bindClicks();
    G.bgm.bind();
    G.bgm.setRoute('select');   // 메인화면은 모든 화면에서 배경 음악 (캐릭터 음악 재생 중에만 멈춤)
    fillIcons(document);
    initLobby();
    initSelect();
    initDetail();
    MAIN.records.init({ stage: stage, back: function () { go(''); } });
    /* 이미지 미리 불러오기 */
    CHARS.forEach(function (c) { [c.sprite, c.spriteAtk].forEach(function (s) { if (s) { const i = new Image(); i.src = s; } }); });
    window.addEventListener('hashchange', route);
    window.addEventListener('popstate', route);
    route();
  }
  document.addEventListener('DOMContentLoaded', boot);
})();
