import { useEffect, useState } from "react";

export function useUnderstandData<T>(loader: () => Promise<T>) {
  const [state, setState] = useState<{ data?: T; error?: Error }>({});
  useEffect(() => {
    let active = true;
    loader().then((data) => { if (active) setState({ data }); }).catch((error: unknown) => { if (active) setState({ error: error instanceof Error ? error : new Error(String(error)) }); });
    return () => { active = false; };
  }, [loader]);
  return state;
}

export function useTargetFocus(targetId: string | undefined, ready: boolean) {
  useEffect(() => {
    if (!ready) return;
    requestAnimationFrame(() => {
      const target = document.getElementById(targetId ?? "understand-page-title");
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    });
  }, [ready, targetId]);
}
