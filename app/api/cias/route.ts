import cias from "../../../data/cias.json";

export async function GET() {
  const lista = Object.keys(cias); // ["LATAM", "Smiles", ...]
  return Response.json({ cias: lista });
}
