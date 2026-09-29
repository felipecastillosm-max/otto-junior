# Progreso — Otto Junior

Estado del proyecto, en lenguaje simple, para retomar rápido en cualquier sesión nueva.

_Última actualización: 29 de septiembre de 2026_

## Fase actual: diseño de frontend

Se decidió terminar todo el diseño visual antes de conectar el backend real. Todas las pantallas usan datos de ejemplo (mock), no hay persistencia todavía.

## ✅ Infraestructura (completa y probada)

- Repositorio GitHub conectado, con copia local en VS Code
- Apps Script + Cloudflare Worker desplegándose automáticamente en cada push (esto es la infraestructura de la primera versión del backend — **va a reemplazarse por Supabase**, ver `CLAUDE.md`)
- Circuito end-to-end probado (`?action=ping`) — funciona
- Identidad visual definida: colores (teal `#00b9a6` / naranjo `#ff9800`), tipografía Roboto, logo y wordmark aplicados

## ✅ Pantalla: Inicio (`index.html`)

- Header con wordmark de marca
- Tarjeta "Viaje actual" con barra de progreso del trayecto
- Grilla de 2 columnas: mapa simulado con ruta + alarma de próximo paradero (estilo señalética vial) | botones de navegación a las 3 secciones
- Footer con créditos

## ✅ Pantalla: Pasajeros (`pasajeros.html`)

- Selector de **Contrato**
- Selector de **Tipo de bus**, con 3 plantillas de asientos reales de la empresa:
  - **Semi Cama (46, 1 piso, 2+2)** — confirmado
  - **Salón Cama — Volvo B450R (43, 2 pisos, 2+1)** — parcialmente confirmado, marcado "a confirmar"
  - **Salón Cama — Irizar (42)** — **pendiente corrección**: se armó como copia del Volvo (2 pisos) pero el usuario aclaró que el Irizar es de **1 piso**. Falta confirmar si su distribución interna es 2+1 (14 filas × 3 = 42) o distinta.
- Mapa de asientos clickeable: asiento libre → buscador de pasajeros del contrato; asiento ocupado → ficha con datos + editar/quitar
- Formulario de pasajero: Nombre, RUT, Teléfono de emergencia, Contrato — mismo formulario sirve para crear y editar
- Panel "Ver relación de pasajeros": lista ordenada por número de asiento, pensada para transcribir a mano a la hoja oficial de Carabineros

## 🚧 Pendiente inmediato

1. **Corregir el Irizar** a 1 piso (esperando confirmación de la distribución interna exacta)
2. Confirmar el Volvo B450R contra el bus real (sobre todo el final de cada piso, cerca del baño/escaleras)

## ⏳ No empezado todavía

- **`paradero.html`**: sigue con datos de ejemplo estáticos, no conectada a GPS real ni a los asientos asignados en `pasajeros.html`
- **`reporte.html`**: sigue siendo wireframe estático, sin generar el mensaje de WhatsApp con datos reales
- **GPS real** (Geolocation API + cálculo de distancia a paraderos)
- **Backend real con Supabase** (reemplazar Apps Script/Sheets) + sincronización offline vía IndexedDB
- **Lista de pasajeros colaborativa** (varios asistentes editando en tiempo real — depende de Supabase)
- **Empaquetado con Capacitor** (fase final, app instalable con GPS en segundo plano)

## Otros proyectos anotados (no iniciados)

- **Otto Hause**: administrador de ingresos/gastos con medidor tipo estanque de combustible. Repositorio propio aún no creado (falta permiso de creación de repos en esta sesión, o que el usuario lo cree manualmente en github.com/new).
