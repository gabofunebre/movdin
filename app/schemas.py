from pydantic import BaseModel
from datetime import date
from app.constants import Currency

class AccountIn(BaseModel):
    name: str
    opening_balance: float = 0.0
    currency: Currency
    is_active: bool = True

class AccountOut(AccountIn):
    id: int
    class Config:
        from_attributes = True

class TxIn(BaseModel):
    date: date
    description: str = ""
    amount: float
    notes: str = ""
    account_id: int

class TxOut(TxIn):
    id: int
    class Config:
        from_attributes = True
