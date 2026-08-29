const frame = document.querySelector('#graph-frame');
const note = document.querySelector('#graph-note');
const tabs = document.querySelectorAll('[data-graph]');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
    });
    frame.src = tab.dataset.graph;
    note.textContent = tab.dataset.graph.includes('filtered')
      ? '50 × 50 mm analysis window: 55 points retained. The 73-record master dataset is unchanged; the measured hook remains ★ at (6.45, 8.16).'
      : 'Full master dataset: all 73 reference bells. The measured hook is shown as ★ at (6.45, 8.16).';
  });
});
