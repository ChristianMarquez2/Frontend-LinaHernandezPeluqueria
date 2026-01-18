/**
 * Servicio centralizado de logging
 * Gestiona todos los logs de la aplicación con niveles de severidad
 */

import { devConsole } from './devConsole';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  source?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 500; // Máximo de logs en memoria
  private isDevelopment = import.meta.env.DEV;

  /**
   * Log de nivel DEBUG (solo en desarrollo)
   */
  debug(message: string, data?: any, source?: string) {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, data, source);
      devConsole.debug(`[DEBUG] ${message}`, data);
    }
  }

  /**
   * Log de nivel INFO
   */
  info(message: string, data?: any, source?: string) {
    this.log(LogLevel.INFO, message, data, source);
    devConsole.log(`[INFO] ${message}`, data);
  }

  /**
   * Log de nivel WARN
   */
  warn(message: string, data?: any, source?: string) {
    this.log(LogLevel.WARN, message, data, source);
    devConsole.warn(`[WARN] ${message}`, data);
  }

  /**
   * Log de nivel ERROR
   */
  error(message: string, data?: any, source?: string) {
    this.log(LogLevel.ERROR, message, data, source);
    devConsole.error(`[ERROR] ${message}`, data);
    
    // En producción, podrías enviar a un servicio de error tracking (Sentry, LogRocket, etc)
    if (!this.isDevelopment) {
      this.sendToErrorTracking(message, data, source);
    }
  }

  /**
   * Registra un entry de log
   */
  private log(level: LogLevel, message: string, data?: any, source?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      source: source || this.getCallerName(),
    };

    this.logs.push(entry);

    // Mantener máximo de logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  /**
   * Obtiene el nombre del componente/función que llama al logger
   */
  private getCallerName(): string {
    const stack = new Error().stack;
    if (!stack) return 'Unknown';
    
    const lines = stack.split('\n');
    const callerLine = lines[4]; // Saltar algunos niveles de stack
    const match = callerLine?.match(/at (\w+)/);
    return match?.[1] || 'Unknown';
  }

  /**
   * Retorna todos los logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Retorna logs de un nivel específico
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Limpia todos los logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Exporta logs como JSON para debug
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Descarga logs como archivo JSON
   */
  downloadLogs() {
    const data = this.exportLogs();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('download', `logs-${new Date().getTime()}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  /**
   * Envía errores a un servicio de tracking (placeholder)
   */
  private sendToErrorTracking(message: string, data: any, source?: string) {
    // Aquí podrías integrar con Sentry, LogRocket, Bugsnag, etc.
    // Ejemplo con Sentry:
    // if (window.Sentry) {
    //   window.Sentry.captureException(new Error(message), {
    //     contexts: { data, source },
    //   });
    // }
  }
}

// Exportar singleton
export const logger = new Logger();

// Hook para React
import { useEffect } from 'react';

export function useLogger(componentName: string) {
  useEffect(() => {
    logger.debug(`Component mounted: ${componentName}`);
    return () => {
      logger.debug(`Component unmounted: ${componentName}`);
    };
  }, [componentName]);

  return logger;
}
