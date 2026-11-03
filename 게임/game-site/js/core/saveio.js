/**
 * 기록 내보내기 · 불러오기 (설정 창에서 사용 · 메인화면 · 게임 공용)
 * ─────────────────────────────────────────────────────────────
 *  아이폰 · 아이패드(사파리 · 크롬)에서도 되도록 세 가지 방법을 함께 둠
 *   1) 파일로 저장 : 공유 기능이 있으면(아이폰 등) 공유 창 → '파일에 저장' / 없으면 일반 다운로드
 *   2) 코드 복사   : 기록을 한 줄 코드로 복사 → 메모 · 메시지 등에 붙여 두었다가 불러오기에서 붙여넣기
 *   3) 불러오기    : 파일 선택(형식 제한 없음 — 아이폰에서 .json 이 회색으로 막히지 않도록) 또는 코드 붙여넣기
 *  G.saveIO.exportSave(container) · G.saveIO.pickImport(container)
 */
window.G = window.G || {};

G.saveIO = (function () {
  const U = G.util;
  const PREFIX = 'VRD1:';

  function stamp() {
    const d = new Date(), p = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes());
  }
  function json() { return JSON.stringify(G.save.exportData()); }
  function toCode() { return PREFIX + btoa(unescape(encodeURIComponent(json()))); }
  function parse(text) {
    text = String(text || '').trim();
    if (!text) return null;
    try {
      if (text.indexOf(PREFIX) === 0) text = decodeURIComponent(escape(atob(text.slice(PREFIX.length).replace(/\s+/g, ''))));
      return JSON.parse(text);
    } catch (e) { return null; }
  }
  function clearedOf(obj) {
    const c = obj && (obj.save ? obj.save.cleared : obj.cleared);
    return c ? Object.keys(c).filter(function (k) { return k.indexOf(':') === -1; }).length : '?';
  }

  /* 창: 제목 · 내용(html) · 버튼 [{ text, primary, keep(누른 뒤에도 창 유지), onClick(box) }] */
  function modal(container, title, html, buttons) {
    const old = container.querySelector('.cs-io'); if (old) old.remove();
    const m = U.el('div', 'cs-rec cs-io');
    const box = U.el('div', 'cs-rec-box cs-io-box g-panel', { html: '<div class="cs-rec-title">' + U.esc(title) + '</div><div class="cs-io-text">' + html + '</div>' });
    const row = U.el('div', 'cs-io-actions');
    buttons.forEach(function (b) {
      const el = U.el('button', 'g-btn' + (b.primary ? ' g-btn-primary' : ''), { type: 'button', text: b.text });
      el.addEventListener('click', function () { if (!b.keep) m.remove(); if (b.onClick) b.onClick(box, el); });
      row.appendChild(el);
    });
    box.appendChild(row);
    m.appendChild(box);
    m.addEventListener('click', function (e) { e.stopPropagation(); if (e.target === m) m.remove(); });
    m.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    m.addEventListener('keydown', function (e) { e.stopPropagation(); });
    container.appendChild(m);
    return { m: m, box: box };
  }
  function note(container, title, html, after) { modal(container, title, html, [{ text: '확인', primary: true, onClick: after }]); }

  /* 파일로 저장 */
  function saveFile(container) {
    const name = 'game-save_' + stamp() + '.json';
    const text = JSON.stringify(G.save.exportData(), null, 2);
    let file = null;
    try { file = new File([text], name, { type: 'application/json' }); } catch (e) {}
    /* 공유 창(아이폰 · 안드로이드): '파일에 저장'으로 저장 */
    if (file && navigator.canShare && navigator.share && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: '게임 기록' }).then(function () {
        note(container, '기록 내보내기', '기록 파일을 보냈습니다. <b>파일에 저장</b>을 골랐다면 파일 앱에서 찾을 수 있습니다.');
      }).catch(function (e) {
        if (e && e.name === 'AbortError') return;   // 공유 창을 닫음
        download(container, text, name);
      });
      return;
    }
    download(container, text, name);
  }
  function download(container, text, name) {
    try {
      const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url; a.download = name; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 60000);   // 바로 지우면 아이폰에서 '작업을 완료할 수 없음'
      note(container, '기록 내보내기', '클리어한 스테이지 <b>' + G.save.clearedCount() + '개</b>와 편성 · 설정을 파일로 저장했습니다.<br>파일이 저장되지 않았다면 <b>코드 복사</b>를 써 주세요.');
    } catch (e) {
      note(container, '기록 내보내기', '파일을 만들지 못했습니다. <b>코드 복사</b>를 써 주세요. (' + U.esc(e.message) + ')');
    }
  }

  /* 코드 복사 */
  function copyCode(container) {
    const code = toCode();
    const v = modal(container, '기록 코드', '아래 코드를 복사해 메모 등에 붙여 두세요. 다른 기기의 <b>기록 불러오기 → 코드 붙여넣기</b>에 넣으면 이어서 할 수 있습니다.' +
      '<textarea class="cs-io-code" readonly></textarea><div class="cs-io-msg"></div>', [
      { text: '복사', primary: true, keep: true, onClick: function (box) { copy(box); } },
      { text: '닫기' }
    ]);
    const ta = v.box.querySelector('textarea');
    ta.value = code;
    function copy(box) {
      const msg = box.querySelector('.cs-io-msg');
      function done(ok) { msg.textContent = ok ? '복사했습니다.' : '코드를 길게 눌러 전체 선택 후 복사해 주세요.'; }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(function () { done(true); }, fallback);
      else fallback();
      function fallback() {
        ta.removeAttribute('readonly'); ta.focus(); ta.select(); ta.setSelectionRange(0, code.length);
        let ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
        ta.setAttribute('readonly', ''); done(ok);
      }
    }
  }

  function exportSave(container) {
    modal(container, '기록 내보내기', '클리어한 스테이지 <b>' + G.save.clearedCount() + '개</b>와 편성 · 설정을 저장합니다.<br>아이폰에서는 <b>파일로 저장 → 파일에 저장</b>을 고르거나, <b>코드 복사</b>를 쓰면 됩니다.', [
      { text: '닫기' },
      { text: '코드 복사', onClick: function () { copyCode(container); } },
      { text: '파일로 저장', primary: true, onClick: function () { saveFile(container); } }
    ]);
  }

  /* 불러오기 */
  function confirmImport(container, obj, label) {
    if (!obj) { note(container, '기록 불러오기', '기록을 읽을 수 없습니다. 내보내기로 만든 파일 또는 코드인지 확인해 주세요.'); return; }
    modal(container, '기록 불러오기', (label ? '<b>' + U.esc(label) + '</b><br>' : '') + '이 기록(클리어 ' + clearedOf(obj) + '개)으로 <b>지금 기록을 덮어씁니다.</b> 계속할까요?', [
      { text: '취소' },
      { text: '불러오기', primary: true, onClick: function () {
        try {
          const res = G.save.importData(obj);
          note(container, '기록 불러오기', '기록을 불러왔습니다. (클리어한 스테이지 ' + res.cleared + '개)', function () { location.reload(); });
        } catch (e) { note(container, '기록 불러오기', U.esc(e.message)); }
      } }
    ]);
  }
  function pickFile(container) {
    const input = document.createElement('input');
    input.type = 'file';   // 형식 제한 없음 (아이폰에서 .json 이 선택되지 않는 문제)
    input.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
    document.body.appendChild(input);   // 아이폰: 화면에 붙어 있어야 선택 창이 열림
    input.addEventListener('change', function () {
      const f = input.files && input.files[0];
      input.remove();
      if (!f) return;
      const r = new FileReader();
      r.onload = function () { confirmImport(container, parse(r.result), f.name); };
      r.onerror = function () { note(container, '기록 불러오기', '파일을 읽지 못했습니다.'); };
      r.readAsText(f);
    });
    input.click();
  }
  function pasteCode(container) {
    const v = modal(container, '코드 붙여넣기', '내보내기에서 복사한 코드를 아래에 붙여넣어 주세요.<textarea class="cs-io-code" placeholder="VRD1:..."></textarea>', [
      { text: '취소' },
      { text: '불러오기', primary: true, onClick: function (box) { confirmImport(container, parse(box.querySelector('textarea').value), ''); } }
    ]);
    setTimeout(function () { v.box.querySelector('textarea').focus(); }, 50);
  }
  function pickImport(container) {
    modal(container, '기록 불러오기', '내보낸 기록 <b>파일</b>을 고르거나, 복사해 둔 <b>코드</b>를 붙여넣어 주세요.<br>지금 기록은 불러온 기록으로 바뀝니다.', [
      { text: '취소' },
      { text: '코드 붙여넣기', onClick: function () { pasteCode(container); } },
      { text: '파일 선택', primary: true, onClick: function () { pickFile(container); } }
    ]);
  }

  return { exportSave: exportSave, pickImport: pickImport };
})();
