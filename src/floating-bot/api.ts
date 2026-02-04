
export const TEXT2SQL_API_URL = import.meta.env.VITE_TEXT2SQL_API_URL;

// Base URL for REST API endpoints (Factory, DC, Store KPIs, etc.)
// This should point to the same backend as TEXT2SQL_API_URL
export const API_BASE_URL = import.meta.env.VITE_TEXT2SQL_API_URL;

export interface QueryResponse {
  sql: string;
  data: Record<string, any>[];
  summary: string;
  viz: string | null;
  mime: string | null;
  // Optional structured fields returned by backend  
  email_body?: string;
  email_subject?: string;
  rows_affected?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sql?: string;
  data?: Record<string, any>[];
  viz?: string | null;
  mime?: string | null;
  meta?: Record<string, any>;
  timestamp: Date;
}

export const sendQuery = async (question: string): Promise<QueryResponse> => {
  const isBrowser = typeof window !== "undefined";
  const host = isBrowser ? window.location.hostname : "";
  const isLocalhost =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "[::1]";

  // Determine endpoints based on environment
  // In localhost: use proxy to avoid CORS (proxy points to VITE_TEXT2SQL_API_URL)
  // In production: use direct URL (backend has CORS configured)
  // Always use the URL from environment variable (VITE_TEXT2SQL_API_URL)
  const endpoints = isLocalhost
    ? ["/api/text2sql/query"]  // Use Vite proxy in development (proxy targets VITE_TEXT2SQL_API_URL)
    : [`${TEXT2SQL_API_URL}/query`];  // Direct call in production (uses VITE_TEXT2SQL_API_URL)

  let lastError: unknown = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        let errorText = "";
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          try {
            errorText = await response.text();
          } catch {
            // ignore
          }
          errorData = { error: response.statusText || errorText };
        }
        
        if (errorData.summary) {
          return {
            sql: errorData.sql || null,
            data: errorData.data || [],
            summary: errorData.summary,
            viz: errorData.viz || null,
            mime: errorData.mime || null,
          };
        }

        throw new Error(
          errorData.error ||
            errorData.details ||
            errorText ||
            `API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      lastError = error;
      console.error(`Error calling Text2SQL API via ${endpoint}:`, error);
    }
  }

  // If both attempts failed, surface the last error with a helpful message.
  if (lastError instanceof TypeError && lastError.message === "Failed to fetch") {
    throw new Error("Unable to connect to the Text2SQL service. Check network/CORS or try again.");
  }

  throw lastError instanceof Error ? lastError : new Error("Unknown error calling Text2SQL API.");
};

