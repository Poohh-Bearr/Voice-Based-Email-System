async function call(path, method = "GET", body) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed.");
  return data;
}

export const api = {
  signIn: (b) => call("/auth/sign_in", "POST", b),
  login: (b) => call("/auth/login", "POST", b),
  logout: () => call("/auth/logout", "POST"),
  me: () => call("/auth/fetch_user"),
  send: (b) => call("/email/send_email", "POST", b),
  inbox: () => call("/email/fetch_emails"),
};
