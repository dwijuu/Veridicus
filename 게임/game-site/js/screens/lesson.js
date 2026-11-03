/**
 * 보충 수업 화면 — #/lesson
 * ─────────────────────────────────────────────────────────────
 *  왼쪽(어두운 면) : 주간 토벌 — 이번 주 블랙 보스 · 초기화까지 남은 시간 · 시작 디버프 · 토벌 시작
 *  오른쪽(밝은 면) : 일간 토벌 — 오늘의 상대 · 남은 횟수(4번) · 초기화까지 남은 시간 · 토벌 시작
 *  [토벌 시작] → 편성 화면(#/stage/ls-weekly|ls-daily/formation) → 전투 → 이기면 횟수 반영 후 이 화면으로
 *  규칙 · 보스 목록: js/core/lesson.js
 */
(function () {
  const U = G.util;
  const L = G.lesson;
  function EL(k) { return (G.DATA.elements || {})[k] || { name: k, icon: 'burst', color: '#555' }; }

  G.router.register('lesson', function () {
    let timer = 0;
    return {
      unmount: function () { clearInterval(timer); },
      mount: function (root, params, ctx) {
        L.refresh();
        const s = U.el('section', 'g-screen ls-screen g-fade-in');
        s.innerHTML = '<div class="ls-dark"></div><div class="ls-paper"></div>';

        /* 위: 뒤로(로비) · 로비 · 제목 · 설정 */
        const top = U.el('div', 'g-topbar ls-top');
        const back = U.el('button', 'g-back', { type: 'button', html: U.svgIcon('i-back') + '<span>LOBBY</span>' });
        back.addEventListener('click', function () { G.app.toLobby(); });
        const set = G.settings.button(s);
        set.classList.add('ls-set');
        top.append(back, U.el('div', 'g-badge', { html: '<span class="num">LESSON</span><span>보충 수업</span>' }), set);
        s.appendChild(top);

        const wk = U.el('div', 'ls-weekly');
        const dy = U.el('div', 'ls-daily');
        const fig = U.el('div', 'ls-boss');
        s.append(fig, wk, dy);
        root.appendChild(s);

        function render() {
          const w = L.weekly(), wDef = G.DATA.enemies[w.enemy] || {}, done = L.weeklyDone();
          const tags = [wDef.element, wDef.subElement].filter(Boolean);
          if (tags.indexOf('black') === -1) tags.push('black');
          fig.innerHTML = w.sprite ? '<img src="' + w.sprite + '" alt="">' : '<span class="ls-boss-sil">' + G.art.enemy(wDef, '') + '</span>';
          wk.innerHTML =
            '<div class="ls-eyebrow">WEEKLY <span>주간 토벌</span></div>' +
            '<div class="ls-timer">' + G.lineIcon('clock') + '<span>초기화까지</span><b id="ls-w-left">' + L.fmt(L.weeklyLeft()) + '</b><small>매주 일요일 12시</small></div>' +
            '<h2 class="ls-name">' + U.esc(w.name) + '</h2>' +
            '<div class="ls-en">' + U.esc(w.en) + '</div>' +
            '<div class="ls-tags">' + tags.map(function (k) { return '<span style="--el:' + (k === 'black' ? '#d8d1c6' : EL(k).color) + '">' + G.icons.svg(EL(k).icon) + EL(k).name + '</span>'; }).join('') + '<span class="is-boss">BOSS</span></div>' +
            '<p class="ls-desc">' + U.esc(w.desc) + '</p>' +
            '<div class="ls-debuff">' + G.lineIcon('moon') + '<div><b>블랙의 위압</b><span>아군 전원이 공격력 −15% · 받는 피해 +15% 상태로 시작합니다. 해제되지 않습니다.</span></div></div>' +
            '<div class="ls-act"><span class="ls-state">' + (done ? '이번 주 토벌 완료' : '이번 주 1회 · 도전 가능') + '</span></div>';
          const wb = U.el('button', 'g-btn g-btn-primary ls-go', { type: 'button', text: done ? '토벌 완료' : '토벌 시작' });
          wb.disabled = done;
          wb.addEventListener('click', function () { if (L.canEnter('weekly')) ctx.go('#/stage/ls-weekly/formation'); });
          wk.querySelector('.ls-act').appendChild(wb);

          const d = L.daily(), left = L.dailyRemain();
          const foes = {};
          d.enemies.concat(d.reserve || []).forEach(function (id) { foes[id] = (foes[id] || 0) + 1; });
          let pips = '';
          for (let i = 0; i < L.DAILY_MAX; i++) pips += '<i' + (i < left ? ' class="is-on"' : '') + '></i>';
          dy.innerHTML =
            '<div class="ls-eyebrow">DAILY <span>일간 토벌</span></div>' +
            '<div class="ls-timer">' + G.lineIcon('clock') + '<span>초기화까지</span><b id="ls-d-left">' + L.fmt(L.dailyLeft()) + '</b><small>매일 0시</small></div>' +
            '<h2 class="ls-name">' + U.esc(d.name) + '</h2>' +
            '<div class="ls-en">' + U.esc(d.en) + '</div>' +
            '<p class="ls-desc">' + U.esc(d.desc) + '</p>' +
            '<div class="ls-foes">' + Object.keys(foes).map(function (id) {
              const ed = G.DATA.enemies[id] || {};
              return '<div class="ls-foe"><span class="ls-foe-art">' + G.art.enemy(ed, '') + '</span><b>' + U.esc(ed.name || id) + '</b><small>× ' + foes[id] + '</small></div>';
            }).join('') + '</div>' +
            '<div class="ls-count"><span>오늘 남은 횟수</span><b>' + left + '<small> / ' + L.DAILY_MAX + '</small></b><span class="ls-pips">' + pips + '</span></div>' +
            '<div class="ls-act"></div>';
          const db = U.el('button', 'g-btn g-btn-primary ls-go', { type: 'button', text: left > 0 ? '토벌 시작' : '오늘의 토벌 종료' });
          db.disabled = left <= 0;
          db.addEventListener('click', function () { if (L.canEnter('daily')) ctx.go('#/stage/ls-daily/formation'); });
          dy.querySelector('.ls-act').appendChild(db);
        }
        render();

        /* 남은 시간: 1초마다 · 초기화 시각이 지나면 보스 · 횟수를 새로 */
        let wPrev = L.weeklyLeft(), dPrev = L.dailyLeft();
        timer = setInterval(function () {
          const w = L.weeklyLeft(), d = L.dailyLeft();
          if (w > wPrev || d > dPrev) { L.refresh(); render(); }
          wPrev = w; dPrev = d;
          const a = s.querySelector('#ls-w-left'), b = s.querySelector('#ls-d-left');
          if (a) a.textContent = L.fmt(w);
          if (b) b.textContent = L.fmt(d);
        }, 1000);
      }
    };
  });
})();
