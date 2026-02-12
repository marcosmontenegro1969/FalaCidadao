// src/components/PulseButton.jsx

export default function PulseButton({
  children,
  onClick,
  className = "",
  color = "emerald", // compat: "emerald" = primário
  intense = false,
  disabled = false,
  title,
}) {
  const isPrimary = color === "emerald";

  const baseClass = isPrimary
    ? [
        "bg-primary text-textmain",
        disabled ? "" : "hover:bg-primary/90",
        "focus:ring-primary/40",
      ].join(" ")
    : [
        "bg-overlay text-textmain border border-borderSubtle",
        disabled ? "" : "hover:bg-overlayHover",
        "focus:ring-primary/30",
      ].join(" ");

  const pulseClass = intense ? "animate-pulse" : "";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={[
        "px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors",
        "focus:outline-none focus:ring-2",
        baseClass,
        pulseClass,
        disabled ? "opacity-60 cursor-not-allowed" : "",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
