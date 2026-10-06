import os

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

import models, schemas, crud
from database import engine, get_db,Base

from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Interview Question Manager", description="API for managing interview questions", version="1.0.0")

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://127.0.0.1:5173,http://localhost:5173,http://127.0.0.1:4173,http://localhost:4173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Welcome to the Interview Question Manager API!"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}

@app.post("/questions/", response_model=schemas.QuestionResponse)
def create_question(question: schemas.QuestionCreate, db: Session = Depends(get_db)):
    return crud.create_question(db=db, question=question)

@app.get("/questions/{question_id}", response_model=schemas.QuestionResponse)
def read_question(question_id: int, db: Session = Depends(get_db)):
    db_question = crud.get_question_by_id(db, question_id=question_id)
    if db_question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    return db_question

@app.get("/questions/", response_model=list[schemas.QuestionResponse])
def read_all_questions(db: Session = Depends(get_db)):
    return crud.get_all_questions(db=db)

@app.put("/questions/{question_id}", response_model=schemas.QuestionResponse)
def update_question(question_id: int, question: schemas.QuestionUpdate, db: Session = Depends
(get_db)):
    db_question = crud.update_question(db, question_id=question_id, question=question)
    if db_question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    return db_question

@app.delete("/questions/{question_id}", response_model=schemas.QuestionResponse)
def delete_question(question_id: int, db: Session = Depends(get_db)):
    db_question = crud.delete_question(db, question_id=question_id)
    if db_question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    return db_question

@app.patch("/questions/{question_id}/complete", response_model=schemas.QuestionResponse)
def mark_question_completed(question_id: int, db: Session = Depends(get_db)):
    db_question = crud.mark_question_completed(db, question_id=question_id)
    if db_question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    return db_question

@app.get("/questions/search/", response_model=list[schemas.QuestionResponse])
def search_questions(keyword: str, db: Session = Depends(get_db)):
    return crud.search_questions(db, keyword=keyword)

@app.get("/questions/filter/", response_model=list[schemas.QuestionResponse])
def filter_questions_by_topic(topic: str, db: Session = Depends(get_db)):
    return crud.filter_by_topic(db, topic=topic)
