/**
 * 메인화면 설정 데이터
 * ─────────────────────────────────────────────────────────────
 * 캐릭터의 이름 · 속성 · 역할 · 전투 수치 · 스킬은 게임 데이터 한 곳에서만 관리합니다.
 *   → ../게임/game-site/js/data/characters.js  (G.DATA.characters / G.DATA.roster)
 *   게임에서 캐릭터를 추가 · 수정하면 메인화면 캐릭터 목록에도 그대로 반영됩니다.
 *
 * 이 파일에는 메인화면에서만 쓰는 값만 적습니다.
 *  · PLAYER  : 왼쪽 위 플레이어 정보
 *  · LOBBY   : 메인 화면 배경 · 중앙 캐릭터 · 메뉴 카드 그림 · 이벤트 배너
 *  · CODEX   : 캐릭터별 목록 이미지(스프라이트) · CD 원판 그림 · 음악(유튜브) 목록
 *
 * 경로는 메인화면/index.html 기준입니다.
 *  · 캐릭터 스프라이트 : ../게임/캐릭터스프라이트/<이름>/<이름>_기본.png · _공격.png
 *  · 스프라이트가 아직 없는 캐릭터(레이 · 실반 · 체레스테)는 게임 폴더의 임시 실루엣(full.svg)을 씁니다.
 */
window.MAIN = window.MAIN || {};

MAIN.PLAYER = { level: 28, levelProgress: 0.42, nick: 'Dw', uid: '20241754' };

MAIN.LOBBY = {
  background: '../게임/배경/강의실.png',
  hero: 'character/Character_06/시멜_스탠딩.png',
  cards: {
    story:    '../게임/game-site/assets/bg/forest.webp',
    training: '../게임/game-site/assets/bg/training.webp',
    lesson:   '../게임/game-site/assets/bg/corridor.webp',
    diary:    '../게임/game-site/assets/bg/garden.webp'
  },
  banners: [
    { image: '../게임/game-site/assets/bg/forest.webp',   tag: 'CHRONICLE', name: '제1권 · 여정의 시작',     date: '2026.10.01 – 2026.11.30' },
    { image: '../게임/game-site/assets/bg/training.webp', tag: 'EVENT',     name: '훈련장 특별 개방',         date: '2026.10.20 – 2026.11.16' },
    { image: '../게임/game-site/assets/bg/corridor.webp', tag: 'NOTICE',    name: '보충 수업 시간표 안내',     date: '2026.11.02' },
    { image: '../게임/game-site/assets/bg/garden.webp',   tag: 'UPDATE',    name: '정원 산책 · 새 캐릭터 기록', date: '2026.11.05' }
  ]
};

(function () {
  const SP = '../게임/캐릭터스프라이트/';
  const GA = '../게임/game-site/assets/characters/';
  function sprite(name, attack) {
    return { base: SP + name + '/' + name + '_기본.png', attack: SP + name + '/' + (attack || name + '_공격.png') };
  }

  MAIN.CODEX = {
    Character_05: Object.assign(sprite('아르덴'), {
      cd: 'character/Character_05/CD_01.png',
      playlist: [{ title: '2:23AM', artist: 'Sharou', url: 'https://youtu.be/slt_Bav8nsQ?si=iyFDGrp3VivsbBUQ' }]
    }),
    Character_10: sprite('샤린'),
    Character_11: sprite('나즈나'),
    Character_12: sprite('알리제'),
    Character_13: { base: GA + 'Character_13/full.svg', placeholder: true },
    Character_14: sprite('코루스코'),
    Character_15: sprite('페델레', '무제1731_20261029150619.png'),
    Character_16: { base: GA + 'Character_16/full.svg', placeholder: true },
    Character_17: (function () {
      const d = SP + '시멜/Send Anywhere (2026-10-29 18-56-00)/';
      return { base: d + '시멜_기본.png', attack: d + '시멜_공격.png' };
    })(),
    Character_18: { base: GA + 'Character_18/full.svg', placeholder: true }   // 체레스테 (스프라이트 준비 전 임시 실루엣)
  };
})();

/* ── 축음기 (레코드) 화면: 메인화면 배경 음악 목록 ───────────────
 *  file: 게임/game-site/assets/bgm/<id>.mp3 · cover: images/records/<id>.jpg
 *  새 곡을 넣으려면 mp3 를 bgm 폴더에 두고 여기에 한 줄 추가하면 됩니다. */
