import { useEffect, useState } from "react";

const emptyForm = {
  question: "",
  answer: "",
  topic: "",
  difficulty: "Medium",
};

export default function QuestionForm({
  isOpen,
  question,
  isSaving,
  error,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setForm(question ? {
      question: question.question,
      answer: question.answer,
      topic: question.topic,
      difficulty: question.difficulty,
    } : emptyForm);
  }, [question, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    function handleKeyDown(event) {
      if (event.key === "Escape" && !isSaving) onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  if (!isOpen) return null;

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      question: form.question.trim(),
      answer: form.answer.trim(),
      topic: form.topic.trim(),
      completed: question?.completed ?? false,
    });
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <section
        aria-labelledby="question-form-title"
        aria-modal="true"
        className="question-modal"
        role="dialog"
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">Your question library</span>
            <h2 id="question-form-title">
              {question ? "Refine your notes." : "Capture a question."}
            </h2>
            <p>A good answer starts with a question worth keeping.</p>
          </div>
          <button
            aria-label="Close form"
            className="icon-button modal-close"
            disabled={isSaving}
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <form className="question-form" onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="question">
            Question
            <textarea
              autoFocus
              id="question"
              maxLength={1000}
              name="question"
              onChange={updateField}
              placeholder="e.g. How does a hash map handle collisions?"
              required
              rows={3}
              value={form.question}
            />
          </label>
          <label className="field-label" htmlFor="answer">
            Your answer
            <textarea
              id="answer"
              maxLength={10000}
              name="answer"
              onChange={updateField}
              placeholder="Write down the explanation you want to remember..."
              required
              rows={5}
              value={form.answer}
            />
          </label>
          <div className="field-pair">
            <label className="field-label" htmlFor="topic">
              Topic
              <input
                id="topic"
                maxLength={50}
                name="topic"
                onChange={updateField}
                placeholder="e.g. Data structures"
                required
                value={form.topic}
              />
            </label>
            <label className="field-label" htmlFor="difficulty">
              Difficulty
              <select
                id="difficulty"
                name="difficulty"
                onChange={updateField}
                value={form.difficulty}
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </label>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button className="button button-quiet" disabled={isSaving} onClick={onClose} type="button">
              Cancel
            </button>
            <button className="button button-dark" disabled={isSaving} type="submit">
              <span>{isSaving ? "Saving..." : question ? "Save changes" : "Save question"}</span>
              {!isSaving && <span className="button-orb" aria-hidden="true">↗</span>}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
