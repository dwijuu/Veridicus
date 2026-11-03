/**
 * 전역 툴팁 (기존 사이트 .js-global-tooltip 과 같은 스타일)
 * 요소에 el._tip = function () { return html; } 을 지정하면 호버 시 표시됩니다. (휴대폰 · 태블릿: 길게 누르면 표시)
 * 리스너는 문서 전체에 1회만 등록 (요소마다 리스너를 만들지 않음)
 */
window.G = window.G || {};

G.tip = (function () {
  let box = null, current = null;
  const listeners = [];

  function find(t) {
    while (t && t !== document.body) {
      if (t._tip) return t;
      t = t.parentNode;
    }
    return null;
  }

  /* 툴팁 크기: 캔버스 배율에 맞춰 함께 줄어듦 (휴대폰에서 화면을 덮을 만큼 커지지 않게)
   *  데스크톱(배율 0.8 안팎)은 거의 그대로, 휴대폰(배율 0.4 안팎)은 0.55배 */
  function tipScale() {
    const sc = (G.util && G.util.getScale) ? G.util.getScale() : 1;
    return Math.max(0.55, Math.min(1.1, sc * 1.25));
  }
  let k = 1;

  function show(target) {
    const html = target._tip();
    if (!html) { hide(); return; }
    current = target;
    /* 이전 위치(화면 오른쪽 끝 등)에서 폭이 줄어든 채로 측정되지 않도록 먼저 왼쪽 위로 옮긴 뒤 측정 */
    box.style.left = '0px';
    box.style.top = '0px';
    k = tipScale();
    box.style.transformOrigin = '0 0';
    box.style.transform = 'scale(' + k + ')';
    box.innerHTML = html;
    box.classList.add('visible');
    position(target);
    listeners.forEach(function (fn) { try { fn(target); } catch (e) {} });
  }

  function position(target) {
    const r = target.getBoundingClientRect();
    const bw = box.offsetWidth * k, bh = box.offsetHeight * k;
    const vw = window.innerWidth, vh = window.innerHeight;
    let x = r.left + r.width / 2 - bw / 2;
    let y = r.top - bh - 10;
    if (y < 8) y = r.bottom + 10;
    /* 화면 안에 들어오도록 보정 (오른쪽 끝 요소는 왼쪽으로, 아래쪽 끝 요소는 위로) */
    x = Math.max(8, Math.min(vw - bw - 8, x));
    y = Math.max(8, Math.min(vh - bh - 8, y));
    box.style.left = x + 'px';
    box.style.top = y + 'px';
  }

  function hide() {
    current = null;
    if (box) box.classList.remove('visible');
  }

  /* 터치(모바일): 누르자마자 뜨면 화면을 가리므로 '길게 누르면(0.45초)' 표시
   *  · 길게 눌러 툴팁을 띄운 경우 손을 뗄 때의 클릭(버튼 실행 · 카드 사용)은 막음
   *  · 손가락이 움직이면(스크롤 · 드래그) 취소 · 다른 곳을 누르면 닫힘 · 5초 뒤 자동으로 닫힘
   *  · 터치 뒤에 브라우저가 흉내 내는 mouseover · mousedown 은 무시 (바로 닫혀 버리지 않도록) */
  const HOLD_MS = 450;
  let lastTouch = 0, autoHide = 0, holdTimer = 0, holdStart = null, swallowClick = 0;
  function cancelHold() { clearTimeout(holdTimer); holdTimer = 0; holdStart = null; }
  function init() {
    box = document.getElementById('g-tooltip');
    document.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      lastTouch = Date.now();
      cancelHold();
      const t = find(e.target);
      if (!t || t !== current) hide();
      if (!t) return;
      holdStart = { x: e.clientX, y: e.clientY };
      holdTimer = setTimeout(function () {
        holdTimer = 0;
        show(t);
        swallowClick = Date.now();
        clearTimeout(autoHide);
        autoHide = setTimeout(function () { if (current === t) hide(); }, 5000);
      }, HOLD_MS);
    }, true);
    document.addEventListener('pointermove', function (e) {
      if (!holdStart || e.pointerType === 'mouse') return;
      if (Math.abs(e.clientX - holdStart.x) > 12 || Math.abs(e.clientY - holdStart.y) > 12) cancelHold();
    }, true);
    document.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') { cancelHold(); lastTouch = Date.now(); } }, true);
    document.addEventListener('pointercancel', cancelHold, true);
    /* 길게 누른 뒤 손을 떼면서 생기는 클릭은 실행하지 않음 */
    document.addEventListener('click', function (e) {
      if (swallowClick && Date.now() - swallowClick < 1500) { swallowClick = 0; e.preventDefault(); e.stopPropagation(); }
    }, true);
    /* 길게 누를 때 뜨는 브라우저 메뉴(복사 · 이미지 저장 등) 막기 */
    document.addEventListener('contextmenu', function (e) { if (Date.now() - lastTouch < 1500 && find(e.target)) e.preventDefault(); }, true);
    document.addEventListener('mouseover', function (e) {
      if (Date.now() - lastTouch < 900) return;
      const t = find(e.target);
      if (t === current) return;
      if (t) show(t); else hide();
    });
    document.addEventListener('mousedown', function () { if (Date.now() - lastTouch < 900) return; hide(); });
    window.addEventListener('blur', hide);
  }

  /* 툴팁이 표시될 때 알림 (튜토리얼에서 '호버해 보기' 단계 진행용) */
  function onShow(fn) { listeners.push(fn); return function () { const i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); }; }

  return { init, hide, onShow };
})();
