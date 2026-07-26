# Plan de Bases Palworld 1.0

Aplicación editable para planificar 6 bases, registrar Pals, prioridades, cantidades, tareas, producción y crianza.

## Sitio

`https://bianfa.github.io/palworld_page/`

## Persistencia

- Los cambios se guardan primero en el navegador.
- La aplicación se conecta automáticamente al tablero compartido `palgremio-tarde-juegos-2026` en Cloud Firestore.
- Las nuevas versiones fusionan su estructura con los datos existentes y conservan avances, textos editados, prioridades, filas creadas y eliminadas.
- También permite exportar e importar respaldos JSON.

## Firebase

Proyecto: `palgremio`.

Para esta actividad se usa Cloud Firestore en modo prueba, sin Authentication. Es simple y suficiente para una tarde de juegos, pero cualquier persona con el enlace puede modificar los datos. El modo prueba creado por Firebase normalmente incluye una fecha de expiración.

## Publicación

El workflow de GitHub Actions reconstruye el paquete desde `site.b64.*` y lo publica automáticamente en GitHub Pages. En Settings → Pages debe estar seleccionada la fuente GitHub Actions.
