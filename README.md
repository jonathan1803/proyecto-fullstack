# TaskAI — Sistema de Gestión de Tareas Inteligente

> **Prueba Técnica:** Sistema de Gestión de Tareas Inteligente (TaskAI)  
> **Candidato:** Jonathan Landaverde  
> **Stack:** NestJS + TypeScript (Backend) | React + Vite (Frontend) | PostgreSQL + TypeORM (Base de Datos) | Swagger OpenAPI

---

## 📋 Resumen Ejecutivo

**TaskAI** es una solución full-stack diseñada para la administración eficiente de tareas con evaluación automática de prioridades mediante reglas de negocio en el backend, eliminación lógica con preservación histórica (Soft Delete), validaciones de fecha límite a nivel dual (cliente y servidor) y una interfaz de usuario reactiva moderna desarrollada bajo los más altos estándares de diseño web y micro-animaciones.

---

## 🎯 Cumplimiento de Requerimientos Funcionales

| Código | Requerimiento | Implementación y Criterio Técnico |
|---|---|---|
| **RF-01** | **Registro de tareas** | Formulario completo que captura: `título` (requerido, máx. 255 car.), `descripción` (opcional), `prioridad` (Baja, Media, Alta) y `fecha límite` (requerido, formato YYYY-MM-DD). |
| **RF-02** | **Asignación automática de prioridad** | **Regla de negocio en Backend:** Si el título contiene la palabra `"Urgente"` (sin distinguir mayúsculas/minúsculas: `/urgente/i`), el backend asigna automáticamente la prioridad **Alta**. La prioridad calculada tiene **precedencia absoluta** sobre el valor enviado por el cliente. En el frontend se ofrece un indicador visual proactivo e interactivo que informa al usuario que dicha regla se aplicará. |
| **RF-03** | **Validación de fecha límite** | Validación en frontend y backend: la fecha límite **no puede ser anterior a la fecha actual**. Se permite registrar tareas cuya fecha corresponda al día de hoy o fechas futuras. Si se envía una fecha pasada, la API rechaza la solicitud retornando **HTTP 400 Bad Request** con el mensaje: `"La fecha límite no puede ser anterior a la fecha actual."`. |
| **RF-04** | **Consulta de tareas** | Interfaz que consume el endpoint `GET /api/tasks` mostrando la información relevante (título, descripción, prioridad, fecha límite formateada, fecha de creación y badges de estado). Incluye barra de búsqueda en tiempo real, filtros por prioridad y tarjetas de métricas cuantitativas. |
| **RF-05** | **Eliminación de tareas (Soft Delete)** | Cada tarea cuenta con un botón de eliminación que despliega un modal de confirmación accesible. La eliminación se ejecuta en el backend mediante **Soft Delete** (`@DeleteDateColumn() deletedAt` en TypeORM), preservando la integridad del historial en PostgreSQL. Tras confirmar, la tarea desaparece del listado **sin recargar la página**. |
| **RF-06** | **Actualización dinámica de la interfaz** | La interfaz reacciona instantáneamente: al registrar una tarea, se incorpora de inmediato a la lista sin recargas. Las tareas con prioridad **Alta** se destacan visualmente mediante un borde rojo suave (`rgba(239, 68, 68, 0.45)`), un fondo con degradado sutil (`rgba(239, 68, 68, 0.12)`) y un badge con icono. Al eliminar una tarea, se ejecuta una animación CSS de desaparición (`fade-out`, escala y desplazamiento lateral) que afecta **exclusivamente al item eliminado**, antes de purgarlo del estado. |

---

## 🏗️ Decisiones de Arquitectura y Construcción

1. **Separación de Responsabilidades y Seguridad de Negocio:**
   - La regla de prioridad automática (**RF-02**) se aplica de manera inmutable en `TasksService.create()`. Aunque un cliente malicioso manipule el payload HTTP enviando `priority: "Baja"`, si el título incluye `"Urgente"`, el backend sobrescribe la prioridad a `"Alta"` antes de persistir en base de datos.
2. **Defensa en Profundidad (Validación en Frontend y Backend):**
   - En el frontend, el campo de fecha cuenta con el atributo HTML5 `min="YYYY-MM-DD"` y validación en JavaScript para retroalimentación instantánea.
   - En el backend, se implementa un validador personalizado con `class-validator` (`IsNotPastDate`) y una comprobación de salvaguarda en la capa de servicio para garantizar consistencia incluso ante peticiones directas de API.
3. **Estrategia de Soft Delete (RF-05):**
   - Se utiliza el decorador `@DeleteDateColumn({ type: 'timestamptz', nullable: true })` en TypeORM. Al llamar a `taskRepository.softDelete(id)`, TypeORM establece la fecha actual en `deletedAt`. Todas las consultas normales `find()` excluyen automáticamente registros con fecha de eliminación, manteniendo intacta la integridad histórica para auditoría.
