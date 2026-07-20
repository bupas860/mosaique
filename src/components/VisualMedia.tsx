import { useEffect, useState } from "react";

interface Props {
  src?: string;
  alt: string;
  fallbackLabel: string;
  className?: string;
  imageClassName?: string;
}

export default function VisualMedia({
  src,
  alt,
  fallbackLabel,
  className = "",
  imageClassName = "",
}: Props) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => setHasError(false), [src]);

  return (
    <div className={`relative overflow-hidden bg-slate-200 ${className}`}>
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          className={`h-full w-full object-cover ${imageClassName}`}
          onError={() => setHasError(true)}
        />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-300 p-3 text-center font-semibold text-slate-600"
        >
          <span aria-hidden="true">{fallbackLabel}</span>
        </div>
      )}
    </div>
  );
}
