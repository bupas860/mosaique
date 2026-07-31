import type { DisclosureEntry } from "../types/publicBiography";

interface Props {
  entries: readonly DisclosureEntry[];
}

export default function BiographyDisclosureMap({ entries }: Props) {
  return (
    <table className="biography-disclosure-map">
      <thead><tr><th scope="col">Espace ou groupe</th><th scope="col">Situation actuelle</th></tr></thead>
      <tbody>{entries.map((entry) => (
        <tr key={`${entry.group}-${entry.currentSituation}`}>
          <th scope="row">{entry.group}</th>
          <td data-label="Situation actuelle">{entry.currentSituation}</td>
        </tr>
      ))}</tbody>
    </table>
  );
}
