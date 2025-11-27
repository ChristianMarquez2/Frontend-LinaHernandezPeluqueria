import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuthContextType, User, AuthSessionData } from "./types";
import { normalizeUser } from "./utils";
import { authService } from "./service";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // -------------------------
  // 🔧 Inicialización
  // -------------------------
  useEffect(() => {
    const storedAccess = localStorage.getItem("accessToken");
    const storedRefresh = localStorage.getItem("refreshToken");
    const storedUser = localStorage.getItem("currentUser");

    if (storedAccess && storedRefresh && storedUser) {
      setAccessToken(storedAccess);
      setRefreshToken(storedRefresh);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // Si falla el parseo, limpiar
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  // -------------------------
  // 🧩 Helpers de Sesión
  // -------------------------
  const saveSession = (data: AuthSessionData) => {
    const normalized = normalizeUser(data.user);

    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setUser(normalized);

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("currentUser", JSON.stringify(normalized));
  };

  const clearSession = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.clear();
  };

  // -------------------------
  // 🔑 Acciones Principales
  // -------------------------

  // LOGIN
  const login = async (email: string, password: string): Promise<void> => {
    try {
      // 1. Obtener tokens
      const loginData = await authService.login(email, password);
      
      // 2. Obtener perfil completo
      const meData = await authService.getMe(loginData.accessToken);
      
      // 3. Guardar todo
      saveSession({
        accessToken: loginData.accessToken,
        refreshToken: loginData.refreshToken,
        user: meData
      });
    
    } catch (err) {
      console.error("Login Error:", err);
      throw err;
    }
  };

  // GOOGLE LOGIN
  const googleSignIn = async (idToken: string): Promise<boolean> => {
    try {
      const loginData = await authService.googleSignIn(idToken);
      const meData = await authService.getMe(loginData.accessToken);
      
      saveSession({
        accessToken: loginData.accessToken,
        refreshToken: loginData.refreshToken,
        user: meData
      });
      return true;
    } catch (err) {
      console.error("Google Sign In Error:", err);
      return false;
    }
  };

  // REFRESH
  const refreshSession = useCallback(async () => {
    if (!refreshToken) return false;
    try {
      const data = await authService.refreshToken(refreshToken);
      
      // Actualizar tokens en local storage y estado
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // Refrescar datos de usuario
      const meData = await authService.getMe(data.accessToken);
      const normalized = normalizeUser(meData);
      setUser(normalized);
      localStorage.setItem("currentUser", JSON.stringify(normalized));

      return true;
    } catch (err) {
      console.error("Session Refresh Failed:", err);
      logout();
      return false;
    }
  }, [refreshToken]);

  // LOGOUT
  const logout = async () => {
    try {
      if (accessToken) {
        await authService.logout(accessToken);
      }
    } catch { } // Ignorar error en logout
    clearSession();
  };

  // REGISTER
  const register = async (data: Partial<User> & { password: string }) => {
    try {
      return await authService.register({
        nombre: data.firstName,
        apellido: data.lastName,
        email: data.email,
        password: data.password,
        telefono: data.phone,
        cedula: data.cedula,
        genero: data.gender,
      });
    } catch {
      return false;
    }
  };

  // UPDATE PROFILE
  const updateProfile = async (data: Partial<User>) => {
    if (!accessToken) return false;
    try {
      const updatedData = await authService.updateProfile(accessToken, data);
      const normalized = normalizeUser(updatedData);
      
      setUser(normalized);
      localStorage.setItem("currentUser", JSON.stringify(normalized));
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        register,
        googleSignIn,
        refreshSession,
        updateProfile,
        sendVerificationEmail: authService.sendVerificationEmail,
        forgotPassword: authService.forgotPassword,
        resetPassword: authService.resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};