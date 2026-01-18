# Error Handling & Logging System

## Overview

The application now includes a comprehensive error handling and centralized logging system to improve debugging, monitoring, and user experience. Additionally, automatic session management with inactivity detection ensures secure user sessions.

## Components

### 1. Logger Service (`src/services/logger.ts`)

Centralized logging service with multiple log levels.

**Log Levels:**
- `DEBUG` - Development only, low-level debugging
- `INFO` - General information about application flow
- `WARN` - Warning messages for non-critical issues
- `ERROR` - Error messages for critical issues

**Usage:**

```typescript
import { logger } from '@/services/logger';

// Debug log (only in development)
logger.debug('User logged in', { userId: '123' }, 'LoginComponent');

// Info log
logger.info('Dashboard loaded successfully', { userId: '456' }, 'Dashboard');

// Warning log
logger.warn('Failed to load client data', { clientId: '789', status: 403 }, 'AppointmentCalendar');

// Error log (includes console.error + optional cloud reporting)
logger.error('API request failed', { error: err, endpoint: '/bookings' }, 'ClientDashboard');
```

**Features:**
- Automatic timestamps
- Component name tracking
- Development-only debug logs
- In-memory log storage (max 500 logs)
- Log export and download functionality
- Preparation for cloud logging integration (Sentry, LogRocket, etc.)

**Methods:**

```typescript
// Retrieve all logs
const allLogs = logger.getLogs();

// Get logs by level
const errors = logger.getLogsByLevel(LogLevel.ERROR);

// Export as JSON string
const json = logger.exportLogs();

// Download logs as file
logger.downloadLogs();

// Clear all logs
logger.clearLogs();
```

### 2. Error Boundary Component (`src/components/ErrorBoundary.tsx`)

React error boundary that catches component errors and prevents white screens.

**Features:**
- Catches React component errors
- Professional error UI with theme colors
- Error details shown in development mode
- Reset button to recover from error state
- Auto-logs errors to logger service
- Responsive design

**Usage:**

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Wrap your application or specific sections
export default function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}

// With custom fallback UI
<ErrorBoundary fallback={<CustomErrorScreen />}>
  <DashboardContent />
</ErrorBoundary>
```

**Error UI:**
- Displays error icon and message in Spanish
- Shows component stack in development
- Provides "Retry" and "Home" buttons
- Support email contact info

### 3. Integration Points

#### App.tsx
```typescript
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { logger } from "@/services/logger";

