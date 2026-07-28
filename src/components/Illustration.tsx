import { useEffect, useState } from "react";
type IllustrationType = "situation" | "character" | "ui";
interface Props { type: IllustrationType; id: string; alt: string; fallbackLabel: string; source: string | null; className?: string; imageClassName?: string; eager?: boolean; }
export default function Illustration({ type, id, alt, fallbackLabel, source, className = "", imageClassName = "", eager = false }: Props) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => { setHasError(false); setIsLoaded(false); }, [type, id, source]);
  return <div className={`illustration-frame ${className}`}>
    {source && !hasError ? <img src={source} alt={alt} width="1600" height="900" loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} decoding="async" onLoad={() => setIsLoaded(true)} onError={() => setHasError(true)} className={`illustration-image ${isLoaded ? "illustration-image--loaded" : ""} ${imageClassName}`} /> :
      <div role="img" aria-label={alt} className="illustration-placeholder"><span aria-hidden="true" className="illustration-placeholder__mark">◇</span><span aria-hidden="true">{fallbackLabel}</span></div>}
  </div>;
}
