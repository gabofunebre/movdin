export async function fetchAccounts() {
  const res = await fetch('/accounts');
  return res.json();
}

export async function fetchTransactions(limit, offset) {
  const res = await fetch(`/transactions?limit=${limit}&offset=${offset}`);
  return res.json();
}

export async function createTransaction(payload) {
  const res = await fetch('/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.ok;
}

export async function createAccount(payload) {
  const res = await fetch('/accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.ok;
}
