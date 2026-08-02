const imageModules = import.meta.glob<string>("../../assets/illustrations/situations/*.webp", {
  eager: true,
  import: "default",
  query: "?url",
});

const imagesByFilename = Object.fromEntries(
  Object.entries(imageModules).map(([filename, source]) => [filename.split("/").at(-1), source]),
) as Readonly<Record<string, string>>;

export function getPublicSituationImage(filename: string): string | undefined {
  return imagesByFilename[filename];
}
