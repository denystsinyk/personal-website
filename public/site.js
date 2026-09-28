document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
  button.addEventListener('click', function () {
    document.getElementById('theme-toggle').click();
  });
});

document.getElementById('theme-toggle').addEventListener('click', function () {
  const next =
    document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem('theme', next);
  } catch {}
  document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
    button.setAttribute(
      'aria-label',
      'Switch to ' + (next === 'dark' ? 'day' : 'night') + ' theme',
    );
  });
});

// ---------- weather: night = snow piling on the footer rule, day = clouds + a distant flock ----------
(function () {
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = motionQuery.matches;
  const weatherToggle = document.getElementById('weather-toggle');
  function updateWeatherButton() {
    weatherToggle.textContent = paused ? 'play weather' : 'pause weather';
    weatherToggle.setAttribute('aria-pressed', String(paused));
  }
  updateWeatherButton();
  const canvas = document.getElementById('snow');
  const footer = document.querySelector('footer');
  if (!canvas || !footer) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const BUCKET = 4; // px per pile column
  const PILE_CAP = 13; // max pile height on the rule
  let W, H, ruleY, ruleL, ruleR, piles;
  const flakes = [];
  let mode = 'night';
  const ink = { suit: '#fff', rule: '#888', muted: '#888' };
  let wind = 0,
    gust = 0,
    lastMX = null;
  let clouds = null,
    flock = null,
    nextFlock = 0;

  function readTheme() {
    const cs = getComputedStyle(document.documentElement);
    ink.suit = cs.getPropertyValue('--suit').trim() || '#fff';
    ink.rule = cs.getPropertyValue('--rule').trim() || '#888';
    ink.muted = cs.getPropertyValue('--muted').trim() || '#888';
    mode = document.documentElement.dataset.theme === 'dark' ? 'night' : 'day';
  }

  function makeFlake(fromTop) {
    const r = 1.1 + Math.random() * 1.9;
    return {
      x: Math.random() * W,
      y: fromTop ? -6 : Math.random() * H,
      r: r,
      vy: 0.2 + r * 0.28,
      ph: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.02,
    };
  }

  function size() {
    W = document.documentElement.clientWidth;
    canvas.style.height = '0px';
    H = document.documentElement.scrollHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const rect = footer.getBoundingClientRect();
    ruleY = rect.top + window.scrollY;
    ruleL = rect.left;
    ruleR = rect.right;
    const cols = Math.max(1, Math.ceil((ruleR - ruleL) / BUCKET));
    if (!piles || piles.length !== cols)
      piles = Array.from({ length: cols }, () => 0);
    const target = Math.min(130, Math.round((W * H) / 18000));
    while (flakes.length < target) flakes.push(makeFlake(false));
    flakes.length = target;
  }

  function nightFrame() {
    wind += (gust - wind) * 0.04;
    gust *= 0.985;

    ctx.fillStyle = ink.suit;
    ctx.strokeStyle = ink.suit;
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.38;
    for (let i = 0; i < flakes.length; i++) {
      const f = flakes[i];
      f.ph += 0.012 + f.r * 0.004;
      f.rot += f.vr;
      f.x += Math.sin(f.ph) * 0.3 + wind * f.r * 0.5;
      f.y += f.vy;
      if (f.x < -4) f.x = W + 4;
      else if (f.x > W + 4) f.x = -4;

      // settle on the footer rule
      if (f.x >= ruleL && f.x < ruleR) {
        const b = Math.floor((f.x - ruleL) / BUCKET);
        const surface = ruleY - piles[b];
        if (f.y >= surface && f.y <= surface + 8) {
          if (piles[b] < PILE_CAP) {
            piles[b] = Math.min(PILE_CAP, piles[b] + f.r * 0.22);
            if (b > 0)
              piles[b - 1] = Math.min(PILE_CAP, piles[b - 1] + f.r * 0.08);
            if (b < piles.length - 1)
              piles[b + 1] = Math.min(PILE_CAP, piles[b + 1] + f.r * 0.08);
          }
          flakes[i] = makeFlake(true);
          continue;
        }
      }
      if (f.y > H + 6) {
        flakes[i] = makeFlake(true);
        continue;
      }

      if (f.r < 1.8) {
        // small flakes stay soft dots
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // bigger ones get six crystal arms, slowly tumbling
        const arm = f.r * 2.1;
        ctx.beginPath();
        for (let a = 0; a < 3; a++) {
          const ang = f.rot + (a * Math.PI) / 3;
          const cx = Math.cos(ang) * arm;
          const cy = Math.sin(ang) * arm;
          ctx.moveTo(f.x - cx, f.y - cy);
          ctx.lineTo(f.x + cx, f.y + cy);
        }
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(f.x, f.y, 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // the pile, smoothed across neighboring columns
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.moveTo(ruleL, ruleY);
    for (let j = 0; j < piles.length; j++) {
      const h =
        (piles[Math.max(0, j - 1)] +
          piles[j] * 2 +
          piles[Math.min(piles.length - 1, j + 1)]) /
        4;
      ctx.lineTo(ruleL + j * BUCKET + BUCKET / 2, ruleY - h);
    }
    ctx.lineTo(ruleR, ruleY);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawCloud(x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x - 40 * s, y);
    ctx.bezierCurveTo(
      x - 46 * s,
      y - 12 * s,
      x - 28 * s,
      y - 22 * s,
      x - 14 * s,
      y - 15 * s,
    );
    ctx.bezierCurveTo(
      x - 8 * s,
      y - 30 * s,
      x + 14 * s,
      y - 30 * s,
      x + 20 * s,
      y - 15 * s,
    );
    ctx.bezierCurveTo(
      x + 34 * s,
      y - 20 * s,
      x + 44 * s,
      y - 8 * s,
      x + 38 * s,
      y,
    );
    ctx.closePath();
    ctx.stroke();
  }

  function spawnFlock() {
    const dir = Math.random() < 0.5 ? 1 : -1;
    const n = 4 + Math.floor(Math.random() * 3);
    const birds = [];
    for (let i = 0; i < n; i++) {
      birds.push({
        ox: -(i * 26 + Math.random() * 12),
        oy: (Math.random() - 0.5) * 26 + (i % 2) * 8,
        ph: Math.random() * Math.PI * 2,
      });
    }
    flock = {
      x: dir > 0 ? -30 : W + 30,
      y: (0.08 + Math.random() * 0.3) * window.innerHeight,
      dir: dir,
      v: 0.55 + Math.random() * 0.25,
      birds: birds,
    };
  }

  function dayFrame() {
    const sy = window.scrollY;
    const now = performance.now();
    if (!clouds) {
      clouds = [];
      for (let i = 0; i < 3; i++) {
        clouds.push({
          x: Math.random() * W,
          y: (0.1 + 0.24 * i) * window.innerHeight,
          s: 0.75 + Math.random() * 0.6,
          v: 0.05 + Math.random() * 0.06,
        });
      }
      nextFlock = now + 3000 + Math.random() * 6000;
    }

    // clouds drift slowly, pinned to the viewport as you scroll
    ctx.strokeStyle = ink.rule;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.85;
    for (let c = 0; c < clouds.length; c++) {
      const cl = clouds[c];
      cl.x += cl.v;
      if (cl.x - 60 * cl.s > W) cl.x = -60 * cl.s;
      drawCloud(cl.x, cl.y + sy, cl.s);
    }

    // every so often, a small flock crosses the sky
    if (!flock && now > nextFlock) spawnFlock();
    if (flock) {
      flock.x += flock.dir * flock.v;
      ctx.strokeStyle = ink.muted;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      for (let j = 0; j < flock.birds.length; j++) {
        const b = flock.birds[j];
        b.ph += 0.14;
        const bx = flock.x + b.ox * flock.dir;
        const by = flock.y + b.oy + sy;
        const lift = 1.4 + Math.sin(b.ph) * 2;
        ctx.moveTo(bx - 5, by - lift);
        ctx.quadraticCurveTo(bx, by + 1.5, bx + 5, by - lift);
      }
      ctx.stroke();
      const span = 26 * flock.birds.length + 60;
      if (
        (flock.dir > 0 && flock.x - span > W) ||
        (flock.dir < 0 && flock.x + span < 0)
      ) {
        flock = null;
        nextFlock = now + 12000 + Math.random() * 18000;
      }
    }
    ctx.globalAlpha = 1;
  }

  let frameId = 0;
  function frame() {
    if (paused || document.hidden) {
      frameId = 0;
      return;
    }
    ctx.clearRect(0, 0, W, H);
    if (mode === 'night') nightFrame();
    else dayFrame();
    frameId = requestAnimationFrame(frame);
  }

  window.addEventListener('resize', function () {
    size();
    clouds = null;
  });
  window.addEventListener('load', function () {
    size();
    readTheme();
  });
  window.addEventListener('mousemove', function (e) {
    if (lastMX !== null) {
      gust = Math.max(-1.4, Math.min(1.4, gust + (e.clientX - lastMX) * 0.02));
    }
    lastMX = e.clientX;
  });
  document.getElementById('theme-toggle').addEventListener('click', readTheme);

  readTheme();
  size();
  function resume() {
    if (!frameId && !paused && !document.hidden)
      frameId = requestAnimationFrame(frame);
  }
  weatherToggle.addEventListener('click', function () {
    paused = !paused;
    updateWeatherButton();
    if (paused) {
      cancelAnimationFrame(frameId);
      frameId = 0;
      ctx.clearRect(0, 0, W, H);
    } else resume();
  });
  motionQuery.addEventListener('change', function (event) {
    paused = event.matches;
    updateWeatherButton();
    if (paused) {
      cancelAnimationFrame(frameId);
      frameId = 0;
      ctx.clearRect(0, 0, W, H);
    } else resume();
  });
  document.addEventListener('visibilitychange', resume);
  if (window.ResizeObserver)
    new ResizeObserver(function () {
      size();
    }).observe(document.querySelector('.page'));
  resume();
})();
