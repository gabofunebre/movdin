export function renderTransaction(tbody, tx, accountMap) {
  const tr = document.createElement('tr');
  const tipo = tx.amount >= 0 ? 'Ingreso' : 'Egreso';
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
    opt.textContent = acc.name;
    select.appendChild(opt);
  });
}
