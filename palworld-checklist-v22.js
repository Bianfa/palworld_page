(() => {
  "use strict";

  const VERSION = "2.2.0";
  const CATEGORIES = [
    "Construcción",
    "Pals",
    "Configuración",
    "Producción",
    "Logística y bienestar",
    "Crianza",
  ];
  const AREA_BY_CATEGORY = {
    "Construcción": "Infraestructura",
    "Pals": "Plantilla de Pals",
    "Configuración": "Configuración",
    "Producción": "Producción",
    "Logística y bienestar": "Logística y bienestar",
    "Crianza": "Crianza",
  };
  const TYPE_BY_CATEGORY = {
    "Construcción": "Construir",
    "Pals": "Asignar",
    "Configuración": "Configurar",
    "Producción": "Producir",
    "Logística y bienestar": "Organizar",
    "Crianza": "Criar",
  };

  let pendingAdd = null;
  let scheduled = false;
  let applying = false;

  const textOf = (cell) => {
    const field = cell?.querySelector("[data-field]");
    return String(field?.value ?? cell?.textContent ?? "").trim();
  };

  function inferCategory(row) {
    const cells = row?.cells || [];
    const area = textOf(cells[1]).toLowerCase();
    const type = textOf(cells[2]).toLowerCase();
    const item = textOf(cells[3]).toLowerCase();
    const panelId = row.closest(".panel")?.id || "";
    const isBreedingBase = panelId === "base-5";

    if (area.includes("plantilla de pals") || area === "pals" || type === "asignar") return "Pals";
    if (isBreedingBase && (area.includes("crianza") || type.includes("criar") || item.includes("línea") || item.includes("condensación") || item.includes("mutaciones") || item.includes("soportes de aura"))) return "Crianza";
    if (area.includes("producción") || ["fabricar", "acumular", "cocinar", "producir"].some((value) => type.includes(value))) return "Producción";
    if (area.includes("logística") || area.includes("bienestar") || ["cofre", "almacenamiento", "camas", "baños", "pasillos", "accesos", "refrigerador", "transferencia"].some((value) => item.includes(value))) return "Logística y bienestar";
    if (area.includes("configuración") || area.includes("criterio de activación") || ["configurar", "evaluar"].some((value) => type.includes(value)) || item.includes("puesto de supervisión") || item.includes("carteles o códigos")) return "Configuración";
    return "Construcción";
  }

  function setField(field, value) {
    if (!field) return;
    field.value = value;
    field.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function applyPendingCategory(panel, rows) {
    if (!pendingAdd || pendingAdd.panelId !== panel.id) return;
    const candidates = rows.filter((row) => {
      const item = textOf(row.cells[3]);
      return item === "Nuevo elemento" || item === "Nuevo Pal";
    });
    const row = candidates.at(-1);
    if (!row) return;

    const category = pendingAdd.category;
    setField(row.cells[1]?.querySelector("[data-field='area']"), AREA_BY_CATEGORY[category]);
    setField(row.cells[2]?.querySelector("[data-field='type']"), TYPE_BY_CATEGORY[category]);
    if (category === "Pals") {
      setField(row.cells[3]?.querySelector("[data-field='item']"), "Nuevo Pal");
      setField(row.cells[4]?.querySelector("[data-field='pal_no']"), "#");
    }
    pendingAdd = null;
  }

  function categoryControl(cell, category, row) {
    if (!cell || cell.dataset.v22Category === "true") return;
    cell.dataset.v22Category = "true";
    const editing = document.body.classList.contains("editing");
    const original = cell.querySelector("[data-field='area']");

    if (!editing) {
      cell.textContent = category;
      return;
    }

    if (original) original.hidden = true;
    const select = document.createElement("select");
    select.className = "edit-field v22-category-select";
    select.innerHTML = CATEGORIES.map((item) => `<option${item === category ? " selected" : ""}>${item}</option>`).join("");
    select.addEventListener("change", () => {
      const nextCategory = select.value;
      setField(original, AREA_BY_CATEGORY[nextCategory]);
      setField(row.cells[2]?.querySelector("[data-field='type']"), TYPE_BY_CATEGORY[nextCategory]);
    });
    cell.append(select);
  }

  function makeGroup(category, rows, originalAdd, panel) {
    const section = document.createElement("section");
    section.className = "v22-checklist-group";

    const heading = document.createElement("div");
    heading.className = "section-head v22-group-heading";
    const complete = rows.filter((row) => row.querySelector(".status-btn.ok")).length;
    const palTotal = category === "Pals"
      ? rows.reduce((sum, row) => sum + Number(row.cells[5]?.querySelector("input")?.value || row.cells[5]?.textContent || 0), 0)
      : null;
    heading.innerHTML = `<h4>${category} <span>${complete}/${rows.length}${palTotal !== null ? ` · ${palTotal} Pals objetivo` : ""}</span></h4>`;

    if (document.body.classList.contains("editing")) {
      const add = document.createElement("button");
      add.type = "button";
      add.className = "small";
      add.textContent = "Agregar ítem";
      add.addEventListener("click", () => {
        pendingAdd = { panelId: panel.id, category };
        originalAdd?.click();
      });
      heading.append(add);
    }
    section.append(heading);

    if (!rows.length) {
      const empty = document.createElement("p");
      empty.className = "v22-empty";
      empty.textContent = "Sin ítems todavía.";
      section.append(empty);
      return section;
    }

    const wrap = document.createElement("div");
    wrap.className = "table-wrap";
    const table = document.createElement("table");
    table.innerHTML = `<thead><tr><th>Prio.</th><th>Categoría</th><th>Tipo / función</th><th>Elemento / Pal</th><th>N.º</th><th>Meta</th><th>Actual</th><th>Estado</th><th>Notas</th><th></th></tr></thead>`;
    const body = document.createElement("tbody");
    rows.forEach((row) => {
      categoryControl(row.cells[1], category, row);
      body.append(row);
    });
    table.append(body);
    wrap.append(table);
    section.append(wrap);
    return section;
  }

  function transformPanel(panel) {
    const cards = [...panel.querySelectorAll(":scope > .card")];
    const checklist = cards.find((card) => card.querySelector("h3")?.textContent.includes("Checklist de construcción y configuración"));
    if (!checklist || checklist.dataset.v22Done === "true") return;

    cards.forEach((card) => {
      const title = card.querySelector("h3")?.textContent || "";
      if (title.startsWith("Plantilla de Pals") || title.startsWith("Prioridad de producción")) {
        card.classList.add("v22-hidden-duplicate");
      }
    });

    const title = checklist.querySelector("h3");
    if (title) title.textContent = "Checklist de la base";
    const originalAdd = checklist.querySelector("[data-action='add-row'][data-collection='tasks']");
    if (originalAdd) originalAdd.hidden = true;

    const oldWrap = checklist.querySelector(".table-wrap");
    const rows = [...(oldWrap?.querySelectorAll("tbody > tr") || [])];
    applyPendingCategory(panel, rows);

    const groups = new Map(CATEGORIES.map((category) => [category, []]));
    rows.forEach((row) => groups.get(inferCategory(row)).push(row));

    const container = document.createElement("div");
    container.className = "v22-unified-checklist";
    CATEGORIES.forEach((category) => {
      const categoryRows = groups.get(category);
      if (categoryRows.length || document.body.classList.contains("editing")) {
        container.append(makeGroup(category, categoryRows, originalAdd, panel));
      }
    });
    oldWrap?.replaceWith(container);
    checklist.dataset.v22Done = "true";
  }

  function updateMetrics() {
    const buttons = [
      ...document.querySelectorAll(".v22-unified-checklist .status-btn"),
      ...document.querySelectorAll("#breedingPanel .status-btn"),
    ];
    const total = buttons.length;
    const done = buttons.filter((button) => button.classList.contains("ok")).length;
    const percent = total ? Math.round((done * 100) / total) : 0;
    const doneNode = document.querySelector("#globalDone");
    const totalNode = document.querySelector("#globalTotal");
    const percentNode = document.querySelector("#globalPct");
    const bar = document.querySelector("#globalBar");
    if (doneNode) doneNode.textContent = String(done);
    if (totalNode) totalNode.textContent = String(total);
    if (percentNode) percentNode.textContent = `${percent}%`;
    if (bar) bar.style.width = `${percent}%`;
    const version = document.querySelector("#appVersion");
    if (version) version.textContent = VERSION;
  }

  function apply() {
    if (applying) return;
    applying = true;
    try {
      document.querySelectorAll(".panel").forEach(transformPanel);
      updateMetrics();
    } finally {
      applying = false;
    }
  }

  function schedule() {
    if (scheduled || applying) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      apply();
    });
  }

  const style = document.createElement("style");
  style.textContent = `
    .v22-hidden-duplicate{display:none!important}
    .v22-unified-checklist{margin-top:6px}
    .v22-checklist-group{border-top:1px solid var(--line);padding-top:14px;margin-top:14px}
    .v22-checklist-group:first-child{border-top:0;margin-top:4px}
    .v22-group-heading h4{margin:0 8px 8px 0;color:var(--accent2);font-size:17px}
    .v22-group-heading h4 span{font-size:12px;color:var(--muted);font-weight:650;margin-left:7px}
    .v22-group-heading h4{margin-right:auto}
    .v22-empty{color:var(--muted);font-style:italic}
    .v22-checklist-group table{min-width:980px}
    .v22-category-select{min-width:180px}
  `;
  document.head.append(style);

  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  schedule();
})();
