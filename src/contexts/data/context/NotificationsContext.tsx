import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/index";
import { Notification } from "../types";

interface NotificationsContextType {
  notifications: Notification[];
  refreshNotifications: () => Promise<void>;
  getUserNotifications: (userId: string) => Notification[];
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refreshNotifications = useCallback(async () => {
    // Frontend-only fix: El backend no tiene GET notifications.
    // Dejamos esto vacío o podríamos simular notificaciones locales.
    setNotifications([]); 
  }, []);

  useEffect(() => {
    if (user) refreshNotifications();
  }, [user, refreshNotifications]);

  const getUserNotifications = useCallback(
    (userId: string) => notifications.filter((n) => n.userId === userId),
    [notifications]
  );

  return (
    <NotificationsContext.Provider value={{ notifications, refreshNotifications, getUserNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error("useNotifications debe usarse dentro de NotificationsProvider");
  return context;
};