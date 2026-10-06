from sqlalchemy import Column, Integer, String,Text,Boolean

from database import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String,nullable=False)
    answer = Column(Text, nullable=False)
    topic = Column(String(50), nullable=False)
    difficulty = Column(String(20), nullable=False)
    completed = Column(Boolean, default=False)
    