/**
 * 메인 화면 — 공지(수정 내역) · 가이드(버튼 설명)
 * ─────────────────────────────────────────────────────────────
 *  MAIN.notice.open(stage) : 왼쪽 목록(버전 · 날짜) + 오른쪽 내용 (MAIN.PATCH_NOTES, code/js/data.js)
 *  MAIN.guide.open(stage)  : 누를 수 있는 메인 화면 버튼을 하나씩 밝게 비추며 설명 (다음 · 이전 · 닫기)
 */
window.MAIN = window.MAIN || {};

(function () {
  const U = G.util;
  const X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';

  function onEsc(fn) {
    function h(e) { if (e.key === 'Escape') { e.stopPropagation(); fn(); } }
    document.addEventListener('keydown', h, true);
    return function () { document.removeEventListener('keydown', h, true); };
  }

  /* ════ 공지 : 수정 내역 ════ */
  MAIN.notice = {
    open: function (stage) {
      const old = stage.querySelector('.nt-modal'); if (old) old.remove();
      const notes = MAIN.PATCH_NOTES || [];
      const m = U.el('div', 'nt-modal');
      const box = U.el('div', 'nt-box');
      box.innerHTML =
        '<header class="nt-head"><b>공지</b><em>Notice</em><span>수정 내역</span></header>' +
        '<nav class="nt-list"></nav><article class="nt-body"></article>';
      const close = U.el('button', 'nt-close', { type: 'button', 'aria-label': '닫기', html: X, 'data-sfx': 'ui_back' });
      box.appendChild(close);
      m.appendChild(box);
      const list = box.querySelector('.nt-list'), body = box.querySelector('.nt-body');
      function pick(i) {
        const n = notes[i];
        list.querySelectorAll('button').forEach(function (b, j) { b.classList.toggle('is-on', j === i); });
        body.innerHTML =
          '<div class="nt-meta"><span>VER. ' + U.esc(n.ver) + '</span><span>' + U.esc(n.date) + '</span></div>' +
          '<h3>' + U.esc(n.title) + '</h3>' +
          n.groups.map(function (g) {
            return '<section><h4>' + U.esc(g.name) + '</h4><ul>' + g.items.map(function (t) { return '<li>' + U.esc(t) + '</li>'; }).join('') + '</ul></section>';
          }).join('');
        body.scrollTop = 0;
      }
      notes.forEach(function (n, i) {
        const b = U.el('button', 'nt-item', { type: 'button', 'data-sfx': 'page', html: '<small>' + U.esc(n.date) + ' · VER. ' + U.esc(n.ver) + '</small><b>' + U.esc(n.title) + '</b>' });
        b.addEventListener('click', function () { pick(i); });
        list.appendChild(b);
      });
      let offEsc = null;
      function shut() { m.remove(); if (offEsc) offEsc(); }
      offEsc = onEsc(shut);
      close.addEventListener('click', shut);
      m.addEventListener('click', function (e) { if (e.target === m) shut(); });
      stage.appendChild(m);
      if (notes.length) pick(0);
    }
  };

  /* ════ 가이드 : 메인 화면 버튼 설명 ════ */
  const STEPS = [
    { sel: '#btn-story', title: '스토리 모드', text: '이야기를 진행합니다. 스테이지를 클리어하면 다음 스테이지와 이야기가 열립니다.' },
    { sel: '#btn-lesson', title: '보충 수업', text: '주간 토벌과 일간 토벌을 합니다. 주간 토벌은 블랙 보스를 한 주에 한 번(매주 일요일 12시 초기화), 일간 토벌은 하루 4번(매일 0시 초기화) 할 수 있습니다. 왼쪽 위 시간은 주간 토벌 보스가 바뀌기까지 남은 시간입니다.' },
    { sel: '#btn-manage', title: '캐릭터관리', text: '캐릭터 카드 목록을 봅니다. 카드를 누르면 그 캐릭터의 능력치 · 스킬 · 특성을 볼 수 있습니다.' },
    { sel: '#lb-records', title: '배경 음악', text: '축음기에서 메인 화면 배경 음악을 고르고 음량을 조절합니다. 고른 곡은 게임에 다녀와도 그대로 나옵니다.' },
    { sel: '#lb-notice', title: '공지', text: '게임이 어떻게 바뀌었는지 수정 내역(패치노트)을 봅니다.' },
    { sel: '#lb-settings', title: '설정', text: '배경 음악 · 효과음을 켜고 끄거나 크기를 바꿉니다. 기록을 파일로 내보내거나 불러올 수도 있습니다.' },
    { sel: '#lb-guide', title: '가이드', text: '지금 보고 있는 이 설명을 다시 봅니다.' },
    { sel: '.lb-menu .is-locked', title: '준비 중인 기능', text: '자물쇠와 LOCKED 가 붙은 버튼은 아직 열리지 않은 기능입니다. 열리면 공지에서 알려 드립니다.' }
  ];

  MAIN.guide = {
    open: function (stage) {
      const old = stage.querySelector('.gd-layer'); if (old) old.remove();
      const layer = U.el('div', 'gd-layer');
      const spot = U.el('div', 'gd-spot');
      const box = U.el('div', 'gd-box');
      layer.append(spot, box);
      stage.appendChild(layer);
      let i = 0, offEsc = null;

      function rectOf(el) {
        const sc = G.util.getScale() || 1, base = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
        return { x: (r.left - base.left) / sc, y: (r.top - base.top) / sc, w: r.width / sc, h: r.height / sc };
      }
      function shut() { layer.remove(); if (offEsc) offEsc(); }
      function render() {
        const st = STEPS[i];
        const els = Array.prototype.slice.call(stage.querySelectorAll(st.sel), 0, st.all ? 99 : 1);
        const r = els.length ? els.map(rectOf).reduce(function (a, b) {
          const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
          return { x: x, y: y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y };
        }) : null, pad = 10;
        if (r) {
          spot.style.display = '';
          spot.style.left = (r.x - pad) + 'px'; spot.style.top = (r.y - pad) + 'px';
          spot.style.width = (r.w + pad * 2) + 'px'; spot.style.height = (r.h + pad * 2) + 'px';
        } else spot.style.display = 'none';
        box.innerHTML =
          '<div class="gd-step">GUIDE <b>' + (i + 1) + '</b> / ' + STEPS.length + '</div>' +
          '<div class="gd-title">' + U.esc(st.title) + '</div>' +
          '<p class="gd-text">' + U.esc(st.text) + '</p>';
        const row = U.el('div', 'gd-row');
        const prev = U.el('button', 'gd-btn', { type: 'button', text: '이전', 'data-sfx': 'page' });
        prev.disabled = i === 0;
        prev.addEventListener('click', function () { if (i > 0) { i--; render(); } });
        const last = i === STEPS.length - 1;
        const next = U.el('button', 'gd-btn is-main', { type: 'button', text: last ? '닫기' : '다음', 'data-sfx': last ? 'ui_back' : 'page' });
        next.addEventListener('click', function () { if (last) shut(); else { i++; render(); } });
        row.append(prev, next);
        box.appendChild(row);
        const close = U.el('button', 'gd-close', { type: 'button', 'aria-label': '가이드 닫기', html: X, 'data-sfx': 'ui_back' });
        close.addEventListener('click', shut);
        box.appendChild(close);
        /* 설명창: 비춘 버튼과 겹치지 않게 (오른쪽 버튼이면 왼쪽에, 왼쪽 버튼이면 오른쪽에) */
        const BW = 560, BH = box.offsetHeight || 300, W = 1920, H = 886;
        let bx, by;
        if (!r) { bx = (W - BW) / 2; by = (H - BH) / 2; }
        else if (r.x + r.w / 2 > W / 2) { bx = r.x - pad - 40 - BW; by = r.y + r.h / 2 - BH / 2; }
        else { bx = r.x + r.w + pad + 40; by = r.y + r.h / 2 - BH / 2; }
        if (r && bx < 30) { bx = Math.min(W - BW - 30, Math.max(30, r.x)); by = r.y > H / 2 ? r.y - pad - 30 - BH : r.y + r.h + pad + 30; }
        box.style.left = Math.max(30, Math.min(W - BW - 30, bx)) + 'px';
        box.style.top = Math.max(30, Math.min(H - BH - 30, by)) + 'px';
      }
      offEsc = onEsc(shut);
      render();
    }
  };
})();
