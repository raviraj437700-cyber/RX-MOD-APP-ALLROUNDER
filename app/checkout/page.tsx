"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Copy, CreditCard, LoaderCircle, ShieldCheck } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Course = { id:string; title:string; description:string|null; price_paise:number; is_published:boolean };
type Setting = { key:string; value:string|null };
export default function CheckoutPage(){
 const params=useSearchParams();
 const courseId=params.get("course");
 const [course,setCourse]=useState<Course|null>(null);
 const [qr,setQr]=useState("");
 const [adminContact,setAdminContact]=useState("");
 const [userId,setUserId]=useState("");
 const [requestId,setRequestId]=useState("");
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 useEffect(()=>{let cancelled=false;(async()=>{const sb=getSupabaseBrowserClient();const [{data:{user}},{data:settings},{data:courseData,error:courseError}]=await Promise.all([sb.auth.getUser(),sb.from("app_settings").select("key,value"),courseId?sb.from("courses").select("id,title,description,price_paise,is_published").eq("id",courseId).eq("is_published",true).maybeSingle():Promise.resolve({data:null,error:null} as any)]);if(cancelled)return;if(user)setUserId(user.id);const settingRows=(settings||[]) as Setting[];setQr(settingRows.find(x=>["payment_qr_url","upi_qr_url","qr_code_url"].includes(x.key))?.value||"");setAdminContact(settingRows.find(x=>["admin_contact","admin_phone","support_phone"].includes(x.key))?.value||"");if(courseError)setError(courseError.message);setCourse(courseData as Course|null);setLoading(false)})();return()=>{cancelled=true}},[courseId]);
 async function requestAccess(){setError("");setSuccess("");if(!userId){window.location.href="/login?next="+encodeURIComponent("/checkout?course="+courseId);return}if(!course){setError("Course nahi mila. Homepage se course dobara select karo.");return}setBusy(true);try{const sb=getSupabaseBrowserClient();const {data,error:insertError}=await sb.from("purchase_requests").insert({user_id:userId,course_id:course.id,amount_paise:course.price_paise,status:"pending"}).select("id").single();if(insertError)throw insertError;setRequestId(data.id);setSuccess("Payment request create ho gayi. QR par payment karne ke baad admin ko apna registered mobile number aur request ID bhejo. Admin payment verify karke course unlock karega.");}catch(e){setError(e instanceof Error?e.message:"Request nahi ban saki. Login karke dobara try karo.")}finally{setBusy(false)}}
 const rupees=(course?.price_paise||0)/100;
 return <main className="auth-page"><div className="auth-top"><Link href="/" className="auth-back"><ArrowLeft size={17}/> RX MOD home</Link></div><section className="auth-card checkout-card"><div className="auth-mark"><CreditCard size={23}/></div><div className="auth-eyebrow">SECURE MANUAL CHECKOUT</div><h1>Get course access.</h1>{loading?<p className="auth-subtitle">Loading course details…</p>:!course?<div className="auth-message auth-error">Published course nahi mila. Homepage par wapas jaakar published course choose karo.</div>:<><p className="auth-subtitle">Review the course, pay using the admin QR, then submit your request for verification.</p><div className="checkout-summary"><span>Selected course</span><strong>{course.title}</strong><b>₹{rupees.toLocaleString("en-IN",{maximumFractionDigits:2})}</b></div><div className="checkout-qr"><h3>Only QR code payment available</h3>{qr?<img src={qr} alt="Admin UPI QR code" className="checkout-qr-image"/>:<div className="qr-placeholder"><CreditCard size={28}/><span>Admin QR code abhi set nahi hua</span><small>Admin Panel mein payment_qr_url setting add karo.</small></div>}<p>Payment karne se pehle QR par dikhne wala naam aur amount khud verify karna. Course access admin ke payment verify karne ke baad hi milega.</p></div>{adminContact&&<p className="checkout-contact">Admin se contact: <a href={"https://wa.me/"+adminContact.replace(/[^0-9]/g,"")} target="_blank" rel="noreferrer">{adminContact}</a></p>}<button className="btn btn-primary auth-submit" onClick={requestAccess} disabled={busy||!!requestId}>{busy?<><LoaderCircle size={16}/> Request bhej rahe hain…</>:requestId?<><CheckCircle2 size={16}/> Request submitted</>:"I have paid — request verification"}</button>{requestId&&<div className="checkout-request"><b>Payment request ID</b><code>{requestId}</code><button type="button" onClick={()=>navigator.clipboard?.writeText(requestId)}><Copy size={14}/> Copy ID</button></div>}{success&&<p className="auth-message auth-success" role="status">{success}</p>}</>}{error&&<p className="auth-message auth-error" role="alert">{error}</p>}<p className="auth-footnote"><ShieldCheck size={13}/> Never share your account password or OTP with anyone.</p></section></main>
}
