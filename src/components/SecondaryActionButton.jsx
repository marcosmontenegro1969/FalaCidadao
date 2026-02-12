// src/components/SecondaryActionButton.jsx

export default function SecondaryActionButton({
  children,
  onClick,
  className = "",
  disabled = false,
  title,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={[
        "inline-flex items-center justify-center",
        "px-5 py-2.5 rounded-lg",
        "bg-primary/15 border border-primary/70",
        "text-sm font-medium text-primary",
        "transition",
        "focus:outline-none focus:ring-2 focus:ring-primary/40",
        disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-primary/20",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
