import { fetchAccounts, createAccount, updateAccount, deleteAccount, fetchTaxes, createTax, updateTax, deleteTax } from './api.js';
import { renderAccount, renderTax, showOverlay, hideOverlay } from './ui.js';
import { CURRENCIES } from './constants.js';

const tbody = document.querySelector('#account-table tbody');
const modalEl = document.getElementById('accountModal');
const accModal = new bootstrap.Modal(modalEl);
const form = document.getElementById('account-form');
const addBtn = document.getElementById('add-account');
const alertBox = document.getElementById('acc-alert');
const currencySelect = form.currency;
const idField = form.querySelector('input[name="id"]');
const colorInput = form.querySelector('input[name="color"]');
const colorBtn = document.getElementById('color-btn');
const modalTitle = modalEl.querySelector('.modal-title');
let accounts = [];
const confirmEl = document.getElementById('confirmModal');
const confirmModal = new bootstrap.Modal(confirmEl);
const confirmMessage = confirmEl.querySelector('#confirm-message');
const confirmBtn = confirmEl.querySelector('#confirm-yes');
let accountToDelete = null;

const taxTbody = document.querySelector('#tax-table tbody');
const taxModalEl = document.getElementById('taxModal');
const taxModal = new bootstrap.Modal(taxModalEl);
const taxForm = document.getElementById('tax-form');
const addTaxBtn = document.getElementById('add-tax');
const taxAlertBox = document.getElementById('tax-alert');
const taxIdField = taxForm.querySelector('input[name="id"]');
const taxModalTitle = taxModalEl.querySelector('.modal-title');
let taxes = [];
const taxConfirmEl = document.getElementById('confirmTaxModal');
const taxConfirmModal = new bootstrap.Modal(taxConfirmEl);
const taxConfirmMessage = taxConfirmEl.querySelector('#confirm-tax-message');
const taxConfirmBtn = taxConfirmEl.querySelector('#confirm-tax-yes');
let taxToDelete = null;

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
    colorInput.value = '#000000';
    colorBtn.style.color = '#000000';
    modalTitle.textContent = 'Nueva cuenta';
    accModal.show();
  });

  colorBtn.addEventListener('click', () => {
    const rect = colorBtn.getBoundingClientRect();
    colorInput.style.left = `${rect.left}px`;
    colorInput.style.top = `${rect.bottom}px`;
    colorInput.click();
  });

colorInput.addEventListener('input', e => {
  colorBtn.style.color = e.target.value;
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const payload = {
    name: data.get('name'),
    currency: data.get('currency'),
    opening_balance: parseFloat(data.get('opening_balance') || '0'),
    is_active: true,
    color: data.get('color') || '#000000'
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
  accounts.forEach(acc => renderAccount(tbody, acc, startEdit, removeAccount));
}


function startEdit(acc) {
  form.reset();
  populateCurrencies();
  form.name.value = acc.name;
  form.currency.value = acc.currency;
  form.opening_balance.value = acc.opening_balance;
  idField.value = acc.id;
  const color = acc.color || '#000000';
  colorInput.value = color;
  colorBtn.style.color = color;
  alertBox.classList.add('d-none');
  modalTitle.textContent = 'Editar cuenta';
  accModal.show();
}

async function removeAccount(acc) {
  accountToDelete = acc;
  confirmMessage.textContent = `¿Eliminar cuenta "${acc.name}"?`;
  confirmModal.show();
}

confirmBtn.addEventListener('click', async () => {
  if (!accountToDelete) return;
  confirmModal.hide();
  showOverlay();
  const result = await deleteAccount(accountToDelete.id);
  hideOverlay();
  if (result.ok) {
    tbody.innerHTML = '';
    await loadAccounts();
  } else {
    alert(result.error || 'Error al eliminar');
  }
  accountToDelete = null;
});

addTaxBtn.addEventListener('click', () => {
  taxForm.reset();
  taxIdField.value = '';
  taxAlertBox.classList.add('d-none');
  taxModalTitle.textContent = 'Nuevo impuesto';
  taxModal.show();
});

taxForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (!taxForm.reportValidity()) return;
  const data = new FormData(taxForm);
  const payload = {
    name: data.get('name'),
    rate: parseFloat(data.get('rate') || '0')
  };
  showOverlay();
  let result;
  if (taxIdField.value) {
    result = await updateTax(taxIdField.value, payload);
  } else {
    result = await createTax(payload);
  }
  hideOverlay();
  taxAlertBox.classList.remove('d-none', 'alert-success', 'alert-danger');
  if (result.ok) {
    taxAlertBox.classList.add('alert-success');
    taxAlertBox.textContent = 'Impuesto guardado';
    taxTbody.innerHTML = '';
    await loadTaxes();
  } else {
    taxAlertBox.classList.add('alert-danger');
    taxAlertBox.textContent = result.error || 'Error al guardar';
  }
});

async function loadTaxes() {
  taxes = await fetchTaxes();
  taxes.forEach(t => renderTax(taxTbody, t, startEditTax, removeTax));
}

function startEditTax(tax) {
  taxForm.reset();
  taxForm.name.value = tax.name;
  taxForm.rate.value = tax.rate;
  taxIdField.value = tax.id;
  taxAlertBox.classList.add('d-none');
  taxModalTitle.textContent = 'Editar impuesto';
  taxModal.show();
}

async function removeTax(tax) {
  taxToDelete = tax;
  taxConfirmMessage.textContent = `¿Eliminar impuesto "${tax.name}"?`;
  taxConfirmModal.show();
}

taxConfirmBtn.addEventListener('click', async () => {
  if (!taxToDelete) return;
  taxConfirmModal.hide();
  showOverlay();
  const result = await deleteTax(taxToDelete.id);
  hideOverlay();
  if (result.ok) {
    taxTbody.innerHTML = '';
    await loadTaxes();
  } else {
    alert(result.error || 'Error al eliminar');
  }
  taxToDelete = null;
});

loadAccounts();
loadTaxes();
