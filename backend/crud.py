from sqlalchemy.orm import Session

import models, schemas

def create_question(db: Session, question: schemas.QuestionCreate):
    db_question = models.Question(
        question=question.question,
        answer=question.answer,
        topic=question.topic,
        difficulty=question.difficulty,
        completed=False
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

def get_question_by_id(db: Session, question_id: int):
    return db.query(models.Question).filter(models.Question.id == question_id).first()

def get_all_questions(db: Session):
    return db.query(models.Question).all()

def update_question(db: Session, question_id: int, question: schemas.QuestionUpdate):
    db_question = get_question_by_id(db, question_id)
    if  db_question:
        db_question.question = question.question
        db_question.answer = question.answer
        db_question.topic = question.topic
        db_question.difficulty = question.difficulty
        db_question.completed = question.completed
        db.commit()
        db.refresh(db_question)
    return db_question

def delete_question(db: Session, question_id: int):
    db_question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if db_question:
        db.delete(db_question)
        db.commit()
    return db_question

def mark_question_completed(db: Session, question_id: int):
    db_question = get_question_by_id(db, question_id)
    if db_question:
        db_question.completed = True
        db.commit()
        db.refresh(db_question)
    return db_question

def search_questions(db: Session,keyword: str):
    return (
        db.query(models.Question).filter(models.Question.question.contains(keyword)).all()
    )

def filter_by_topic(db: Session, topic: str):
    return db.query(models.Question).filter(models.Question.topic == topic).all()




