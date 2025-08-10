import { fetchAccounts, createAccount } from './api.js';
import { renderAccount } from './ui.js';
import { CURRENCIES } from './constants.js';

const tbody = document.querySelector('#account-table tbody');
const modalEl = document.getElementById('accountModal');
const accModal = new bootstrap.Modal(modalEl);
const form = document.getElementById('account-form');
const addBtn = document.getElementById('add-account');
const alertBox = document.getElementById('acc-alert');
const currencySelect = form.currency;

function populateCurrencies() {
  currencySelect.innerHTML = '';
  CURRENCIES.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    currencySelect.appendChild(opt);
  });
}

addBtn.addEventListener('click', () => {
  form.reset();
  populateCurrencies();
  alertBox.classList.add('d-none');
  accModal.show();
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const payload = {
    name: data.get('name'),
    currency: data.get('currency'),
    opening_balance: parseFloat(data.get('opening_balance') || '0'),
    is_active: true
  };
  const ok = await createAccount(payload);
  alertBox.classList.remove('d-none', 'alert-success', 'alert-danger');
  if (ok) {
    alertBox.classList.add('alert-success');
    alertBox.textContent = 'Cuenta guardada';
    tbody.innerHTML = '';
    await loadAccounts();
  } else {
    alertBox.classList.add('alert-danger');
    alertBox.textContent = 'Error al guardar';
  }
});

async function loadAccounts() {
  const accounts = await fetchAccounts();
  accounts.forEach(acc => renderAccount(tbody, acc));
}

loadAccounts();
