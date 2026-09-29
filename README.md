# GanaBol

Sistema móvil de gestión ganadera para explotaciones bovinas tradicionales del
departamento de Santa Cruz, Bolivia.

Proyecto de grado — Licenciatura en Ingeniería de Sistemas, Universidad Privada
del Valle (UNIVALLE). Caso de estudio: establecimiento ganadero Sabayones, zona
del Izozog, Chaco cruceño.

## Estructura

```
backend/    API REST (NestJS + Prisma + PostgreSQL)
mobile/     Aplicación móvil (Flutter + Drift/SQLite)
docs/       Documentación técnica y evidencias de pruebas
```

## Estado

**Incremento 1 — Identidad, accesos e inventario bovino.** Implementado:
autenticación JWT con refresh de larga duración, control de acceso por roles
(RBAC), y registro, consulta, actualización y baja de animales con
identificación individual. Incluye el endpoint de cambios que alimenta la
sincronización diferida del cliente móvil.

Incrementos posteriores (sanidad, estimación de peso, selección para venta y
panel web) están planificados y documentados, pero no implementados.

## Puesta en marcha del backend

```bash
docker compose up -d postgres

cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run db:seed
npm run start:dev
```

La documentación interactiva de la API queda en `http://localhost:3000/api/docs`.

### Usuarios de prueba

Todos con contraseña `Ganabol2026`:

| Correo | Rol |
|--------|-----|
| admin@ganabol.bo | Administrador |
| propietario@ganabol.bo | Propietario |
| campo@ganabol.bo | Personal de campo |
| veterinario@ganabol.bo | Veterinario |

## Puesta en marcha de la aplicación móvil

El repositorio guarda el código de la app, no las carpetas de plataforma, que
se generan localmente:

```bash
cd mobile
flutter create . --platforms=android,windows
flutter pub get
dart run build_runner build
```

Para correrla apuntando a un backend local:

```bash
# Emulador de Android (10.0.2.2 es el alias del host)
flutter run --dart-define=API_URL=http://10.0.2.2:3000/api

# Teléfono físico: usar la IP de la máquina en la red local
flutter run --dart-define=API_URL=http://192.168.1.10:3000/api

# Escritorio, para iterar la interfaz con hot reload
flutter run -d windows --dart-define=API_URL=http://localhost:3000/api
```

Pruebas: `flutter test` en `mobile/`, `npm test` en `backend/`.

## Decisiones de diseño

**Identificadores ULID generados en el cliente.** El animal recibe su
identificador en el dispositivo, antes de existir conexión. Esto permite
registrar en campo sin señal y sincronizar después sin colisiones, y hace que
el reenvío de un registro tras una respuesta perdida sea idempotente.

**Baja lógica en lugar de borrado físico.** La sincronización necesita
propagar la eliminación a los dispositivos; un `DELETE` no deja rastro que
transmitir.

**Unicidad de caravana por predio.** La numeración de manejo se repite entre
establecimientos distintos, de modo que la restricción global sería incorrecta
para el dominio.

**La interfaz lee y escribe siempre contra la base local.** Ninguna pantalla
espera a la red: las consultas son streams sobre SQLite y la sincronización
ocurre aparte. Cuando trae cambios del servidor, la lista se actualiza sola.

**Objetivos táctiles de 56 px y color siempre acompañado de texto.** La app se
usa a la intemperie, con sol directo y las manos ocupadas; la distinción por
color solo no es confiable en esas condiciones.
