"use client";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LockKeyhole, Phone, UserRound } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  useEffect(() => { if (new URLSearchParams(window.location.search).get("mode") === "signup") setMode("signup"); }, []);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(""); setError("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setError("Supabase key abhi configure nahi hui hai. Deployment environment mein publishable key add karni hogi."); setBusy(false); return; }
    const cleanPhone = phone.replace(/[\s()-]/g, "");
    if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) { setError("Sahi mobile number daalo. Country code ke saath number use karna behtar hai, jaise +91XXXXXXXXXX."); setBusy(false); return; }
    try {
      if (mode === "signup") {
        const { data, error: authError } = await supabase.auth.signUp({ phone: cleanPhone, password, options: { data: { display_name: name.trim() } } });
        if (authError) throw authError;
        if (data.session && data.user) {
          await supabase.from("profiles").upsert({ id: data.user.id, phone: cleanPhone, display_name: name.trim() }, { onConflict: "id" });
          setMessage("Account ban gaya! Ab tum RX MOD use kar sakte ho.");
        } else { setMessage("Signup request ho gayi. Supabase Auth mein phone confirmation enabled hai, isliye pehle verification complete karni hogi. OTP ke bina signup ke liye Auth settings badalni padegi."); }
      } else {
        const { data, error: authError } = await supabase.auth.signInWithPassword({ phone: cleanPhone, password });
        if (authError) throw authError;
        if (data.user) await supabase.from("profiles").upsert({ id: data.user.id, phone: cleanPhone }, { onConflict: "id" });
        setMessage("Login successful!");
        window.location.href = "/";
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Request complete nahi ho saki. Dobara try karo."); }
    finally { setBusy(false); }
  }

  return <main className="auth-page"><div className="auth-top"><Link href="/" className="auth-back"><ArrowLeft size={17}/> RX MOD home</Link></div><section className="auth-card"><div className="auth-mark">RX</div><div className="auth-eyebrow">YOUR LEARNING SPACE</div><h1>{mode === "login" ? "Welcome back." : "Create your account."}</h1><p className="auth-subtitle">{mode === "login" ? "Log in to continue your learning journey." : "One account for your courses and progress."}</p><div className="auth-tabs"><button type="button" className={mode === "login" ? "auth-tab selected" : "auth-tab"} onClick={() => {setMode("login");setMessage("");setError("");}}>Log in</button><button type="button" className={mode === "signup" ? "auth-tab selected" : "auth-tab"} onClick={() => {setMode("signup");setMessage("");setError("");}}>Sign up</button></div><form onSubmit={submit} className="auth-form">{mode === "signup" && <label>Your name<div className="auth-input"><UserRound size={17}/><input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" required maxLength={80}/></div></label>}<label>Mobile number<div className="auth-input"><Phone size={17}/><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91 98765 43210" inputMode="tel" autoComplete="tel" required/></div></label><label>Password<div className="auth-input"><LockKeyhole size={17}/><input value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" type="password" autoComplete={mode==="login"?"current-password":"new-password"} minLength={8} required/></div></label><button className="btn btn-primary auth-submit" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button></form>{error&&<p className="auth-message auth-error" role="alert">{error}</p>}{message&&<p className="auth-message auth-success" role="status">{message}</p>}<p className="auth-footnote">Your password is handled by Supabase Auth; RX MOD does not store plaintext passwords.</p></section></main>;
}
