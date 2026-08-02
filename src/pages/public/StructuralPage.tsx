type StructuralPageProps = {
  title: "Situations" | "Repères";
  description?: string;
};

export default function StructuralPage({ title, description }: StructuralPageProps) {
  return <main className="structural-page"><h1>{title}</h1>{description ? <p>{description}</p> : null}</main>;
}