4. **Experiencia de Usuario y Animaciones (RF-06):**
   - En lugar de recargar el navegador o hacer refetch global del listado, la aplicación aplica un flujo optimista y reactivo con React (`useState`), animando la salida del item con la clase `.deleting` durante 350ms antes de retirarlo del DOM.
5. **Estética y Sistema de Diseño Vanilla CSS:**
   - Para cumplir estrictamente con las instrucciones de evitar dependencias excesivas y proporcionar un diseño personalizado de alto impacto, se construyó un sistema de tokens en Vanilla CSS con paleta oscura moderna, efectos de *glassmorphism* (`backdrop-filter: blur`), tipografía moderna (*Plus Jakarta Sans* y *JetBrains Mono*) y micro-interacciones suaves.
6. **Estructura Git y Conventional Commits:**
   - Todo el historial de desarrollo se construyó paso a paso mediante commits semánticos bajo la convención *Conventional Commits* (`chore`, `feat`, `docs`, `test`), facilitando la trazabilidad de cada fase del proyecto.

---

## 📖 Documentación OpenAPI / Swagger (Plus)

La API cuenta con documentación OpenAPI 3.0 completa, anotada mediante `@nestjs/swagger`:
- **Documentación Interactiva Swagger UI:** Disponible en vivo en [`http://localhost:3000/api/docs`](http://localhost:3000/api/docs).
- **Especificación Exportada:** Se incluye el archivo estático [`backend/openapi.json`](file:///Users/jonathanlandaverde/Desktop/prueba%20tareas/backend/openapi.json) listo para importar en Postman, Insomnia o Swagger Editor.

### Endpoints Principales

| Método | Ruta | Descripción | Códigos HTTP |
|---|---|---|---|
| `POST` | `/api/tasks` | Registra una tarea con reglas RF-02 y RF-03 | `201 Created`, `400 Bad Request` |
| `GET` | `/api/tasks` | Lista tareas activas (no eliminadas) | `200 OK` |
| `GET` | `/api/tasks/:id` | Consulta una tarea específica por UUID | `200 OK`, `404 Not Found` |
| `PATCH` | `/api/tasks/:id` | Actualiza campos de una tarea | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/api/tasks/:id` | Ejecuta Soft Delete de la tarea | `200 OK`, `404 Not Found` |

---

## 🚀 Guía de Instalación y Ejecución

### Prerrequisitos
- Node.js v18 o superior (v22 recomendado)
- npm v9+
- Docker y Docker Compose (opcional, si no se cuenta con PostgreSQL local)

### 1. Clonar / Abrir el Repositorio
```bash
cd "prueba tareas"
```

### 2. Base de Datos PostgreSQL
Se provee una configuración lista con Docker Compose:
```bash
# Iniciar contenedor PostgreSQL (taskai_db en puerto 5432)
docker compose up -d
```
> *Nota:* Si ya cuentas con PostgreSQL corriendo en local, simplemente verifica las credenciales en tu `.env` (usuario por defecto `postgres`, contraseña `postgres`, base de datos `taskai_db`).

### 3. Ejecutar Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
```
El servidor backend iniciará en `http://localhost:3000/api`.  
La documentación Swagger estará disponible en `http://localhost:3000/api/docs`.

### 4. Ejecutar Frontend (React + Vite)
En una nueva terminal:
```bash
cd frontend
npm install
npm run dev
```
La aplicación web estará disponible en `http://localhost:5173/`.

### 5. Ejecución Rápida Todo en Uno (Opcional)
Desde la raíz del proyecto puedes correr ambos servicios con:
```bash
npm run dev
```

---

## 🧪 Ejecución de Pruebas Automatizadas

El backend incluye pruebas unitarias exhaustivas con Jest que verifican específicamente las reglas de negocio de la prueba técnica (**RF-02**, **RF-03** y **RF-05**):

```bash
cd backend
npm test
```

### Casos de Prueba Incluidos:
- ✅ **RF-02:** Asignación automática de prioridad `Alta` cuando el título contiene `"Urgente"`, `"urgente"` o `"URGENTE"`, sobrescribiendo valores enviados por el cliente.
- ✅ **RF-02:** Respeto a la prioridad elegida por el cliente cuando el título no contiene `"urgente"`.
- ✅ **RF-03:** Aceptación de tareas cuya fecha límite es la fecha de hoy.
- ✅ **RF-03:** Aceptación de tareas con fechas límites futuras.
- ✅ **RF-03:** Rechazo con `BadRequestException (HTTP 400)` cuando la fecha límite es anterior a la actual.
- ✅ **RF-05:** Ejecución correcta de `softDelete` y verificación de `deletedAt`.

---

## 🤖 Guía para Agentes de Inteligencia Artificial

Para consultar las normas de trabajo, mapa de arquitectura y políticas de extensión para agentes autónomos o asistentes de código, revisa el archivo [`AGENTS.md`](file:///Users/jonathanlandaverde/Desktop/prueba%20tareas/AGENTS.md).
