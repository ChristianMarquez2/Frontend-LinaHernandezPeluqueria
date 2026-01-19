# Sistema de Manejo de Errores y Logging

## Descripción General

La aplicación ahora incluye un sistema integral de manejo de errores y logging centralizado para mejorar la depuración, el monitoreo y la experiencia del usuario. Además, la gestión automática de sesiones con detección de inactividad asegura que las sesiones de usuario sean seguras.

## Componentes

### 1. Servicio Logger (`src/services/logger.ts`)

Servicio de logging centralizado con múltiples niveles de log.

**Niveles de Log:**
- `DEBUG` - Solo desarrollo, depuración de bajo nivel
- `INFO` - Información general sobre el flujo de la aplicación
- `WARN` - Mensajes de advertencia para problemas no críticos
- `ERROR` - Mensajes de error para problemas críticos

**Uso:**

```typescript
import { logger } from '@/services/logger';

// Debug log (solo en desarrollo)
logger.debug('Usuario logueado', { userId: '123' }, 'LoginComponent');

// Info log
logger.info('Dashboard cargado correctamente', { userId: '456' }, 'Dashboard');

// Warning log
logger.warn('Error al cargar datos del cliente', { clientId: '789', status: 403 }, 'AppointmentCalendar');

// Error log (incluye console.error + rastreo en la nube opcional)
logger.error('Error en solicitud de API', { error: err, endpoint: '/bookings' }, 'ClientDashboard');
```

**Características:**
- Timestamps automáticos
- Rastreo de nombre de componente
- Logs de depuración solo en desarrollo
- Almacenamiento de logs en memoria (máximo 500 logs)
- Funcionalidad de exportación y descarga de logs
- Preparación para integración con servicios en la nube (Sentry, LogRocket, etc.)

**Métodos:**

```typescript
// Obtener todos los logs
const allLogs = logger.getLogs();

// Obtener logs por nivel
const errors = logger.getLogsByLevel(LogLevel.ERROR);

// Exportar como string JSON
const json = logger.exportLogs();

// Descargar logs como archivo
logger.downloadLogs();

// Limpiar todos los logs
logger.clearLogs();
```

### 2. Componente Error Boundary (`src/components/ErrorBoundary.tsx`)

Error boundary de React que captura errores de componentes y previene pantallas blancas.

**Características:**
- Captura errores de componentes React
- Interfaz de error profesional con colores del tema
- Detalles del error mostrados en modo desarrollo
- Botón de reinicio para recuperarse del estado de error
- Auto-registra errores al servicio logger
- Diseño responsivo

**Uso:**

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Envuelve tu aplicación o secciones específicas
export default function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}

// Con interfaz de error personalizada
<ErrorBoundary fallback={<CustomErrorScreen />}>
  <DashboardContent />
</ErrorBoundary>
```

**Interfaz de Error:**
- Muestra icono de error y mensaje en español
- Muestra pila de componentes en desarrollo
- Proporciona botones "Reintentar" e "Inicio"
- Información de contacto por correo electrónico

### 3. Puntos de Integración

#### App.tsx
```typescript
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { logger } from "@/services/logger";

