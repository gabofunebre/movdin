import { fetchAccountBalances } from './api.js';
import { showOverlay, hideOverlay } from './ui.js';

const tbody = document.querySelector('#totals-table tbody');
const refreshBtn = document.getElementById('refresh-totals');

function renderTotals(data) {
  tbody.innerHTML = '';
  data.forEach(acc => {
    const tr = document.createElement('tr');
    tr.classList.add('text-center');
    const total = Number(acc.balance).toFixed(2);
    tr.innerHTML = `<td>${acc.name}</td><td>${total}</td>`;
    tbody.appendChild(tr);
  });
}

async function loadTotals() {
  showOverlay();
  const data = await fetchAccountBalances();
  renderTotals(data);
  hideOverlay();
}

refreshBtn.addEventListener('click', loadTotals);

loadTotals();
