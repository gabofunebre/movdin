import { fetchAccounts, createAccount, updateAccount, deleteAccount } from './api.js';
import { renderAccount, showOverlay, hideOverlay } from './ui.js';
import { CURRENCIES } from './constants.js';

const tbody = document.querySelector('#account-table tbody');
const modalEl = document.getElementById('accountModal');
const accModal = new bootstrap.Modal(modalEl);
const form = document.getElementById('account-form');
const addBtn = document.getElementById('add-account');
const alertBox = document.getElementById('acc-alert');
const currencySelect = form.currency;
const idField = form.querySelector('input[name="id"]');
let accounts = [];

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
  idField.value = '';
  alertBox.classList.add('d-none');
  accModal.show();
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const existing = accounts.find(a => a.id === parseInt(idField.value, 10));
  const payload = {
    name: data.get('name'),
    currency: data.get('currency'),
    opening_balance: parseFloat(data.get('opening_balance') || '0'),
    is_active: true,
    color: existing ? existing.color : '#000000'
  };
  showOverlay();
  let result;
  if (idField.value) {
    result = await updateAccount(idField.value, payload);
  } else {
    result = await createAccount(payload);
  }
  hideOverlay();
  alertBox.classList.remove('d-none', 'alert-success', 'alert-danger');
  if (result.ok) {
    alertBox.classList.add('alert-success');
    alertBox.textContent = 'Cuenta guardada';
    tbody.innerHTML = '';
    await loadAccounts();
  } else {
    alertBox.classList.add('alert-danger');
    alertBox.textContent = result.error || 'Error al guardar';
  }
});

async function loadAccounts() {
  accounts = await fetchAccounts();
  accounts.forEach(acc => renderAccount(tbody, acc, startEdit, removeAccount, changeColor));
}


function startEdit(acc) {
  form.reset();
  populateCurrencies();
  form.name.value = acc.name;
  form.currency.value = acc.currency;
  form.opening_balance.value = acc.opening_balance;
  idField.value = acc.id;
  alertBox.classList.add('d-none');
  accModal.show();
}

async function removeAccount(acc) {
  if (!confirm('¿Eliminar cuenta?')) return;
  showOverlay();
  const result = await deleteAccount(acc.id);
  hideOverlay();
  if (result.ok) {
    tbody.innerHTML = '';
    await loadAccounts();
  } else {
    alert(result.error || 'Error al eliminar');
  }
}

async function changeColor(acc, color) {
  const payload = {
    name: acc.name,
    currency: acc.currency,
    opening_balance: acc.opening_balance,
    is_active: acc.is_active,
    color
  };
  showOverlay();
  const result = await updateAccount(acc.id, payload);
  hideOverlay();
  if (result.ok) {
    acc.color = color;
  } else {
    alert(result.error || 'Error al guardar color');
  }
}

loadAccounts();
