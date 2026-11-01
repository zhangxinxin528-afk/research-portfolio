(() => {
  const menu = document.querySelector('.menu-toggle');
  if (menu) menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    document.querySelector('.nav-links').classList.toggle('open', open);
  });
  document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => {
    if (menu) { menu.setAttribute('aria-expanded', 'false'); document.querySelector('.nav-links').classList.remove('open'); }
  }));
  const hero = document.querySelector('#hero-figure');
  document.querySelectorAll('[data-hero-image]').forEach(button => button.addEventListener('click', () => {
    hero.src = button.dataset.heroImage;
    hero.alt = button.dataset.heroAlt;
    document.querySelector('#hero-caption-title').textContent = button.dataset.heroTitle;
    document.querySelector('#hero-caption-text').textContent = button.dataset.heroCaption;
    document.querySelector('#hero-project-link').href = button.dataset.heroLink;
    document.querySelectorAll('[data-hero-image]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  }));
  const search = document.querySelector('#project-search');
  let category = 'all';
  function filterProjects() {
    const q = (search?.value || '').toLowerCase().trim();
    let count = 0;
    document.querySelectorAll('.filter-card').forEach(card => {
      const show = (category === 'all' || card.dataset.category === category) && card.textContent.toLowerCase().includes(q);
      card.hidden = !show; if(show) count++;
    });
    const out = document.querySelector('#project-count'); if (out) out.textContent = `${count} project${count === 1 ? '' : 's'}`;
    const empty = document.querySelector('#no-projects'); if (empty) empty.hidden = count > 0;
  }
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    category = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    filterProjects();
  }));
  search?.addEventListener('input', filterProjects);
  const solidJSON = document.querySelector('#solid-data');
  if (solidJSON) {
    const data = JSON.parse(solidJSON.textContent).rows;
    let region = 'R2', level = 0;
    function renderSolid() {
      const rows = data.filter(r => r.region === region && r.Dlevel === level);
      const a = rows.find(r => r.side === 'A'), b = rows.find(r => r.side === 'B');
      const max = Math.ceil(Math.max(...data.filter(r => r.region === region).map(r => r.variance * 1e5)));
      const y = v => 210 - (v * 1e5 / max) * 155;
      let svg = `<title>${region}: computed concentration variance, ${level ? 'tenfold' : 'baseline'} diffusivity</title><desc>Pattern A ${a.variance.toExponential(6)}; pattern B ${b.variance.toExponential(6)}. Variance is dimensionless.</desc>`;
      svg += '<text x="32" y="22" font-size="13" fill="#565b55">Concentration variance W (×10⁻⁵)</text>';
      for(let i = 0; i <= max; i++) { const yy = y(i/1e5); svg += `<line x1="65" y1="${yy}" x2="655" y2="${yy}" stroke="#dedfd8"/><text x="47" y="${yy+5}" text-anchor="end" font-size="12">${i}</text>`; }
      [a,b].forEach((r,i) => {
        const x = 205 + i*230, yy = y(r.variance);
        svg += `<rect x="${x}" y="${yy}" width="110" height="${210-yy}" fill="${i ? '#c85a5a' : '#3c5488'}"/><text x="${x+55}" y="${yy-10}" text-anchor="middle" font-size="17" font-weight="bold">${(r.variance*1e5).toFixed(4)}</text><text x="${x+55}" y="238" text-anchor="middle" font-size="14">Pattern ${r.side}</text>`;
      });
      document.querySelector('#solid-chart').innerHTML = svg;
      const contrast = 100 * (a.variance-b.variance)/b.variance;
      document.querySelector('#solid-contrast').textContent = `${contrast >= 0 ? '+' : ''}${contrast.toFixed(2)}%`;
      document.querySelector('#solid-order').textContent = `${region} · ${level ? '10D₀' : 'D₀'} · ${a.variance > b.variance ? 'A has greater variance than B.' : 'B has greater variance than A.'}`;
      document.querySelectorAll('[data-region]').forEach(btn => btn.setAttribute('aria-pressed',String(btn.dataset.region===region)));
      document.querySelectorAll('[data-dlevel]').forEach(btn => btn.setAttribute('aria-pressed',String(Number(btn.dataset.dlevel)===level)));
    }
    document.querySelectorAll('[data-region]').forEach(btn => btn.addEventListener('click',()=>{region=btn.dataset.region;renderSolid();}));
    document.querySelectorAll('[data-dlevel]').forEach(btn => btn.addEventListener('click',()=>{level=Number(btn.dataset.dlevel);renderSolid();}));
    renderSolid();
  }
  const basaltJSON = document.querySelector('#basalt-data');
  if (basaltJSON) {
    const rows = JSON.parse(basaltJSON.textContent).rows;
    const slider = document.querySelector('#basalt-time');
    function renderBasalt() {
      const i=Number(slider.value), r=rows[i];
      document.querySelector('#basalt-time-value').textContent = `${r.time_s} s`;
      document.querySelector('#basalt-min-temp').textContent = `${r.temperature_min_K.toFixed(1)} K`;
      document.querySelector('#basalt-depth-value').textContent = `${r.top_connected_damage_depth_mm.toFixed(2)} mm`;
      slider.setAttribute('aria-valuetext',`${r.time_s} seconds, depth ${r.top_connected_damage_depth_mm.toFixed(2)} millimetres`);
      let svg='<title>Sampled depth of top-connected phi above 0.8 versus time</title><desc>Data from the continuous coarse 3D prototype, with current saved output marked. Not a natural column length prediction.</desc>';
      svg+='<text x="23" y="19" font-size="12" fill="#565b55">Top-connected high-damage depth (mm)</text>';
      [0,2,4,6].forEach(d=>{let y=208-d/6*145;svg+=`<line x1="65" y1="${y}" x2="660" y2="${y}" stroke="#dedfd8"/><text x="48" y="${y+4}" text-anchor="end" font-size="12">${d}</text>`;});
      const x=r=>65+r.time_s/120*595, y=r=>208-r.top_connected_damage_depth_mm/6*145;
      svg+=`<polyline points="${rows.map(r=>`${x(r)},${y(r)}`).join(' ')}" fill="none" stroke="#18573f" stroke-width="3"/><circle cx="${x(r)}" cy="${y(r)}" r="6" fill="#c62d44" stroke="white" stroke-width="2"/>`;
      [0,30,60,90,120].forEach(t=>{svg+=`<text x="${65+t/120*595}" y="232" text-anchor="middle" font-size="12">${t}</text>`;});
      svg+='<text x="360" y="257" text-anchor="middle" font-size="12">Simulation time (s)</text>';
      document.querySelector('#basalt-chart').innerHTML=svg;
    }
    slider.max=String(rows.length-1); slider.value=String(rows.length-1); slider.addEventListener('input',renderBasalt); renderBasalt();
  }
  document.querySelectorAll('[data-animation-target]').forEach(button => button.addEventListener('click',()=>{
    const img=document.getElementById(button.dataset.animationTarget);
    const play=button.getAttribute('aria-pressed')!=='true';
    img.src=play?button.dataset.animation:button.dataset.poster;
    button.setAttribute('aria-pressed',String(play));button.textContent=play?'Stop animation':'Play animation';
  }));
})();
