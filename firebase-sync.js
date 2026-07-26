const SDK_VERSION = "12.16.0";
let active = null;

export async function connectFirebaseSync({ config, workspaceId, clientId, onRemote, onStatus }) {
  if (!config?.apiKey || !config?.projectId || !config?.appId) throw new Error("La configuración Firebase está incompleta.");
  if (!workspaceId || workspaceId.length < 12) throw new Error("El ID compartido debe tener al menos 12 caracteres.");
  if (active?.disconnect) active.disconnect();
  onStatus?.("connecting", "Conectando con Firebase…");

  const appMod = await import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-app.js`);
  const fsMod = await import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-firestore.js`);
  const appName = `palworld-${config.projectId}-${workspaceId}`;
  const existing = appMod.getApps().find((a) => a.name === appName);
  const app = existing || appMod.initializeApp(config, appName);
  const db = fsMod.getFirestore(app);
  const ref = fsMod.doc(db, "workspaces", workspaceId);

  let unsub = fsMod.onSnapshot(ref, { includeMetadataChanges: true }, (snap) => {
    if (!snap.exists()) {
      onRemote?.(null, { exists: false, fromCache: snap.metadata.fromCache });
      return;
    }
    const value = snap.data();
    onRemote?.(value, { exists: true, pendingWrites: snap.metadata.hasPendingWrites, fromCache: snap.metadata.fromCache });
  }, (error) => onStatus?.("error", friendlyFirebaseError(error)));

  active = {
    async push(payload, revision) {
      onStatus?.("saving", "Guardando en la nube…");
      await fsMod.setDoc(ref, {
        payload,
        revision,
        appVersion: payload.appVersion || "2.0.0",
        updatedBy: clientId,
        updatedAt: fsMod.serverTimestamp()
      }, { merge: true });
      onStatus?.("online", "Sincronizado");
    },
    disconnect() { if (unsub) unsub(); unsub = null; onStatus?.("local", "Solo local"); }
  };
  onStatus?.("online", "Conectado");
  return active;
}

export function friendlyFirebaseError(error) {
  const code = error?.code || "";
  if (code.includes("permission-denied")) return "Firestore rechazó el acceso. Crea la base de datos en modo prueba o revisa sus reglas.";
  return error?.message || "No se pudo conectar con Firebase.";
}
