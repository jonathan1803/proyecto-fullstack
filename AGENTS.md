# AGENTS.md — TaskAI System Guidelines

Este archivo proporciona la guía operacional, estándares arquitectónicos y directivas de contexto para agentes de Inteligencia Artificial (y desarrolladores) que interactúen con este repositorio.

---

## 1. Visión General del Proyecto

**TaskAI** es un sistema de gestión inteligente de tareas desarrollado como prueba técnica full-stack. Implementa automatización de reglas de negocio en el backend, integridad referencial mediante Soft Delete, documentación viva OpenAPI y una interfaz reactiva moderna con animaciones fluidas sin recargas de página.

### Stack Tecnológico
- **Backend:** NestJS 11 + TypeScript + TypeORM + `@nestjs/swagger` + `class-validator`
- **Base de Datos:** PostgreSQL 15 (con soporte Docker Compose)
- **Frontend:** React 19 + Vite + TypeScript + Vanilla CSS (Design System propio) + `lucide-react`
- **Control de Versiones:** Git con convención *Conventional Commits*

---

## 2. Reglas de Negocio Críticas (Obligatorias)

Todo agente o desarrollador que modifique o extienda la lógica debe preservar incondicionalmente las siguientes reglas:

| Regla | Requisito | Implementación |
|---|---|---|
| **RF-01: Registro** | Formulario con título, descripción, prioridad y fecha límite. | Validaciones con `class-validator` en `CreateTaskDto` y formulario reactivo en frontend. |
| **RF-02: Prioridad Automática** | Si el título contiene la palabra **"Urgente"** (sin distinguir mayúsculas/minúsculas), el backend asigna automáticamente prioridad **Alta**. La prioridad calculada tiene **precedencia absoluta** sobre cualquier valor enviado por el cliente. Debe ejecutarse **exclusivamente en el backend**. | `TasksService.create()` evalúa `/urgente/i.test(dto.title)`. Si coincide, fuerza `TaskPriority.ALTA`. |
| **RF-03: Fecha Límite** | La fecha límite no puede ser anterior al día actual. Se permiten fechas del día de hoy en adelante. Validación en frontend y backend. Si no cumple, rechazar con **HTTP 400 Bad Request** y mensaje descriptivo. | Decorador `IsNotPastDate` en backend + validación defensiva en `TasksService`. Atributo `min` y validación preventiva en `TaskForm.tsx`. |
| **RF-04: Consulta** | Presentar listado/tabla reactiva de tareas con metadatos clave. | `GET /api/tasks` ordenado por fecha límite ascendente y creación descendente. Filtros y búsqueda en cliente. |
| **RF-05: Eliminación (Soft Delete)** | Eliminación lógica preservando registros históricos. Desaparición del listado sin recargar la página. | Decorador `@DeleteDateColumn()` en TypeORM y método `taskRepository.softDelete(id)`. |
| **RF-06: UI Dinámica** | Actualizaciones reactivas instantáneas (sin reload). Destacado visual en color rojo suave para prioridad Alta. Animación de desaparición que afecta **únicamente** al item eliminado. | Estado reactivo de React (`useState`), estilos CSS `.priority-alta` con degradado y borde rojo sutil, y keyframe animation `.deleting` (`taskDisappear`) en `index.css`. |

---

## 3. Estructura del Repositorio

