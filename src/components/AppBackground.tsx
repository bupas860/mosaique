import type { CSSProperties, ReactNode } from "react";

interface Props {
  as?: "div" | "main";
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export default function AppBackground({
  as: Element = "div",
  children,
  className = "",
  style,
}: Props) {
  return (
    <Element className={`app-background ${className}`} style={style}>
      <div className="app-background__decor" aria-hidden="true">
        <span className="app-background__halo app-background__halo--blue" />
        <span className="app-background__halo app-background__halo--mauve" />
        <span className="app-background__halo app-background__halo--teal" />
        <span className="app-background__halo app-background__halo--rose" />
        <span className="app-background__trace app-background__trace--blue" />
        <span className="app-background__trace app-background__trace--violet" />
        <span className="app-background__trace app-background__trace--teal" />
      </div>
      {children}
    </Element>
  );
}
