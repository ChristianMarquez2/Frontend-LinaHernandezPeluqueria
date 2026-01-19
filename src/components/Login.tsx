import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/auth/index";
import { PasswordInput } from "./ui/password-input";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Extraemos login y loading del contexto
  // Nota: loading del contexto suele ser para la carga inicial de la app.
  // Usaremos un estado local 'isSubmitting' para el botón de este formulario.
  const { login } = useAuth(); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setIsSubmitting(true);

    try {
      // Si aplicaste mi corrección del punto 1 (throw err):
      await login(email, password);
      
      // Si no lanza error, el login fue exitoso
      navigate("/"); // O la ruta que quieras
      
    } catch (err: any) {
      // Aquí capturamos el mensaje real del backend
      // Asumiendo que tu authService devuelve el mensaje en err.message o similar
      const mensaje = err.response?.data?.message || err.message || "Error al iniciar sesión";
      setLocalError(mensaje);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-md mx-auto space-y-4 p-4">
      <h2 className="text-lg font-semibold">Iniciar sesión</h2>

      <input
        type="email"
        autoComplete="username" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Correo"
        required
        className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-[#D4AF37] outline-none"
      />

      <PasswordInput
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        required
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2 bg-[#D4AF37] rounded text-black font-medium disabled:opacity-50 hover:bg-[#b5952f] transition-colors"
      >
        {isSubmitting ? "Verificando..." : "Entrar"}
      </button>

      {localError && (
        <div className="p-3 bg-red-900/50 border border-red-500 text-red-200 rounded text-sm text-center">
          {localError}
        </div>
      )}
    </form>
  );
}