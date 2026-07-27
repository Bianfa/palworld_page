(() => {
  const VERSION = "palworld-1.0-max-tech-2026-07-27";

  function task(base, key, item, target, priority, notes, aliases = []) {
    return {
      id: `tech-${base}-${key}`,
      recommendationKey: `${base}:${key}`,
      planVersion: VERSION,
      base,
      category: "Construcción",
      area: "Infraestructura tecnológica",
      type: "Tecnología máxima",
      priority,
      item,
      qty_target: target,
      qty_current: 0,
      status: "NO",
      notes,
      aliases,
      source: "Plan tecnológico Palworld 1.0"
    };
  }

  const rows = [];
  const add = (...args) => rows.push(task(...args));

  function common(base, { beds = 35, springs = 2, generators = 1, chests = 3, priority = "P1" } = {}) {
    add(base, "guild-chest", "Cofre de gremio", 1, "P0", "Almacenamiento de objetos compartido entre todas las bases. Máximo 1 por base.", ["cofre gremio", "guild chest"]);
    add(base, "dimensional-pal-storage", "Almacén DimensioPal", 1, priority, "Almacenamiento dimensional para Pals del gremio. No reemplaza al Cofre de gremio: guarda Pals, no objetos.", ["almacenamiento dimensional pal", "cofre interdimensional", "dimensional pal storage"]);
    add(base, "item-retrieval", "Dispensador de objetos", 1, priority, "Permite retirar objetos desde los cofres locales de la base desde un único punto.", ["dispensador", "item retrieval machine"]);
    add(base, "ancient-clinic", "Clínica de civilización antigua", 1, "P0", "Clínica de máximo nivel para reducir pérdida de COR/SAN y limitar heridas y enfermedades.", ["clínica antigua", "clinica antigua", "ancient clinic"]);
    add(base, "ancient-monitoring", "Puesto de supervisión de civilización antigua", 1, "P0", "Control de trabajos de la base y reducción avanzada del desgaste de COR/SAN.", ["puesto de supervisión antiguo", "ancient monitoring stand"]);
    add(base, "alpha-wave", "Generador de ondas alfa", 1, priority, "Reduce el descenso de COR/SAN. No aporta beneficio adicional construir más de uno.", ["alpha wave generator", "generador alfa"]);
    add(base, "beta-wave", "Generador de ondas beta", 1, priority, "Aumenta la velocidad de trabajo de los Pals. No aporta beneficio adicional construir más de uno.", ["beta wave generator", "generador beta"]);
    add(base, "ancient-hot-spring", "Baño termal de civilización antigua", springs, priority, "Baño de máximo nivel para recuperar COR/SAN y salud. Separar uno cerca del trabajo y otro cerca de las camas cuando se construyan dos.", ["baño termal antiguo", "termas antiguas", "ancient hot spring"]);
    add(base, "ancient-pal-bed", "Cama Pal de civilización antigua", beds, priority, "Cama de último nivel. Mantener una cama por cada Pal asignado; la meta refleja la capacidad planificada de esta base.", ["cama pal antigua", "ancient pal bed", "camas de último nivel"]);
    add(base, "ancient-power", "Generador eléctrico de civilización antigua", generators, "P0", "Generación eléctrica de máximo nivel. Requiere electricidad alta y apoyo de riego para controlar el sobrecalentamiento.", ["generador antiguo", "ancient power generator"]);
    add(base, "advanced-chest", "Cofre avanzado", chests, priority, "Almacenamiento local de 54 espacios para separar materias primas, productos y reservas.", ["advanced chest", "cofre de hexolita"]);
  }

  // Base 1 · Recursos, petróleo y energía
  common(1, { beds: 35, springs: 2, generators: 2, chests: 4, priority: "P1" });
  add(1, "high-pressure-oil", "Extractor de petróleo crudo de alta presión", 1, "P0", "Extractor máximo para reforzar petróleo incluso sin depender exclusivamente de un yacimiento.", ["extractor de petróleo", "high-pressure crude oil extractor"]);
  add(1, "ancient-material-synth", "Sintetizador de materiales de civilización antigua", 2, "P0", "Dos unidades permiten producir simultáneamente dos recursos seleccionados; priorizar Coralium/Cromita y materiales tardíos.", ["generador de materiales antiguo", "ancient material synthesizer"]);
  add(1, "soralite-quarry", "Cantera de soralita", 1, "P1", "Producción dedicada de soralita para las tecnologías antiguas.", ["soralite quarry"]);
  add(1, "hexolite-quartz", "Mina de cuarzo de hexolita", 1, "P1", "Producción dedicada de cuarzo de hexolita para tecnología tardía.", ["hexolite quartz mine"]);

  // Base 2 · Fábrica, hornos y mesas
  common(2, { beds: 35, springs: 2, generators: 2, chests: 6, priority: "P1" });
  add(2, "ancient-furnace", "Horno de civilización antigua", 2, "P0", "Dos hornos máximos permiten fundición paralela. Sustituye la meta antigua de cuatro hornos cuando la velocidad cubra la demanda.", ["horno antiguo", "ancient furnace", "hornos de civilización antigua"]);
  add(2, "ancient-workbench", "Mesa de trabajo de civilización antigua", 2, "P0", "Dos mesas versátiles para colas paralelas de cualquier objeto o equipamiento.", ["mesa antigua", "ancient workbench", "mesas de civilización antigua"]);
  add(2, "advanced-workshop", "Taller avanzado", 2, "P1", "Líneas de alta velocidad para producción repetitiva; complementar las mesas antiguas, no reemplazarlas.", ["advanced workshop"]);
  add(2, "advanced-weapons", "Línea avanzada de montaje de armas", 1, "P1", "Producción máxima dedicada a armas y municiones.", ["advanced weapon assembly line"]);
  add(2, "advanced-spheres", "Línea avanzada de montaje de esferas", 1, "P1", "Producción máxima dedicada a esferas.", ["advanced sphere assembly line"]);
  add(2, "ancient-material-synth", "Sintetizador de materiales de civilización antigua", 1, "P1", "Apoyo flexible para minerales o madera cuando otra línea se quede sin materia prima.", ["generador de materiales antiguo", "ancient material synthesizer"]);
  add(2, "ancient-recycler", "Reciclador de reliquias de civilización antigua", 1, "P1", "Procesamiento y aprovechamiento de reliquias antiguas.", ["ancient relic recycler"]);
  add(2, "large-toolbox", "Caja de herramientas grande", 1, "P1", "Aumenta el trabajo manual de la base. Más de una no añade efecto.", ["large toolbox"]);
  add(2, "flame-cauldron", "Caldero de llamas", 1, "P1", "Refuerzo para la velocidad de encendido de hornos y procesos de fuego.", ["flame cauldron"]);
  add(2, "industrial-ranch-fire", "Corral industrial para órganos de fuego", 2, "P0", "Dos corrales para los 8 productores de órganos de fuego actualmente asignados a la fábrica.", ["corral de órganos de fuego", "industrial ranch"]);

  // Base 3 · Cocina y agricultura para todos los pasteles
  common(3, { beds: 35, springs: 2, generators: 1, chests: 4, priority: "P1" });
  add(3, "ancient-farm", "Granja de civilización antigua", 8, "P0", "Distribución objetivo: 2 trigo y 1 de bayas, tomate, lechuga, papa, cebolla y zanahoria.", ["granja antigua", "ancient farm", "cultivadora antigua"]);
  add(3, "ancient-kitchen", "Cocina de civilización antigua", 2, "P0", "Una cocina dedicada a pasteles y otra para comida de trabajadores y recetas generales.", ["cocina antigua", "ancient kitchen"]);
  add(3, "mill", "Molino", 2, "P0", "Dos molinos para convertir el trigo en harina sin bloquear la producción de pasteles.", ["mill", "molinos"]);
  add(3, "industrial-ranch-cakes", "Corral industrial de ingredientes para pasteles", 3, "P0", "Tres corrales para huevos, leche, miel, setas y algodones de azúcar normales y con caramelo.", ["corral de ingredientes", "industrial ranch"]);
  add(3, "cold-food-box", "Caja de comida refrigerada", 1, "P0", "Comedero refrigerado para los trabajadores. No es sustituido por el refrigerador.", ["cold food box", "comedero refrigerado"]);
  add(3, "refrigerator", "Refrigerador", 2, "P1", "Separar ingredientes crudos y pasteles/comidas terminadas.", ["refrigerator", "refrigeradores"]);
  add(3, "silo", "Silo", 1, "P1", "Refuerzo de siembra; construir solo uno porque el efecto no se acumula.", ["silo"]);
  add(3, "water-fountain", "Fuente de agua", 1, "P1", "Refuerzo de riego para la línea agrícola y los molinos.", ["water fountain", "fuente"]);

  // Base 4 · Ganadería y materiales
  common(4, { beds: 35, springs: 2, generators: 1, chests: 4, priority: "P1" });
  add(4, "industrial-ranch", "Corral industrial", 4, "P0", "Cuatro corrales para materiales de ganadería, manteniendo productores separados por recurso.", ["industrial ranch", "corrales industriales"]);
  add(4, "ancient-material-synth", "Sintetizador de materiales de civilización antigua", 1, "P1", "Apoyo flexible para materiales que no alcance a cubrir la ganadería.", ["generador de materiales antiguo", "ancient material synthesizer"]);
  add(4, "cold-food-box", "Caja de comida refrigerada", 1, "P1", "Alimentación de trabajadores y productores de corral.", ["cold food box", "comedero refrigerado"]);
  add(4, "refrigerator", "Refrigerador", 1, "P2", "Reserva de ingredientes perecibles producidos en la base.", ["refrigerator"]);

  // Base 5 · Criadero exclusivo
  common(5, { beds: 12, springs: 1, generators: 1, chests: 2, priority: "P1" });
  add(5, "ancient-hatchery", "Criadora de civilización antigua", 3, "P0", "Meta revisada: 3 líneas de crianza; actualmente existe 1 criadora antigua.", ["criadero antiguo", "criadora antigua", "ancient hatchery", "breeding farm"]);
  add(5, "pal-condenser", "Condensador de esencia Pal", 1, "P0", "Condensación de trabajadores, rancheros y soportes de las bases.", ["pal essence condenser", "condensador"]);
  add(5, "pal-surgery", "Mesa de cirugía Pal", 1, "P1", "Ajuste de género y pasivas para cerrar líneas de crianza.", ["pal surgery table", "mesa cirugía"]);
  add(5, "cold-food-box", "Caja de comida refrigerada", 1, "P0", "Alimentación de los Pals asignados a crianza.", ["cold food box", "comedero refrigerado"]);
  add(5, "refrigerator", "Refrigerador para pasteles", 1, "P0", "Reserva de pasteles enviados desde la base agrícola y cocina.", ["refrigerador de pasteles", "refrigerator"]);

  // Base 6 · Reserva estratégica y servicios
  common(6, { beds: 20, springs: 1, generators: 1, chests: 2, priority: "P2" });
  add(6, "labor-research", "Laboratorio de investigación laboral Pal", 1, "P1", "Centro común para desbloqueos y mejoras de trabajo de todas las bases.", ["pal labor research laboratory", "laboratorio laboral"]);
  add(6, "pal-surgery", "Mesa de cirugía Pal", 1, "P2", "Servicio de respaldo para modificaciones de Pals sin ocupar la base de crianza.", ["pal surgery table", "mesa cirugía"]);
  add(6, "ancient-workbench", "Mesa de trabajo de civilización antigua", 1, "P2", "Estación flexible para emergencias o producción temporal.", ["mesa antigua", "ancient workbench"]);
  add(6, "ancient-material-synth", "Sintetizador de materiales de civilización antigua", 1, "P2", "Capacidad adaptable para duplicar el material que se transforme en cuello de botella.", ["generador de materiales antiguo", "ancient material synthesizer"]);

  window.PALGREMIO_CONSTRUCTION_PLAN = Object.freeze({ version: VERSION, tasks: Object.freeze(rows) });
})();
