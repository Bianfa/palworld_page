(() => {
  const CHUNKS = ["site.b64.00", "site.b64.01", "site.b64.02", "site.b64.03"];

  function normalized(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function validate(data) {
    if (!data || !Array.isArray(data.bases) || data.bases.length < 6) {
      throw new Error("El respaldo recuperado no contiene las seis bases.");
    }
    if (!Array.isArray(data.tasks) || data.tasks.length < 1) {
      throw new Error("El respaldo recuperado no contiene tareas.");
    }
    return data;
  }

  function mergeTechnologyPlan(data) {
    const plan = window.PALGREMIO_CONSTRUCTION_PLAN;
    if (!plan?.version || !Array.isArray(plan.tasks) || !plan.tasks.length) return data;
    const result = { ...data, tasks: [...data.tasks] };

    plan.tasks.forEach((recommendation, index) => {
      const names = [recommendation.item, ...(recommendation.aliases || [])].map(normalized);
      const matchIndex = result.tasks.findIndex(task => {
        if (task?.recommendationKey === recommendation.recommendationKey || task?.id === recommendation.id) return true;
        return Number(task?.base || 0) === Number(recommendation.base || 0) && names.includes(normalized(task?.item));
      });
      if (matchIndex >= 0) {
        const current = result.tasks[matchIndex];
        result.tasks[matchIndex] = {
          ...current,
          ...recommendation,
          id: current.id || recommendation.id,
          qty_current: Number(current.qty_current || 0),
          status: current.status === "OK" ? "OK" : "NO",
          orderKey: current.orderKey || `${String(recommendation.base).padStart(2, "0")}-tech-${String(index).padStart(3, "0")}`
        };
      } else {
        result.tasks.push({
          ...recommendation,
          orderKey: `${String(recommendation.base).padStart(2, "0")}-tech-${String(index).padStart(3, "0")}`
        });
      }
    });
    result.technologyPlanVersion = plan.version;
    return result;
  }

  async function tryPublishedJson(version) {
    const response = await fetch(`data-v3.part1?v=${encodeURIComponent(version || "4.1.0")}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status} al leer data-v3.part1`);
    const text = (await response.text()).replace(/^\uFEFF/, "");
    return mergeTechnologyPlan(validate(JSON.parse(text)));
  }

  async function fetchStableZip() {
    const pieces = await Promise.all(CHUNKS.map(async (name) => {
      const response = await fetch(`${name}?v=4.1.0`, { cache: "no-store" });
      if (!response.ok) throw new Error(`No se pudo cargar ${name}`);
      return response.text();
    }));
    const base64 = pieces.join("").replace(/\s+/g, "");
    let binary;
    try {
      binary = atob(base64);
    } catch {
      throw new Error("Los fragmentos del respaldo estable no forman Base64 válido.");
    }
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }

  function findEndOfCentralDirectory(bytes) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const minimum = Math.max(0, bytes.length - 65557);
    for (let offset = bytes.length - 22; offset >= minimum; offset -= 1) {
      if (view.getUint32(offset, true) === 0x06054b50) return offset;
    }
    throw new Error("El respaldo ZIP no contiene un directorio central válido.");
  }

  function locateEntry(bytes, wantedName) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const decoder = new TextDecoder();
    const eocd = findEndOfCentralDirectory(bytes);
    const totalEntries = view.getUint16(eocd + 10, true);
    let offset = view.getUint32(eocd + 16, true);

    for (let index = 0; index < totalEntries; index += 1) {
      if (view.getUint32(offset, true) !== 0x02014b50) throw new Error("Directorio central ZIP dañado.");
      const method = view.getUint16(offset + 10, true);
      const compressedSize = view.getUint32(offset + 20, true);
      const fileNameLength = view.getUint16(offset + 28, true);
      const extraLength = view.getUint16(offset + 30, true);
      const commentLength = view.getUint16(offset + 32, true);
      const localOffset = view.getUint32(offset + 42, true);
      const fileName = decoder.decode(bytes.slice(offset + 46, offset + 46 + fileNameLength));
      if (fileName === wantedName) return { method, compressedSize, localOffset };
      offset += 46 + fileNameLength + extraLength + commentLength;
    }
    throw new Error(`No se encontró ${wantedName} dentro del respaldo estable.`);
  }

  async function extractEntry(bytes, wantedName) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const entry = locateEntry(bytes, wantedName);
    if (view.getUint32(entry.localOffset, true) !== 0x04034b50) throw new Error("Cabecera ZIP local inválida.");
    const fileNameLength = view.getUint16(entry.localOffset + 26, true);
    const extraLength = view.getUint16(entry.localOffset + 28, true);
    const start = entry.localOffset + 30 + fileNameLength + extraLength;
    const compressed = bytes.slice(start, start + entry.compressedSize);

    if (entry.method === 0) return new TextDecoder().decode(compressed);
    if (entry.method !== 8) throw new Error(`Método ZIP no compatible: ${entry.method}`);
    if (!("DecompressionStream" in window)) throw new Error("Este navegador no permite descomprimir el respaldo estable.");

    const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return new TextDecoder().decode(await new Response(stream).arrayBuffer());
  }

  function extractDefaultData(source) {
    const prefix = "const DEFAULT_DATA = ";
    const start = source.indexOf(prefix);
    if (start < 0) throw new Error("No se encontró DEFAULT_DATA en app.js.");
    const after = start + prefix.length;
    let end = source.indexOf(";\nconst APP_VERSION", after);
    if (end < 0) end = source.indexOf(";\r\nconst APP_VERSION", after);
    if (end < 0) throw new Error("No se encontró el cierre de DEFAULT_DATA.");
    return mergeTechnologyPlan(validate(JSON.parse(source.slice(after, end))));
  }

  async function recoverFromStablePackage() {
    const bytes = await fetchStableZip();
    const appSource = await extractEntry(bytes, "app.js");
    return extractDefaultData(appSource);
  }

  async function load(version) {
    try {
      return await tryPublishedJson(version);
    } catch (jsonError) {
      console.warn("Respaldo JSON publicado inválido; se usará el paquete estable.", jsonError);
      const recovered = await recoverFromStablePackage();
      recovered.recoveredFrom = "stable-package";
      return recovered;
    }
  }

  window.PALGREMIO_FALLBACK = Object.freeze({ load });
})();
