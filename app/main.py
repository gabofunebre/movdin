from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import List, Dict

from .db import Base, engine, get_db
from .models import Account, Transaction
from .schemas import AccountIn, AccountOut, TxIn, TxOut

app = FastAPI(title="Movimientos")

# Crear tablas si no existen (mínimo para arrancar)
Base.metadata.create_all(bind=engine)

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/accounts", response_model=AccountOut)
def create_account(payload: AccountIn, db: Session = Depends(get_db)):
    acc = Account(**payload.dict())
    db.add(acc)
    db.commit()
    db.refresh(acc)
    return acc

@app.get("/accounts", response_model=List[AccountOut])
def list_accounts(db: Session = Depends(get_db)):
    rows = db.scalars(select(Account).order_by(Account.name)).all()
    return rows

@app.post("/transactions", response_model=TxOut)
def create_tx(payload: TxIn, db: Session = Depends(get_db)):
    tx = Transaction(**payload.dict())
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx

@app.get("/transactions", response_model=List[TxOut])
def list_txs(from_: str | None = None, to: str | None = None, account_id: int | None = None, db: Session = Depends(get_db)):
    q = select(Transaction)
    if account_id:
        q = q.where(Transaction.account_id == account_id)
    if from_:
        q = q.where(Transaction.date >= from_)
    if to:
        q = q.where(Transaction.date <= to)
    q = q.order_by(Transaction.date.desc(), Transaction.id.desc())
    return db.scalars(q).all()

@app.get("/balances")
def balances(db: Session = Depends(get_db)) -> Dict[str, float]:
    rows = db.execute(
        select(Account.name, (func.coalesce(func.sum(Transaction.amount), 0) + Account.opening_balance))
        .join(Transaction, isouter=True)
        .group_by(Account.id)
        .order_by(Account.name)
    ).all()
    return {name: float(total) for name, total in rows}