MAIN.TRACKS = [
  { id: 'afternoon_letters', title: 'Afternoon Letters', ko: '오후의 편지', time: '2:13', key: 'B minor', bpm: 72,
    cover: 'images/records/afternoon_letters.jpg',
    desc: '정원에 오후 햇살이 기울 무렵, 책상 위에 쌓인 편지를 한 장씩 읽어 내려가는 시간. 잔잔한 피아노로 만든 이 게임의 첫 배경 음악입니다.' },
  { id: 'morning_letters', title: 'Morning Letters', ko: '아침의 편지', time: '2:37', key: 'D major', bpm: 76,
    cover: 'images/records/morning_letters.jpg',
    desc: '창으로 아침 햇살이 드는 복도에서 막 도착한 편지를 펼쳐 보는 순간. 나일론 기타와 피아노, 플루트가 함께하는 밝은 곡입니다.' },
  { id: 'lantern_at_dusk', title: 'Lantern at Dusk', ko: '해 질 녘의 등불', time: '2:25', key: 'C minor', bpm: 70,
    cover: 'images/records/lantern_at_dusk.jpg',
    desc: '어둠이 내려앉는 숲길에 하나둘 켜지는 등불. 낮고 무거운 첼로로 시작해, 현악과 호른이 함께 떠오르며 끝내 밝아지는 곡입니다.' },
  { id: 'briar_lullaby', title: 'Briar Lullaby', ko: '가시덤불 자장가', time: '2:11', key: 'E minor', bpm: 62,
    cover: 'images/records/briar_lullaby.jpg',
    desc: '오래된 지도와 카드가 펼쳐진 책상 위로 흘러나오는 옛이야기. 기타 위로 리코더와 바이올린, 휘슬이 차례로 이야기를 이어받는 어둡고 동화 같은 곡입니다.' }
];

/* ── 공지: 수정 내역 (패치노트) ──────────────────────────────
 *  메인 화면 왼쪽 [공지] 버튼 → 이 목록을 보여 줌 (위에 있는 것이 최신)
 *  새 내역을 맨 위에 추가하면 됩니다. groups 의 이름: 새 기능 · 변경 · 수정 */
