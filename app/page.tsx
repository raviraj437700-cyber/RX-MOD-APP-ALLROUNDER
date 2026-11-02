"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ArrowRight, BookOpen, Download, FileText, FolderOpen, GraduationCap, House, Layers, LoaderCircle, Menu, MessageCircle, PlaySquare, Search, ShieldCheck, ShoppingBag, Sparkles, Star, UserRound, X } from "lucide-react";

type CourseCard={id:string;title:string;category:string;categoryId:string|null;price:number;description:string;badge:string;thumbnail:string|null;color:string};
type Category={id:string;name:string;slug:string};
function categoryIcon(_name:string){return FolderOpen;}
function categoryTone(index:number){return ["mint","amber","coral","purple","blue"][index%5];}
export default function Home(){
 const [catalog,setCatalog]=useState<CourseCard[]>([]),[categories,setCategories]=useState<Category[]>([]),[purchasedIds,setPurchasedIds]=useState<string[]>([]),[active,setActive]=useState("all"),[query,setQuery]=useState(""),[selected,setSelected]=useState<CourseCard|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(""),[profileName,setProfileName]=useState("Student"),[isAdmin,setIsAdmin]=useState(false),[signedIn,setSignedIn]=useState(false),[menu,setMenu]=useState(false);
 useEffect(()=>{
  let cancelled=false;
  const sb=getSupabaseBrowserClient();
  const loadForSession=async(session:any)=>{
   if(cancelled)return;
   if(!session?.user){setSignedIn(false);window.location.replace("/login");return;}
   setSignedIn(true);setProfileName(String(session.user.user_metadata?.display_name||session.user.email?.split("@")[0]||"Student"));setIsAdmin(session.user.app_metadata?.role==="admin");setLoading(true);setError("");
   const [courseRes,accessRes,categoryRes]=await Promise.all([
    sb.from("courses").select("id,title,category_id,short_description,description,price_paise,is_featured,thumbnail_url,categories(name)").eq("is_published",true).order("created_at",{ascending:false}),
    sb.from("course_access").select("course_id").eq("user_id",session.user.id).is("revoked_at",null),
    sb.from("categories").select("id,name,slug").eq("is_active",true).order("sort_order",{ascending:true})
   ]);
   if(cancelled)return;
   if(courseRes.error){setError(courseRes.error.message);setCatalog([]);}
   else{
    const palette=["blue","teal","purple","orange"];
    setCatalog((courseRes.data||[]).map((row:any,index:number)=>({id:String(row.id),title:row.title,category:row.categories?.name||"Courses",categoryId:row.category_id||null,price:Math.round((row.price_paise||0)/100),description:row.short_description||row.description||"Course details and learning materials.",badge:row.is_featured?"FEATURED":"",thumbnail:row.thumbnail_url||null,color:palette[index%palette.length]})));
   }
   if(accessRes.error){setError(old=>old||("Purchased courses load nahi hue: "+accessRes.error.message));setPurchasedIds([]);}
   else setPurchasedIds((accessRes.data||[]).map((row:any)=>String(row.course_id)));
   if(categoryRes.error)setError(old=>old||("Categories load nahi hui: "+categoryRes.error.message));else setCategories(categoryRes.data||[]);
   setLoading(false);
  };
  sb.auth.getSession().then(({data})=>loadForSession(data.session));
  const {data:{subscription}}=sb.auth.onAuthStateChange((_event,session)=>{if(session)void loadForSession(session);else if(!cancelled)window.location.replace("/login");});
  return()=>{cancelled=true;subscription.unsubscribe()};
 },[]);
 const visibleCatalog=useMemo(()=>catalog.filter(c=>!purchasedIds.includes(c.id)),[catalog,purchasedIds]);
 const filtered=useMemo(()=>visibleCatalog.filter(c=>{
  const matchesSearch=(c.title+" "+c.category+" "+c.description).toLowerCase().includes(query.toLowerCase());
  const key=active.toLowerCase();
  const categoryMatch=active==="all"||c.categoryId===active;
  return matchesSearch&&categoryMatch;
 }),[visibleCatalog,query,active]);
 if(loading||!signedIn)return <main className="auth-page"><section className="auth-card"><div className="auth-mark">RX</div><LoaderCircle className="spin"/><p>Account aur courses load ho rahe hain…</p></section></main>;
 return <main className="shop-home">
  <header className="shop-header">
   <Link className="shop-avatar" href="/profile" aria-label="Account"><UserRound size={20}/></Link>
   <Link href="/" className="shop-brand"><b>RX</b><span>MOD APP<small>ALLROUNDER</small></span></Link>
   <div className="shop-header-actions"><Link href="/my-courses" aria-label="My purchases"><Download size={19}/></Link><button aria-label="Menu" onClick={()=>setMenu(!menu)}><Menu size={20}/></button></div>
  </header>
  {menu&&<div className="shop-menu"><Link href="/my-courses">My Purchases</Link><Link href="/profile">Account</Link>{isAdmin&&<Link href="/admin">Admin Panel</Link>}<button onClick={async()=>{await getSupabaseBrowserClient().auth.signOut();window.location.replace("/login")}}>Log out</button></div>}
  <section className="shop-welcome"><h1>Hi, {profileName}</h1><p>Aaj kya naya seekhna hai?</p><label className="shop-search"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search courses, study materials..." aria-label="Search courses and study materials"/></label></section>
  <section className="shop-promo-wrap"><div className="shop-promo"><div><span className="promo-eyebrow">RX MOD ALLROUNDER</span><h2>Learn something new.<br/><strong>Build your skills.</strong></h2><p>Courses and study materials in one place.</p><button onClick={()=>{setActive("all");document.getElementById("shop-categories")?.scrollIntoView({behavior:"smooth"});}}>Explore now <ArrowRight size={15}/></button></div><div className="promo-art"><div className="promo-circle"><BookOpen size={42}/></div><Sparkles className="promo-spark spark-one"/><Star className="promo-spark spark-two"/></div></div></section>
  <section className="shop-categories" id="shop-categories"><div className="shop-section-title"><h2>Category</h2><button onClick={()=>setActive("all")}>See All</button></div><div className="shop-category-row"><button className={"shop-category tone-mint "+(active==="all"?"category-selected ":"")} onClick={()=>setActive("all")}><span><Layers size={22}/></span><small>All</small></button>{categories.map((category,index)=>{const Icon=categoryIcon(category.name);return <button key={category.id} className={"shop-category tone-"+categoryTone(index)+(active===category.id?" category-selected":"")} onClick={()=>setActive(category.id)}><span><Icon size={22}/></span><small>{category.name}</small></button>})}</div></section>
  <section className="shop-recommended" id="shop-courses"><div className="shop-section-title"><div><h2>Recommended for You</h2><p>Choose your next course or learning resource.</p></div><button aria-label="View all courses" onClick={()=>{setActive("all");document.getElementById("shop-courses")?.scrollIntoView({behavior:"smooth"});}}><ArrowRight size={19}/></button></div>
   {error&&<div className="shop-error">{error}</div>}
   {filtered.length>0?<div className="shop-product-row">{filtered.map(c=><article className="shop-product-card" key={c.id}><button className={"shop-product-art product-"+c.color} onClick={()=>setSelected(c)} aria-label={"View "+c.title}>{c.thumbnail?<img src={c.thumbnail} alt="" />:<><span className="product-art-grid"/><span className="product-art-symbol">{c.category.toLowerCase().includes("pdf")?"▤":c.category.toLowerCase().includes("video")?"▶":"✦"}</span></>} {c.badge&&<span className="shop-product-badge">{c.badge}</span>}</button><div className="shop-product-info"><small>{c.category}</small><button className="shop-product-name" onClick={()=>setSelected(c)}>{c.title}</button><div className="shop-product-price"><b>₹{c.price.toLocaleString("en-IN")}</b><span>One-time purchase</span></div><button className="shop-buy-small" onClick={()=>setSelected(c)}>View details <ArrowRight size={14}/></button></div></article>)}</div>:<div className="shop-empty">{loading?<LoaderCircle className="spin"/>:<><BookOpen size={27}/><h3>{visibleCatalog.length===0?"All caught up!":"Nothing in this category yet"}</h3><p>{visibleCatalog.length===0&&purchasedIds.length>0?"Tumhare purchased courses My Purchases mein milenge.":error?"Courses load karne mein dikkat hui. Page refresh karke try karo.":"Admin ke publish karne ke baad yahan items dikhenge."}</p>{purchasedIds.length>0&&<Link href="/my-courses">Go to My Purchases <ArrowRight size={15}/></Link>}</>}</div>}
  </section>
  <footer className="shop-bottom-nav"><Link className="shop-nav-active" href="/"><House size={20}/><small>Home</small></Link><Link href="/my-courses"><ShoppingBag size={20}/><small>My Purchases</small></Link><Link className="shop-nav-center" href="/support-chat"><MessageCircle size={20}/><small>Chat</small></Link><Link href="/learn"><BookOpen size={20}/><small>Learn</small></Link><Link href="/profile"><UserRound size={20}/><small>Account</small></Link></footer>
  {isAdmin&&<Link href="/admin" className="shop-admin-fab">Admin Panel <ArrowRight size={15}/></Link>}
  {selected&&<div className="modal-backdrop" onClick={()=>setSelected(null)}><section className="course-modal" role="dialog" aria-modal="true" aria-labelledby="shop-modal-title" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setSelected(null)} aria-label="Close"><X size={19}/></button><div className={"modal-art product-"+selected.color}>{selected.thumbnail?<img src={selected.thumbnail} alt=""/>:<span className="product-art-symbol">✦</span>}</div><div className="modal-body"><div className="course-category">{selected.category}</div><h2 id="shop-modal-title">{selected.title}</h2><p>{selected.description}</p><div className="modal-price"><strong>₹{selected.price.toLocaleString("en-IN")}</strong></div><button className="btn btn-primary modal-buy" onClick={()=>{window.location.href="/checkout?course="+encodeURIComponent(selected.id);}}>Buy Now <ArrowRight size={17}/></button><small className="modal-disclaimer"><ShieldCheck size={13}/> Course access admin payment approval ke baad milega.</small></div></section></div>}
 </main>;
}
