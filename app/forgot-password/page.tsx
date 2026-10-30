"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, LoaderCircle, CheckCircle2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email,setEmail]=useState("");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  async function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError(""); setMessage("");
    const clean=email.trim().toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)){setError("Valid email address daalo.");setBusy(false);return;}
    try {
      const origin=window.location.origin;
      const {error}=await getSupabaseBrowserClient().auth.resetPasswordForEmail(clean,{redirectTo:origin+"/reset-password"});
      if(error) throw error;
      setMessage("Agar is email par account hai, to password reset link bhej diya gaya hai. Inbox aur spam folder check karo.");
    } catch(err) { setError(err instanceof Error?err.message:"Reset email bheja nahi ja saka."); }
    finally {setBusy(false);}
  }
  return <main className="auth-page"><div className="auth-top"><Link href="/login" className="auth-back"><ArrowLeft size={17}/> Back to login</Link></div><section className="auth-card"><div className="auth-mark">RX</div><div className="auth-eyebrow">ACCOUNT RECOVERY</div><h1>Reset your password.</h1><p className="auth-subtitle">Apne account ka email daalo. Hum reset link bhejenge.</p><form className="auth-form" onSubmit={submit}><label>Email address<div className="auth-input"><Mail size={17}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required/></div></label><button className="btn btn-primary auth-submit" disabled={busy}>{busy?<><LoaderCircle size={16}/> Sending…</>:"Send reset link"}</button></form>{error&&<p className="auth-message auth-error" role="alert">{error}</p>}{message&&<p className="auth-message auth-success" role="status"><CheckCircle2 size={16}/> {message}</p>}<p className="auth-footnote">Reset link expire ho sakta hai. Link ko kisi ke saath share mat karo.</p></section></main>;
}
