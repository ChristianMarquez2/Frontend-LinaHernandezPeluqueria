export const VITE_API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:4000";
export const VITE_API_PREFIX = (import.meta.env.VITE_API_PREFIX as string) || "/api/v1";

export const API_URL = VITE_API_URL.replace(/\/$/, "") + (VITE_API_PREFIX.startsWith("/") ? VITE_API_PREFIX : `/${VITE_API_PREFIX}`);

export const env = {
  API_URL,
  NODE_ENV: import.meta.env.NODE_ENV || "development",
};
