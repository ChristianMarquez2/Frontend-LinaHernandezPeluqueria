/**
 * Console wrapper que solo muestra mensajes en desarrollo
 * En producción, estos mensajes serán eliminados por Vite/Terser
 * pero este wrapper proporciona una capa adicional de seguridad
 */

const isDevelopment = import.meta.env.DEV;

export const devConsole = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
} as const;
