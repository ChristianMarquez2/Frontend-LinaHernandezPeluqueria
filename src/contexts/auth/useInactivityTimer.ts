import { useEffect, useRef, useCallback } from 'react';
import { logger } from '../../services/logger';

interface UseInactivityTimerProps {
  onInactive: () => void;
  inactivityMinutes: number;
  isAuthenticated: boolean;
}

/**
 * Hook que detecta inactividad del usuario y ejecuta callback
 * Monitorea eventos de mouse, teclado, touch y scroll
 */
export function useInactivityTimer({
  onInactive,
  inactivityMinutes,
  isAuthenticated,
}: UseInactivityTimerProps) {
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const lastActivityTime = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return;

    lastActivityTime.current = Date.now();

    // Limpiar timer anterior
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    // Establecer nuevo timer
    timeoutId.current = setTimeout(() => {
      const inactiveMinutes = Math.floor((Date.now() - lastActivityTime.current) / 1000 / 60);
      logger.warn(`User inactive for ${inactiveMinutes} minutes, logging out`, {}, 'InactivityTimer');
      onInactive();
    }, inactivityMinutes * 60 * 1000);

    logger.debug('Inactivity timer reset', { inactivityMinutes }, 'InactivityTimer');
  }, [onInactive, inactivityMinutes, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      // Limpiar timer si usuario no está autenticado
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
        timeoutId.current = null;
      }
      return;
    }

    // Eventos que consideramos como "actividad"
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Inicializar timer
    resetTimer();

    // Agregar listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    logger.info('Inactivity timer started', { inactivityMinutes }, 'InactivityTimer');

    // Cleanup
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      logger.debug('Inactivity timer stopped', {}, 'InactivityTimer');
    };
  }, [isAuthenticated, resetTimer, inactivityMinutes]);

  return null;
}
