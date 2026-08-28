// SmartEase Properties — home page interactivity only.
try {
  const unitTabs = document.querySelectorAll('.unit-tab');
  const unitPanels = document.querySelectorAll('.unit-panel');
  unitTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      unitTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
      const u = tab.dataset.unit;
      unitPanels.forEach(p => p.classList.toggle('active', p.dataset.unit === u));
    });
  });
} catch (err) { console.error('unit tabs setup failed', err); }

try {
  const specRows = document.querySelectorAll('.spec-row');
  const specImgs = document.querySelectorAll('.simg');
  specRows.forEach(row => {
    row.addEventListener('click', () => {
      specRows.forEach(r => r.classList.remove('active'));
      row.classList.add('active');
      const imgIdx = row.dataset.simg;
      specImgs.forEach(s => s.classList.toggle('active', s.dataset.simg === imgIdx));
    });
    row.addEventListener('mouseenter', () => row.click());
  });
} catch (err) { console.error('spec index setup failed', err); }

try {
  const pathTabs = document.querySelectorAll('.path-tab');
  const pathPanels = document.querySelectorAll('.path-panel');
  pathTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const path = tab.dataset.path;
      pathTabs.forEach(t => { const on = t.dataset.path === path; t.classList.toggle('active', on); t.setAttribute('aria-selected', on); });
      pathPanels.forEach(p => p.classList.toggle('active', p.dataset.path === path));
    });
  });
} catch (err) { console.error('services paths setup failed', err); }
