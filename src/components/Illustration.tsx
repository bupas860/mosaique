import { useEffect, useState } from "react";

import {
  getIllustrationSources,
  type IllustrationType,
} from "../assets/illustrations/illustrations";

interface Props {
  type: IllustrationType;
  id: string;
  alt: string;
  fallbackLabel: string;
  className?: string;
  imageClassName?: string;
  eager?: boolean;
}

const mimeTypes = {
  avif: "image/avif",
  webp: "image/webp",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

export default function Illustration({
  type,
  id,
  alt,
  fallbackLabel,
  className = "",
  imageClassName = "",
  eager = false,
}: Props) {
  const sources = getIllustrationSources(type, id);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [type, id]);

  const fallbackSource = sources.find(({ format }) => format !== "avif") ?? sources[0];
  const showImage = fallbackSource && !hasError;

  return (
    <div className={`illustration-frame ${className}`}>
      {showImage ? (
        <picture>
          {sources.map(({ format, src }) => (
            <source key={`${format}-${src}`} srcSet={src} type={mimeTypes[format]} />
          ))}
          <img
            src={fallbackSource.src}
            alt={alt}
            width="1600"
            height="900"
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : "auto"}
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={`illustration-image ${isLoaded ? "illustration-image--loaded" : ""} ${imageClassName}`}
          />
        </picture>
      ) : (
        <div role="img" aria-label={alt} className="illustration-placeholder">
          <span aria-hidden="true" className="illustration-placeholder__mark">◇</span>
          <span aria-hidden="true">{fallbackLabel}</span>
        </div>
      )}
    </div>
  );
}
