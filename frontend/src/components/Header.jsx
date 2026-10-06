function Mark() {
  return (
    <svg
      aria-hidden="true"
      className="brand-mark"
      viewBox="0 0 38 38"
      fill="none"
    >
      <rect x="1" y="1" width="36" height="36" rx="13" fill="#203B32" />
      <path
        d="M11 25.5V12.5H18.5C21.1 12.5 23 14.1 23 16.5C23 18.8 21.1 20.5 18.5 20.5H11M23 25.5L27 20.5"
        stroke="#F4F1E8"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="27" cy="12" r="2" fill="#D7A666" />
    </svg>
  );
}

export default function Header({ onCreate }) {
  const today = new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <header className="topbar">
      <a aria-label="Fieldnotes home" className="brand" href="#">
        <Mark />
        <span className="brand-name">fieldnotes<span>.</span></span>
        <span className="brand-divider" />
        <span className="brand-caption">Interview prep</span>
      </a>
      <div className="topbar-actions">
        <span className="today-label">{today}</span>
        <button className="button button-dark topbar-create" onClick={onCreate}>
          <span>Add a question</span>
          <span className="button-orb" aria-hidden="true">+</span>
        </button>
      </div>
    </header>
  );
}