```text
prueba-tareas/
├── .env.example              # Variables de entorno globales
├── .gitignore                # Reglas de exclusión para Git
├── docker-compose.yml        # Servicio PostgreSQL para desarrollo
├── package.json              # Scripts raíz para orquestación de servicios
├── README.md                 # Documentación exhaustiva para evaluadores humanos
├── AGENTS.md                 # Instrucciones operativas para agentes de IA
│
├── backend/                  # API REST en NestJS
│   ├── src/
│   │   ├── tasks/
│   │   │   ├── dto/          # CreateTaskDto, UpdateTaskDto
│   │   │   ├── entities/     # Task entity con TypeORM y soft delete
│   │   │   ├── enums/        # TaskPriority ('Baja', 'Media', 'Alta')
│   │   │   ├── validators/   # Validador de fecha límite no anterior a hoy
│   │   │   ├── tasks.controller.ts  # Endpoints REST y decoradores OpenAPI
│   │   │   ├── tasks.service.ts     # Reglas de negocio RF-02, RF-03, RF-05
│   │   │   ├── tasks.service.spec.ts # Pruebas unitarias de las reglas
│   │   │   └── tasks.module.ts
│   │   ├── app.module.ts     # Configuración TypeORM y PostgreSQL
│   │   └── main.ts           # Swagger OpenAPI (/api/docs), CORS, ValidationPipe
│   ├── openapi.json          # Especificación OpenAPI 3.0 exportada
│   └── package.json
│
└── frontend/                 # Aplicación SPA en React + Vite
    ├── src/
    │   ├── components/
    │   │   ├── TaskStats.tsx     # Métricas en tiempo real (Total, Alta, Urgentes, Hoy)
    │   │   ├── TaskForm.tsx      # Formulario reactivo con detector visual RF-02
    │   │   ├── TaskList.tsx      # Listado con filtros, badges y delete trigger
    │   │   ├── DeleteModal.tsx   # Modal accesible de confirmación RF-05
    │   │   └── Toast.tsx         # Sistema de notificaciones de feedback
    │   ├── services/
    │   │   └── api.ts            # Cliente fetch desacoplado y manejo de errores
    │   ├── types/
    │   │   └── task.ts           # Definiciones TypeScript de entidades y DTOs
    │   ├── index.css             # Design System en Vanilla CSS con animaciones
    │   ├── App.tsx               # Orquestación de estado y sincronización reactiva
    │   └── main.tsx
    ├── index.html
    └── package.json
```

---

## 4. Comandos de Operación

### Iniciar Base de Datos (PostgreSQL)
```bash
# Levantar contenedor en el puerto 5432
docker compose up -d
```

### Ejecutar Backend
```bash
cd backend
npm install
npm run start:dev       # Modo desarrollo con recarga en caliente
# o para producción compilada:
npm run build && node dist/main.js
```
- API Base: `http://localhost:3000/api`
- Swagger UI interactivo: `http://localhost:3000/api/docs`

### Ejecutar Pruebas Unitarias Backend
```bash
cd backend
npm test
```

### Ejecutar Frontend
```bash
cd frontend
npm install
npm run dev
```
- Aplicación Web: `http://localhost:5173/`

### Ejecutar Todo Simultáneamente (desde la raíz)
```bash
npm run dev
```

---

## 5. Convenciones de Código y Commits

1. **Conventional Commits Obligatorio:**
   - `feat(...)`: Nuevas funcionalidades (ej. `feat(backend): implement task business rules`).
   - `fix(...)`: Correcciones de errores o inconsistencias.
   - `docs(...)`: Documentación (`README.md`, `AGENTS.md`, OpenAPI).
   - `test(...)`: Pruebas unitarias o de integración.
   - `chore(...)`: Configuración, dependencias o herramientas de compilación.

2. **TypeScript Estricto:**
   - Evitar el uso de `any`.
   - Utilizar `import type` para tipos en entornos con `verbatimModuleSyntax`.
   - Mantener tipado coherente entre las entidades del backend y los tipos del frontend.

3. **Manejo de Errores HTTP:**
   - Errores de validación deben responder siempre con código `HTTP 400 Bad Request` y un arreglo o string explicativo en el campo `message`.
   - Elementos no encontrados deben responder con `HTTP 404 Not Found`.

4. **Persistencia e Integridad:**
   - Nunca utilizar `DELETE` físico (`taskRepository.delete`) para tareas; siempre invocar `taskRepository.softDelete`.
   - En las consultas normales, respetar el filtrado automático de TypeORM para omitir registros con `deletedAt IS NOT NULL`.
