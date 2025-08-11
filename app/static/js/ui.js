export function renderTransaction(tbody, tx, accountMap) {
  const tr = document.createElement('tr');
  const isIncome = tx.amount >= 0;
  tr.classList.add(isIncome ? 'fw-bold' : 'fst-italic');
  const tipo = isIncome ? 'Ingreso' : 'Egreso';
  const amount = Math.abs(tx.amount).toFixed(2);
  const acc = accountMap[tx.account_id];
  const accName = acc ? acc.name : '';
  const accColor = acc ? acc.color : '';
  tr.innerHTML =
    `<td>${tx.date}</td>` +
    `<td>${tx.description}</td>` +
    `<td>${amount}</td>` +
    `<td>${tipo}</td>` +
    `<td style="color:${accColor}">${accName}</td>`;
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

export function renderAccount(tbody, account, onEdit, onDelete) {
  const tr = document.createElement('tr');
  tr.innerHTML =
    `<td>${account.name}</td>` +
    `<td>${account.currency}</td>` +
    `<td class="text-nowrap">` +
    `<button class="btn btn-sm btn-outline-secondary me-2" title="Editar"><i class="bi bi-pencil"></i></button>` +
    `<button class="btn btn-sm btn-outline-danger" title="Eliminar"><i class="bi bi-x"></i></button>` +
    `</td>`;
  const [editBtn, delBtn] = tr.querySelectorAll('button');
  if (onEdit) editBtn.addEventListener('click', () => onEdit(account));
  if (onDelete) delBtn.addEventListener('click', () => onDelete(account));
  tbody.appendChild(tr);
}

const overlayEl = document.getElementById('overlay');

export function showOverlay() {
  overlayEl.classList.remove('d-none');
}

export function hideOverlay() {
  overlayEl.classList.add('d-none');
}
