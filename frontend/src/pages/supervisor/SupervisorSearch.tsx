import { Search, X } from "lucide-react";
export function SupervisorSearch({
  value,
  onChange,
  placeholder,
  onFocus,
  onEscape,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onFocus?: () => void;
  onEscape?: () => void;
}) {
  return (
    <div className="sup-search-field">
      <Search aria-hidden="true" />
      <input
        type="search"
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onFocus={onFocus}
        onKeyDown={(e) => {
          if (e.key === "Escape") onEscape?.();
        }}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          aria-label="Очистить поиск"
          onClick={() => onChange("")}
        >
          <X />
        </button>
      )}
    </div>
  );
}
