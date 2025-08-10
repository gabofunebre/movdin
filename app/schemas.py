from pydantic import BaseModel
from datetime import date
from decimal import Decimal

from config.constants import Currency

class AccountIn(BaseModel):
    name: str
    opening_balance: Decimal = 0
    currency: Currency
    is_active: bool = True

class AccountOut(AccountIn):
    id: int
    class Config:
        from_attributes = True

class TransactionCreate(BaseModel):
    account_id: int
    date: date
    description: str = ""
    amount: Decimal
    notes: str = ""


class TransactionOut(BaseModel):
    id: int
    account_id: int
    date: date
    description: str
    amount: Decimal
    notes: str

    class Config:
        from_attributes = True


class TransactionWithBalance(TransactionOut):
    running_balance: Decimal


class AccountBalance(BaseModel):
    account_id: int
    name: str
    currency: Currency
    balance: Decimal


class BalanceOut(BaseModel):
    balance: Decimal
