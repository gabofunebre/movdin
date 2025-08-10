from fastapi import Depends, FastAPI
from fastapi.staticfiles import StaticFiles
from sqlalchemy import and_, bindparam, func, select
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from pathlib import Path
from db import get_db, init_db
from models import Account, Transaction
from schemas import (
    AccountIn,
    AccountOut,
    TransactionCreate,
    TransactionOut,
    TransactionWithBalance,
    AccountBalance,
    BalanceOut,
)

app = FastAPI(title="Movimientos")


@app.on_event("startup")
def on_startup() -> None:
    init_db()

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

@app.post("/transactions", response_model=TransactionOut)
def create_tx(payload: TransactionCreate, db: Session = Depends(get_db)):
    data = payload.dict()
    amount = data.pop("amount")
    kind = data.pop("kind")
    signed = -abs(amount) if kind == "egreso" else abs(amount)
    tx = Transaction(amount=signed, **data)
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx

@app.get("/accounts/balances", response_model=List[AccountBalance])
def account_balances(to_date: date | None = None, db: Session = Depends(get_db)):
    to_date = to_date or date.max
    stmt = (
        select(
            Account.id,
            Account.name,
            Account.currency,
            (Account.opening_balance + func.coalesce(func.sum(Transaction.amount), 0)).label("balance"),
        )
        .select_from(Account)
        .join(
            Transaction,
            and_(
                Transaction.account_id == Account.id,
                Transaction.date <= bindparam("to_date"),
            ),
            isouter=True,
        )
        .where(Account.is_active == True)
        .group_by(Account.id, Account.name, Account.opening_balance, Account.currency)
        .order_by(Account.name)
    )
    rows = db.execute(stmt, {"to_date": to_date}).all()
    return [
        AccountBalance(
            account_id=r.id,
            name=r.name,
            currency=r.currency,
            balance=r.balance,
        )
        for r in rows
    ]


@app.get("/accounts/{account_id}/balance", response_model=BalanceOut)
def account_balance(account_id: int, to_date: date | None = None, db: Session = Depends(get_db)):
    to_date = to_date or date.max
    stmt = (
        select((Account.opening_balance + func.coalesce(func.sum(Transaction.amount), 0)).label("balance"))
        .select_from(Account)
        .join(
            Transaction,
            and_(
                Transaction.account_id == Account.id,
                Transaction.date <= bindparam("to_date"),
            ),
            isouter=True,
        )
        .where(Account.id == bindparam("account_id"))
        .group_by(Account.id, Account.opening_balance)
    )
    row = db.execute(stmt, {"account_id": account_id, "to_date": to_date}).one()
    return BalanceOut(balance=row.balance)


@app.get("/accounts/{account_id}/transactions", response_model=List[TransactionWithBalance])
def account_transactions(
    account_id: int,
    from_: date | None = None,
    to: date | None = None,
    db: Session = Depends(get_db),
):
    stmt = (
        select(
            Transaction.id,
            Transaction.account_id,
            Transaction.date,
            Transaction.description,
            Transaction.amount,
            Transaction.notes,
            func.sum(Transaction.amount)
            .over(
                partition_by=Transaction.account_id,
                order_by=(Transaction.date, Transaction.id),
            )
            .label("running_balance"),
        )
        .where(Transaction.account_id == account_id)
    )
    if from_:
        stmt = stmt.where(Transaction.date >= from_)
    if to:
        stmt = stmt.where(Transaction.date <= to)
    stmt = stmt.order_by(Transaction.date, Transaction.id)
    rows = db.execute(stmt).all()
    return [
        TransactionWithBalance(
            id=r.id,
            account_id=r.account_id,
            date=r.date,
            description=r.description,
            amount=r.amount,
            notes=r.notes,
            running_balance=r.running_balance,
        )
        for r in rows
    ]

app.mount(
    "/",
    StaticFiles(directory=Path(__file__).parent / "static", html=True),
    name="static",
)
