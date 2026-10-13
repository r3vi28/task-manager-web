# task-manager-web

Frontend de la Task Manager API (proyecto de portafolio que verán entrevistadores). Mantenlo pequeño, limpio y legible. El backend es lo principal que se muestra.

## Idioma
- Conversa conmigo en español.
- Todo lo que quede en el repo va en inglés: código, nombres, comentarios, texto de la interfaz, README y mensajes de commit.

## Reglas para el agente
- Tú escribes todo el código y los archivos. No ejecutes comandos de git que cambien el estado (nada de add, commit, branch ni push), no instales paquetes y no levantes servidores de desarrollo. Dime el comando exacto y lo ejecuto yo.
- Trabaja una fase a la vez. Al final de cada fase: lista qué cambió, sugiere un mensaje de commit (en inglés, con prefijo semántico: feat:, fix:, chore:, docs:), dime qué debo ejecutar y qué debería ver, y detente a esperar mi confirmación.
- Nunca leas, edites ni crees `.env`. Usa `.env.example` con valores falsos.
- Al editar, muestra solo el código que cambia, no archivos completos otra vez.
- Explica brevemente las decisiones importantes, porque tengo que poder defender este código en una entrevista.

## Stack
React + TypeScript + Vite, Tailwind v4, React Router, pnpm. Un wrapper simple sobre fetch para la API. Sin librería de estado y sin kit de UI.

## API
- URL base desde `VITE_API_URL`. Producción: https://task-manager-api-vk0z.onrender.com
- Autenticación: `Authorization: Bearer <token>`. El token dura 7 días. No hay refresh token, ni /me, ni endpoint de logout. Payload del JWT: { id, role, iat, exp }; decodifícalo en el cliente para obtener el rol y la expiración. Ante cualquier 401, borra el token y redirige al login.
- La API corre en un plan gratis y se duerme tras un rato sin uso: la primera petición puede tardar cerca de un minuto. Muestra un estado de carga claro ("waking up the server") y no uses timeouts cortos.

Endpoints (todos requieren auth excepto el login):
- POST /api/auth/login { email, password } -> 200 { token, user }
- GET /api/projects -> Project[] (cada uno con sus tasks)
- POST /api/projects { name, description? } -> 201 Project
- GET /api/projects/:id -> Project con tasks
- GET /api/projects/:id/tasks?status=&priority= -> Task[]
- POST /api/projects/:id/tasks { title, description?, status?, priority?, dueDate? } -> 201 Task
- GET /api/tasks/:id -> Task
- PUT /api/tasks/:id (mismos campos, todos opcionales) -> Task
- DELETE /api/tasks/:id -> solo rol ADMIN

Tipos:
- User = { id, name, email, role: "ADMIN" | "MEMBER", createdAt }
- Project = { id, name, description: string | null, ownerId, createdAt }
- Task = { id, title, description: string | null, status, priority, assignedToId: number | null, projectId, createdAt, dueDate: string | null }
- status: "TODO" | "IN_PROGRESS" | "DONE". priority: "LOW" | "MEDIUM" | "HIGH".

## Particularidades conocidas del backend (el frontend debe manejarlas)
- PUT /api/tasks/:id reinicia status y priority a TODO y MEDIUM si no se envían. SIEMPRE envía ambos campos al editar o completar una tarea.
- dueDate solo acepta ISO en UTC con "Z" (usa `toISOString()`). Una fecha sola o con desfase horario devuelve 400.
- No ofrezcas un campo "asignado a".
- Los errores son `{ "message": ... }`, donde message es un string o un objeto de errores por campo (`{ title: ["..."] }`). Maneja ambas formas. Un cuerpo JSON mal formado devuelve una página HTML de error, no JSON.
- Borrar proyectos queda fuera de alcance (puede fallar con 500).

## Pantallas (alcance mínimo)
1. Login: email y contraseña, más un botón "Use demo account" que rellena member@demo.com / Demo1234!. Sin pantalla de registro.
2. Proyectos: listar y crear proyecto.
3. Detalle del proyecto: listar tareas, crear, editar, marcar como hecha y filtrar por estado. El botón de borrar tarea solo se muestra si el rol del JWT es ADMIN.

## Fuera de alcance
Registro, gestión de usuarios, borrar proyectos, asignación de tareas, refresh tokens.
