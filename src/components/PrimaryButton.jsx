// src/components/PrimaryButton.jsx

import { useAppearance } from "../context/AppearanceContext.jsx";

export default function PrimaryButton({
  children,
  className = "",
  type = "button",
  disabled = false,
  intense = false,
  ...props
}) {
  const { appearance } = useAppearance();
  const isLight = appearance === "light";

  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold tracking-tight transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2";

  const enabled =
    "bg-gradient-to-b from-emerald-500 to-emerald-600 text-white border border-emerald-700/20 shadow-sm hover:from-emerald-600 hover:to-emerald-700 hover:shadow-md active:translate-y-[1px]";

  const intenseStyle =
    intense && !disabled
      ? "ring-2 ring-emerald-400/40 shadow-lg shadow-emerald-500/20"
      : "";

  const disabledStyle = isLight
    ? "bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed shadow-none"
    : "bg-white/10 text-white/45 border border-white/10 cursor-not-allowed shadow-none";

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${
        disabled ? disabledStyle : enabled
      } ${intenseStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}