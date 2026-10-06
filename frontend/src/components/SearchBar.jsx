export default function SearchBar({ value, onChange }) {
  return (
    <label className="search-box">
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
        <circle cx="8.7" cy="8.7" r="5.7" stroke="currentColor" strokeWidth="1.5" />
        <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="sr-only">Search questions</span>
      <input
        type="search"
        placeholder="Search your questions..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <kbd>/</kbd>
    </label>
  );
}
