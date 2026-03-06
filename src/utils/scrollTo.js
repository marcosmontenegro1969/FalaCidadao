// src/utils/scrollTo.js

export function scrollTo(sectionRef, focusRef) {
  const el = sectionRef?.current;
  if (!el) return;

  el.scrollIntoView({ behavior: "smooth", block: "start" });

  const target = focusRef?.current;
  if (target && typeof target.focus === "function") {
    window.setTimeout(() => target.focus(), 250);
  }
}