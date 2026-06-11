export async function postJson<T extends Record<string, unknown>>(
  url: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; status: number; data: T; errorMessage: string }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });

    let data = {} as T;
    try {
      data = (await res.json()) as T;
    } catch {
      return {
        ok: false,
        status: res.status,
        data,
        errorMessage: res.ok
          ? "Invalid server response. Try refreshing the page."
          : `Request failed (${res.status}). Check your connection.`,
      };
    }

    const errorMessage =
      typeof data.error === "string"
        ? data.error
        : res.ok
          ? ""
          : `Request failed (${res.status}).`;

    return { ok: res.ok, status: res.status, data, errorMessage };
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "TimeoutError";
    return {
      ok: false,
      status: 0,
      data: {} as T,
      errorMessage: timedOut
        ? "Request timed out. Use your PC's Wi‑Fi IP (not localhost) on mobile."
        : "Network error. Use the same Wi‑Fi and open http://<your-pc-ip>:3000/login",
    };
  }
}
