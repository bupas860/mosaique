import { useEffect, useState } from "react";
import n02 from "../../assets/illustrations/situations/n02.webp?url";
import v10 from "../../assets/illustrations/situations/v10.webp?url";
import x01 from "../../assets/illustrations/situations/x01.webp?url";
import i01 from "../../assets/illustrations/situations/i01.webp?url";
import n13 from "../../assets/illustrations/situations/n13.webp?url";
import x13 from "../../assets/illustrations/situations/x13.webp?url";
import v01 from "../../assets/illustrations/situations/v01.webp?url";
import i14 from "../../assets/illustrations/situations/i14.webp?url";

const sources = [n02, v10, x01, i01, n13, x13, v01, i14];

export default function QuizSituationImage({ position, altText }: { position: number; altText: string }) {
  const [blobUrl, setBlobUrl] = useState<string>();
  useEffect(() => { let active = true; let created = ""; fetch(sources[position - 1]).then((response) => response.blob()).then((blob) => { if (active) { created = URL.createObjectURL(blob); setBlobUrl(created); } }); return () => { active = false; if (created) URL.revokeObjectURL(created); setBlobUrl(undefined); }; }, [position]);
  if (!blobUrl) return <div className="public-situation-image public-situation-image--error" role="img" aria-label={altText}><span aria-hidden="true">Chargement de l’illustration…</span></div>;
  return <img className="public-situation-image" src={blobUrl} alt={altText} width="1000" height="800" />;
}
