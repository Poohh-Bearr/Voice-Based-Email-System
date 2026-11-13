import { useState } from "react";
import { api } from "./api.js";

export default function AuthForm({ onDone }) {
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ username: "", address: "", password: "" });
  const [error, setError] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    try {
      const { user } = mode === "login" ? await api.login(f) : await api.signIn(f);
      onDone(user);
    } catch (err) { setError(err.message); }
  }

  return (
    <main className="app">
      <h1>{mode === "login" ? "Log in" : "Create an account"}</h1>
      <form onSubmit={submit} className="stack">
        {mode === "signup" && <label>Username<input value={f.username} onChange={set("username")} autoComplete="name" /></label>}
        <label>Email address<input type="email" value={f.address} onChange={set("address")} autoComplete="email" /></label>
        <label>Password<input type="password" value={f.password} onChange={set("password")} autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
        <button type="submit">{mode === "login" ? "Log in" : "Create account"}</button>
        {error && <p role="alert" className="error">{error}</p>}
      </form>
      <button type="button" className="link" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>
        {mode === "login" ? "Need an account? Sign up" : "Have an account? Log in"}
      </button>
    </main>
  );
}
