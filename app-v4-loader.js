try {
  const names = ["app-v4.part1", "app-v4.part2"];
  const chunks = await Promise.all(names.map(async name => {
    const response = await fetch(`${name}?v=4.0.0`, { cache: "no-store" });
    if (!response.ok) throw new Error(`No se pudo cargar ${name}`);
    return response.text();
  }));
  const moduleUrl = URL.createObjectURL(new Blob([chunks.join("")], { type: "text/javascript" }));
  await import(moduleUrl);
} catch (error) {
  document.querySelector(".content").innerHTML = `<div class="empty-state"><strong>No fue posible abrir PalGremio.</strong><p>${String(error?.message || error)}</p><p>No se modificaron las tareas de Firebase.</p></div>`;
  console.error(error);
}
