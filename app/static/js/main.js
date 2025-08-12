import { fetchAccounts, fetchTransactions, createTransaction } from './api.js';
import { renderTransaction, populateAccounts, showOverlay, hideOverlay } from './ui.js';

const tbody = document.querySelector('#tx-table tbody');
const container = document.getElementById('table-container');
const modalEl = document.getElementById('txModal');
const txModal = new bootstrap.Modal(modalEl);
const form = document.getElementById('tx-form');
const alertBox = document.getElementById('tx-alert');
const searchBox = document.getElementById('search-box');
const dateHeader = document.getElementById('date-header');

let offset = 0;
const limit = 50;
let loading = false;
let accounts = [];
let accountMap = {};
let transactions = [];
let sortAsc = false;

function renderTransactions() {
  const q = searchBox.value.trim().toLowerCase();
  const filtered = transactions.filter(tx => {
    const accName = accountMap[tx.account_id]?.name.toLowerCase() || '';
    return tx.description.toLowerCase().includes(q) || accName.includes(q);
  });
  filtered.sort((a, b) =>
    sortAsc
      ? new Date(a.date) - new Date(b.date)
      : new Date(b.date) - new Date(a.date)
  );
  tbody.innerHTML = '';
  filtered.forEach(tx => renderTransaction(tbody, tx, accountMap));
}

async function loadMore() {
  if (loading) return;
  loading = true;
  const data = await fetchTransactions(limit, offset);
  transactions = transactions.concat(data);
  offset += data.length;
  renderTransactions();
  loading = false;
}

function openModal(type) {
  form.reset();
  document.getElementById('form-title').textContent = type === 'income' ? 'Nuevo Ingreso' : 'Nuevo Egreso';
  populateAccounts(form.account_id, accounts.filter(a => a.is_active));
  form.dataset.type = type;
  alertBox.classList.add('d-none');
  const today = new Date().toISOString().split('T')[0];
  form.date.max = today;
  txModal.show();
}

document.getElementById('add-income').addEventListener('click', () => openModal('income'));
document.getElementById('add-expense').addEventListener('click', () => openModal('expense'));
searchBox.addEventListener('input', renderTransactions);
dateHeader.addEventListener('click', () => {
  sortAsc = !sortAsc;
  renderTransactions();
});

container.addEventListener('scroll', () => {
  if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
    loadMore();
  }
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  let amount = parseFloat(data.get('amount'));
  amount = form.dataset.type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
  const payload = {
    date: data.get('date'),
    description: data.get('description'),
    amount,
    notes: '',
    account_id: parseInt(data.get('account_id'), 10)
  };
  const today = new Date().toISOString().split('T')[0];
  if (payload.date > today) {
    alertBox.classList.remove('d-none', 'alert-success', 'alert-danger');
    alertBox.classList.add('alert-danger');
    alertBox.textContent = 'La fecha no puede ser futura';
    return;
  }

  showOverlay();
  const result = await createTransaction(payload);
  hideOverlay();
  alertBox.classList.remove('d-none', 'alert-success', 'alert-danger');
  if (result.ok) {
    alertBox.classList.add('alert-success');
    alertBox.textContent = 'Movimiento guardado';
    transactions = [];
    offset = 0;
    await loadMore();
    setTimeout(() => {
      txModal.hide();
      alertBox.classList.add('d-none');
    }, 1000);
  } else {
    alertBox.classList.add('alert-danger');
    alertBox.textContent = result.error || 'Error al guardar';
  }
});

(async function init() {
  accounts = await fetchAccounts(true);
  accountMap = Object.fromEntries(accounts.map(a => [a.id, a]));
  await loadMore();
})();
