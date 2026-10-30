"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LockKeyhole, LoaderCircle, CheckCircle2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
 const [password,setPassword]=useState(""); const [confirm,setConfirm]=useState("");
 const [ready,setReady]=useState(false); const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState(""); const [error,setError]=useState("");
 useEffect(()=>{const sb=getSupabaseBrowserClient();const {data:{subscription}}=sb.auth.onAuthStateChange((event,session)=>{if(event==="PASSWORD_RECOVERY"||session)setReady(true)});sb.auth.getSession().then(({data})=>{if(data.session)setReady(true);else setError("Reset link invalid ya expire ho gaya. Naya reset link request karo.")});return()=>subscription.unsubscribe()},[]);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setError("");setMessage("");if(password.length<8){setError("Password kam se kam 8 characters ka hona chahiye.");return}if(password!==confirm){setError("Dono password match nahi kar rahe.");return}setBusy(true);try{const {error}=await getSupabaseBrowserClient().auth.updateUser({password});if(error)throw error;setMessage("Password update ho gaya. Ab login kar sakte ho.");setPassword("");setConfirm("");}catch(err){setError(err instanceof Error?err.message:"Password update nahi hua.")}finally{setBusy(false)}}
 return <main className="auth-page"><div className="auth-top"><Link href="/login" className="auth-back"><ArrowLeft size={17}/> Back to login</Link></div><section className="auth-card"><div className="auth-mark">RX</div><div className="auth-eyebrow">SECURE ACCOUNT</div><h1>Choose a new password.</h1><p className="auth-subtitle">Naya password set karo. Kam se kam 8 characters.</p>{ready?<form className="auth-form" onSubmit={submit}><label>New password<div className="auth-input"><LockKeyhole size={17}/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={8} autoComplete="new-password" required/></div></label><label>Confirm password<div className="auth-input"><LockKeyhole size={17}/><input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} minLength={8} autoComplete="new-password" required/></div></label><button className="btn btn-primary auth-submit" disabled={busy}>{busy?<><LoaderCircle size={16}/> Updating…</>:"Update password"}</button></form>:<p className="auth-footnote">Email ke reset link se yahan aao.</p>}{error&&<p className="auth-message auth-error" role="alert">{error}</p>}{message&&<p className="auth-message auth-success" role="status"><CheckCircle2 size={16}/> {message} <Link href="/login">Go to login</Link></p>}</section></main>;
}
