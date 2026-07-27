try {
  const version = "4.0.2";
  const names = ["app-v4.part1", "app-v4.part2"];
  const [chunks, firebaseModule] = await Promise.all([
    Promise.all(names.map(async name => {
      const response = await fetch(`${name}?v=${version}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`No se pudo cargar ${name}`);
      return response.text();
    })),
    fetch(`firebase-store-v4.js?v=${version}`, { cache: "no-store" }).then(response => {
      if (!response.ok) throw new Error("No se pudo cargar firebase-store-v4.js");
      return response.text();
    })
  ]);
  const firebaseUrl = URL.createObjectURL(new Blob([firebaseModule], { type: "text/javascript" }));
  const source = chunks.join("").replaceAll('"./firebase-store-v4.js"', JSON.stringify(firebaseUrl));
  const moduleUrl = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
  await import(moduleUrl);
} catch (error) {
  document.querySelector(".content").innerHTML = `<div class="empty-state"><strong>No fue posible abrir PalGremio.</strong><p>${String(error?.message || error)}</p><p>No se modificaron las tareas de Firebase.</p></div>`;
  console.error(error);
}
