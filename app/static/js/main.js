import { fetchAccounts, fetchTransactions, createTransaction } from './api.js';
import { renderTransaction, populateAccounts } from './ui.js';

const tbody = document.querySelector('#tx-table tbody');
const container = document.getElementById('table-container');
const modalEl = document.getElementById('txModal');
const txModal = new bootstrap.Modal(modalEl);
const form = document.getElementById('tx-form');
const alertBox = document.getElementById('tx-alert');

let offset = 0;
const limit = 50;
let loading = false;
let accounts = [];
let accountMap = {};

async function loadMore() {
  if (loading) return;
  loading = true;
  const data = await fetchTransactions(limit, offset);
  data.forEach(tx => renderTransaction(tbody, tx, accountMap));
  offset += data.length;
  loading = false;
}

function openModal(type) {
  form.reset();
  document.getElementById('form-title').textContent = type === 'income' ? 'Nuevo Ingreso' : 'Nuevo Egreso';
  populateAccounts(form.account_id, accounts);
  form.dataset.type = type;
  alertBox.classList.add('d-none');
  txModal.show();
}

document.getElementById('add-income').addEventListener('click', () => openModal('income'));
document.getElementById('add-expense').addEventListener('click', () => openModal('expense'));

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
  const ok = await createTransaction(payload);
  alertBox.classList.remove('d-none', 'alert-success', 'alert-danger');
  if (ok) {
    alertBox.classList.add('alert-success');
    alertBox.textContent = 'Movimiento guardado';
    tbody.innerHTML = '';
    offset = 0;
    await loadMore();
    setTimeout(() => {
      txModal.hide();
      alertBox.classList.add('d-none');
    }, 1000);
  } else {
    alertBox.classList.add('alert-danger');
    alertBox.textContent = 'Error al guardar';
  }
});

(async function init() {
  accounts = await fetchAccounts();
  accountMap = Object.fromEntries(accounts.map(a => [a.id, a.name]));
  await loadMore();
})();
