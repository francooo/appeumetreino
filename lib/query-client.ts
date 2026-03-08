import { fetch } from "expo/fetch";
import { QueryClient, QueryFunction } from "@tanstack/react-query";
import Constants from "expo-constants";

const API_PORT = "5000";

/**
 * Gets the base URL for the Express API server.
 * Em desenvolvimento com Expo Go: usa o mesmo host do Metro (debuggerHost) na porta 5000.
 * @returns {string} The API base URL
 */
export function getApiUrl(): string {
  const envHost = process.env.EXPO_PUBLIC_DOMAIN;

  if (envHost) {
    const hostname = envHost.split(":")[0];
    const isNgrok = /ngrok|\.ngrok\./.test(hostname);
    const host = envHost.includes(":") ? envHost : isNgrok ? hostname : `${envHost}:${API_PORT}`;
    const protocol =
      hostname === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(hostname) ? "http" : "https";
    return `${protocol}://${host}`;
  }

  // Expo Go / desenvolvimento: mesmo host do Metro (hostUri no Expo 50+), porta do API server
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as { manifest?: { hostUri?: string; debuggerHost?: string } }).manifest?.hostUri ??
    (Constants as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost;

  if (hostUri) {
    const [host] = hostUri.split(":");
    return `http://${host}:${API_PORT}`;
  }

  // Fallback: emulador local
  return `http://localhost:${API_PORT}`;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  route: string,
  data?: unknown | undefined,
): Promise<Response> {
  const baseUrl = getApiUrl();
  const url = new URL(route, baseUrl);

  const res = await fetch(url.toString(), {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const baseUrl = getApiUrl();
    const url = new URL(queryKey.join("/") as string, baseUrl);

    const res = await fetch(url.toString(), {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
