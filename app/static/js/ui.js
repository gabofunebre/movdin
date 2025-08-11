export function renderTransaction(tbody, tx, accountMap) {
  const tr = document.createElement('tr');
  const isIncome = tx.amount >= 0;
  tr.classList.add(isIncome ? 'fw-bold' : 'fst-italic');
  const tipo = isIncome ? 'Ingreso' : 'Egreso';
  const amount = Math.abs(tx.amount).toFixed(2);
  tr.innerHTML =
    `<td>${tx.date}</td>` +
    `<td>${tx.description}</td>` +
    `<td>${amount}</td>` +
    `<td>${tipo}</td>` +
    `<td>${accountMap[tx.account_id] || ''}</td>`;
  tbody.appendChild(tr);
}

export function populateAccounts(select, accounts) {
  select.innerHTML = '';
  accounts.forEach(acc => {
    const opt = document.createElement('option');
    opt.value = acc.id;
    opt.textContent = `${acc.name} (${acc.currency})`;
    select.appendChild(opt);
  });
}

export function renderAccount(tbody, account) {
  const tr = document.createElement('tr');
  tr.innerHTML =
    `<td>${account.name}</td>` +
    `<td>${account.currency}</td>` +
    `<td>${Number(account.opening_balance).toFixed(2)}</td>`;
  tbody.appendChild(tr);
}

const overlayEl = document.getElementById('overlay');

export function showOverlay() {
  overlayEl.classList.remove('d-none');
}

export function hideOverlay() {
  overlayEl.classList.add('d-none');
}
