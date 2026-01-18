/**
 * Configuración de sesión y seguridad
 * Basado en variables de entorno del backend
 */

export const SESSION_CONFIG = {
  // Tiempo de inactividad antes de cerrar sesión automáticamente (minutos)
  INACTIVITY_TIMEOUT_MIN: 20,
  
  // TTL del access token (minutos) - debe coincidir con backend
  ACCESS_TOKEN_TTL_MIN: 15,
  
  // TTL del refresh token (días) - debe coincidir con backend
  REFRESH_TOKEN_TTL_DAYS: 7,
  
  // Intervalo para refrescar token automáticamente (minutos)
  // Se ejecuta antes de que expire para evitar interrupciones
  AUTO_REFRESH_INTERVAL_MIN: 14,
} as const;

export const SECURITY_CONFIG = {
  // Ventana de rate limiting (minutos)
  RATE_LIMIT_WINDOW_MIN: 15,
  
  // Máximo de requests por ventana
  RATE_LIMIT_MAX: 10000,
} as const;