export default function App() {
  logger.info('Aplicación inicializada');
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        {/* Contenido de la aplicación */}
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

#### Servicio de API (`src/services/api.ts`)
```typescript
import { logger } from './logger';

async function request<T>(...) {
  try {
    logger.debug(`Solicitud de API: ${method} ${url}`, { body }, 'API');
    const res = await fetch(...);
    
    if (!res.ok) {
      logger.warn(`Error de API: ${method} ${url} - Estado ${status}`, { error: payload?.error }, 'API');
      return { ok: false, ... };
    }
    
    logger.debug(`Éxito en API: ${method} ${url} - Estado ${status}`, {}, 'API');
    return { ok: true, ... };
  } catch (err: any) {
    logger.error(`Error de Red en API: ${method} ${url}`, { message: err?.message }, 'API');
    return { ok: false, ... };
  }
}
```

#### Dashboard del Cliente (`src/components/dashboards/ClientDashboard/index.tsx`)
```typescript
import { logger } from '@/services/logger';

export function ClientDashboard() {
  useEffect(() => {
    const load = async () => {
      logger.info('ClientDashboard: Cargando datos del dashboard', { userId }, 'ClientDashboard');
      try {
        await fetchData();
        logger.debug('ClientDashboard: Datos cargados correctamente', {}, 'ClientDashboard');
      } catch (err) {
        logger.error('ClientDashboard: Error al cargar dashboard', { error: err }, 'ClientDashboard');
      }
    };
    load();
  }, []);
}
```

#### Gestión del Calendario (`src/components/management/calendar/useAppointmentCalendar.ts`)
```typescript
import { logger } from '@/services/logger';

export function useAppointmentCalendar(...) {
  const fetchBookings = useCallback(async () => {
    logger.debug('Obteniendo citas', { selectedDate, selectedStylistId }, 'useAppointmentCalendar');
    try {
      const data = await dataService.fetchAllBookings(...);
      logger.info('Citas obtenidas correctamente', { count: data.length }, 'useAppointmentCalendar');
    } catch (err) {
      logger.error("Error al obtener citas", { error: err }, 'useAppointmentCalendar');
    }
  }, [...]);
}
```

## Mejores Prácticas

### Cuándo Registrar

1. **INFO** - Acciones del usuario, operaciones exitosas
   - Inicio/cierre de sesión de usuario
   - Datos cargados correctamente
   - Reserva creada

2. **DEBUG** - Ciclo de vida del componente, cambios de estado
   - Componente montado/desmontado
   - Cambios de filtros
   - Detalles de solicitud de API
   - *Solo mostrado en desarrollo*

3. **WARN** - Problemas no críticos que necesitan atención
   - Error al cargar datos de usuario (pero existe respaldo)
   - API devuelve 403/404
   - Advertencias de validación

4. **ERROR** - Fallos críticos
   - Errores de API sin respaldo
   - Excepciones inesperadas
   - Fallos de autenticación

### Formato de Log

```typescript
logger.[level](
  'Mensaje legible por humanos',
  { claveContexto: valorContexto },  // Objeto de contexto opcional
  'NombreDelComponente'               // Nombre del componente opcional
);
```

### Desarrollo vs Producción

- Los logs **DEBUG** solo aparecen en desarrollo (`import.meta.env.DEV`)
- Los logs **ERROR** en producción pueden enviarse a servicios en la nube
- Los logs en memoria se preservan (máximo 500 entradas)

## Integración con Servicios en la Nube (Futuro)

El servicio logger está preparado para integración con servicios en la nube:

```typescript
// En logger.ts método sendToErrorTracking()
private sendToErrorTracking(message: string, data: any, source?: string) {
  // Ejemplo con Sentry:
  if (window.Sentry) {
    window.Sentry.captureException(new Error(message), {
      contexts: { data, source },
    });
  }
}
```

Para habilitar:
1. Instalar SDK del servicio en la nube (ej: `npm install @sentry/react`)
2. Inicializar en main.tsx o App.tsx
3. Descomentar código de integración en `sendToErrorTracking()`

## Depuración

### Ver Logs en Consola

```typescript
// Obtener todos los logs
const logs = logger.getLogs();
console.table(logs);

// Obtener solo logs de error
const errors = logger.getLogsByLevel(LogLevel.ERROR);
console.table(errors);
```

### Descargar Logs

```typescript
// En consola del navegador:
logger.downloadLogs();
// Esto descargará un archivo JSON con todos los logs
```

### Recuperación de Error Boundary

Los usuarios pueden recuperarse del estado de error por:
1. Hacer clic en el botón "Intentar de nuevo" (Retry)
2. Hacer clic en el botón "Inicio" (Home) para navegar a la página de inicio

## Testing

Probar el manejo de errores:

```typescript
// Forzar un error
throw new Error('Error de prueba');

// El error debe ser capturado por ErrorBoundary y registrado
// El usuario ve una pantalla de error profesional con opción de reintentar
```

## Consideraciones de Rendimiento

- El Logger mantiene máximo 500 logs en memoria para prevenir fugas de memoria
- Los logs más antiguos se eliminan cuando se alcanza el límite
- Los logs DEBUG se crean solo en desarrollo (overhead mínimo)
- La recuperación y exportación de logs son operaciones O(n)
- El temporizador de inactividad utiliza eventos con debounce para minimizar impacto en el rendimiento
- Auto-refresh se ejecuta cada 14 minutos para mantener la sesión viva

## Gestión de Sesiones

### Logout Automático por Inactividad

La aplicación automáticamente cierra la sesión de usuarios después de **20 minutos de inactividad** para asegurar la seguridad.

**Configuración** (`src/config/session.ts`):
```typescript
export const SESSION_CONFIG = {
  INACTIVITY_TIMEOUT_MIN: 20,       // Auto-logout después de 20 min de inactividad
  ACCESS_TOKEN_TTL_MIN: 15,         // Token de acceso expira en 15 min
  REFRESH_TOKEN_TTL_DAYS: 7,        // Refresh token expira en 7 días
  AUTO_REFRESH_INTERVAL_MIN: 14,    // Auto-refresh cada 14 min
};
```

**Cómo funciona:**
1. **Detección de Actividad**: Monitorea eventos de mouse, teclado, toque y scroll
2. **Reinicio del Temporizador**: Cada interacción del usuario reinicia la cuenta atrás de 20 minutos
3. **Logout Automático**: Después de 20 minutos sin actividad, se cierra la sesión automáticamente
4. **Notificación al Usuario**: Muestra mensaje toast: "Sesión expirada por inactividad"
5. **Logging**: Todos los eventos de inactividad se registran para monitoreo

**Implementación** (`src/contexts/auth/useInactivityTimer.ts`):
```typescript
import { useInactivityTimer } from '@/contexts/auth/useInactivityTimer';

// En AuthContext
useInactivityTimer({
  onInactive: handleInactiveLogout,
  inactivityMinutes: SESSION_CONFIG.INACTIVITY_TIMEOUT_MIN,
  isAuthenticated: !!user,
});
```

### Refresh Automático de Token

Para prevenir interrupciones de sesión, los tokens de acceso se renuevan automáticamente **cada 14 minutos** (antes de la expiración de 15 minutos).

**Beneficios:**
- El usuario permanece logueado durante sesiones activas
- Sin interrupciones durante reservas o llenado de formularios
- Experiencia fluida mientras se usa la aplicación
- Solo cierra sesión después de verdadera inactividad (20 minutos)

**Implementación** (`src/contexts/auth/AuthContext.tsx`):
```typescript
useEffect(() => {
  if (!user || !refreshToken) return;

  const intervalId = setInterval(() => {
    logger.debug('Auto-refrescando token de acceso');
    refreshSession();
  }, SESSION_CONFIG.AUTO_REFRESH_INTERVAL_MIN * 60 * 1000);

  return () => clearInterval(intervalId);
}, [user, refreshToken, refreshSession]);
```

### Línea de Tiempo de Sesión

```
Login
  ↓
[0-14 min] → Sesión activa, usuario trabajando
  ↓
[14 min] → Auto-refresh de token (sin interrupciones)
  ↓
[14-20 min] → Continuar trabajando con token nuevo
  ↓
[20 min] → Inactividad detectada → Auto-logout → Notificación toast
```

### Eventos Monitoreados

El temporizador de inactividad considera estos eventos como "actividad del usuario":
- `mousedown` - Clics del usuario
- `mousemove` - Movimiento del mouse
- `keypress` - Entrada de teclado
- `scroll` - Scroll de página
- `touchstart` - Interacciones táctiles
- `click` - Eventos de clic

### Experiencia del Usuario

**Usuarios Activos:**
- ✅ Sin interrupciones durante el uso
- ✅ Token se refresca automáticamente cada 14 minutos
- ✅ Pueden trabajar continuamente sin re-login
- ✅ Solo se cierra sesión después de 20 minutos de verdadera inactividad

**Usuarios Inactivos:**
- ⏰ Después de 20 minutos sin interacción
- 🚪 Se cierra sesión automáticamente
- 📢 Mensaje claro: "Sesión expirada por inactividad"
- 🔄 Indicación para iniciar sesión nuevamente

### Beneficios de Seguridad

1. **Previene acceso no autorizado** si el usuario deja el dispositivo desatendido
2. **Cumple con mejores prácticas de seguridad** para datos sensibles
3. **Reduce riesgo** de secuestro de sesión en computadoras compartidas
4. **Registra todos los eventos de seguridad** para auditoría

## Mejoras Futuras

1. **Soporte Offline**: Almacenar logs en localStorage cuando la API no está disponible
2. **Logging Remoto**: Enviar logs críticos al backend para persistencia
3. **Sesiones de Usuario**: Rastrear logs por sesión de usuario
4. **Analíticas**: Agregar patrones de error para monitoreo
5. **Limitación de Velocidad**: Prevenir inundación de logs
6. **Métricas de Rendimiento**: Rastrear tiempos de renderizado de componentes y latencia de API
7. **Advertencia de Sesión**: Mostrar diálogo de advertencia 2 minutos antes del auto-logout
8. **Timeouts Configurables**: Permitir a admins ajustar timeout de inactividad por rol

---

**Christian Márquez**
