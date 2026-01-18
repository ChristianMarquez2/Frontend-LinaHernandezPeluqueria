import React from 'react';
import { logger } from '@/services/logger';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * ErrorBoundary component que captura errores en React
 * Evita que la app se vuelva completamente blanca
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log del error a nuestro servicio de logging
    logger.error(
      `React Error Boundary caught an error: ${error.toString()}`,
      {
        errorMessage: error.message,
        errorStack: error.stack,
        componentStack: errorInfo.componentStack,
      },
      'ErrorBoundary'
    );

    // Actualizar state con error info
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    logger.info('Error boundary reset triggered', {}, 'ErrorBoundary');
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#0F0F0F] to-black p-4">
            <div className="max-w-md w-full bg-[#1A1A1A] border border-[#D4AF37]/20 rounded-lg p-8 shadow-2xl">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-white text-center mb-2">
                ¡Oops! Algo salió mal
              </h1>

              {/* Subtitle */}
              <p className="text-gray-400 text-center text-sm mb-6">
                Se encontró un error inesperado. No te preocupes, nuestro equipo ha sido notificado.
              </p>

              {/* Error Details (Development Only) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="bg-black/50 border border-[#D4AF37]/10 rounded p-4 mb-6 max-h-32 overflow-y-auto">
                  <p className="text-xs font-mono text-red-400 break-words">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <p className="text-xs font-mono text-yellow-400 mt-2 break-words">
                      {this.state.errorInfo.componentStack?.split('\n').slice(0, 3).join('\n')}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 bg-[#D4AF37] hover:bg-[#C9A127] text-black font-semibold py-3 rounded-lg transition-colors"
                >
                  Intentar de nuevo
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 bg-[#1A1A1A] hover:bg-[#252525] text-[#D4AF37] border border-[#D4AF37]/50 font-semibold py-3 rounded-lg transition-colors"
                >
                  Inicio
                </button>
              </div>

              {/* Help Text */}
              <p className="text-xs text-gray-500 text-center mt-6">
                Si el problema persiste, contacta a soporte: soporte@linapeluqueria.com
              </p>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
