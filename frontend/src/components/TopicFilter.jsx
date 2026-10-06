export default function TopicFilter({
  topics,
  selectedTopic,
  onTopicChange,
  selectedStatus,
  onStatusChange,
}) {
  return (
    <div className="filter-row">
      <div className="status-tabs" aria-label="Filter by completion">
        {[
          ["all", "Everything"],
          ["open", "In progress"],
          ["completed", "Mastered"],
        ].map(([value, label]) => (
          <button
            aria-pressed={selectedStatus === value}
            className={`status-tab ${selectedStatus === value ? "is-selected" : ""}`}
            key={value}
            onClick={() => onStatusChange(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <label className="topic-select-wrap">
        <span className="sr-only">Filter by topic</span>
        <select value={selectedTopic} onChange={(event) => onTopicChange(event.target.value)}>
          <option value="all">All topics</option>
          {topics.map((topic) => (
            <option key={topic} value={topic}>{topic}</option>
          ))}
        </select>
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
          <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </label>
    </div>
  );
}
