// Update BASE_URL to your machine's LAN IP when testing on a physical device
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api/v1';
