"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-provider";

type Mode = "login" | "signup" | "reset";

export function AuthCard() {
  const router = useRouter();
  const { firebaseEnabled, busy, login, signup, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [notice, setNotice] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [form, setForm] = useState({
    name: "",
    company: "",
    mobile: "",
    email: "",
    password: "",
  });

  const heading = useMemo(() => {
    if (mode === "signup") return "Create your workspace";
    if (mode === "reset") return "Reset your password";
    return "Sign in to Fastex Admin";
  }, [mode]);

  function patch(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (mode === "login") {
      const result = await login({ email: form.email, password: form.password });
      if (!result.ok) {
        setError(result.error || "Unable to log in.");
        return;
      }
      router.push(result.target || "/workspace");
      return;
    }

    if (mode === "signup") {
      const result = await signup(form);
      if (!result.ok) {
        setError(result.error || "Unable to create the account.");
        return;
      }
      setNotice(result.message || "Signup submitted.");
      setMode("login");
      setForm((current) => ({ ...current, password: "" }));
      return;
    }

    const result = await resetPassword(form.email);
    if (!result.ok) {
      setError(result.error || "Unable to send reset email.");
      return;
    }
    setNotice(result.message || "Password reset email sent.");
  }

  return (
    <div className="auth-card">
      <div className="auth-logo">F</div>
      <h1>Fastex Admin</h1>
      <p>{heading}</p>

      <div className="auth-tabs">
        <button type="button" className={`auth-tab${mode === "login" ? " active" : ""}`} onClick={() => { setMode("login"); setError(""); setNotice(""); }}>
          Login
        </button>
        <button type="button" className={`auth-tab${mode === "signup" ? " active" : ""}`} onClick={() => { setMode("signup"); setError(""); setNotice(""); }}>
          Sign up
        </button>
        <button type="button" className={`auth-tab${mode === "reset" ? " active" : ""}`} onClick={() => { setMode("reset"); setError(""); setNotice(""); }}>
          Forgot Password
        </button>
      </div>

      {!firebaseEnabled ? (
        <div className="auth-message warning">
          Add your Firebase environment variables to enable real login, approvals, and cloud data.
        </div>
      ) : null}

      {error ? <div className="auth-message error">{error}</div> : null}
      {notice ? <div className="auth-message success">{notice}</div> : null}
      <div className="auth-debug">
        Host: {typeof window !== "undefined" ? window.location.host : "server"} · Online: {typeof navigator !== "undefined" ? String(navigator.onLine) : "unknown"} · Firebase: {String(firebaseEnabled)}
      </div>

      <form className="stack" style={{ marginTop: 20 }} onSubmit={handleSubmit}>
        {mode === "signup" ? (
          <>
            <div className="field">
              <label>Name</label>
              <input value={form.name} onChange={(event) => patch("name", event.target.value)} placeholder="Your full name" />
            </div>
            <div className="field">
              <label>Company</label>
              <input value={form.company} onChange={(event) => patch("company", event.target.value)} placeholder="Your company name" />
            </div>
            <div className="field">
              <label>Mobile</label>
              <input value={form.mobile} onChange={(event) => patch("mobile", event.target.value)} placeholder="+91 98765 43210" />
            </div>
          </>
        ) : null}

        <div className="field">
          <label>Email</label>
          <input type="email" value={form.email} onChange={(event) => patch("email", event.target.value)} placeholder="you@company.com" />
        </div>

        {mode !== "reset" ? (
          <div className="field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={(event) => patch("password", event.target.value)} placeholder="••••••••" />
          </div>
        ) : null}

        <div className="actions" style={{ marginTop: 4 }}>
          <button className="button" type="submit" disabled={busy || !firebaseEnabled}>
            {busy ? "Please wait..." : mode === "login" ? "Login" : mode === "signup" ? "Create account" : "Send reset link"}
          </button>
        </div>
      </form>
    </div>
  );
}