export default function App() {
  logger.info('App initialized');
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        {/* App content */}
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

#### API Service (`src/services/api.ts`)
```typescript
import { logger } from './logger';

async function request<T>(...) {
  try {
    logger.debug(`API Request: ${method} ${url}`, { body }, 'API');
    const res = await fetch(...);
    
    if (!res.ok) {
      logger.warn(`API Error: ${method} ${url} - Status ${status}`, { error: payload?.error }, 'API');
      return { ok: false, ... };
    }
    
    logger.debug(`API Success: ${method} ${url} - Status ${status}`, {}, 'API');
    return { ok: true, ... };
  } catch (err: any) {
    logger.error(`API Network Error: ${method} ${url}`, { message: err?.message }, 'API');
    return { ok: false, ... };
  }
}
```

#### Client Dashboard (`src/components/dashboards/ClientDashboard/index.tsx`)
```typescript
import { logger } from '@/services/logger';

export function ClientDashboard() {
  useEffect(() => {
    const load = async () => {
      logger.info('ClientDashboard: Loading dashboard data', { userId }, 'ClientDashboard');
      try {
        await fetchData();
        logger.debug('ClientDashboard: Data loaded successfully', {}, 'ClientDashboard');
      } catch (err) {
        logger.error('ClientDashboard: Error loading dashboard', { error: err }, 'ClientDashboard');
      }
    };
    load();
  }, []);
}
```

#### Calendar Management (`src/components/management/calendar/useAppointmentCalendar.ts`)
```typescript
import { logger } from '@/services/logger';

export function useAppointmentCalendar(...) {
  const fetchBookings = useCallback(async () => {
    logger.debug('Fetching appointments', { selectedDate, selectedStylistId }, 'useAppointmentCalendar');
    try {
      const data = await dataService.fetchAllBookings(...);
      logger.info('Appointments fetched successfully', { count: data.length }, 'useAppointmentCalendar');
    } catch (err) {
      logger.error("Error fetching bookings", { error: err }, 'useAppointmentCalendar');
    }
  }, [...]);
}
```

## Best Practices

### When to Log

1. **INFO** - User actions, successful operations
   - User login/logout
   - Data loaded successfully
   - Booking created

2. **DEBUG** - Component lifecycle, state changes
   - Component mounted/unmounted
   - Filter changes
   - API request details
   - *Only displayed in development*

3. **WARN** - Non-critical issues that need attention
   - Failed to load user data (but fallback exists)
   - API returns 403/404
   - Validation warnings

4. **ERROR** - Critical failures
   - API errors with no fallback
   - Unexpected exceptions
   - Auth failures

### Log Format

```typescript
logger.[level](
  'Human-readable message',
  { contextKey: contextValue },  // Optional context object
  'ComponentName'                // Optional component name
);
```

### Development vs Production

- **DEBUG logs** only appear in development (`import.meta.env.DEV`)
- **ERROR logs** in production can be sent to cloud services
- In-memory logs are preserved (max 500 entries)

## Cloud Logging Integration (Future)

The logger service is prepared for cloud logging integration:

```typescript
// In logger.ts sendToErrorTracking() method
private sendToErrorTracking(message: string, data: any, source?: string) {
  // Example with Sentry:
  if (window.Sentry) {
    window.Sentry.captureException(new Error(message), {
      contexts: { data, source },
    });
  }
}
```

To enable:
1. Install cloud service SDK (e.g., `npm install @sentry/react`)
2. Initialize in main.tsx or App.tsx
3. Uncomment integration code in `sendToErrorTracking()`

## Debugging

### View Logs in Console

```typescript
// Get all logs
const logs = logger.getLogs();
console.table(logs);

// Get error logs only
const errors = logger.getLogsByLevel(LogLevel.ERROR);
console.table(errors);
```

### Download Logs

```typescript
// In browser console:
logger.downloadLogs();
// This will download a JSON file with all logs
```

### Error Boundary Recovery

Users can reset from error state by:
1. Clicking "Intentar de nuevo" (Retry) button
2. Clicking "Inicio" (Home) button to navigate to home page

## Testing

Test error handling:

```typescript
// Force an error
throw new Error('Test error');

// Error should be caught by ErrorBoundary and logged
// User sees professional error screen with retry option
```

## Performance Considerations

- Logger maintains max 500 logs in memory to prevent memory leaks
- Oldest logs are removed when limit is exceeded
- DEBUG logs only created in development (minimal overhead)
- Log retrieval and export are O(n) operations
- Inactivity timer uses debounced events to minimize performance impact
- Auto-refresh runs every 14 minutes to keep session alive

## Session Management

### Automatic Inactivity Logout

The application automatically logs out users after **20 minutes of inactivity** to ensure security.

**Configuration** (`src/config/session.ts`):
```typescript
export const SESSION_CONFIG = {
  INACTIVITY_TIMEOUT_MIN: 20,       // Auto-logout after 20 min of inactivity
  ACCESS_TOKEN_TTL_MIN: 15,         // Access token expires in 15 min
  REFRESH_TOKEN_TTL_DAYS: 7,        // Refresh token expires in 7 days
  AUTO_REFRESH_INTERVAL_MIN: 14,    // Auto-refresh every 14 min
};
```

**How it works:**
1. **Activity Detection**: Monitors mouse, keyboard, touch, and scroll events
2. **Timer Reset**: Every user interaction resets the 20-minute countdown
3. **Automatic Logout**: After 20 minutes without activity, logs out automatically
4. **User Notification**: Shows toast message: "Sesión expirada por inactividad"
5. **Logging**: All inactivity events are logged for monitoring

**Implementation** (`src/contexts/auth/useInactivityTimer.ts`):
```typescript
import { useInactivityTimer } from '@/contexts/auth/useInactivityTimer';

// In AuthContext
useInactivityTimer({
  onInactive: handleInactiveLogout,
  inactivityMinutes: SESSION_CONFIG.INACTIVITY_TIMEOUT_MIN,
  isAuthenticated: !!user,
});
```

### Automatic Token Refresh

To prevent session interruptions, access tokens are automatically refreshed **every 14 minutes** (before the 15-minute expiration).

**Benefits:**
- User stays logged in during active sessions
- No interruptions during booking or form filling
- Seamless experience while using the application
- Only logs out after true inactivity (20 minutes)

**Implementation** (`src/contexts/auth/AuthContext.tsx`):
```typescript
useEffect(() => {
  if (!user || !refreshToken) return;

  const intervalId = setInterval(() => {
    logger.debug('Auto-refreshing access token');
    refreshSession();
  }, SESSION_CONFIG.AUTO_REFRESH_INTERVAL_MIN * 60 * 1000);

  return () => clearInterval(intervalId);
}, [user, refreshToken, refreshSession]);
```

### Session Timeline

```
Login
  ↓
[0-14 min] → Active session, user working
  ↓
[14 min] → Auto-refresh token (seamless)
  ↓
[14-20 min] → Continue working with new token
  ↓
[20 min] → Inactivity detected → Auto-logout → Toast notification
```

### Monitored Events

The inactivity timer considers these events as "user activity":
- `mousedown` - User clicks
- `mousemove` - Mouse movement
- `keypress` - Keyboard input
- `scroll` - Page scrolling
- `touchstart` - Touch interactions
- `click` - Click events

### User Experience

**Active Users:**
- ✅ No interruptions during use
- ✅ Token refreshes automatically every 14 minutes
- ✅ Can work continuously without re-login
- ✅ Only logged out after 20 minutes of true inactivity

**Inactive Users:**
- ⏰ After 20 minutes of no interaction
- 🚪 Automatically logged out
- 📢 Clear message: "Sesión expirada por inactividad"
- 🔄 Prompt to login again

### Security Benefits

1. **Prevents unauthorized access** if user leaves device unattended
2. **Complies with security best practices** for sensitive data
3. **Reduces risk** of session hijacking on shared computers
4. **Logs all security events** for audit trails

## Future Improvements

1. **Offline Support**: Store logs to localStorage when API is unavailable
2. **Remote Logging**: Send critical logs to backend for persistence
3. **User Sessions**: Track logs per user session
4. **Analytics**: Aggregate error patterns for monitoring
5. **Rate Limiting**: Prevent log flooding
6. **Performance Metrics**: Track component render times and API latency
7. **Session Warning**: Show warning dialog 2 minutes before auto-logout
8. **Configurable Timeouts**: Allow admins to adjust inactivity timeout per role
