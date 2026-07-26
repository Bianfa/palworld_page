const names = ["app.part1", "app.part2", "app.part3", "app.part4", "app.part5"];
const chunks = await Promise.all(names.map(async (name) => {
  const response = await fetch(name, { cache: "no-store" });
  if (!response.ok) throw new Error(`No se pudo cargar ${name}`);
  return response.text();
}));
const url = URL.createObjectURL(new Blob([chunks.join("")], { type: "text/javascript" }));
try { await import(url); } finally { URL.revokeObjectURL(url); }
