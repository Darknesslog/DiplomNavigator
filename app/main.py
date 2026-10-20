from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db import Base, engine, get_db

app = FastAPI(title="DiplomNavigator API")

@app.on_event("startup")
def on_startup():
    # Создаем таблицы, если их нет (без миграций, как вы и просили)
    Base.metadata.create_all(bind=engine)

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        # Простейший запрос для проверки, что БД жива
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": str(e)}