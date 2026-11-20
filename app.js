// ===== 유틸 =====
const $ = (id) => document.getElementById(id);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function say(text) {
  const c = $('caption');
  c.textContent = text;
  c.classList.remove('pop');
  void c.offsetWidth;
  c.classList.add('pop');
}

function showScene(id) {
  document.querySelectorAll('.scene').forEach((s) => s.classList.toggle('active', s.id === id));
}

function showView(id) {
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === id));
}

// ===== 도망가는 요소 =====
// el: 도망갈 요소, times: 도망 횟수, lines: 도망칠 때마다 나올 대사, onCatch: 잡았을 때
function dodgy(el, times, lines, onCatch) {
  let left = times;
  let last = 0;
  let done = false;

  function flee(e) {
    if (left <= 0) return;
    if (e.type === 'pointerenter' && e.pointerType !== 'mouse') return;
    if (e.cancelable) e.preventDefault();
    left--;
    last = Date.now();

    const area = el.offsetParent;
    const w = area.clientWidth - el.offsetWidth;
    const h = area.clientHeight - el.offsetHeight;
    const cx = el.offsetLeft, cy = el.offsetTop;
    let x, y, tries = 0;
    do {
      x = Math.random() * w;
      y = Math.random() * h;
    } while (Math.hypot(x - cx, y - cy) < Math.min(w, h) * 0.45 && ++tries < 30);

    el.classList.add('moved');
    el.style.transform = 'none';
    el.style.right = 'auto';
    el.style.bottom = 'auto';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    say(lines[times - left - 1] ?? lines[lines.length - 1]);
  }

  el.addEventListener('pointerenter', flee);
  el.addEventListener('pointerdown', flee);
  el.addEventListener('click', (e) => {
    e.preventDefault();
    if (done || Date.now() - last < 350) return;
    if (left > 0) return flee(e);
    done = true;
    onCatch();
  });
}

// 엉뚱한 아이콘/메뉴 클릭
const WRONG = ['그거 아니에요.', '여기 아님.', '딴짓 금지.', '연차 신청은 그게 아닙니다.'];
document.querySelectorAll('.wrong').forEach((b) =>
  b.addEventListener('click', () => say(WRONG[Math.floor(Math.random() * WRONG.length)]))
);

// ===== 1. 인트로 → 사무실 =====
let startedAt = Date.now();
$('startBtn').addEventListener('click', () => {
  startedAt = Date.now();
  showScene('office');
  say('일단 자리에 앉아볼까?');
});

// ===== 2. 의자 =====
dodgy($('chair'), 4, [
  '어?! 의자가 도망갔다?!',
  '거기 서!!',
  '의자가 나를 싫어하나...?',
  '하... 이번엔 진짜 잡는다.',
], async () => {
  $('chair').classList.add('sat');
  say('털썩. 겨우 앉았다.');
  await wait(1300);
  showScene('laptop');
  say('노트북을 켜자.');
});

// ===== 3. 전원 버튼 =====
dodgy($('power'), 4, [
  '전원 버튼이... 도망간다?',
  '왜 이것까지...',
  '이 회사 장비 다 왜 이래',
  '마지막이다...',
], async () => {
  showView('vBoot');
  say('겨우 켰다...');
  await wait(2000);

  // 4. 배경화면 클로즈업
  const desk = $('vDesk');
  desk.classList.add('zooming');
  showView('vDesk');
  say('...?');
  await wait(600);
  $('wallpaper').classList.add('zoom');
  say('배경화면이 클로즈업된다...?!');
  await wait(2800);
  say('(넋 놓고 배경화면 감상 중...)');
  const sun = $('sunText');
  sun.className = 'sun-text show';
  await wait(3000);
  sun.className = 'sun-text hide';
  await wait(600);
  sun.className = 'sun-text';
  $('wallpaper').classList.remove('zoom');
  say('정신 차리자.');
  await wait(2600);
  desk.classList.remove('zooming');
  say('사내 그룹웨어에 접속하자.');
});

