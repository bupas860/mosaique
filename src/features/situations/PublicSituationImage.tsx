import { useEffect, useState } from "react";
import { getPublicSituationImage } from "./publicSituationImages";

type PublicSituationImageProps = {
  code: string;
  filename: string;
  altText: string;
  eager?: boolean;
};

export default function PublicSituationImage({ code, filename, altText, eager = false }: PublicSituationImageProps) {
  const [failed, setFailed] = useState(false);
  const source = getPublicSituationImage(filename);
  useEffect(() => setFailed(false), [code, filename]);
  if (!source || failed) return <div className="public-situation-image public-situation-image--error" role="img" aria-label={altText}><span aria-hidden="true">Illustration indisponible</span></div>;
  return <img className="public-situation-image" src={source} alt={altText} width="1000" height="800" loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} decoding="async" onError={() => setFailed(true)} />;
}
