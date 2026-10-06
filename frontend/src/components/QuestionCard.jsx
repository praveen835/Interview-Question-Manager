import { useState } from "react";

function ArrowIcon({ open }) {
  return (
    <svg
      aria-hidden="true"
      className={open ? "answer-chevron is-open" : "answer-chevron"}
      viewBox="0 0 16 16"
      fill="none"
    >
      <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function QuestionCard({ question, index, onEdit, onDelete, onToggle }) {
  const [answerOpen, setAnswerOpen] = useState(false);
  const topicInitial = question.topic?.trim().charAt(0).toUpperCase() || "Q";

  return (
    <article className={`question-card reveal ${question.completed ? "question-completed" : ""}`}>
      <div className="question-card-core">
        <div className="question-card-meta">
          <div className="question-tags">
            <span className="topic-tag">
              <span className="topic-dot">{topicInitial}</span>
              {question.topic}
            </span>
            <span className={`difficulty-tag difficulty-${question.difficulty?.toLowerCase() || "medium"}`}>
              {question.difficulty}
            </span>
          </div>
          <span className="question-number">Q{String(index + 1).padStart(2, "0")}</span>
        </div>

        <h3 className="question-title">{question.question}</h3>

        <button
          aria-expanded={answerOpen}
          className="answer-toggle"
          onClick={() => setAnswerOpen((open) => !open)}
        >
          <span>{answerOpen ? "Close answer" : "Reveal answer"}</span>
          <ArrowIcon open={answerOpen} />
        </button>

        {answerOpen && (
          <div className="answer-panel">
            <span className="answer-label">Your notes</span>
            <p>{question.answer}</p>
          </div>
        )}

        <div className="question-card-footer">
          <button
            aria-pressed={question.completed}
            className={`mastery-button ${question.completed ? "is-mastered" : ""}`}
            onClick={() => onToggle(question)}
          >
            <span className="mastery-check" aria-hidden="true">{question.completed ? "✓" : ""}</span>
            {question.completed ? "Mastered" : "Mark as mastered"}
          </button>
          <div className="card-actions">
            <button aria-label="Edit question" className="icon-button" onClick={() => onEdit(question)}>
              <svg aria-hidden="true" viewBox="0 0 18 18" fill="none">
                <path d="m11.8 3.2 3 3M3 15l3.4-.7 8.1-8.1a2.1 2.1 0 0 0-3-3l-8.1 8.1L3 15Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button aria-label="Delete question" className="icon-button delete-button" onClick={() => onDelete(question)}>
              <svg aria-hidden="true" viewBox="0 0 18 18" fill="none">
                <path d="M3.5 5h11M7 5V3.5h4V5m2.5 0-.7 9H5.2l-.7-9m3.2 2.5v4m3-4v4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
