interface SearchIconProps {
  className?: string;
}

export function SearchIcon({ className = "" }: SearchIconProps) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.2-5.2M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
      />
    </svg>
  );
}
