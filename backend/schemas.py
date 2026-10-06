from pydantic import BaseModel

class QuestionCreate(BaseModel):
    question: str
    answer: str
    topic: str
    difficulty: str

class QuestionUpdate(BaseModel):
    question: str
    answer: str
    topic: str
    difficulty: str
    completed: bool

class QuestionResponse(BaseModel):
    id: int
    question: str
    answer: str
    topic: str
    difficulty: str
    completed: bool

    class Config:
        from_attributes = True
