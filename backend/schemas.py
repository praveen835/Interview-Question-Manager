from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints

QuestionText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=1000)]
AnswerText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=10000)]
TopicText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=50)]
DifficultyText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=20)]

class QuestionCreate(BaseModel):
    question: QuestionText
    answer: AnswerText
    topic: TopicText
    difficulty: DifficultyText

class QuestionUpdate(BaseModel):
    question: QuestionText
    answer: AnswerText
    topic: TopicText
    difficulty: DifficultyText
    completed: bool

class QuestionResponse(BaseModel):
    id: int
    question: str
    answer: str
    topic: str
    difficulty: str
    completed: bool

    model_config = ConfigDict(from_attributes=True)
