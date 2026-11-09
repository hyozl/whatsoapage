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

  /* ---------- 02 스텝 플레이어: 2.5초마다 다음 단계, 화면 캡처도 함께 바뀜 ---------- */
  const player = $('[data-step-player]');
  if (player) {
    const steps = $$('.step', player);
    const pc = $('[data-step-img="pc"]', player);
    const mo = $('[data-step-img="mo"]', player);
    const STEP_MS = 2500;
    player.style.setProperty('--step-ms', STEP_MS + 'ms');
    let idx = 0, timer, visible = false, paused = false;

    // 다음 단계 이미지를 미리 불러오기
    steps.forEach((s) => { [s.dataset.pc, s.dataset.mo].forEach((src) => { if (src) new Image().src = src; }); });

    const swap = (img, src) => {
      if (!img || !src || img.getAttribute('src') === src) return;
      img.style.opacity = 0;
      setTimeout(() => {
        const test = new Image();
        test.onload = () => { img.classList.remove('is-missing'); img.src = src; img.style.opacity = ''; };
        test.onerror = () => { img.classList.add('is-missing'); img.src = src; img.style.opacity = ''; };
        test.src = src;
      }, 200);
    };
    const show = (i) => {
      idx = (i + steps.length) % steps.length;
      steps.forEach((s, n) => {
        s.classList.toggle('is-active', n === idx);
        s.classList.toggle('done', n < idx);
        s.setAttribute('aria-current', n === idx ? 'step' : 'false');
        const bar = $('.step-bar i', s);
        bar.style.animation = 'none';
        void bar.offsetWidth; // 진행바 애니메이션 다시 시작
        bar.style.animation = '';
      });
      swap(pc, steps[idx].dataset.pc);
      swap(mo, steps[idx].dataset.mo);
    };
    const run = () => {
      clearInterval(timer);
      if (visible && !paused && !REDUCE) timer = setInterval(() => show(idx + 1), STEP_MS);
    };
    steps.forEach((s, n) => {
      s.tabIndex = 0;
      s.setAttribute('role', 'button');
      const go = () => { show(n); run(); };
      s.addEventListener('click', go);
      s.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    // 마우스를 올리면 잠시 멈춤
    player.addEventListener('mouseenter', () => { paused = true; player.classList.add('is-paused'); run(); });
    player.addEventListener('mouseleave', () => { paused = false; player.classList.remove('is-paused'); show(idx); run(); });
    // 모바일: 좌우로 밀어서 단계 이동
    let x0 = null;
    player.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    player.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { show(idx + (dx < 0 ? 1 : -1)); run(); }
      x0 = null;
    });
    onView(player, (vis) => { visible = vis; run(); });
  }

  /* ---------- 03 가격 슬라이더 (설명용 예시) ---------- */
  const range = $('[data-price]');
  const tipBox = $('[data-price-tip]');
  const tip = tipBox && $('b', tipBox);
  if (range && tip) {
    const update = (bump) => {
      const p = ((range.value - range.min) / (range.max - range.min)) * 100;
      range.parentElement.style.setProperty('--p', p + '%');
      range.style.setProperty('--p', p + '%');
      tip.textContent = '₩ ' + Number(range.value).toLocaleString('ko-KR');
      range.setAttribute('aria-valuetext', Number(range.value).toLocaleString('ko-KR') + '원');
      if (bump) { tipBox.classList.remove('bump'); void tipBox.offsetWidth; tipBox.classList.add('bump'); }
    };
    range.addEventListener('input', () => update(true));
    update(false);
    // 화면에 처음 들어오면 1,000 → 5,000 으로 스르륵 움직여 "끌 수 있다"는 걸 보여줌
    if (!REDUCE) {
      const io = onView(range, (vis) => {
        if (!vis) return;
        io.disconnect();
        const to = Number(range.value), from = Number(range.min);
        const t0 = performance.now(), dur = 900;
        const tick = (t) => {
          const k = Math.min((t - t0) / dur, 1);
          const v = from + (to - from) * (1 - Math.pow(1 - k, 3));
          range.value = Math.round(v / 1000) * 1000;
          update(false);
          if (k < 1) requestAnimationFrame(tick); else { range.value = to; update(true); }
        };
        requestAnimationFrame(tick);
      }, { threshold: 0.6 });
    }
  }

  /* ---------- 04 재생목록: 누르면 그 항목이 NOW PLAYING ---------- */
  const playlist = $('.playlist');
  if (playlist) {
    const items = $$('.pl-item', playlist);
    const eq = $('.eq', playlist);
    items.forEach((it) => {
      it.tabIndex = 0;
      it.setAttribute('role', 'button');
      const pick = () => {
        items.forEach((x) => x.classList.toggle('is-now', x === it));
        const thumb = $('.thumb', it);
        if (eq && thumb && eq.parentElement !== thumb) thumb.appendChild(eq);
      };
      it.addEventListener('click', pick);
      it.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
  }

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
