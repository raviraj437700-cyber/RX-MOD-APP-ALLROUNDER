"use client";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LockKeyhole, Phone, UserRound, Mail } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Method = "phone" | "email";
type Mode = "login" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [method, setMethod] = useState<Method>("phone");
  const [phone, setPhone] = useState("");
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

  function clearMessages() { setMessage(""); setError(""); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); clearMessages();
    const supabase = getSupabaseBrowserClient();
    const cleanPhone = phone.replace(/[\\s()-]/g, "");
    if (method === "phone" && !/^\\+?[0-9]{10,15}$/.test(cleanPhone)) {
      setError("Valid mobile number daalo. India ke liye +91 ke saath number use karo.");
      setBusy(false); return;
    }
    if (method === "email" && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email.trim())) {
      setError("Valid email address daalo."); setBusy(false); return;
    }
    try {
      if (mode === "signup") {
        const options = { data: { display_name: name.trim(), ...(method === "phone" ? {} : { phone: cleanPhone || null }) } };
        const result = method === "phone"
          ? await supabase.auth.signUp({ phone: cleanPhone, password, options })
          : await supabase.auth.signUp({ email: email.trim().toLowerCase(), password, options });
        if (result.error) throw result.error;
        const user = result.data.user;
        if (user && result.data.session) {
          const profile = { id: user.id, display_name: name.trim(), ...(method === "phone" ? { phone: cleanPhone } : (cleanPhone ? { phone: cleanPhone } : {})) };
          const { error: profileError } = await supabase.from("profiles").upsert(profile, { onConflict: "id" });
          if (profileError) throw profileError;
          setMessage("Account ban gaya! Ab tum RX MOD use kar sakte ho.");
          const next = new URLSearchParams(window.location.search).get("next");
          window.location.href = next?.startsWith("/") ? next : "/";
        } else {
          setMessage(method === "phone"
            ? "Signup request mili, lekin phone confirmation/OTP enabled hai ya phone provider off hai. Agar 'Phone provider is disabled' aaye, Supabase Dashboard → Authentication → Sign In / Providers → Phone enable karo. SMS OTP ke liye provider configure karna hoga."
            : "Signup request ho gayi. Email verification complete karke phir login karo.");
        }
      } else {
        const result = method === "phone"
          ? await supabase.auth.signInWithPassword({ phone: cleanPhone, password })
          : await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
        if (result.error) throw result.error;
        if (result.data.user) {
          const profile = { id: result.data.user.id, display_name: String(result.data.user.user_metadata?.display_name || name || "").trim() || null, ...(method === "phone" ? { phone: cleanPhone } : (cleanPhone ? { phone: cleanPhone } : {})) };
          const { error: profileError } = await supabase.from("profiles").upsert(profile, { onConflict: "id" });
          if (profileError) console.warn("Profile sync failed:", profileError.message);
          const next = new URLSearchParams(window.location.search).get("next");
          window.location.href = next?.startsWith("/") ? next : (result.data.user.app_metadata?.role === "admin" ? "/admin" : "/");
        }
      }
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Request complete nahi ho saki. Dobara try karo.";
      if (/phone.*disabled|provider.*disabled/i.test(raw)) {
        setError("Supabase mein Phone provider abhi disabled hai. Supabase Dashboard → Authentication → Sign In / Providers → Phone ko enable karo. SMS OTP ke liye SMS provider bhi set karna hoga. Email login tab tak available hai.");
      } else if (/invalid login credentials/i.test(raw)) {
        setError("Number/email ya password galat hai. Signup complete hua tha aur confirmation required nahi hai, ye bhi check karo.");
      } else setError(raw);
    } finally { setBusy(false); }
  }

  return <main className="auth-page">
    <div className="auth-top"><Link href="/" className="auth-back"><ArrowLeft size={17}/> RX MOD home</Link></div>
    <section className="auth-card">
      <div className="auth-mark">RX</div><div className="auth-eyebrow">YOUR LEARNING SPACE</div>
      <h1>{mode === "login" ? "Welcome back." : "Create your account."}</h1>
      <p className="auth-subtitle">{mode === "login" ? "Log in to continue your learning journey." : "One account for your courses and progress."}</p>
      <div className="auth-tabs">
        <button type="button" className={mode === "login" ? "auth-tab selected" : "auth-tab"} onClick={() => {setMode("login");clearMessages();}}>Log in</button>
        <button type="button" className={mode === "signup" ? "auth-tab selected" : "auth-tab"} onClick={() => {setMode("signup");clearMessages();}}>Sign up</button>
      </div>
      <div className="auth-tabs" aria-label="Login method">
        <button type="button" className={method === "phone" ? "auth-tab selected" : "auth-tab"} onClick={() => {setMethod("phone");clearMessages();}}><Phone size={14}/> Mobile number</button>
        <button type="button" className={method === "email" ? "auth-tab selected" : "auth-tab"} onClick={() => {setMethod("email");clearMessages();}}><Mail size={14}/> Email</button>
      </div>
      <form onSubmit={submit} className="auth-form">
        {mode === "signup" && <label>Your name<div className="auth-input"><UserRound size={17}/><input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" required maxLength={80} autoComplete="name"/></div></label>}
        {method === "phone" ? <label>Mobile number<div className="auth-input"><Phone size={17}/><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91 98765 43210" inputMode="tel" autoComplete="tel" required/></div></label> : <label>Email address<div className="auth-input"><Mail size={17}/><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email" autoComplete="email" required/></div></label>}
        <label>Password<div className="auth-input"><LockKeyhole size={17}/><input value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" type="password" autoComplete={mode==="login"?"current-password":"new-password"} minLength={8} required/></div></label>
        <button className="btn btn-primary auth-submit" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button>
      </form>
      {error&&<p className="auth-message auth-error" role="alert">{error}</p>}
      {message&&<p className="auth-message auth-success" role="status">{message}</p>}
      <p className="auth-footnote">Passwords are handled by Supabase Auth. RX MOD never stores plaintext passwords.</p>
    </section>
  </main>;
}