// ===== 5. 그룹웨어 아이콘 =====
dodgy($('gwIcon'), 5, [
  '아이콘이 도망간다;;',
  '바탕화면에서 왜 뛰어다녀',
  '잡히라고!!',
  '진짜 너무하네',
  '숨 고르고... 한 번만 더...',
], () => {
  showView('vGw');
  say('겨우 접속했다. 연차 신청 메뉴를 찾자.');
});

// ===== 6. 연차 신청 메뉴 =====
$('leaveMenu').addEventListener('click', () => {
  showView('vForm');
  say('날짜 쓰고 신청 누르자!');
});

// 기본 날짜: 다음 금요일
(function setDefaultDate() {
  const d = new Date();
  d.setDate(d.getDate() + (((5 - d.getDay()) + 7) % 7 || 7));
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  $('date').value = local.toISOString().slice(0, 10);
})();

// ===== 7. 신청 버튼 =====
dodgy($('submitBtn'), 6, [
  '신청 버튼이 도망간다!!',
  '여기까지 왔는데...',
  '제발...',
  '손이 떨린다',
  '거의 다 왔어...',
  '마지막... 진짜 마지막...',
], () => {
  say('겨우 신청했다...!');
  runLoading();
});

// ===== 8. 신청중 → 반려 =====
async function runLoading() {
  showView('vLoad');
  const steps = [
    [15, '신청 중입니다...'],
    [35, '신청 중입니다.. ...'],
    [55, '팀장님 결재 중...'],
    [75, '부장님 결재 중...'],
    [92, '최종 결재자 검토 중...'],
    [99, '최종 결재자 검토 중......'],
  ];
  const setBar = (pct, msg) => {
    $('barFill').style.width = pct + '%';
    $('loadPct').textContent = pct + '%';
    $('loadMsg').textContent = msg;
  };

  for (const [pct, msg] of steps) {
    setBar(pct, msg);
    await wait(pct === 99 ? 2200 : 1100);
  }

  // 99% → 12% 추락
  setBar(12, '하암.. 수락을 해줘말어..');
  say('...?? 12%???');
  await wait(3200);

  for (const [pct, msg] of [[40, '흠...'], [75, '그래 뭐... 해주지 뭐'], [100, '결재 완료!']]) {
    setBar(pct, msg);
    await wait(1100);
  }
  showResult();
}

async function showResult() {
  const date = $('date').value;
  const stamp = $('stamp');
  const sheet = document.querySelector('.sheet');

  $('docNo').textContent = '문서번호 HR-' + Date.now().toString().slice(-6);
  $('rWho').textContent = $('who').value.trim() || '(이름 없음)';
  $('rDate').textContent = date ? date.replaceAll('-', '.') : '미입력';
  $('rWhy').textContent = $('why').value;

  // 가짜 승인
  $('rReasonLabel').textContent = '결재 의견';
  $('rReason').textContent = '즐거운 휴가 되세요 🎉';
  $('rReason').className = 'green';
  stamp.className = 'stamp approve on';
  stamp.textContent = '승인';
  $('result').hidden = false;
  say('승인...?!?! 진짜로?!');

  await wait(550);                 // 도장 쾅
  stamp.className = 'stamp approve done';
  await wait(1000);                // 1초 뒤 지직

  stamp.className = 'stamp approve glitch';
  await wait(350);
  stamp.className = 'stamp glitch';
  stamp.textContent = '반려';
  $('rReasonLabel').textContent = '반려 사유';
  $('rReason').textContent = '되겠냐? 그냥 시러';
  $('rReason').className = 'red';
  await wait(350);

  stamp.className = 'stamp done';
  sheet.classList.add('shake');
  say('아 잘못 찍음ㅋ');

  // 시간낭비 시간
  const sec = Math.floor((Date.now() - startedAt) / 1000);
  const mm = String(Math.floor(sec / 60)).padStart(2, '0');
  const ss = String(sec % 60).padStart(2, '0');
  $('wastedTime').textContent = `${mm}분 ${ss}초`;
  await wait(700);
  $('wasted').classList.add('show');
}

$('retryBtn').addEventListener('click', () => location.reload());

// 작업표시줄 시계
function tick() {
  $('clock').textContent = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}
tick();
setInterval(tick, 30000);
