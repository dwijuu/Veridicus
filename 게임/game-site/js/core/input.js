/**
 * 입력 규칙 (타이틀 · 메인화면 · 게임 공용)
 * ─────────────────────────────────────────────────────────────
 *  · 버튼 · 카드 등은 마우스 왼쪽 버튼으로만 눌림 — 오른쪽 · 가운데 버튼은 무시
 *  · 오른쪽 버튼 메뉴(브라우저 기본 메뉴)도 띄우지 않음 (글자 입력 칸은 붙여넣기를 위해 그대로 둠)
 *  · 터치(손가락 · 펜)는 그대로
 */
(function () {
  function isField(t) { return !!(t && t.closest && t.closest('input, textarea, [contenteditable="true"]')); }
  ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'auxclick', 'dblclick'].forEach(function (type) {
    window.addEventListener(type, function (e) {
      if (e.pointerType === 'touch' || e.pointerType === 'pen') return;
      if (typeof e.button === 'number' && e.button !== 0 && !isField(e.target)) {
        e.stopImmediatePropagation();
        if (type !== 'pointerup' && type !== 'mouseup') e.preventDefault();
      }
    }, true);
  });
  window.addEventListener('contextmenu', function (e) { if (!isField(e.target)) e.preventDefault(); }, true);
})();
