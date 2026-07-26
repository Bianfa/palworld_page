# Plan de Bases Palworld 1.0

Aplicación editable para organizar 6 bases, prioridades, Pals, producción y crianza.

El sitio se publica con GitHub Pages desde `site.zip`. Los datos se guardan localmente y, al conectar Firebase, se sincronizan en Firestore sin perderse cuando se publica una nueva versión.

URL prevista: `https://bianfa.github.io/palworld_page/`

## Publicación

En GitHub abre **Settings → Pages → Build and deployment → Source → GitHub Actions** si todavía no está seleccionado.

## Sincronización

La aplicación incluye un asistente para pegar la configuración de una app web Firebase y compartir un mismo `workspaceId`. Antes hay que crear Firestore, habilitar Authentication anónima y publicar las reglas incluidas en el sitio.
