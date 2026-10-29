"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LockKeyhole, UserRound, Mail } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "signup") setMode("signup");
  }, []);

  function clearMessages() {
    setMessage("");
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    clearMessages();

    const cleanEmail = email.trim().toLowerCase();
    // Keep this regex single-escaped: \s means whitespace in a JavaScript regex.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Sahi email address daalo, jaise name@example.com.");
      setBusy(false);
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();

      if (mode === "signup") {
        const result = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { display_name: name.trim() } },
        });
        if (result.error) throw result.error;

        const user = result.data.user;
        if (user && result.data.session) {
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert({ id: user.id, display_name: name.trim() }, { onConflict: "id" });
          if (profileError) throw new Error("Account bana, lekin profile save nahi hua: " + profileError.message);

          const next = new URLSearchParams(window.location.search).get("next");
          window.location.href = next?.startsWith("/") && !next.startsWith("//") ? next : "/";
        } else {
          setMessage("Signup request ho gayi! Apne email inbox/spam folder mein confirmation link check karo. Email confirm karne ke baad login karo.");
        }
      } else {
        const result = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (result.error) throw result.error;

        if (result.data.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
              id: result.data.user.id,
              display_name: String(result.data.user.user_metadata?.display_name || name || "").trim() || null,
            }, { onConflict: "id" });

          if (profileError) throw new Error("Login ho gaya, lekin profile sync nahi hua: " + profileError.message);

          const next = new URLSearchParams(window.location.search).get("next");
          const destination = result.data.user.app_metadata?.role === "admin" ? "/admin" : "/";
          window.location.href = next?.startsWith("/") && !next.startsWith("//") ? next : destination;
        }
      }
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Request complete nahi ho saki. Dobara try karo.";
      if (/invalid login credentials/i.test(raw)) {
        setError("Email ya password galat hai. Signup complete hua hai aur email confirmation ki zarurat hai, to inbox mein confirmation link bhi check karo.");
      } else if (/email not confirmed/i.test(raw)) {
        setError("Email abhi verify nahi hua. Inbox/spam folder mein Supabase ka confirmation email check karo.");
      } else if (/invalid email/i.test(raw)) {
        setError("Supabase ne email address accept nahi kiya. Email ko dobara check karo, jaise name@example.com.");
      } else {
        setError(raw);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-top"><Link href="/" className="auth-back"><ArrowLeft size={17}/> RX MOD home</Link></div>
      <section className="auth-card">
        <div className="auth-mark">RX</div>
        <div className="auth-eyebrow">YOUR LEARNING SPACE</div>
        <h1>{mode === "login" ? "Welcome back." : "Create your account."}</h1>
        <p className="auth-subtitle">{mode === "login" ? "Log in to continue your learning journey." : "One account for your courses and progress."}</p>
        <div className="auth-tabs">
          <button type="button" className={mode === "login" ? "auth-tab selected" : "auth-tab"} onClick={() => { setMode("login"); clearMessages(); }}>Log in</button>
          <button type="button" className={mode === "signup" ? "auth-tab selected" : "auth-tab"} onClick={() => { setMode("signup"); clearMessages(); }}>Sign up</button>
        </div>
        <form onSubmit={submit} className="auth-form">
          {mode === "signup" && <label>Your name<div className="auth-input"><UserRound size={17}/><input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" required maxLength={80} autoComplete="name"/></div></label>}
          <label>Email address<div className="auth-input"><Mail size={17}/><input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" type="email" autoComplete="email" required/></div></label>
          <label>Password<div className="auth-input"><LockKeyhole size={17}/><input value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required/></div></label>
          <button className="btn btn-primary auth-submit" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button>
        </form>
        {error && <p className="auth-message auth-error" role="alert">{error}</p>}
        {message && <p className="auth-message auth-success" role="status">{message}</p>}
        <p className="auth-footnote">Passwords are handled by Supabase Auth. RX MOD never stores plaintext passwords.</p>
      </section>
    </main>
  );
}
