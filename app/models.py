from sqlalchemy import Column, Integer, String, Numeric, Boolean, Date, ForeignKey, Text, func
from sqlalchemy.orm import relationship, Mapped, mapped_column
# Allow using the models both as part of a package or standalone module
try:  # pragma: no cover
    from .db import Base
except ImportError:  # pragma: no cover
    from db import Base

class Account(Base):
    __tablename__ = "accounts"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    opening_balance: Mapped[float] = mapped_column(Numeric(12,2), default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at = mapped_column(server_default=func.now())

    transactions = relationship("Transaction", back_populates="account")

class Transaction(Base):
    __tablename__ = "transactions"
    id: Mapped[int] = mapped_column(primary_key=True)
    date = mapped_column(Date, nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    amount: Mapped[float] = mapped_column(Numeric(12,2), nullable=False)
    notes: Mapped[str] = mapped_column(Text, default="")
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), nullable=False)
    created_at = mapped_column(server_default=func.now())

    account = relationship("Account", back_populates="transactions")
