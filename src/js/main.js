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
    fetch(API + '/oatheme')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((res) => {
        const open = (res.data || []).filter((t) => t.isOpen);
        for (let k = open.length - 1; k > 0; k--) { const r = Math.floor(Math.random() * (k + 1)); [open[k], open[r]] = [open[r], open[k]]; }
        const pick = open.slice(0, 3);
        if (!pick.length) return;
        const eq = '<span class="eq"><i></i><i></i><i></i><i></i></span>';
        themeList.innerHTML = pick.map((t, n) => {
          const img = t.thumbnailPath ? API + '/files/image' + t.thumbnailPath : '';
          const href = 'https://oalive.kr' + encodeURI(t.url || '/oatheme');
          return '<a class="pl-item' + (n === 0 ? ' is-now' : '') + '" href="' + href + '" target="_blank" rel="noopener">' +
            '<span class="thumb t' + (n + 1) + '"' + (img ? ' style="background-image:url(\'' + img + '\')"' : '') + '>' + (n === 0 ? eq : '') + '</span>' +
            '<span class="pl-txt"><b>' + esc(t.title.trim()) + '</b><small>' + esc(t.titleEn) + '</small></span></a>';
        }).join('');
        $$('.pl-item', themeList).forEach((el) => el.classList.add('is-in'));
      })
      .catch(() => { /* 불러오기 실패: 기본값 유지 */ });
    // 마우스를 올린 항목이 NOW PLAYING
    themeList.addEventListener('mouseover', (e) => {
      const it = e.target.closest('.pl-item'); if (!it) return;
      $$('.pl-item', themeList).forEach((x) => x.classList.toggle('is-now', x === it));
      const eqEl = $('.eq', themeList), th = $('.thumb', it);
      if (eqEl && th && eqEl.parentElement !== th) th.appendChild(eqEl);
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
      const top = roleBar.getBoundingClientRect().top + window.scrollY - (headerEl ? headerEl.offsetHeight : 0);
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
