import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardStats from "./components/DashboardStats.jsx";
import Header from "./components/Header.jsx";
import QuestionCard from "./components/QuestionCard.jsx";
import QuestionForm from "./components/QuestionForm.jsx";
import SearchBar from "./components/SearchBar.jsx";
import TopicFilter from "./components/TopicFilter.jsx";

const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const PAGE_SIZE = 8;

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(`Could not reach the API at ${API_URL}. Check that your backend is running.`);
  }

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (typeof body.detail === "string") detail = body.detail;
      else if (Array.isArray(body.detail)) {
        detail = body.detail.map((item) => item.msg).join(", ");
      }
    } catch {
      // Keep the HTTP status message when the server does not return JSON.
    }
    throw new Error(detail);
  }

  if (response.status === 204) return null;
  return response.json();
}

function EmptyState({ hasFilters, onCreate, onReset }) {
  return (
    <div className="empty-state">
      <span className="empty-emblem" aria-hidden="true">✳</span>
      <span className="eyebrow">{hasFilters ? "A quiet corner" : "A fresh page"}</span>
      <h3>{hasFilters ? "Nothing matches just yet." : "Your next great answer starts here."}</h3>
      <p>
        {hasFilters
          ? "Try a different search or clear a filter to see more of your library."
          : "Save the questions you want to understand deeply, then revisit them whenever you like."}
      </p>
      {hasFilters ? (
        <button className="button button-light" onClick={onReset}>Clear filters</button>
      ) : (
        <button className="button button-dark" onClick={onCreate}>
          <span>Add your first question</span>
          <span className="button-orb" aria-hidden="true">↗</span>
        </button>
      )}
    </div>
  );
}

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const result = await request("/questions/");
      setQuestions(result);
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    function handleSlashShortcut(event) {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) return;
      event.preventDefault();
      document.querySelector('input[type="search"]')?.focus();
    }
    window.addEventListener("keydown", handleSlashShortcut);
    return () => window.removeEventListener("keydown", handleSlashShortcut);
  }, []);

  const topics = useMemo(
    () => [...new Set(questions.map((question) => question.topic).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [questions],
  );

  const visibleQuestions = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return questions.filter((question) => {
      const matchesSearch = !query || [question.question, question.answer, question.topic, question.difficulty]
        .some((value) => value?.toLocaleLowerCase().includes(query));
      const matchesTopic = selectedTopic === "all" || question.topic === selectedTopic;
      const matchesStatus = selectedStatus === "all"
        || (selectedStatus === "completed" ? question.completed : !question.completed);
      return matchesSearch && matchesTopic && matchesStatus;
    });
  }, [questions, search, selectedTopic, selectedStatus]);

  const pageCount = Math.max(1, Math.ceil(visibleQuestions.length / PAGE_SIZE));
  const activePage = Math.min(currentPage, pageCount);
  const pageQuestions = useMemo(() => {
    const start = (activePage - 1) * PAGE_SIZE;
    return visibleQuestions.slice(start, start + PAGE_SIZE);
  }, [activePage, visibleQuestions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedTopic, selectedStatus]);

  function openCreateForm() {
    setEditingQuestion(null);
    setFormError("");
    setIsFormOpen(true);
  }

  function openEditForm(question) {
    setEditingQuestion(question);
    setFormError("");
    setIsFormOpen(true);
  }

  function closeForm() {
    if (isSaving) return;
    setIsFormOpen(false);
    setEditingQuestion(null);
    setFormError("");
  }

  async function saveQuestion(payload) {
    setIsSaving(true);
    setFormError("");
    try {
      if (editingQuestion) {
        const updated = await request(`/questions/${editingQuestion.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setQuestions((current) => current.map((item) => item.id === updated.id ? updated : item));
        setNotice("Question updated. Your notes are in good shape.");
      } else {
        const created = await request("/questions/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setQuestions((current) => [created, ...current]);
        setNotice("Question saved to your library.");
      }
      setIsFormOpen(false);
      setEditingQuestion(null);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleMastery(question) {
    try {
      const updated = question.completed
        ? await request(`/questions/${question.id}`, {
          method: "PUT",
          body: JSON.stringify({ ...question, completed: false }),
        })
        : await request(`/questions/${question.id}/complete`, { method: "PATCH" });
      setQuestions((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNotice(updated.completed ? "Nicely done — marked as mastered." : "Moved back to your practice list.");
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function deleteQuestion(question) {
    if (!window.confirm("Remove this question from your library? This cannot be undone.")) return;
    try {
      await request(`/questions/${question.id}`, { method: "DELETE" });
      setQuestions((current) => current.filter((item) => item.id !== question.id));
      setNotice("Question removed from your library.");
    } catch (error) {
      setNotice(error.message);
    }
  }

  function clearFilters() {
    setSearch("");
    setSelectedTopic("all");
    setSelectedStatus("all");
    setCurrentPage(1);
  }

  const hasFilters = Boolean(search || selectedTopic !== "all" || selectedStatus !== "all");
  const firstVisibleQuestion = visibleQuestions.length ? (activePage - 1) * PAGE_SIZE + 1 : 0;
  const lastVisibleQuestion = Math.min(activePage * PAGE_SIZE, visibleQuestions.length);

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <div className="page-wrap">
        <Header onCreate={openCreateForm} />

        <main>
          <section className="welcome-section">
            <div className="welcome-copy reveal">
              <span className="eyebrow"><span className="eyebrow-spark">✳</span> Your personal practice space</span>
              <h1>Think it through.<br /><em>Know it by heart.</em></h1>
              <p className="welcome-description">
                A thoughtful home for the questions that move you forward.
                Collect, revisit, and make every answer your own.
              </p>
              <button className="button button-dark welcome-cta" onClick={openCreateForm}>
                <span>Write a new question</span>
                <span className="button-orb" aria-hidden="true">↗</span>
              </button>
            </div>

            <aside className="practice-note reveal" aria-label="Practice reminder">
              <div className="note-topline">
                <span className="note-stamp">A NOTE TO SELF</span>
                <svg aria-hidden="true" viewBox="0 0 40 40" fill="none">
                  <path d="M8 28.5 28.5 8m0 0H12m16.5-0v16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="note-quote">“Clarity comes from being willing to sit with the question.”</p>
              <span className="note-author">A LITTLE REMINDER FOR TODAY</span>
              <div className="note-decoration" aria-hidden="true">
                <span /><span /><span />
              </div>
            </aside>
          </section>

          <DashboardStats questions={questions} />

          <section className="library-section" aria-labelledby="library-title">
            <div className="library-heading reveal">
              <div>
                <span className="eyebrow">The collection</span>
                <h2 id="library-title">Your question library<span>.</span></h2>
              </div>
              <span className="library-count">
                {visibleQuestions.length
                  ? `${firstVisibleQuestion}–${lastVisibleQuestion} of ${visibleQuestions.length}`
                  : "0 questions"}
              </span>
            </div>

            <div className="library-tools reveal">
              <SearchBar value={search} onChange={setSearch} />
              <TopicFilter
                onStatusChange={setSelectedStatus}
                onTopicChange={setSelectedTopic}
                selectedStatus={selectedStatus}
                selectedTopic={selectedTopic}
                topics={topics}
              />
            </div>

            {loadError ? (
              <div className="load-error" role="alert">
                <span className="error-symbol" aria-hidden="true">!</span>
                <div>
                  <strong>We couldn’t open your library.</strong>
                  <p>{loadError}</p>
                </div>
                <button className="button button-light" onClick={loadQuestions}>Try again</button>
              </div>
            ) : isLoading ? (
              <div aria-label="Loading your questions" className="loading-grid" role="status">
                {[0, 1, 2].map((item) => <div className="skeleton-card" key={item} />)}
              </div>
            ) : visibleQuestions.length ? (
              <div className="questions-grid">
                {pageQuestions.map((question, index) => (
                  <QuestionCard
                    index={(activePage - 1) * PAGE_SIZE + index}
                    key={question.id}
                    onDelete={deleteQuestion}
                    onEdit={openEditForm}
                    onToggle={toggleMastery}
                    question={question}
                  />
                ))}
              </div>
            ) : (
              <EmptyState hasFilters={hasFilters} onCreate={openCreateForm} onReset={clearFilters} />
            )}
            {!isLoading && !loadError && pageCount > 1 && (
              <nav aria-label="Question pages" className="pagination">
                <button
                  className="page-button page-direction"
                  disabled={activePage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  <span aria-hidden="true">←</span> Previous
                </button>
                <div className="page-numbers">
                  {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                    <button
                      aria-current={activePage === page ? "page" : undefined}
                      aria-label={`Page ${page}`}
                      className={`page-button page-number ${activePage === page ? "is-current" : ""}`}
                      key={page}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  className="page-button page-direction"
                  disabled={activePage === pageCount}
                  onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                >
                  Next <span aria-hidden="true">→</span>
                </button>
              </nav>
            )}
          </section>
        </main>

        <footer className="site-footer">
          <span><span className="footer-mark">f.</span> A little more prepared, every day.</span>
          <span className="footer-right">MADE FOR THE MOMENT BEFORE YOU KNOW</span>
        </footer>
      </div>

      {notice && <div className="toast-message" role="status">{notice}</div>}
      <QuestionForm
        error={formError}
        isOpen={isFormOpen}
        isSaving={isSaving}
        onClose={closeForm}
        onSubmit={saveQuestion}
        question={editingQuestion}
      />
    </div>
  );
}
