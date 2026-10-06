const stats = [
  { key: "total", label: "In your library", tone: "stat-ink" },
  { key: "completed", label: "Mastered", tone: "stat-sage" },
  { key: "remaining", label: "To revisit", tone: "stat-cream" },
  { key: "topics", label: "Topics covered", tone: "stat-lilac" },
];

export default function DashboardStats({ questions }) {
  const completed = questions.filter((question) => question.completed).length;
  const topicCount = new Set(questions.map((question) => question.topic)).size;
  const values = {
    total: questions.length,
    completed,
    remaining: questions.length - completed,
    topics: topicCount,
  };

  return (
    <section aria-label="Question library statistics" className="stats-grid">
      {stats.map((stat, index) => (
        <article
          className={`stat-card ${stat.tone} reveal`}
          key={stat.key}
          style={{ "--reveal-delay": `${index * 75}ms` }}
        >
          <div className="stat-card-top">
            <span className="stat-label">{stat.label}</span>
            <span className="stat-index">0{index + 1}</span>
          </div>
          <strong className="stat-value">{values[stat.key]}</strong>
          {stat.key === "completed" && questions.length > 0 ? (
            <div
              className="stat-progress"
              aria-label={`${Math.round((completed / questions.length) * 100)} percent mastered`}
            >
              <span style={{ width: `${(completed / questions.length) * 100}%` }} />
            </div>
          ) : (
            <span className="stat-footnote">
              {stat.key === "remaining" ? "Ready when you are" : "Updated just now"}
            </span>
          )}
        </article>
      ))}
    </section>
  );
}
