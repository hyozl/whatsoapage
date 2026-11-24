// 오아라이브 서비스 소개 — 인터랙션
// 움직임 줄이기(prefers-reduced-motion)를 켠 사용자에게는 자동 움직임을 끕니다.
(() => {
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const onView = (el, cb, opt = { threshold: 0.3 }) => {
    const io = new IntersectionObserver((es) => es.forEach((e) => cb(e.isIntersecting, e)), opt);
    io.observe(el);
    return io;
  };

  // 캡처 이미지가 아직 없으면 빈 화면(어두운 배경)으로 둡니다.
  $$('img').forEach((img) => {
    const miss = () => img.classList.add('is-missing');
    if (img.complete && img.naturalWidth === 0) miss();
    img.addEventListener('error', miss, { once: true });
  });

  /* ---------- 헤더: 스크롤하면 그림자 ---------- */
  const header = $('.site-header');
  const onScrollHeader = () => header && header.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- 스크롤 등장 (섹션 제목, 카드, 목록이 아래에서 떠오름) ---------- */
  if (!REDUCE) {
    const groups = [
      '.sec-head > *', '.hero-inner > *', '.steps .step', '.modes li', '.playlist .pl-item',
      '.cta-copy > *', '.end-card', '.bento .tile', '.tracklist .track', '.you', '.oa li',
      '.weeks-head > *', '.timeline li', '.faq > li', '.ending-screen > h2, .ending-screen > p, .ending-cta',
      '.curation .laptop', '.devices', '.price-player', '.sec-cta', '.tabs', '.faq-more',
    ];
    const items = new Set();
    groups.forEach((sel) => {
      $$(sel).forEach((el, i, arr) => {
        if (items.has(el) || el.closest('[hidden]')) return;
        items.add(el);
        el.classList.add('reveal');
        // 같은 묶음 안에서는 조금씩 늦게 (최대 0.4초)
        const siblings = arr.filter((x) => x.parentElement === el.parentElement);
        el.style.setProperty('--d', Math.min(siblings.indexOf(el) * 0.08, 0.4) + 's');
      });
    });
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach((el) => io.observe(el));
  }

  /* ---------- 01 히어로: 숫자 카운트 (data-count 에 숫자가 있을 때만) ---------- */
  $$('[data-count]').forEach((el) => {
    const target = parseInt(String(el.dataset.count).replace(/[^\d]/g, ''), 10);
    const num = $('.num', el);
    if (!target || !num) return; // 숫자가 정해지기 전에는 그대로 둠
    const fmt = (n) => n.toLocaleString('ko-KR');
    if (REDUCE) { num.textContent = fmt(target); return; }
    num.textContent = '0';
    const io = onView(el, (vis) => {
      if (!vis) return;
      io.disconnect();
      const t0 = performance.now(), dur = 1400;
      const tick = (t) => {
        const k = Math.min((t - t0) / dur, 1);
        num.textContent = fmt(Math.round(target * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
  });

  /* ---------- 01 히어로 화면: 채팅이 하나씩 올라오고, 재생바·시간이 흐름 ---------- */
  const stage = $('.stage-screen');
  if (stage) {
    const chats = $$('.stage-chat li', stage);
    const bar = $('[data-stage-bar]', stage);
    const time = $('[data-stage-time]', stage);
    const TOTAL = 330; // 05:30
    let sec = 134;      // 02:14 에서 시작
    let ci = 0, timer;
    const render = () => {
      if (bar) bar.style.width = (sec / TOTAL) * 100 + '%';
      if (time) time.textContent = String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');
    };
    const step = () => {
      sec = sec >= TOTAL ? 0 : sec + 1;
      render();
      if (sec % 2 === 0) { // 2초마다 채팅 하나씩, 다 나오면 다시 처음부터
        if (ci < chats.length) chats[ci++].classList.add('is-show');
        else if (sec % 8 === 0) { chats.forEach((c) => c.classList.remove('is-show')); ci = 0; }
      }
    };
    render();
    if (REDUCE) chats.forEach((c) => c.classList.add('is-show'));
    else onView(stage, (vis) => { clearInterval(timer); if (vis) timer = setInterval(step, 1000); });
  }

  /* ---------- 02 스텝 플레이어: 3초마다 자동으로 넘어가고, 누르면 그 단계로 (진행바 채움 없음) ---------- */
  const player = $('[data-step-player]');
  if (player) {
    const steps = $$('.step', player);
    const tabs = $$('[data-step-go]', player);
    const pc = $('[data-step-img="pc"]', player);
    const mo = $('[data-step-img="mo"]', player);
    let idx = 0;
    steps.forEach((s) => { [s.dataset.pc, s.dataset.mo].forEach((src) => { if (src) new Image().src = src; }); });
    const swap = (img, src) => {
      if (!img || !src || img.getAttribute('src') === src) return;
      img.style.opacity = 0;   // 디졸브: 천천히 사라졌다가
      setTimeout(() => {
        const test = new Image();
        test.onload = () => { img.classList.remove('is-missing'); img.src = src; img.style.opacity = ''; };
        test.onerror = () => { img.classList.add('is-missing'); img.src = src; img.style.opacity = ''; };
        test.src = src;
      }, 450);
    };
    const show = (i) => {
      idx = (i + steps.length) % steps.length;
      steps.forEach((s, n) => {
        s.classList.toggle('is-active', n === idx);
        s.setAttribute('aria-current', n === idx ? 'step' : 'false');
      });
      tabs.forEach((t, n) => { t.classList.toggle('is-on', n === idx); t.setAttribute('aria-selected', n === idx); });
      swap(pc, steps[idx].dataset.pc);
      swap(mo, steps[idx].dataset.mo);
    };
    const STEP_MS = 3000;
    let timer, visible = false, paused = false;
    const run = () => {
      clearInterval(timer);
      if (visible && !paused && !REDUCE) timer = setInterval(() => show(idx + 1), STEP_MS);
    };
    const go = (n) => { show(n); run(); };
    player.addEventListener('mouseenter', () => { paused = true; run(); });
    player.addEventListener('mouseleave', () => { paused = false; run(); });
    onView(player, (vis) => { visible = vis; run(); });
    steps.forEach((s, n) => {
      s.tabIndex = 0;
      s.setAttribute('role', 'button');
      s.addEventListener('click', () => go(n));
      s.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(n); } });
    });
    tabs.forEach((t) => t.addEventListener('click', () => go(+t.dataset.stepGo)));
    // 모바일: 좌우로 밀어서 단계 이동
    let x0 = null;
    player.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    player.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  /* ---------- 03 가격 슬라이더 (설명용 예시) ---------- */
  const range = $('[data-price]');
  const tipBox = $('[data-price-tip]');
  const tip = tipBox && $('b', tipBox);
  const tipLabel = tipBox && $('small', tipBox);
  if (range && tip) {
    const update = (bump) => {
      const p = ((range.value - range.min) / (range.max - range.min)) * 100;
      range.parentElement.style.setProperty('--p', p + '%');
      range.style.setProperty('--p', p + '%');
      // 금액 대신 WoW의 o 개수로 (1개 ~ 최대 8개)
      const n = Math.max(1, Math.min(8, Math.round(Number(range.value))));
      tip.textContent = 'W' + 'o'.repeat(n) + 'W';
      tipBox.classList.toggle('is-wow', n === 8);
      range.setAttribute('aria-valuetext', tip.textContent);
      // 말풍선이 양 끝에서 잘리지 않게
      const half = tipBox.offsetWidth / 2 + 4, wrapW = range.parentElement.offsetWidth;
      tipBox.style.left = Math.min(Math.max(half, wrapW * p / 100), wrapW - half) + 'px';
      if (bump) { tipBox.classList.remove('bump'); void tipBox.offsetWidth; tipBox.classList.add('bump'); }
    };
    range.addEventListener('input', () => update(true));
    update(false);
    // 화면에 처음 들어오면 WoW → WooooW 로 스르륵 움직여 "끌 수 있다"는 걸 보여줌
    if (!REDUCE) {
      const io = onView(range, (vis) => {
        if (!vis) return;
        io.disconnect();
        const to = Number(range.value), from = Number(range.min);
        const t0 = performance.now(), dur = 900;
        const tick = (t) => {
          const k = Math.min((t - t0) / dur, 1);
          const v = from + (to - from) * (1 - Math.pow(1 - k, 3));
          range.value = Math.round(v);
          update(false);
          if (k < 1) requestAnimationFrame(tick); else { range.value = to; update(true); }
        };
        requestAnimationFrame(tick);
      }, { threshold: 0.6 });
    }
  }

  /* ---------- 04 재생목록: 오뗌 극장 테마 3개를 무작위로 불러와요 ---------- */
  const themeList = $('[data-oatheme]');
  if (themeList) {
    const API = 'https://api.oalive.kr';
    const esc = (t) => String(t || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    // API를 못 불러올 때 쓰는 테마 목록 (2026.11.24 기준)
    const SNAPSHOT = [{"title": "ACC 온라인 극장", "titleEn": "ACC ONLINVE STAGE", "thumbnailPath": "/20260305/e6399abc898c11964bd7172261497a5e", "url": "/oatheme/ACC-온라인-극장"}, {"title": "제4회 대한민국 국제뮤지컬콩쿠르", "titleEn": "4th Korea International Musical Concours", "thumbnailPath": "/20261006/f39e0db17ea98cfe37269ef9d36e54bb", "url": "/oatheme/제4회-대한민국-국제뮤지컬콩쿠르"}, {"title": "숏폼 드라마 <채워지는 날들>", "titleEn": "Filling Days", "thumbnailPath": "/20260114/d67ac6e84fe81cd0f55e66d8644e7858", "url": "/oatheme/숏폼-드라마-채워지는-날들-"}, {"title": "서울연극제", "titleEn": "Seoul Theater Festival", "thumbnailPath": "/20260918/2e9673876acd2bcce66c1e4ab5af9828", "url": "/oatheme/서울연극제"}, {"title": "동아 콩쿠르", "titleEn": "DONG-A Competion", "thumbnailPath": "/20240419/117e89daf14219b94d2e569a0c547e51", "url": "/oatheme/동아-콩쿠르"}, {"title": "제1회 부산프린지 페스티벌", "titleEn": "The 1st Busan Fringe Festival", "thumbnailPath": "/20260519/bcdbef0d7db7a0947337debca0553e70", "url": "/oatheme/제1회-부산프린지-페스티벌"}, {"title": "섬나비 여름 극장", "titleEn": "sumnavi", "thumbnailPath": "/20260519/63dcfbc6b8e9cb3a26e8f6d0597744be", "url": "/oatheme/섬나비-여름-극장"}, {"title": "신진연극인페스티벌", "titleEn": "New Artists Festival", "thumbnailPath": "/20260313/5aa6707a2580fdaf7572fc6a71ec38ce", "url": "/oatheme/신진연극인페스티벌"}, {"title": "오아라이브 페스티벌", "titleEn": "OALIVE Festival", "thumbnailPath": "/20241030/1f40efa8485cae30b649018cbf55c472", "url": "/oatheme/오아라이브-페스티벌"}, {"title": "아이엠컬처 10주년", "titleEn": "imculture 10th", "thumbnailPath": "/20241227/6ca43c5400d82982ea2ed01e3869e8b8", "url": "/oatheme/아이엠컬처-10주년"}, {"title": "주다컬쳐를 다 주다", "titleEn": "JOO:DA.zip", "thumbnailPath": "/20250819/6a80827f2f2af2bf81f9c6ebce5d5f97", "url": "/oatheme/주다컬쳐를-다-주다"}, {"title": "1번출구 연극제", "titleEn": "exit1 theater festival", "thumbnailPath": "/20250718/f7b943942eaefc6713e30c7e175afa04", "url": "/oatheme/1번출구-연극제"}, {"title": "[OA Originals] 웹뮤지컬 ‘골드보이’", "titleEn": "[OA Originals] Web Musical ‘GOLD BOY’", "thumbnailPath": "/20221104/0444672b44588b8758035bb6effd5626", "url": "/oatheme/OA-Originals-웹뮤지컬-‘골드보이’"}, {"title": "창무국제공연예술제", "titleEn": "ChangMu International Performing Arts Festival", "thumbnailPath": "/20241206/48f8100a9416cad8716bdb4210795519", "url": "/oatheme/창무국제공연예술제"}, {"title": "서울세계무용축제", "titleEn": "SIDance", "thumbnailPath": "/20240419/79f09611bb430586ab7bab0690779646", "url": "/oatheme/서울세계무용축제"}, {"title": "극공작소 마방진", "titleEn": "Playfactory Mabangzen", "thumbnailPath": "/20240419/5ae4e70fed67c59254583574a51692fa", "url": "/oatheme/극공작소-마방진"}, {"title": "브리즈 뮤지컬 컴퍼니", "titleEn": "BREEZE the active musical team", "thumbnailPath": "/20220124/1f62fe21642fe7a08e63100d2534fc75", "url": "/oatheme/브리즈-뮤지컬-컴퍼니"}];
    const render = (list) => {
      const open = list.slice();
      for (let k = open.length - 1; k > 0; k--) { const r = Math.floor(Math.random() * (k + 1)); [open[k], open[r]] = [open[r], open[k]]; }
      const pick = open.slice(0, 4);
      if (!pick.length) return;
      const eq = '<span class="eq"><i></i><i></i><i></i><i></i></span>';
      themeList.innerHTML = pick.map((t, n) => {
        const img = t.thumbnailPath ? API + '/files/image' + t.thumbnailPath : '';
        const href = 'https://oalive.kr' + encodeURI(t.url || '/oatheme');
        return '<a class="pl-item' + (n === 0 ? ' is-now' : '') + '" href="' + href + '" target="_blank" rel="noopener">' +
          '<span class="thumb t' + (n + 1) + '"' + (img ? ' style="background-image:url(\'' + img + '\')"' : '') + '>' + (n === 0 ? eq : '') + '</span>' +
          '<span class="pl-txt"><b>' + esc(String(t.title).trim()) + '</b><small>' + esc(t.titleEn) + '</small></span></a>';
      }).join('');
      $$('.pl-item', themeList).forEach((el) => el.classList.add('is-in'));
    };
    // 먼저 내장 목록으로 바로 보여주고, API가 되면 최신 목록으로 바꿔요
    render(SNAPSHOT);
    fetch(API + '/oatheme')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((res) => { const open = (res.data || []).filter((t) => t.isOpen); if (open.length) render(open); })
      .catch(() => { /* 불러오기 실패: 내장 목록 유지 */ });
    // 마우스를 올린 항목이 NOW PLAYING
    themeList.addEventListener('mouseover', (e) => {
      const it = e.target.closest('.pl-item'); if (!it) return;
      $$('.pl-item', themeList).forEach((x) => x.classList.toggle('is-now', x === it));
      const eqEl = $('.eq', themeList), th = $('.thumb', it);
      if (eqEl && th && eqEl.parentElement !== th) th.appendChild(eqEl);
    });
  }

  /* ---------- 05 카테고리: 카테고리마다 추천 작품 한 편씩 ---------- */
  const catCards = $$('.cat-card[data-genre]');
  if (catCards.length) {
    const API = 'https://api.oalive.kr';
    const Q = { free: 'genre=all&type=vod&excludeCharged=true', musical: 'genre=musical&type=all', theater: 'genre=theater&type=all', dance: 'genre=dance&type=all', music: 'genre=music&type=all', interview: 'genre=interview&type=all' };
    // API를 못 불러올 때 쓰는 작품 목록 (2026.11.24 기준)
    const CAT_SNAPSHOT = {"free": [{"title": "연극 <장도>", "thumbnail": "/20250124/33cac6ad0306edc73b36f6eb5a93de2b", "route": "/watch/vod/연극-장도"}, {"title": "숏폼 드라마 <채워지는 날들> 1-7화", "thumbnail": "/20260114/4907b9f96129d3d1621b04c8d8fa4f19", "route": "/watch/vod/숏폼-드라마-채워지는-날들-1-7화"}, {"title": "연극 <매일이 크리스마스(낭독공연)>", "thumbnail": "/20250328/740361267b9f3a27845b1160dcd12ae7", "route": "/watch/vod/연극-매일이-크리스마스낭독공연"}, {"title": "연극 <미미를 채워주세요(낭독공연)>", "thumbnail": "/20250328/5792772e4cd64c84b2f57c68f4754506", "route": "/watch/vod/연극-미미를-채워주세요낭독공연"}, {"title": "연극 <데스포이나(낭독공연)>", "thumbnail": "/20250328/43c52e5bcc4974b73e58f54aff1ed4f8", "route": "/watch/vod/연극-데스포이나낭독공연"}], "musical": [{"title": "[제4회 대한민국 국제뮤지컬콩쿠르] 고등부", "thumbnail": "/20261006/47ea637e0ce9e3449e8e0cbf6d770dc1", "route": "/watch/vod/제4회-대한민국-국제뮤지컬콩쿠르-고등부"}, {"title": "[제4회 대한민국 국제뮤지컬콩쿠르] 초등부 (2)", "thumbnail": "/20261006/2daa136074943664ece2455bc77c55b4", "route": "/watch/vod/제4회-대한민국-국제뮤지컬콩쿠르-초등부-2"}, {"title": "[제4회 대한민국 국제뮤지컬콩쿠르] 초등부 (1)", "thumbnail": "/20261006/335b58b791b60f1e09d3d093f1b32e61", "route": "/watch/vod/제4회-대한민국-국제뮤지컬콩쿠르-초등부-1"}, {"title": "[제4회 대한민국 국제뮤지컬콩쿠르] 대학일반부 (1)", "thumbnail": "/20261006/fd9fd063c120c501facae99eeb195c04", "route": "/watch/vod/제4회-대한민국-국제뮤지컬콩쿠르-대학일반부-1"}, {"title": "[제4회 대한민국 국제뮤지컬콩쿠르] 중등부", "thumbnail": "/20261006/8964e8d6a5d870bb1e9edf1e6276144c", "route": "/watch/vod/제4회-대한민국-국제뮤지컬콩쿠르-중등부"}], "theater": [{"title": "연극 <장도>", "thumbnail": "/20250124/33cac6ad0306edc73b36f6eb5a93de2b", "route": "/watch/vod/연극-장도"}, {"title": "연극 <회란기>", "thumbnail": "/20250305/73e512581980696d5c54019ab1f3930d", "route": "/watch/vod/연극-회란기"}, {"title": "연극 <당신은 아들을 모른다>", "thumbnail": "/20260805/bcc3a50cae63af9b456b8c0bee176401", "route": "/watch/vod/연극-당신은-아들을-모른다"}, {"title": "숏폼 드라마 <채워지는 날들> 1-7화", "thumbnail": "/20260114/4907b9f96129d3d1621b04c8d8fa4f19", "route": "/watch/vod/숏폼-드라마-채워지는-날들-1-7화"}, {"title": "연극 <장소>", "thumbnail": "/20251020/8cd98e7e33ac44762d580b140b0098ea", "route": "/watch/vod/연극-장소"}], "dance": [{"title": "[53회 동아무용] 한국무용(창작) 고등부 본선 진출작", "thumbnail": "/20230706/5de34e97f9c742391142cb2f9da7d394", "route": "/watch/vod/53회-동아무용-한국무용창작-고등부-본선-진출작"}, {"title": "무용 <7th Altimeets - 시선 너머의 결핍>", "thumbnail": "/20251208/c4dc3240817e7b3bfb25c744028906cb", "route": "/watch/vod/무용-7th-altimeets---시선-너머의-결핍"}, {"title": "전복된 해부학적 풍경(SAL) <88>", "thumbnail": "/20241129/1db95fb9d77515d47156c414ebe0f77a", "route": "/watch/vod/전복된-해부학적-풍경sal-88"}, {"title": "[53회 동아무용] 한국무용(창작) 일반부(여자) 본선 진출작", "thumbnail": "/20230706/3879e14662085e355e1ae09d061424e6", "route": "/watch/vod/53회-동아무용-한국무용창작-일반부여자-본선-진출작"}, {"title": "[53회 동아무용] 현대무용 전체 부문 수상작", "thumbnail": "/20230706/be21c76f0e46baf3878afa3ee8c574dc", "route": "/watch/vod/53회-동아무용-현대무용-전체-부문-수상작"}], "music": [{"title": "[62회 동아음악] 콘트라베이스 본선 경연 영상", "thumbnail": "/20230118/792992abea8a3a6c0f8a13f9f67969c9", "route": "/watch/vod/62회-동아음악-콘트라베이스-본선-경연-영상"}, {"title": "[62회 동아음악] 바이올린 본선 경연 영상", "thumbnail": "/20230118/63f65dd60c07a155c294dc6693225bed", "route": "/watch/vod/62회-동아음악-바이올린-본선-경연-영상"}, {"title": "[62회 동아음악] 트롬본 본선 경연 영상", "thumbnail": "/20230118/432c4925a1a1260ccfe4f2fd176380da", "route": "/watch/vod/62회-동아음악-트롬본-본선-경연-영상"}, {"title": "[62회 동아음악] 비올라 본선 경연 영상", "thumbnail": "/20230118/ea52ba3829f9d40ada22fb77033a3e6c", "route": "/watch/vod/62회-동아음악-비올라-본선-경연-영상"}], "interview": [{"title": "[53회 동아무용] 수상자 인터뷰", "thumbnail": "/20230524/c4801c3cca487dec0b7628c3897e7ad1", "route": "/watch/vod/53회-동아무용-수상자-인터뷰"}, {"title": "[7회 동아뮤지컬] 고등부, 대학(일반)부 수상자 인터뷰", "thumbnail": "/20240129/7c9bd9472c20a3032b2a9517fcc56b2d", "route": "/watch/vod/7회-동아뮤지컬-고등부-대학일반부-수상자-인터뷰"}, {"title": "[53회 동아무용] 심사위원 인터뷰", "thumbnail": "/20230524/33e99233b0a99cbbed466c65a4a87070", "route": "/watch/vod/53회-동아무용-심사위원-인터뷰"}, {"title": "[52회 동아무용] 부문별 수상자 인터뷰", "thumbnail": "/20220804/5a2c6f0784f68e0c98ee5664cc784191", "route": "/watch/vod/52회-동아무용-부문별-수상자-인터뷰"}, {"title": "[6회 동아뮤지컬] 본선 진출자 축하무대", "thumbnail": "/20230323/a723be9dd143c0fba7ffd10271868d53", "route": "/watch/vod/6회-동아뮤지컬-본선-진출자-축하무대"}]};
    const used = new Set();
    const pickOne = (list) => {
      const pool = list.filter((w) => !used.has(w.route)).slice(0, 5);
      if (!pool.length) return null;
      const w = pool[Math.floor(Math.random() * pool.length)];
      used.add(w.route); return w;
    };
    const fill = (card, w) => {
      if (!w) return;
      let img = card.querySelector('.cat-img img');
      if (!img) { img = document.createElement('img'); img.alt = ''; img.loading = 'lazy'; card.querySelector('.cat-img').prepend(img); }
      img.onerror = null; img.loading = 'eager'; img.src = API + '/files/image' + w.thumbnail; img.alt = w.title;
      card.href = 'https://oalive.kr' + encodeURI(w.route);
      let sm = card.querySelector('.cat-work');
      if (!sm) { sm = document.createElement('small'); sm.className = 'cat-work'; card.appendChild(sm); }
      sm.textContent = w.title;
    };
    const clean = (k, items) => items.filter((i) => i.thumbnail && i.route && (k === 'interview' || (i._tag === 'feature' && !String(i.type || '').includes('oaplus'))))
      .map((i) => ({ title: String(i.title).trim(), thumbnail: i.thumbnail, route: i.route }));
    Promise.all(catCards.map((card) => {
      const k = card.dataset.genre;
      return fetch(API + '/board/features/watch?excludeClosed=false&fixedContentsIndex=&size=15&sort=recommend&' + Q[k])
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((res) => { const l = clean(k, (res.data && res.data.items) || []); return l.length ? l : CAT_SNAPSHOT[k]; })
        .catch(() => CAT_SNAPSHOT[k] || []);
    })).then((lists) => lists.forEach((l, n) => fill(catCards[n], pickOne(l))));
  }

  /* ---------- 06 아티스트 카드: 누르면 뒤집기 ---------- */
  $$('.sc-card').forEach((card) => {
    let busy = false;
    const flip = () => {
      if (busy) return; busy = true;
      card.classList.add('is-turning');
      setTimeout(() => {
        const on = card.classList.toggle('is-flipped');
        card.setAttribute('aria-pressed', on ? 'true' : 'false');
        const back = card.querySelector('.sc-back'); if (back) back.setAttribute('aria-hidden', on ? 'false' : 'true');
        card.classList.remove('is-turning'); card.classList.add('is-back-in');
        requestAnimationFrame(() => requestAnimationFrame(() => { card.classList.remove('is-back-in'); setTimeout(() => { busy = false; }, 230); }));
      }, 220);
    };
    card.addEventListener('click', (e) => { if (e.target.closest('a')) return; flip(); });
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
  });

  /* ---------- 07·10 펼침 목록: 부드럽게 열리고, 하나만 열림 ---------- */
  $$('.track-a, .faq-a').forEach((a) => {
    if (a.firstElementChild && a.firstElementChild.classList.contains('acc-inner')) return;
    const inner = document.createElement('div');
    inner.className = 'acc-inner';
    while (a.firstChild) inner.appendChild(a.firstChild);
    a.appendChild(inner);
  });
  $$('[data-accordion]').forEach((list) => {
    list.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn || !list.contains(btn)) return;
      const item = btn.parentElement;
      const willOpen = !item.classList.contains('is-open');
      [...list.children].forEach((li) => {
        li.classList.remove('is-open');
        li.querySelector('button')?.setAttribute('aria-expanded', 'false');
      });
      if (willOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- 10 FAQ 탭 ---------- */
  const tabs = $$('.tabs [data-tab]');
  const panels = $$('.faq[data-panel]');
  const selectTab = (name) => {
    tabs.forEach((t) => {
      const on = t.dataset.tab === name;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', on);
    });
    panels.forEach((p) => {
      p.hidden = p.dataset.panel !== name;
      if (!p.hidden) $$('.reveal', p).forEach((el) => el.classList.add('is-in'));
    });
  };
  tabs.forEach((t) => t.addEventListener('click', () => selectTab(t.dataset.tab)));
  $$('[data-faq-tab]').forEach((a) => a.addEventListener('click', () => selectTab(a.dataset.faqTab)));

  /* ---------- 관객 / 아티스트 탭: 고른 쪽 내용만 보여줘요 ---------- */
  const roleTabs = $$('[data-role-tab]');
  const rolePanels = $$('[data-role-panel]');
  const roleBar = $('.role-tabs');
  const headerEl = $('.site-header');
  const setHeaderVar = () => document.documentElement.style.setProperty('--hdr', (headerEl ? headerEl.offsetHeight : 0) + 'px');
  setHeaderVar(); window.addEventListener('resize', setHeaderVar);
  const setRole = (role, scroll) => {
    roleTabs.forEach((t) => {
      const on = t.dataset.roleTab === role;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', on);
    });
    rolePanels.forEach((p) => {
      p.hidden = p.dataset.rolePanel !== role;
      if (!p.hidden) $$('.reveal', p).forEach((el) => el.classList.add('is-in'));
    });
    selectTab(role === 'artist' ? 'artist' : 'aud');   // FAQ 탭도 같이
    history.replaceState(null, '', role === 'artist' ? '#forArtist' : '#forAudience');
    if (scroll && roleBar) {
      const panelEl = document.getElementById('panel-' + (role === 'artist' ? 'artist' : 'audience'));
      const top = (panelEl || roleBar).getBoundingClientRect().top + window.scrollY - (headerEl ? headerEl.offsetHeight : 0);
      window.scrollTo({ top, behavior: REDUCE ? 'auto' : 'smooth' });
    }
  };
  roleTabs.forEach((t) => t.addEventListener('click', () => setRole(t.dataset.roleTab, true)));
  $$('[data-role-go]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); setRole(a.dataset.roleGo, true); }));
  // 숨겨진 쪽 섹션으로 가는 링크(#artist 등)를 누르면 탭부터 바꿔요
  $$('a[href^="#"]').forEach((a) => {
    const id = a.getAttribute('href').slice(1);
    const target = id && document.getElementById(id);
    const panel = target && target.closest('[data-role-panel]');
    if (!panel) return;
    a.addEventListener('click', (e) => {
      if (!panel.hidden) return;
      e.preventDefault();
      setRole(panel.dataset.rolePanel, false);
      requestAnimationFrame(() => target.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth' }));
    });
  });
  if (/forArtist|artist|weeks|features|support/i.test(location.hash)) setRole('artist', false);
  window.addEventListener('hashchange', () => {
    if (/forArtist/i.test(location.hash)) setRole('artist', true);
    else if (/forAudience/i.test(location.hash)) setRole('audience', true);
  });

  /* ---------- 스크롤에 따라 채워지는 것들 ---------- */
  const dividers = $$('.chapter-divider');
  const timeline = $('.timeline');
  const tlItems = timeline ? $$('li', timeline) : [];
  const progress = (el, start = 0.9, end = 0.4) => {
    // el 이 화면 아래쪽(start)에서 위쪽(end)까지 지나가는 동안 0 → 1
    const r = el.getBoundingClientRect();
    const vh = innerHeight;
    const k = (vh * start - r.top) / (vh * (start - end) + r.height);
    return Math.max(0, Math.min(1, k));
  };
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      // 챕터 구분선: 원래 비율(45%, 82%)까지 스크롤에 맞춰 차오름
      dividers.forEach((d) => {
        const i = $('.cd-track i', d);
        if (!i) return;
        const max = parseFloat(i.style.width) || 50;
        d.style.setProperty('--cd', (progress(d, 1, 0.5) * max).toFixed(1) + '%');
      });
      // 09 타임라인: 선이 채워지고, 지나간 주차의 점이 켜짐
      if (timeline) {
        const k = progress(timeline, 0.75, 0.35);
        timeline.style.setProperty('--tl', (k * 100).toFixed(1) + '%');
        tlItems.forEach((li, n) => li.classList.toggle('is-on', k >= n / (tlItems.length - 1) - 0.02));
      }
      ticking = false;
    });
  };
  if (REDUCE) {
    dividers.forEach((d) => { const i = $('.cd-track i', d); if (i) d.style.setProperty('--cd', i.style.width); });
    if (timeline) { timeline.style.setProperty('--tl', '100%'); tlItems.forEach((li) => li.classList.add('is-on')); }
  } else {
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    onScroll();
  }

  /* ---------- 11 엔딩: 화면에 들어오면 빛이 가운데로 모이고 선이 줄어듦 ---------- */
  const ending = $('[data-ending]');
  if (ending) onView(ending, (vis) => ending.classList.toggle('is-in', vis), { threshold: 0.5 });
})();