MAIN.PATCH_NOTES = [
  { ver: '1.5', date: '2026.11.04', title: '새 캐릭터 체레스테 · 체력 바 정리',
    groups: [
      { name: '새 캐릭터', items: [
        '체레스테 (가짜 예언자 · 블랙 · 딜러 / 서포터)가 합류했습니다.',
        '진실과 거짓의 계약: 체레스테가 출전하면 전투가 시작될 때 아군 아이콘 중 한 명을 눌러 계약자로 정합니다.',
        '패시브 [예정된 행동]: 아군이 [예언] 상태의 적을 공격하면 피해의 일부가 [시간의 잔상]으로 기록되고, 아군의 공격이 끝나면 계약자가 잔상을 현실화해 추가 공격합니다. (일반 공격의 60% · 잔상이 클수록 최대 2배 · 턴당 2회 · 행동 · 마력 · 열의를 쓰지 않음)',
        '스킬: 운명의 실타래 · 미래의 대역 · 거짓된 미래 · 궁극기 예정된 결말'
      ] },
      { name: '변경', items: [
        '머리 위 체력 · 마력 바를 가늘고 단정한 모양으로 바꿨습니다.',
        '[번개] 스택 아이콘을 새로 그렸고, 아래의 \'번개\' 글씨를 지웠습니다.',
        '[번개] 스택은 레이 · 코루스코가 필드에 출전 중일 때만 보입니다. (대기석에 있을 때는 숨김)',
        '전투 중 아군 스킬 창에 패시브 · 특성도 함께 보입니다.',
        '궁극기 연출이 조금 더 길게 보입니다.',
        '챕터 선택 화면의 책을 배경에 맞게 조금 어둡게 했습니다.',
        '캐릭터 정보의 특성은 한 줄 요약만 보이고, 자세한 설명은 마우스를 올리거나 길게 누르면 보입니다.',
        '궁극기 카드는 열의가 가득 찬 다음 아군 턴이 시작될 때 마법에 추가됩니다.',
        '마법 카드가 많아지면 대기석 · 셔플 버튼과 겹치지 않도록 카드 간격이 좁아집니다.',
        '전투 화면 왼쪽 위의 [적 정보] 부분만 눌러 적 정보를 봅니다. (스테이지 이름은 눌리지 않음)',
        '버튼과 카드는 마우스 왼쪽 버튼으로만 눌립니다.',
        '스크롤 막대를 게임 디자인에 맞게 바꿨습니다.'
      ] },
      { name: '수정', items: [
        '지도교수 샤머의 [물의 분신]이 여러 번 때리는 스킬 · 알리제의 추가 공격을 막지 못하던 문제를 고쳤습니다. 이제 다음 공격 1회를 통째로 막습니다. ([연소] 등 지속 피해는 그대로 들어갑니다)'
      ] }
    ] },
  { ver: '1.4', date: '2026.11.03', title: '전투 화면 정리 · 블랙 / 골드 패시브',
    groups: [
      { name: '새 기능', items: [
        '블랙 속성 패시브 [그림자]: 피해를 주는 스킬을 쓸 때마다 피해를 입은 상대의 마력을 조금 빼앗고, 자신의 마력을 채웁니다. (블랙 속성 적에게도 적용)',
        '캐릭터 정보의 특성에 블랙 · 골드 속성 패시브 설명을 넣었습니다.',
        '기록 내보내기 · 불러오기에 코드 복사 · 코드 붙여넣기를 추가했습니다.'
      ] },
      { name: '변경', items: [
        '골드 속성 패시브 [빛]: 블랙 속성 적에게 주는 피해가 3%에서 10%로 늘었습니다.',
        '궁극기 연출을 새로 만들었습니다. 속성 색 사선 판 위로 캐릭터와 궁극기 이름이 나옵니다.',
        '전투 화면의 스킬 이름 · 적의 행동 예고 · 버튼 · 아이콘에서 테두리와 그림자를 지웠습니다.',
        '스킬 이펙트의 빛 번짐 · 그림자를 지우고, 타격할 때 사선 컷이 보이도록 바꿨습니다.',
        '챕터 선택 화면의 책을 새 그림으로 바꿨습니다.',
        '화면 위 글씨의 \'//\' 구분 기호를 \'·\'로 바꿨습니다.'
      ] },
      { name: '수정', items: [
        '아이폰 · 아이패드에서 기록 내보내기 · 불러오기가 되지 않던 문제를 고쳤습니다. 파일로 저장할 때 공유 창의 \'파일에 저장\'을 쓸 수 있습니다.'
      ] }
    ] },
  { ver: '1.3', date: '2026.11.03', title: '보충 수업 개방 · 새 캐릭터 카드',
    groups: [
      { name: '새 기능', items: [
        '보충 수업을 열었습니다. 주간 토벌과 일간 토벌을 할 수 있습니다.',
        '주간 토벌: 블랙 속성의 강화된 보스만 등장합니다. 아군은 [블랙의 위압](공격력 −15% · 받는 피해 +15%)을 받고 시작합니다. 한 주에 한 번 토벌할 수 있고, 매주 일요일 12시에 보스가 바뀝니다.',
        '일간 토벌: 하루 4번 할 수 있으며 매일 0시에 횟수가 돌아옵니다. 상대는 날마다 바뀝니다. 승리했을 때만 횟수가 줄어듭니다.',
        '메인 화면 보충 수업 버튼 왼쪽 위에 주간 토벌이 바뀌기까지 남은 시간을 표시합니다.',
        '공지(수정 내역)와 가이드(메인 화면 버튼 설명)를 열었습니다.'
      ] },
      { name: '변경', items: [
        '캐릭터 선택 카드를 타로 카드 모양의 새 테두리로 바꿨습니다. 블랙 속성 캐릭터는 달, 그 밖의 캐릭터는 별 장식을 씁니다.',
        '번개 속성의 색을 보라색에서 노란색으로 바꿨습니다. 물은 파랑, 바람은 회색으로 정리했습니다.',
        '챕터 선택 · 스테이지 선택 화면에 메인 화면으로 바로 가는 버튼을 추가했습니다.',
        '휴대폰에서 버튼을 누르자마자 설명 창이 뜨지 않고, 길게 눌러야 뜨도록 바꿨습니다. 설명 창 크기도 화면 크기에 맞춰집니다.',
        '휴대폰에서도 누르기 쉽도록 모든 화면의 버튼 · 글씨를 키웠습니다.'
      ] },
      { name: '수정', items: [
        'STAGE 01 튜토리얼을 시작할 때 왼쪽 위에 빈 안내창이 잠깐 보였다 사라지던 문제를 고쳤습니다.'
      ] }
    ] },
  { ver: '1.2', date: '2026.11.03', title: '축음기 · 새 배경 음악',
    groups: [
      { name: '새 기능', items: [
        '플레이어 이름 옆 축음기에서 메인 화면 배경 음악을 고르고 음량을 조절할 수 있습니다. 고른 곡은 게임에 다녀와도 유지됩니다.',
        '새 배경 음악 Morning Letters · Lantern at Dusk · Briar Lullaby 를 추가했습니다.'
      ] },
      { name: '변경', items: [
        '레코드를 바꿀 때 톤암이 올라갔다 내려오는 소리를 넣었습니다.',
        '깃허브 페이지 주소에서도 모든 화면이 열리도록 경로를 정리했습니다.'
      ] }
    ] },
  { ver: '1.1', date: '2026.11.02', title: '타이틀 화면 · 화면 정리',
    groups: [
      { name: '새 기능', items: [
        '타이틀 화면(Veridicus)을 추가했습니다. START 를 누르면 메인 화면으로 갑니다.',
        '사이트를 옮길 때만 오른쪽 아래에 로딩 화면이 나옵니다.',
        '메인 화면과 게임의 기록 · 설정이 함께 저장됩니다. 클리어 기록 파일(전체 클리어 · 새 기록)을 함께 넣었습니다.'
      ] },
      { name: '변경', items: [
        '설정 창 · 덱 창 · 스테이지 선택 화면을 메인 화면과 같은 디자인으로 정리했습니다.',
        '궁극기 이름 앞의 \'최종 술식 -\'을 빼고 이름만 보이게 했습니다.',
        '서브 스토리는 시멜 임시 스테이지 하나만 남겼습니다.'
      ] }
    ] }
];
