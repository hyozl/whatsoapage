// 오아라이브 서비스 소개 — 인터랙션
(() => {
  // 캡처 이미지가 아직 없으면 빈 화면(어두운 배경)으로 둡니다.
  document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', () => img.classList.add('is-missing'), { once: true });
  });

  /* ---------- 02 스텝 플레이어: 2.5초마다 다음 단계, 화면 캡처도 함께 바뀜 ---------- */
  const player = document.querySelector('[data-step-player]');
  if (player) {
    const steps = [...player.querySelectorAll('.step')];
    const pc = player.querySelector('[data-step-img="pc"]');
    const mo = player.querySelector('[data-step-img="mo"]');
    const STEP_MS = 2500;
    player.style.setProperty('--step-ms', STEP_MS + 'ms');
    let idx = 0;
    let timer;

    const swap = (img, src) => {
      if (!img || img.getAttribute('src') === src) return;
      img.style.opacity = 0;
      setTimeout(() => {
        img.classList.remove('is-missing');
        img.src = src;
        img.style.opacity = '';
      }, 200);
    };
    const show = (i) => {
      idx = (i + steps.length) % steps.length;
      steps.forEach((s, n) => {
        s.classList.toggle('is-active', n === idx);
        s.classList.toggle('done', n < idx);
        // 진행바 애니메이션 다시 시작
        const bar = s.querySelector('.step-bar i');
        bar.style.animation = 'none';
        void bar.offsetWidth;
        bar.style.animation = '';
      });
      swap(pc, steps[idx].dataset.pc);
      swap(mo, steps[idx].dataset.mo);
    };
    const start = () => { clearInterval(timer); timer = setInterval(() => show(idx + 1), STEP_MS); };
    steps.forEach((s, n) => s.addEventListener('click', () => { show(n); start(); }));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) {
      new IntersectionObserver(([e]) => (e.isIntersecting ? start() : clearInterval(timer)), { threshold: 0.3 }).observe(player);
    }
  }

  /* ---------- 03 가격 슬라이더 (설명용 예시) ---------- */
  const range = document.querySelector('[data-price]');
  const tip = document.querySelector('[data-price-tip] b');
  if (range && tip) {
    const update = () => {
      const p = ((range.value - range.min) / (range.max - range.min)) * 100;
      range.parentElement.style.setProperty('--p', p + '%');
      range.style.setProperty('--p', p + '%');
      tip.textContent = '₩ ' + Number(range.value).toLocaleString('ko-KR');
    };
    range.addEventListener('input', update);
    update();
  }

  /* ---------- 07·10 펼침 목록: 하나만 열림 ---------- */
  document.querySelectorAll('[data-accordion]').forEach((list) => {
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
  const tabs = [...document.querySelectorAll('.tabs [data-tab]')];
  const panels = [...document.querySelectorAll('.faq[data-panel]')];
  const selectTab = (name) => {
    tabs.forEach((t) => {
      const on = t.dataset.tab === name;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', on);
    });
    panels.forEach((p) => (p.hidden = p.dataset.panel !== name));
  };
  tabs.forEach((t) => t.addEventListener('click', () => selectTab(t.dataset.tab)));
  document.querySelectorAll('[data-faq-tab]').forEach((a) =>
    a.addEventListener('click', () => selectTab(a.dataset.faqTab))
  );

  /* ---------- 11 엔딩: 화면에 들어오면 빛이 가운데로 모임 ---------- */
  const ending = document.querySelector('[data-ending]');
  if (ending) {
    new IntersectionObserver(([e]) => ending.classList.toggle('is-in', e.isIntersecting), { threshold: 0.5 }).observe(ending);
  }
})();
