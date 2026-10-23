function getRequiredEnv(key: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(
      `[FATAL CONFIG ERROR] Missing required environment variable: "${key}". Check your frontend/.env file.`,
    );
  }
  return value.trim();
}

export const ENV = {
  API_URL: getRequiredEnv("VITE_API_URL", import.meta.env.VITE_API_URL),
  SELLER_API_URL: getRequiredEnv(
    "VITE_SELLER_API_URL",
    import.meta.env.VITE_SELLER_API_URL,
  ),
  UTILS_API_URL: getRequiredEnv(
    "VITE_UTILS_API_URL",
    import.meta.env.VITE_UTILS_API_URL,
  ),
  GOOGLE_CLIENT_ID: getRequiredEnv(
    "VITE_GOOGLE_CLIENT_ID",
    import.meta.env.VITE_GOOGLE_CLIENT_ID,
  ),
  GOOGLE_MAPS_API_KEY: getRequiredEnv(
    "VITE_GOOGLE_MAPS_API_KEY",
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  ),
  SITE_DOMAIN: getRequiredEnv(
    "VITE_SITE_DOMAIN",
    import.meta.env.VITE_SITE_DOMAIN,
  ),
  SITE_URL: getRequiredEnv("VITE_SITE_URL", import.meta.env.VITE_SITE_URL),
  REALTIME_WS_URL:
    import.meta.env.VITE_REALTIME_WS_URL ,
} as const;

