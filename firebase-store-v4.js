const SDK_VERSION = "12.16.0";

function cleanId(value) {
  return String(value || crypto.randomUUID()).replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 120);
}

function friendly(error) {
  const code = error?.code || "";
  if (code.includes("permission-denied")) return "Firestore rechazó el acceso. Revisa que la base siga en modo prueba.";
  if (code.includes("unavailable")) return "Firebase no está disponible. Se mantiene el modo local.";
  return error?.message || "No fue posible sincronizar con Firebase.";
}

export async function createCloudStore({ config, workspaceId, clientId, fallback, callbacks = {} }) {
  const appMod = await import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-app.js`);
  const fs = await import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-firestore.js`);
  const appName = `palgremio-v4-${workspaceId}`;
  const app = appMod.getApps().find(a => a.name === appName) || appMod.initializeApp(config, appName);
  const db = fs.getFirestore(app);
  const workspaceRef = fs.doc(db, "workspaces", workspaceId);
  const tasksRef = fs.collection(workspaceRef, "tasks");
  const historyRef = fs.collection(workspaceRef, "history");
  let taskUnsub = null;
  let workspaceUnsub = null;
  let historyUnsub = null;
  callbacks.onStatus?.("connecting", "Conectando", "Consultando tareas en Firebase");

  async function migrateIfNeeded() {
    const existing = await fs.getDocs(tasksRef);
    if (!existing.empty) return { migrated: false, count: existing.size, source: "firestore" };

    const rootSnap = await fs.getDoc(workspaceRef);
    const legacyTasks = rootSnap.exists() && Array.isArray(rootSnap.data()?.payload?.tasks)
      ? rootSnap.data().payload.tasks.filter(Boolean)
      : [];
    const fallbackTasks = Array.isArray(fallback?.tasks) ? fallback.tasks.filter(Boolean) : [];
    const sourceTasks = legacyTasks.length ? legacyTasks : fallbackTasks;
    if (!sourceTasks.length) {
      throw new Error("La migración fue detenida porque no se encontraron tareas válidas. No se creó un tablero vacío.");
    }

    for (let start = 0; start < sourceTasks.length; start += 400) {
      const batch = fs.writeBatch(db);
      sourceTasks.slice(start, start + 400).forEach((task, offset) => {
        const id = cleanId(task.id || `task-${start + offset + 1}`);
        batch.set(fs.doc(tasksRef, id), {
          ...task,
          id,
          orderKey: task.orderKey || `${String(task.base || 0).padStart(2, "0")}-${String(start + offset).padStart(4, "0")}`,
          updatedBy: clientId,
          updatedAt: fs.serverTimestamp()
        }, { merge: true });
      });
      await batch.commit();
    }

    const bases = legacyTasks.length && Array.isArray(rootSnap.data()?.payload?.bases)
      ? rootSnap.data().payload.bases
      : fallback?.bases || [];
    await fs.setDoc(workspaceRef, {
      appVersion: "4.0.0",
      schemaVersion: 6,
      taskStorage: "subcollection",
      bases,
      migration: {
        completed: true,
        source: legacyTasks.length ? "legacy-payload" : "bundled-backup",
        taskCount: sourceTasks.length,
        completedAt: fs.serverTimestamp()
      },
      updatedAt: fs.serverTimestamp(),
      updatedBy: clientId
    }, { merge: true });
    return { migrated: true, count: sourceTasks.length, source: legacyTasks.length ? "legacy-payload" : "bundled-backup" };
  }

  const migration = await migrateIfNeeded();

  taskUnsub = fs.onSnapshot(tasksRef, { includeMetadataChanges: true }, snapshot => {
    const tasks = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
    callbacks.onTasks?.(tasks, {
      fromCache: snapshot.metadata.fromCache,
      pendingWrites: snapshot.metadata.hasPendingWrites
    });
    callbacks.onStatus?.("online", "Sincronizado", `${tasks.length} tareas en tiempo real`);
  }, error => callbacks.onStatus?.("error", "Error de sincronización", friendly(error)));

  workspaceUnsub = fs.onSnapshot(workspaceRef, snap => {
    callbacks.onWorkspace?.(snap.exists() ? snap.data() : null);
  }, error => callbacks.onStatus?.("error", "Error de configuración", friendly(error)));

  try {
    const historyQuery = fs.query(historyRef, fs.orderBy("createdAt", "desc"), fs.limit(100));
    historyUnsub = fs.onSnapshot(historyQuery, snap => {
      callbacks.onHistory?.(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  } catch {
    callbacks.onHistory?.([]);
  }

  async function addHistory(entry) {
    try {
      await fs.addDoc(historyRef, {
        ...entry,
        clientId,
        createdAt: fs.serverTimestamp()
      });
    } catch {
      // El historial no debe impedir guardar una tarea.
    }
  }

  return {
    migration,
    async saveTask(task, previous = null) {
      const id = cleanId(task.id);
      callbacks.onStatus?.("saving", "Guardando", task.item || "Actualizando tarea");
      await fs.setDoc(fs.doc(tasksRef, id), {
        ...task,
        id,
        updatedBy: clientId,
        updatedAt: fs.serverTimestamp()
      }, { merge: true });
      await addHistory({
        action: previous ? "updated" : "created",
        taskId: id,
        label: task.item || id,
        base: Number(task.base || 0),
        before: previous || null,
        after: task
      });
    },
    async deleteTask(task) {
      await fs.deleteDoc(fs.doc(tasksRef, cleanId(task.id)));
      await addHistory({
        action: "deleted",
        taskId: task.id,
        label: task.item || task.id,
        base: Number(task.base || 0),
        before: task,
        after: null
      });
    },
    async saveWorkspace(fields) {
      await fs.setDoc(workspaceRef, {
        ...fields,
        appVersion: "4.0.0",
        schemaVersion: 6,
        updatedBy: clientId,
        updatedAt: fs.serverTimestamp()
      }, { merge: true });
    },
    disconnect() {
      taskUnsub?.();
      workspaceUnsub?.();
      historyUnsub?.();
      callbacks.onStatus?.("local", "Modo local", "Sin conexión en tiempo real");
    }
  };
}

export { friendly as friendlyFirebaseError };
