const tbody = document.querySelector('#tx-table tbody');
const container = document.getElementById('table-container');
let offset = 0;
const limit = 50;
let loading = false;
let accounts = [];
let accountMap = {};

async function fetchAccounts() {
    const res = await fetch('/accounts');
    accounts = await res.json();
    accountMap = Object.fromEntries(accounts.map(a => [a.id, a.name]));
}

function renderTx(tx) {
    const tr = document.createElement('tr');
    const tipo = tx.amount >= 0 ? 'Ingreso' : 'Egreso';
    const amount = Math.abs(tx.amount).toFixed(2);
    tr.innerHTML = `<td>${tx.date}</td><td>${tx.description}</td><td>${amount}</td><td>${tipo}</td><td>${accountMap[tx.account_id] || ''}</td>`;
    tbody.appendChild(tr);
}

async function loadMore() {
    if (loading) return;
    loading = true;
    const res = await fetch(`/transactions?limit=${limit}&offset=${offset}`);
    const data = await res.json();
    data.forEach(renderTx);
    offset += data.length;
    loading = false;
}

container.addEventListener('scroll', () => {
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
        loadMore();
    }
});

function openModal(type) {
    const modal = document.getElementById('modal');
    const form = document.getElementById('tx-form');
    form.reset();
    document.getElementById('form-title').textContent = type === 'income' ? 'Nuevo Ingreso' : 'Nuevo Egreso';
    const select = form.account_id;
    select.innerHTML = '';
    accounts.forEach(acc => {
        const opt = document.createElement('option');
        opt.value = acc.id;
        opt.textContent = acc.name;
        select.appendChild(opt);
    });
    form.dataset.type = type;
    modal.style.display = 'flex';
}

document.getElementById('add-income').onclick = () => openModal('income');
document.getElementById('add-expense').onclick = () => openModal('expense');
document.getElementById('cancel-btn').onclick = () => document.getElementById('modal').style.display = 'none';

document.getElementById('tx-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    let amount = parseFloat(data.get('amount'));
    if (form.dataset.type === 'expense') amount = -Math.abs(amount);
    else amount = Math.abs(amount);
    const payload = {
        date: data.get('date'),
        description: data.get('description'),
        amount: amount,
        notes: '',
        account_id: parseInt(data.get('account_id'), 10)
    };
    await fetch('/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    document.getElementById('modal').style.display = 'none';
    tbody.innerHTML = '';
    offset = 0;
    await loadMore();
});

// config button placeholder
 document.getElementById('config-btn').onclick = () => alert('Configuración no implementada');

(async function init() {
    await fetchAccounts();
    await loadMore();
})();
