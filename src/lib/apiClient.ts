import { supabase } from "@/lib/supabase";

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<any | null> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    window.location.href = "/login";
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-user-id": session.user.id,
        ...options.headers,
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new Error("No internet connection.");
    }
    throw err;
  }
}
