import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Plus, FileText, Users, BookOpen, BarChart3, Settings as SettingsIcon,
  LayoutDashboard, ChevronRight, ChevronLeft, Trash2, Copy, Search,
  Sparkles, Download, Send, Save, X, Check, Building2, Calculator,
  ArrowLeft, Lock, LogOut, Eye, EyeOff, AlertCircle, Mail
} from "lucide-react";
import { supabase } from "./supabaseClient";

/* ---------------------------------------------------------------
   My QUOTE — construction & engineering quotation builder
   Tokens:
   ink #0B1E33 (blueprint navy) · paper #FBFAF6 (drafting paper)
   blue #1D4E89 (structural blue) · orange #E85D04 (signature accent)
   steel #64748B · green #2F9E44 · red #C1121F
   Display: Space Grotesk · Body: Inter · Data: IBM Plex Mono
----------------------------------------------------------------*/

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

:root{
  --ink:#0B1E33; --ink-2:#132A44; --paper:#FBFAF6; --paper-2:#F2EEE3;
  --blue:#1D4E89; --blue-2:#2E6BB0; --orange:#E85D04; --steel:#64748B;
  --steel-2:#94A3B8; --green:#2F9E44; --red:#C1121F; --line:#D8D2C2;
  --line-dark:#25405F;
}
*{box-sizing:border-box;}
.qa-root{
  font-family:'Inter',sans-serif; background:var(--paper); color:var(--ink);
  min-height:100vh; width:100%; display:flex; position:relative;
}
.qa-root, .qa-root *{ -webkit-font-smoothing:antialiased; }
.qa-mono{ font-family:'IBM Plex Mono',monospace; }
.qa-disp{ font-family:'Space Grotesk',sans-serif; }

/* login */
.qa-login-wrap{ min-height:100vh; width:100%; display:flex; align-items:center; justify-content:center;
  background:radial-gradient(circle at 20% 20%, #10233b 0%, var(--ink) 55%, #071322 100%); }
.qa-login-card{ width:380px; background:var(--paper); border-radius:4px; padding:36px 32px; position:relative;
  box-shadow:0 30px 60px rgba(0,0,0,.45); }
.qa-login-card::before{ content:''; position:absolute; inset:10px; border:1px solid var(--line); pointer-events:none; }
.qa-crossmark{ position:absolute; width:12px; height:12px; }
.qa-crossmark::before, .qa-crossmark::after{ content:''; position:absolute; background:var(--orange); }
.qa-crossmark::before{ width:12px; height:1.5px; top:5px; }
.qa-crossmark::after{ width:1.5px; height:12px; left:5px; }
.qa-cm-tl{ top:2px; left:2px; } .qa-cm-tr{ top:2px; right:2px; }
.qa-cm-bl{ bottom:2px; left:2px; } .qa-cm-br{ bottom:2px; right:2px; }

/* layout */
.qa-sidebar{ width:220px; background:var(--ink); color:var(--paper); flex-shrink:0; display:flex; flex-direction:column;
  min-height:100vh; }
.qa-nav-item{ display:flex; align-items:center; gap:10px; padding:11px 20px; color:#C7D2DD; cursor:pointer;
  font-size:13.5px; font-weight:500; border-left:3px solid transparent; transition:all .15s; }
.qa-nav-item:hover{ background:var(--ink-2); color:#fff; }
.qa-nav-item.active{ background:var(--ink-2); color:#fff; border-left-color:var(--orange); }
.qa-main{ flex:1; min-width:0; padding:28px 36px 60px; }

/* buttons */
.qa-btn{ font-family:'Inter',sans-serif; font-weight:600; font-size:13.5px; border-radius:3px; border:none;
  cursor:pointer; display:inline-flex; align-items:center; gap:7px; padding:10px 18px; transition:all .15s; }
.qa-btn-primary{ background:var(--orange); color:#fff; }
.qa-btn-primary:hover{ background:#CC4E00; }
.qa-btn-dark{ background:var(--ink); color:#fff; }
.qa-btn-dark:hover{ background:var(--ink-2); }
.qa-btn-ghost{ background:transparent; color:var(--ink); border:1px solid var(--line); }
.qa-btn-ghost:hover{ background:var(--paper-2); }
.qa-btn:disabled{ opacity:.45; cursor:not-allowed; }

/* cards */
.qa-card{ background:#fff; border:1px solid var(--line); border-radius:4px; padding:20px; }
.qa-stat{ background:#fff; border:1px solid var(--line); border-left:3px solid var(--blue); border-radius:3px; padding:16px 18px; }

/* inputs */
.qa-label{ font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.06em; color:var(--steel); margin-bottom:5px; display:block; }
.qa-input, .qa-select, .qa-textarea{ width:100%; border:1px solid var(--line); border-radius:3px; padding:9px 11px;
  font-size:13.5px; font-family:'Inter',sans-serif; background:#fff; color:var(--ink); }
.qa-input:focus, .qa-select:focus, .qa-textarea:focus{ outline:2px solid var(--blue-2); outline-offset:0; border-color:var(--blue-2); }
.qa-field{ margin-bottom:14px; }

/* progress */
.qa-progress{ display:flex; align-items:center; margin-bottom:28px; }
.qa-step{ display:flex; align-items:center; gap:8px; }
.qa-step-num{ width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center;
  font-size:12px; font-weight:700; font-family:'IBM Plex Mono',monospace; border:1.5px solid var(--line); color:var(--steel); flex-shrink:0; }
.qa-step.done .qa-step-num{ background:var(--green); border-color:var(--green); color:#fff; }
.qa-step.current .qa-step-num{ background:var(--orange); border-color:var(--orange); color:#fff; }
.qa-step-label{ font-size:12px; font-weight:600; color:var(--steel); white-space:nowrap; }
.qa-step.current .qa-step-label{ color:var(--ink); }
.qa-step-connector{ height:1.5px; background:var(--line); flex:1; margin:0 8px; min-width:16px; }

/* table */
.qa-table{ width:100%; border-collapse:collapse; font-size:13px; }
.qa-table th{ text-align:left; font-size:10.5px; text-transform:uppercase; letter-spacing:.05em; color:var(--steel);
  border-bottom:1.5px solid var(--ink); padding:8px 8px; font-weight:700; }
.qa-table td{ padding:8px 8px; border-bottom:1px solid var(--line); vertical-align:middle; }
.qa-table tr:hover td{ background:#FAF8F2; }

/* badge */
.qa-badge{ font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; padding:3px 8px; border-radius:2px; display:inline-block; }

/* blueprint preview sheet */
.qa-sheet{ background:#fff; border:1px solid var(--line-dark); position:relative; padding:0; max-width:820px; margin:0 auto; }
.qa-sheet::before{ content:''; position:absolute; inset:8px; border:1px solid #C9C2AC; pointer-events:none; }
.qa-titleblock{ border-top:2px solid var(--ink); margin-top:18px; display:grid; grid-template-columns:1.4fr 1fr 1fr 1fr; }
.qa-titleblock > div{ border-right:1px solid var(--line); border-top:1px solid var(--line); padding:8px 12px; }
.qa-titleblock > div:last-child{ border-right:none; }
.qa-tb-label{ font-size:9px; text-transform:uppercase; letter-spacing:.05em; color:var(--steel); font-weight:700; }
.qa-tb-value{ font-family:'IBM Plex Mono',monospace; font-size:12.5px; font-weight:600; margin-top:2px; }

::selection{ background:var(--orange); color:#fff; }
`;

const CURRENCIES = ["AED","USD","EUR","GBP","CAD","KES","INR","TZS"];
const PROJECT_TYPES = ["Villa Construction","Commercial Construction","Office Fit-Out","Retail","Hospitality","School","Joinery","MEP","Electrical","Plumbing","HVAC","Civil Works","Steel Fabrication","Aluminium & Glass","Swimming Pool","Landscaping","Maintenance","Other"];
const ROLES = ["Admin","Estimator","Sales","Project Manager","Accountant","Viewer"];
const COST_VISIBLE_ROLES = ["Admin","Estimator","Accountant"];
const STATUS_FLOW = ["Draft","Ready","Sent","Viewed","Negotiation","Revised","Approved","Rejected","Expired"];
const STATUS_COLOR = {
  Draft:{bg:"#EEE9DC",fg:"#5B5544"}, Ready:{bg:"#DCE9F6",fg:"#1D4E89"}, Sent:{bg:"#DCE9F6",fg:"#1D4E89"},
  Viewed:{bg:"#E7E2F6",fg:"#5B3FA6"}, Negotiation:{bg:"#FCE8D6",fg:"#B85C00"}, Revised:{bg:"#FCE8D6",fg:"#B85C00"},
  Approved:{bg:"#DCF3E1",fg:"#2F9E44"}, Rejected:{bg:"#FBDDE1",fg:"#C1121F"}, Expired:{bg:"#EEE9DC",fg:"#8A8371"}
};

const uid = () => Math.random().toString(36).slice(2,10);
function readFileAsDataUrl(file, cb){
  const reader = new FileReader();
  reader.onload = () => cb(reader.result);
  reader.readAsDataURL(file);
}
const emptyCompany = { name:"", logo:"", address:"", phone:"", email:"", website:"", vat:"", currency:"AED", defaultVat:5, paymentTerms:"50% advance, 40% on completion, 10% on handover", warranty:"12 months warranty on workmanship", validity:"30 days" };
const emptyClient = { id:"", name:"", company:"", phone:"", email:"", address:"", projectLocation:"" };
const emptyItem = () => ({ id:uid(), item:"", description:"", unit:"m²", quantity:1, rate:0, advanced:false, cost:0, mode:"markup", markup:20, margin:20 });

function fmtMoney(n, currency){
  const v = isFinite(n) ? n : 0;
  return `${currency} ${v.toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2})}`;
}
function computeRate(item){
  if(!item.advanced) return item.rate || 0;
  const cost = Number(item.cost)||0;
  if(item.mode==="markup") return cost*(1+(Number(item.markup)||0)/100);
  const m = Number(item.margin)||0;
  return m>=100 ? cost : cost/(1-m/100);
}
function itemAmount(item){ return (Number(item.quantity)||0) * computeRate(item); }
function itemCostTotal(item){ return item.advanced ? (Number(item.quantity)||0)*(Number(item.cost)||0) : 0; }

async function callClaude(prompt){
  // Calls our own serverless function (api/ai-assist.js) rather than api.anthropic.com directly,
  // so the Anthropic API key stays on the server and is never exposed to the browser.
  // This is an optional feature: it only works once ANTHROPIC_API_KEY is set in the hosting
  // provider's environment variables (see README). Without it, this call fails gracefully and
  // the rest of the app is unaffected.
  const res = await fetch("/api/ai-assist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if(!res.ok){
    const body = await res.json().catch(()=>({}));
    throw new Error(body.error || "AI assistant is not configured on this deployment yet.");
  }
  const data = await res.json();
  return data.text || "";
}

/* ---------------- persistence (Supabase: one row per user per key, RLS-isolated) ---------------- */
async function cloudGet(userId, key, fallback){
  const { data, error } = await supabase
    .from("user_data")
    .select("value")
    .eq("user_id", userId)
    .eq("key", key)
    .maybeSingle();
  if (error) { console.error("cloudGet error", key, error); return fallback; }
  return data ? data.value : fallback;
}
async function cloudSet(userId, key, value){
  const { error } = await supabase
    .from("user_data")
    .upsert({ user_id: userId, key, value }, { onConflict: "user_id,key" });
  if (error) console.error("cloudSet error", key, error);
}

function useCloudStore(userId, key, fallback){
  const [value, setValue] = useState(fallback);
  const [loaded, setLoaded] = useState(false);
  useEffect(()=>{
    if(!userId){ setValue(fallback); setLoaded(false); return; }
    let mounted = true;
    setValue(fallback); // reset immediately so switching accounts never shows the previous account's data
    setLoaded(false);
    (async()=>{
      const v = await cloudGet(userId, key, fallback);
      if(mounted) setValue(v);
      if(mounted) setLoaded(true);
    })();
    return ()=>{ mounted=false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[userId, key]);
  const persist = async (next) => {
    setValue(next);
    if(!userId) return;
    await cloudSet(userId, key, next);
  };
  return [value, persist, loaded];
}

/* ==================================================================== */
export default function App(){
  const [session, setSession] = useState(undefined); // undefined = checking, null = signed out, object = signed in
  const [profile, setProfile] = useState(null);       // {name, role, company}
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(()=>{
    supabase.auth.getSession().then(({ data })=> setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess)=> setSession(sess));
    return ()=> sub.subscription.unsubscribe();
  },[]);

  const userId = session?.user?.id || null;

  useEffect(()=>{
    if(!userId){ setProfile(null); setProfileLoaded(false); return; }
    let mounted = true;
    setProfileLoaded(false);
    (async()=>{
      const p = await cloudGet(userId, "profile", null);
      if(mounted){ setProfile(p); setProfileLoaded(true); }
    })();
    return ()=>{ mounted=false; };
  },[userId]);

  const [company, setCompany, companyLoaded] = useCloudStore(userId, "company", emptyCompany);
  const [clients, setClients] = useCloudStore(userId, "clients", []);
  const [quotations, setQuotations] = useCloudStore(userId, "quotations", []);
  const [rateLibrary, setRateLibrary] = useCloudStore(userId, "rateLibrary", []);
  const [view, setView] = useState("dashboard");
  const [draft, setDraft] = useState(null); // in-progress quotation
  const [step, setStep] = useState(0);
  const [previewingId, setPreviewingId] = useState(null);

  useEffect(()=>{
    // first sign-in: prefill the company name from what they entered when creating their profile
    if(userId && companyLoaded && !company.name && profile?.company){
      setCompany({ ...company, name: profile.company });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[userId, companyLoaded, profile]);

  if(session === undefined){
    return <><style>{CSS}</style><div className="qa-login-wrap"><div style={{color:"#fff",fontSize:13}}>Loading…</div></div></>;
  }

  if(!session){
    return <><style>{CSS}</style><Auth /></>;
  }

  if(!profileLoaded){
    return <><style>{CSS}</style><div className="qa-login-wrap"><div style={{color:"#fff",fontSize:13}}>Loading…</div></div></>;
  }

  if(!profile){
    return <><style>{CSS}</style><CompleteProfile userId={userId} email={session.user.email}
      onDone={async(p)=>{ await cloudSet(userId, "profile", p); setProfile(p); }} /></>;
  }

  const user = { name: profile.name, role: profile.role, company: profile.company, email: session.user.email };
  const canSeeCost = COST_VISIBLE_ROLES.includes(user.role);

  const startNewQuotation = () => {
    const seq = quotations.length + 1;
    const year = new Date().getFullYear();
    setDraft({
      id: uid(),
      number: `QT-${year}-${String(seq).padStart(3,"0")}`,
      status: "Draft",
      createdAt: new Date().toISOString(),
      company: { ...company },
      client: { ...emptyClient, id: uid() },
      clientMode: "new",
      project: { name:"", type:PROJECT_TYPES[0], location:"", description:"", date:new Date().toISOString().slice(0,10), validUntil:"", completion:"" },
      items: [emptyItem()],
      discount: 0,
      discountType: "amount",
      vat: company.defaultVat || 5,
      currency: company.currency || "AED",
    });
    setStep(0);
    setView("wizard");
  };

  const saveQuotation = async (status) => {
    if(!draft) return;
    const toSave = { ...draft, status: status || draft.status };
    const exists = quotations.some(q=>q.id===toSave.id);
    const next = exists ? quotations.map(q=>q.id===toSave.id?toSave:q) : [toSave, ...quotations];
    await setQuotations(next);
    if(!clients.some(c=>c.id===toSave.client.id) && toSave.client.name){
      await setClients([...clients, toSave.client]);
    }
    return toSave;
  };

  const editQuotation = (q) => {
    setDraft(JSON.parse(JSON.stringify(q)));
    setStep(0);
    setView("wizard");
  };

  const duplicateQuotation = async (q) => {
    const seq = quotations.length + 1;
    const year = new Date().getFullYear();
    const copy = { ...JSON.parse(JSON.stringify(q)), id: uid(), number:`QT-${year}-${String(seq).padStart(3,"0")}`, status:"Draft", createdAt:new Date().toISOString() };
    await setQuotations([copy, ...quotations]);
  };

  const deleteQuotation = async (id) => {
    await setQuotations(quotations.filter(q=>q.id!==id));
  };

  const revise = async (q) => {
    const base = q.number.split("-R")[0];
    const revCount = quotations.filter(x=>x.number.startsWith(base+"-R")).length;
    const copy = { ...JSON.parse(JSON.stringify(q)), id: uid(), number:`${base}-R${revCount+1}`, status:"Revised", createdAt:new Date().toISOString() };
    await setQuotations([copy, ...quotations]);
  };

  return (
    <div className="qa-root">
      <style>{CSS}</style>
      <Sidebar view={view} setView={(v)=>{ setDraft(null); setView(v); }} user={user} onLogout={()=>supabase.auth.signOut()} onNew={startNewQuotation} />
      <div className="qa-main">
        {view==="dashboard" && (
          <Dashboard quotations={quotations} currency={company.currency||"AED"} onNew={startNewQuotation}
            onOpen={(q)=>{ setPreviewingId(q.id); setView("preview-existing"); }} canSeeCost={canSeeCost} />
        )}
        {view==="wizard" && draft && (
          <Wizard draft={draft} setDraft={setDraft} step={step} setStep={setStep} clients={clients}
            rateLibrary={rateLibrary} setRateLibrary={setRateLibrary} canSeeCost={canSeeCost}
            onCancel={()=>{ setDraft(null); setView("dashboard"); }}
            onSave={async(status)=>{ const s=await saveQuotation(status); setDraft(s); }}
            onFinish={async()=>{ await saveQuotation("Ready"); setDraft(null); setView("quotations"); }} />
        )}
        {view==="quotations" && (
          <QuotationsList quotations={quotations} currency={company.currency||"AED"} clients={clients}
            onEdit={editQuotation} onDuplicate={duplicateQuotation} onRevise={revise} onDelete={deleteQuotation}
            onView={(q)=>{ setPreviewingId(q.id); setView("preview-existing"); }}
            onStatusChange={async(id,status)=>{ await setQuotations(quotations.map(q=>q.id===id?{...q,status}:q)); }} />
        )}
        {view==="preview-existing" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <button className="qa-btn qa-btn-ghost" onClick={()=>setView("quotations")}><ArrowLeft size={14}/> Back to quotations</button>
              {previewingId && quotations.find(q=>q.id===previewingId) && (
                <button className="qa-btn qa-btn-dark" onClick={()=>downloadQuotationHTML(quotations.find(q=>q.id===previewingId))}>
                  <Download size={14}/> Download Quotation
                </button>
              )}
            </div>
            <QuotationPreview quotation={quotations.find(q=>q.id===previewingId)} canSeeCost={canSeeCost} />
          </div>
        )}
        {view==="clients" && (
          <ClientsView clients={clients} setClients={setClients} quotations={quotations} currency={company.currency||"AED"} />
        )}
        {view==="rates" && (
          <RateLibraryView rateLibrary={rateLibrary} setRateLibrary={setRateLibrary} currency={company.currency||"AED"} />
        )}
        {view==="reports" && (
          <ReportsView quotations={quotations} currency={company.currency||"AED"} canSeeCost={canSeeCost} />
        )}
        {view==="settings" && (
          <SettingsView company={company} setCompany={setCompany} user={user} />
        )}
      </div>
    </div>
  );
}

/* ---------------- Auth (real Supabase email/password accounts) ---------------- */
function Auth(){
  const [mode, setMode] = useState("signin"); // signin | signup | reset
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const submit = async () => {
    setError(""); setNotice(""); setLoading(true);
    try{
      if(mode === "signup"){
        const { error } = await supabase.auth.signUp({ email: email.trim(), password });
        if(error) throw error;
        setNotice("Account created. If email confirmation is enabled on this project, check your inbox for a confirmation link before signing in.");
        setMode("signin");
      } else if(mode === "reset"){
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
        if(error) throw error;
        setNotice("If that email has an account, a password reset link has been sent.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if(error) throw error;
      }
    }catch(e){
      setError(e.message || "Something went wrong.");
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="qa-login-wrap">
      <div className="qa-login-card">
        <div className="qa-crossmark qa-cm-tl"></div><div className="qa-crossmark qa-cm-tr"></div>
        <div className="qa-crossmark qa-cm-bl"></div><div className="qa-crossmark qa-cm-br"></div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
          <div style={{width:28,height:28,background:"var(--ink)",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:3}}>
            <Building2 size={15} color="#fff" />
          </div>
          <div className="qa-disp" style={{fontWeight:700,fontSize:17}}>My QUOTE</div>
        </div>
        <div style={{fontSize:12.5,color:"var(--steel)",marginBottom:24}}>Construction &amp; engineering quotations, ready in minutes. Free to sign up.</div>

        <div style={{display:"flex",gap:4,marginBottom:18,background:"var(--paper-2)",borderRadius:4,padding:3}}>
          {["signin","signup"].map(m=>(
            <button key={m} type="button"
              onClick={()=>{ setMode(m); setError(""); setNotice(""); }}
              style={{flex:1,padding:"7px 0",fontSize:12.5,fontWeight:700,border:"none",borderRadius:3,cursor:"pointer",
                background: mode===m ? "#fff" : "transparent", color: mode===m ? "var(--ink)" : "var(--steel)",
                boxShadow: mode===m ? "0 1px 3px rgba(0,0,0,.1)" : "none"}}>
              {m==="signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <div className="qa-field">
          <label className="qa-label">Email</label>
          <input className="qa-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" />
        </div>

        {mode !== "reset" && (
          <div className="qa-field">
            <label className="qa-label">Password</label>
            <div style={{position:"relative"}}>
              <input className="qa-input" style={{paddingRight:36}} type={showPw?"text":"password"} value={password}
                onChange={e=>setPassword(e.target.value)} placeholder={mode==="signup" ? "At least 6 characters" : "Your password"}
                onKeyDown={e=>e.key==="Enter" && submit()} />
              <button type="button" onClick={()=>setShowPw(s=>!s)} style={{position:"absolute",right:8,top:8,background:"none",border:"none",cursor:"pointer",color:"var(--steel)"}}>
                {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>
        )}

        {error && <div style={{fontSize:12,color:"var(--red)",marginBottom:10}}>{error}</div>}
        {notice && <div style={{fontSize:12,color:"var(--green)",marginBottom:10}}>{notice}</div>}

        <button className="qa-btn qa-btn-primary" style={{width:"100%",justifyContent:"center",marginTop:2}}
          disabled={loading || !email.trim() || (mode!=="reset" && !password)}
          onClick={submit}>
          <Lock size={14}/> {loading ? "Please wait…" : mode==="signup" ? "Create free account" : mode==="reset" ? "Send reset link" : "Sign in"}
        </button>

        <div style={{textAlign:"center",marginTop:12}}>
          {mode!=="reset" ? (
            <button type="button" onClick={()=>{ setMode("reset"); setError(""); setNotice(""); }}
              style={{background:"none",border:"none",color:"var(--steel)",fontSize:11.5,cursor:"pointer",textDecoration:"underline"}}>
              Forgot password?
            </button>
          ) : (
            <button type="button" onClick={()=>{ setMode("signin"); setError(""); setNotice(""); }}
              style={{background:"none",border:"none",color:"var(--steel)",fontSize:11.5,cursor:"pointer",textDecoration:"underline"}}>
              Back to sign in
            </button>
          )}
        </div>

        <div style={{display:"flex",gap:6,alignItems:"flex-start",marginTop:16,padding:"9px 10px",background:"var(--paper-2)",borderRadius:3}}>
          <AlertCircle size={13} style={{marginTop:1,flexShrink:0,color:"var(--steel)"}}/>
          <div style={{fontSize:11,color:"var(--steel)",lineHeight:1.5}}>
            Every account is a real, password-protected sign-up. Your data — quotations, clients, rate library, company profile — is private to your account and never visible to anyone else's.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- CompleteProfile (first sign-in only) ---------------- */
function CompleteProfile({ userId, email, onDone }){
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("Admin");
  const [saving, setSaving] = useState(false);
  return (
    <div className="qa-login-wrap">
      <div className="qa-login-card">
        <div className="qa-crossmark qa-cm-tl"></div><div className="qa-crossmark qa-cm-tr"></div>
        <div className="qa-crossmark qa-cm-bl"></div><div className="qa-crossmark qa-cm-br"></div>
        <div className="qa-disp" style={{fontWeight:700,fontSize:16,marginBottom:4}}>Welcome to My QUOTE</div>
        <div style={{fontSize:12.5,color:"var(--steel)",marginBottom:20}}>Signed in as {email}. Just a couple of details to set up your workspace.</div>

        <div className="qa-field">
          <label className="qa-label">Your name</label>
          <input className="qa-input" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Ali Hassan" />
        </div>
        <div className="qa-field">
          <label className="qa-label">Company</label>
          <input className="qa-input" value={company} onChange={e=>setCompany(e.target.value)} placeholder="Company - ABC" />
        </div>
        <div className="qa-field">
          <label className="qa-label">Role</label>
          <select className="qa-select" value={role} onChange={e=>setRole(e.target.value)}>
            {ROLES.map(r=><option key={r}>{r}</option>)}
          </select>
        </div>
        <button className="qa-btn qa-btn-primary" style={{width:"100%",justifyContent:"center",marginTop:6}}
          disabled={!name.trim() || saving}
          onClick={async()=>{ setSaving(true); await onDone({ name:name.trim(), company:company.trim(), role }); }}>
          <Check size={14}/> {saving ? "Setting up…" : "Continue"}
        </button>
      </div>
    </div>
  );
}

/* ---------------- Sidebar ---------------- */
function Sidebar({ view, setView, user, onLogout, onNew }){
  const items = [
    ["dashboard","Dashboard",LayoutDashboard],
    ["quotations","Quotations",FileText],
    ["clients","Clients",Users],
    ["rates","Rate Library",BookOpen],
    ["reports","Reports",BarChart3],
    ["settings","Settings",SettingsIcon],
  ];
  return (
    <div className="qa-sidebar">
      <div style={{padding:"20px 20px 16px", borderBottom:"1px solid var(--ink-2)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:26,height:26,background:"var(--orange)",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:3,flexShrink:0}}>
            <Building2 size={14} color="#fff" />
          </div>
          <div className="qa-disp" style={{fontWeight:700,fontSize:15.5,color:"#fff"}}>My QUOTE</div>
        </div>
      </div>
      <div style={{padding:"16px 20px"}}>
        <button className="qa-btn qa-btn-primary" style={{width:"100%",justifyContent:"center"}} onClick={onNew}>
          <Plus size={15}/> New Quotation
        </button>
      </div>
      <div style={{flex:1}}>
        {items.map(([key,label,Icon])=>(
          <div key={key} className={`qa-nav-item ${view===key?"active":""}`} onClick={()=>setView(key)}>
            <Icon size={15}/> {label}
          </div>
        ))}
      </div>
      <div style={{padding:"14px 20px", borderTop:"1px solid var(--ink-2)"}}>
        <div style={{fontSize:12.5,fontWeight:600,color:"#fff"}}>{user.name}</div>
        <div style={{fontSize:11,color:"var(--steel-2)",marginBottom:8}}>{user.role}</div>
        <div className="qa-nav-item" style={{padding:"6px 0",borderLeft:"none"}} onClick={onLogout}>
          <LogOut size={13}/> Sign out
        </div>
      </div>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */
function Dashboard({ quotations, currency, onNew, onOpen, canSeeCost }){
  const stats = useMemo(()=>{
    const total = quotations.length;
    const drafts = quotations.filter(q=>q.status==="Draft").length;
    const sent = quotations.filter(q=>["Sent","Viewed","Negotiation"].includes(q.status)).length;
    const approved = quotations.filter(q=>q.status==="Approved").length;
    const totalValue = quotations.reduce((s,q)=>s+quoteTotal(q).grandTotal,0);
    return { total, drafts, sent, approved, totalValue };
  },[quotations]);
  const recent = quotations.slice(0,6);

  return (
    <div>
      <div className="qa-disp" style={{fontSize:23,fontWeight:700,marginBottom:2}}>Dashboard</div>
      <div style={{fontSize:13,color:"var(--steel)",marginBottom:22}}>Open the app, enter your details, and get a quotation out the door.</div>

      <button className="qa-btn qa-btn-primary" style={{padding:"14px 26px",fontSize:14,marginBottom:26}} onClick={onNew}>
        <Plus size={17}/> Create New Quotation
      </button>

      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:28}}>
        <Stat label="Total Quotations" value={stats.total} />
        <Stat label="Draft" value={stats.drafts} />
        <Stat label="Sent / In Review" value={stats.sent} />
        <Stat label="Approved" value={stats.approved} />
        <Stat label="Total Quoted Value" value={fmtMoney(stats.totalValue, currency)} mono wide />
      </div>

      <div className="qa-card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div className="qa-disp" style={{fontWeight:700,fontSize:15}}>Recent Quotations</div>
        </div>
        {recent.length===0 ? (
          <EmptyState text="No quotations yet. Create your first one above — it takes a few minutes." />
        ) : (
          <table className="qa-table">
            <thead><tr><th>Number</th><th>Client</th><th>Project</th><th>Status</th><th style={{textAlign:"right"}}>Total</th></tr></thead>
            <tbody>
              {recent.map(q=>{
                const t = quoteTotal(q);
                const c = STATUS_COLOR[q.status]||STATUS_COLOR.Draft;
                return (
                  <tr key={q.id} style={{cursor:"pointer"}} onClick={()=>onOpen(q)}>
                    <td className="qa-mono">{q.number}</td>
                    <td>{q.client?.name||"—"}</td>
                    <td>{q.project?.name||"—"}</td>
                    <td><span className="qa-badge" style={{background:c.bg,color:c.fg}}>{q.status}</span></td>
                    <td className="qa-mono" style={{textAlign:"right"}}>{fmtMoney(t.grandTotal, q.currency||currency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
function Stat({ label, value, mono, wide }){
  return (
    <div className="qa-stat" style={wide?{gridColumn:"span 2"}:undefined}>
      <div style={{fontSize:10.5,textTransform:"uppercase",letterSpacing:".05em",color:"var(--steel)",fontWeight:700,marginBottom:6}}>{label}</div>
      <div className={mono?"qa-mono":"qa-disp"} style={{fontSize:mono?18:22,fontWeight:700}}>{value}</div>
    </div>
  );
}
function EmptyState({ text }){
  return <div style={{padding:"30px 10px",textAlign:"center",color:"var(--steel)",fontSize:13}}>{text}</div>;
}

/* ---------------- totals helper ---------------- */
function quoteTotal(q){
  const items = q.items||[];
  const subtotal = items.reduce((s,it)=>s+itemAmount(it),0);
  const discountAmt = q.discountType==="percent" ? subtotal*((Number(q.discount)||0)/100) : (Number(q.discount)||0);
  const afterDiscount = Math.max(0, subtotal - discountAmt);
  const vatAmt = afterDiscount * ((Number(q.vat)||0)/100);
  const grandTotal = afterDiscount + vatAmt;
  const totalCost = items.reduce((s,it)=>s+itemCostTotal(it),0);
  const profit = subtotal - totalCost;
  const profitMargin = subtotal>0 ? (profit/subtotal)*100 : 0;
  return { subtotal, discountAmt, vatAmt, grandTotal, totalCost, profit, profitMargin };
}

function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

function buildQuotationHTML(q){
  const t = quoteTotal(q);
  const currency = q.currency;
  const rows = (q.items||[]).map(it=>`
    <tr>
      <td style="font-weight:600;">${esc(it.item)}</td>
      <td style="color:#64748B;">${esc(it.description)}</td>
      <td>${esc(it.unit)}</td>
      <td style="font-family:'IBM Plex Mono',monospace;">${esc(it.quantity)}</td>
      <td style="font-family:'IBM Plex Mono',monospace;">${esc(fmtMoney(computeRate(it),currency))}</td>
      <td style="font-family:'IBM Plex Mono',monospace;font-weight:600;text-align:right;">${esc(fmtMoney(itemAmount(it),currency))}</td>
    </tr>`).join("");
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>${esc(q.number)} - ${esc(q.client?.name||"Quotation")}</title>
<style>
@page{ size:A4; margin:16mm; }
*{box-sizing:border-box;}
body{ font-family:Arial,Helvetica,sans-serif; color:#0B1E33; background:#fff; margin:0; padding:24px; }
.mono{ font-family:'Courier New',monospace; }
.sheet{ max-width:800px; margin:0 auto; border:1px solid #25405F; padding:24px 28px; position:relative; }
.sheet::before{ content:''; position:absolute; inset:8px; border:1px solid #C9C2AC; pointer-events:none; }
.head{ display:flex; justify-content:space-between; align-items:flex-start; gap:16px; }
.head-left{ display:flex; gap:12px; align-items:flex-start; }
.logo{ width:48px; height:48px; object-fit:contain; flex-shrink:0; }
.company-name{ font-size:19px; font-weight:700; }
.small{ font-size:11px; color:#64748B; line-height:1.6; margin-top:3px; max-width:280px; }
.badge{ font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; padding:3px 8px; border-radius:2px; display:inline-block; background:#DCE9F6; color:#1D4E89; margin-top:4px; }
.quotetitle{ font-size:16px; font-weight:700; color:#1D4E89; text-align:right; }
.grid2{ display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:22px; padding-top:16px; border-top:1px solid #D8D2C2; }
.label{ font-size:9px; text-transform:uppercase; letter-spacing:.05em; color:#64748B; font-weight:700; }
.val{ font-weight:700; font-size:13.5px; margin-top:2px; }
table{ width:100%; border-collapse:collapse; font-size:13px; margin-top:18px; }
th{ text-align:left; font-size:10.5px; text-transform:uppercase; letter-spacing:.05em; color:#64748B; border-bottom:1.5px solid #0B1E33; padding:8px; font-weight:700; }
td{ padding:8px; border-bottom:1px solid #D8D2C2; }
.totals{ display:flex; justify-content:flex-end; margin-top:10px; }
.totals-box{ width:280px; }
.trow{ display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #D8D2C2; font-size:12.5px; }
.trow.big{ border-bottom:none; font-weight:700; font-size:16px; }
.terms{ margin-top:18px; font-size:11px; color:#64748B; line-height:1.7; }
.titleblock{ border-top:2px solid #0B1E33; margin-top:18px; display:grid; grid-template-columns:1.4fr 1fr 1fr 1fr; }
.titleblock > div{ border-right:1px solid #D8D2C2; border-top:1px solid #D8D2C2; padding:8px 12px; }
.titleblock > div:last-child{ border-right:none; }
.tbval{ font-family:'Courier New',monospace; font-size:12.5px; font-weight:600; margin-top:2px; }
.sign{ display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:26px; padding-top:16px; border-top:1px dashed #D8D2C2; }
.line{ border-bottom:1px solid #D8D2C2; height:34px; }
@media print{ body{ padding:0; } .sheet{ border:none; } .sheet::before{ display:none; } }
</style></head>
<body>
<div class="sheet">
  <div class="head">
    <div class="head-left">
      ${q.company?.logo ? `<img class="logo" src="${q.company.logo}" alt="logo"/>` : ""}
      <div>
        <div class="company-name">${esc(q.company?.name||"Your Company")}</div>
        <div class="small">
          ${esc(q.company?.address||"")}<br/>
          ${esc(q.company?.phone||"")} ${q.company?.phone && q.company?.email ? "&middot;" : ""} ${esc(q.company?.email||"")}<br/>
          ${esc(q.company?.website||"")}${q.company?.vat ? ` &middot; VAT ${esc(q.company.vat)}` : ""}
        </div>
      </div>
    </div>
    <div>
      <div class="quotetitle">QUOTATION</div>
      <div style="text-align:right;"><span class="badge">${esc(q.status)}</span></div>
    </div>
  </div>

  <div class="grid2">
    <div>
      <div class="label">Prepared for</div>
      <div class="val">${esc(q.client?.name||"—")}</div>
      <div class="small">${esc(q.client?.company||"")}<br/>${esc(q.client?.address||"")}<br/>${esc(q.client?.phone||"")} ${esc(q.client?.email||"")}</div>
    </div>
    <div>
      <div class="label">Project</div>
      <div class="val">${esc(q.project?.name||"—")}</div>
      <div class="small">${esc(q.project?.type||"")} &middot; ${esc(q.project?.location||"")}<br/>${esc(q.project?.description||"")}</div>
    </div>
  </div>

  <table>
    <thead><tr><th>Item</th><th>Description</th><th>Unit</th><th>Qty</th><th>Rate</th><th style="text-align:right;">Amount</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals"><div class="totals-box">
    <div class="trow"><span>Subtotal</span><span class="mono">${esc(fmtMoney(t.subtotal,currency))}</span></div>
    <div class="trow"><span>Discount</span><span class="mono">- ${esc(fmtMoney(t.discountAmt,currency))}</span></div>
    <div class="trow"><span>VAT/Tax (${esc(q.vat)}%)</span><span class="mono">${esc(fmtMoney(t.vatAmt,currency))}</span></div>
    <div class="trow big"><span>Grand Total</span><span class="mono">${esc(fmtMoney(t.grandTotal,currency))}</span></div>
  </div></div>

  <div class="terms"><b style="color:#0B1E33;">Terms:</b> ${esc(q.company?.paymentTerms)}. ${esc(q.company?.warranty)}. Quotation valid for ${esc(q.company?.validity)}.</div>

  <div class="titleblock">
    <div><div class="label">Quotation No.</div><div class="tbval">${esc(q.number)}</div></div>
    <div><div class="label">Date</div><div class="tbval">${esc(q.project?.date)}</div></div>
    <div><div class="label">Valid Until</div><div class="tbval">${esc(q.project?.validUntil||"—")}</div></div>
    <div><div class="label">Completion</div><div class="tbval">${esc(q.project?.completion||"—")}</div></div>
  </div>
  <div class="sign">
    <div><div class="label">Client Signature</div><div class="line"></div></div>
    <div><div class="label">Date</div><div class="line"></div></div>
  </div>
</div>
</body></html>`;
}

function downloadQuotationHTML(q){
  const html = buildQuotationHTML(q);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${q.number || "quotation"}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ---------------- Wizard ---------------- */
const STEPS = ["Company","Client","Project","Items","Review","Generate"];

function Wizard({ draft, setDraft, step, setStep, clients, rateLibrary, setRateLibrary, canSeeCost, onCancel, onSave, onFinish }){
  const update = (patch) => setDraft(d=>({ ...d, ...patch }));
  const next = async () => { await onSave("Draft"); setStep(s=>Math.min(s+1, STEPS.length-1)); };
  const back = () => setStep(s=>Math.max(s-1,0));

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
        <div>
          <div className="qa-disp" style={{fontSize:20,fontWeight:700}}>New Quotation <span className="qa-mono" style={{fontSize:14,color:"var(--steel)"}}>· {draft.number}</span></div>
        </div>
        <button className="qa-btn qa-btn-ghost" onClick={onCancel}><X size={14}/> Cancel</button>
      </div>

      <div className="qa-progress">
        {STEPS.map((label,i)=>(
          <React.Fragment key={label}>
            <div className={`qa-step ${i<step?"done":i===step?"current":""}`}>
              <div className="qa-step-num">{i<step?<Check size={13}/>:i+1}</div>
              <div className="qa-step-label">{label}</div>
            </div>
            {i<STEPS.length-1 && <div className="qa-step-connector"/>}
          </React.Fragment>
        ))}
      </div>

      <div className="qa-card" style={{marginBottom:18}}>
        {step===0 && <StepCompany company={draft.company} onChange={c=>update({company:c})} currency={draft.currency} onCurrencyChange={cur=>update({currency:cur})} />}
        {step===1 && <StepClient draft={draft} clients={clients} onChange={c=>update({client:c})} onMode={m=>update({clientMode:m})} />}
        {step===2 && <StepProject project={draft.project} onChange={p=>update({project:p})} />}
        {step===3 && <StepItems draft={draft} setDraft={setDraft} rateLibrary={rateLibrary} setRateLibrary={setRateLibrary} canSeeCost={canSeeCost} />}
        {step===4 && <StepReview draft={draft} onChange={update} canSeeCost={canSeeCost} />}
        {step===5 && <StepGenerate draft={draft} onSave={onSave} onFinish={onFinish} canSeeCost={canSeeCost} />}
      </div>

      <div style={{display:"flex",justifyContent:"space-between"}}>
        <button className="qa-btn qa-btn-ghost" onClick={back} disabled={step===0}><ChevronLeft size={14}/> Back</button>
        {step<STEPS.length-1 ? (
          <button className="qa-btn qa-btn-dark" onClick={next}>Continue <ChevronRight size={14}/></button>
        ) : (
          <button className="qa-btn qa-btn-primary" onClick={onFinish}><Check size={14}/> Mark as Ready</button>
        )}
      </div>
    </div>
  );
}

function StepCompany({ company, onChange, currency, onCurrencyChange }){
  const set = (k,v) => onChange({ ...company, [k]:v });
  return (
    <div>
      <div className="qa-disp" style={{fontWeight:700,fontSize:15,marginBottom:14}}>Company Details</div>
      <LogoField logo={company.logo} onChange={dataUrl=>set("logo",dataUrl)} />
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14, marginTop:14}}>
        <Field label="Company Name"><input className="qa-input" value={company.name} onChange={e=>set("name",e.target.value)} /></Field>
        <Field label="VAT / Tax Number"><input className="qa-input" value={company.vat} onChange={e=>set("vat",e.target.value)} /></Field>
        <Field label="Phone"><input className="qa-input" value={company.phone} onChange={e=>set("phone",e.target.value)} /></Field>
        <Field label="Email"><input className="qa-input" value={company.email} onChange={e=>set("email",e.target.value)} /></Field>
        <Field label="Website"><input className="qa-input" value={company.website} onChange={e=>set("website",e.target.value)} /></Field>
        <Field label="Currency for this Quotation">
          <select className="qa-select" value={currency} onChange={e=>onCurrencyChange(e.target.value)}>
            {CURRENCIES.map(c=><option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Default VAT / Tax %"><input type="number" className="qa-input" value={company.defaultVat} onChange={e=>set("defaultVat",e.target.value)} /></Field>
        <Field label="Quotation Validity"><input className="qa-input" value={company.validity} onChange={e=>set("validity",e.target.value)} /></Field>
      </div>
      <Field label="Address"><textarea className="qa-textarea" rows={2} value={company.address} onChange={e=>set("address",e.target.value)} /></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Field label="Payment Terms"><textarea className="qa-textarea" rows={2} value={company.paymentTerms} onChange={e=>set("paymentTerms",e.target.value)} /></Field>
        <Field label="Warranty"><textarea className="qa-textarea" rows={2} value={company.warranty} onChange={e=>set("warranty",e.target.value)} /></Field>
      </div>
    </div>
  );
}

function LogoField({ logo, onChange }){
  const inputRef = useRef(null);
  return (
    <div>
      <label className="qa-label">Company Logo</label>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:64,height:64,border:"1px solid var(--line)",borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",background:"var(--paper-2)",overflow:"hidden",flexShrink:0}}>
          {logo ? <img src={logo} alt="Logo" style={{width:"100%",height:"100%",objectFit:"contain"}} /> : <Building2 size={22} color="var(--steel)" />}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button type="button" className="qa-btn qa-btn-ghost" onClick={()=>inputRef.current?.click()}>Upload logo</button>
          {logo && <button type="button" className="qa-btn qa-btn-ghost" onClick={()=>onChange("")}><Trash2 size={13}/> Remove</button>}
        </div>
        <input ref={inputRef} type="file" accept="image/*" style={{display:"none"}}
          onChange={e=>{ const f=e.target.files?.[0]; if(f) readFileAsDataUrl(f, onChange); e.target.value=""; }} />
      </div>
      <div style={{fontSize:11,color:"var(--steel)",marginTop:6}}>PNG or JPG, shown on the quotation preview and PDF.</div>
    </div>
  );
}

function StepClient({ draft, clients, onChange, onMode }){
  const client = draft.client;
  const set = (k,v) => onChange({ ...client, [k]:v });
  return (
    <div>
      <div className="qa-disp" style={{fontWeight:700,fontSize:15,marginBottom:14}}>Client Details</div>
      {clients.length>0 && (
        <Field label="Select existing client (or fill in a new one below)">
          <select className="qa-select" value={draft.clientMode==="existing"?client.id:""} onChange={e=>{
            const c = clients.find(x=>x.id===e.target.value);
            if(c){ onMode("existing"); onChange(c); }
          }}>
            <option value="">— New client —</option>
            {clients.map(c=><option key={c.id} value={c.id}>{c.name} {c.company?`(${c.company})`:""}</option>)}
          </select>
        </Field>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Field label="Client Name"><input className="qa-input" value={client.name} onChange={e=>set("name",e.target.value)} /></Field>
        <Field label="Client Company"><input className="qa-input" value={client.company} onChange={e=>set("company",e.target.value)} /></Field>
        <Field label="Phone"><input className="qa-input" value={client.phone} onChange={e=>set("phone",e.target.value)} /></Field>
        <Field label="Email"><input className="qa-input" value={client.email} onChange={e=>set("email",e.target.value)} /></Field>
      </div>
      <Field label="Address"><textarea className="qa-textarea" rows={2} value={client.address} onChange={e=>set("address",e.target.value)} /></Field>
      <Field label="Project Location"><input className="qa-input" value={client.projectLocation} onChange={e=>set("projectLocation",e.target.value)} /></Field>
    </div>
  );
}

function StepProject({ project, onChange }){
  const set = (k,v) => onChange({ ...project, [k]:v });
  return (
    <div>
      <div className="qa-disp" style={{fontWeight:700,fontSize:15,marginBottom:14}}>Project Details</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Field label="Project Name"><input className="qa-input" value={project.name} onChange={e=>set("name",e.target.value)} /></Field>
        <Field label="Project Type">
          <select className="qa-select" value={project.type} onChange={e=>set("type",e.target.value)}>
            {PROJECT_TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Project Location"><input className="qa-input" value={project.location} onChange={e=>set("location",e.target.value)} /></Field>
        <Field label="Completion Period"><input className="qa-input" placeholder="e.g. 8 weeks" value={project.completion} onChange={e=>set("completion",e.target.value)} /></Field>
        <Field label="Quotation Date"><input type="date" className="qa-input" value={project.date} onChange={e=>set("date",e.target.value)} /></Field>
        <Field label="Valid Until"><input type="date" className="qa-input" value={project.validUntil} onChange={e=>set("validUntil",e.target.value)} /></Field>
      </div>
      <Field label="Description / Scope"><textarea className="qa-textarea" rows={3} value={project.description} onChange={e=>set("description",e.target.value)} /></Field>
    </div>
  );
}

/* --------- Items step (core) --------- */
function StepItems({ draft, setDraft, rateLibrary, setRateLibrary, canSeeCost }){
  const items = draft.items;
  const currency = draft.currency;
  const setItems = (next) => setDraft(d=>({ ...d, items: next }));
  const updateItem = (id, patch) => setItems(items.map(it=>it.id===id?{...it,...patch}:it));
  const addItem = () => setItems([...items, emptyItem()]);
  const removeItem = (id) => setItems(items.filter(it=>it.id!==id));
  const duplicateItem = (id) => {
    const it = items.find(i=>i.id===id);
    const idx = items.findIndex(i=>i.id===id);
    const copy = { ...it, id: uid() };
    const next = [...items]; next.splice(idx+1,0,copy); setItems(next);
  };

  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiNote, setAiNote] = useState("");

  const runAI = async () => {
    if(!aiPrompt.trim()) return;
    setAiLoading(true); setAiError(""); setAiNote("");
    try{
      const libHint = rateLibrary.length
        ? `Known company rates (unit, rate in ${currency}) you may reuse when the description matches: ${rateLibrary.slice(0,25).map(r=>`${r.item}: ${r.unit} @ ${r.sellingRate||r.cost}`).join("; ")}.`
        : "No saved company rate library yet — estimate reasonable market rates.";
      const prompt = `You are a construction/engineering estimator helping build a Bill of Quantities (BOQ) for a quotation.
Project type context: ${draft.project.type}. ${libHint}
Task from the user: "${aiPrompt.trim()}"

Return ONLY a raw JSON array (no markdown fences, no prose) of BOQ line items, each object with exactly these keys:
"item" (short name), "description" (spec, 1 sentence), "unit" (e.g. m², m, nr, lm, ls, kg), "quantity" (number, best estimate or 1 if truly unknown), "rate" (number in ${currency}), "estimated" (boolean, true if the rate/quantity is your estimate rather than something the user specified).
List missing-information notes as items with unit "note" and rate 0 if something important is unclear.
Keep the list focused (max 12 items). Do not invent unrealistic prices — if unsure, mark estimated:true.`;
      const text = await callClaude(prompt);
      const cleaned = text.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(cleaned);
      const newItems = parsed.filter(p=>p.unit!=="note").map(p=>({
        id: uid(), item: p.item||"Item", description: p.description||"", unit: p.unit||"unit",
        quantity: Number(p.quantity)||1, rate: Number(p.rate)||0, advanced:false, cost:0, mode:"markup", markup:20, margin:20,
        estimated: !!p.estimated,
      }));
      const notes = parsed.filter(p=>p.unit==="note").map(p=>p.description).join(" ");
      if(newItems.length){
        const base = items.length===1 && !items[0].item ? [] : items;
        setItems([...base, ...newItems]);
      }
      setAiNote(notes ? `Note: ${notes}` : "Items added — rates marked as estimates should be checked against your actual costs before sending.");
      setAiPrompt("");
    }catch(e){
      setAiError("Couldn't reach the AI assistant or parse its response. Try rephrasing, or add items manually below.");
    }finally{
      setAiLoading(false);
    }
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div className="qa-disp" style={{fontWeight:700,fontSize:15}}>Add Items</div>
        <button className="qa-btn qa-btn-ghost" onClick={()=>setAiOpen(o=>!o)}><Sparkles size={14}/> AI Quotation Assistant</button>
      </div>

      {aiOpen && (
        <div style={{background:"var(--paper-2)",border:"1px solid var(--line)",borderRadius:4,padding:14,marginBottom:16}}>
          <div style={{fontSize:12,color:"var(--steel)",marginBottom:8}}>Describe the scope of work — the assistant suggests BOQ line items using your rate library where it matches. Estimated prices are always labeled.</div>
          <div style={{display:"flex",gap:8}}>
            <input className="qa-input" placeholder="e.g. 2,000 sq ft office fit-out: partitions, ceiling, flooring, painting, lighting"
              value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} onKeyDown={e=>e.key==="Enter" && runAI()} />
            <button className="qa-btn qa-btn-dark" onClick={runAI} disabled={aiLoading}>{aiLoading?"Thinking…":"Suggest items"}</button>
          </div>
          {aiError && <div style={{color:"var(--red)",fontSize:12,marginTop:8}}>{aiError}</div>}
          {aiNote && !aiError && <div style={{color:"var(--steel)",fontSize:12,marginTop:8}}>{aiNote}</div>}
        </div>
      )}

      <div style={{overflowX:"auto"}}>
        <table className="qa-table">
          <thead>
            <tr>
              <th style={{width:"18%"}}>Item</th>
              <th style={{width:"26%"}}>Description</th>
              <th>Unit</th><th>Qty</th><th>Rate</th>
              {canSeeCost && <th>Costing</th>}
              <th style={{textAlign:"right"}}>Amount</th><th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(it=>{
              const rate = computeRate(it);
              return (
                <tr key={it.id}>
                  <td>
                    <input className="qa-input" style={{fontSize:12.5}} value={it.item} onChange={e=>updateItem(it.id,{item:e.target.value})} />
                    {it.estimated && <div style={{fontSize:10,color:"var(--orange)",marginTop:3}}>estimated</div>}
                  </td>
                  <td><input className="qa-input" style={{fontSize:12.5}} value={it.description} onChange={e=>updateItem(it.id,{description:e.target.value})} /></td>
                  <td><input className="qa-input" style={{fontSize:12.5,width:64}} value={it.unit} onChange={e=>updateItem(it.id,{unit:e.target.value})} /></td>
                  <td><input type="number" className="qa-input" style={{fontSize:12.5,width:70}} value={it.quantity} onChange={e=>updateItem(it.id,{quantity:e.target.value})} /></td>
                  <td>
                    {it.advanced ? (
                      <div className="qa-mono" style={{fontSize:12.5,fontWeight:600,padding:"9px 2px"}}>{rate.toFixed(2)}</div>
                    ) : (
                      <input type="number" className="qa-input" style={{fontSize:12.5,width:90}} value={it.rate} onChange={e=>updateItem(it.id,{rate:e.target.value})} />
                    )}
                  </td>
                  {canSeeCost && (
                    <td>
                      <button className="qa-btn qa-btn-ghost" style={{padding:"5px 9px",fontSize:11}} onClick={()=>updateItem(it.id,{advanced:!it.advanced})}>
                        <Calculator size={12}/> {it.advanced?"On":"Off"}
                      </button>
                      {it.advanced && (
                        <div style={{marginTop:6,display:"flex",flexDirection:"column",gap:4,minWidth:150}}>
                          <MiniField label="Cost/unit"><input type="number" className="qa-input" style={{fontSize:11.5,padding:"5px 7px"}} value={it.cost} onChange={e=>updateItem(it.id,{cost:e.target.value})} /></MiniField>
                          <div style={{display:"flex",gap:4}}>
                            <button className={`qa-btn ${it.mode==="markup"?"qa-btn-dark":"qa-btn-ghost"}`} style={{fontSize:10.5,padding:"4px 7px"}} onClick={()=>updateItem(it.id,{mode:"markup"})}>Markup%</button>
                            <button className={`qa-btn ${it.mode==="margin"?"qa-btn-dark":"qa-btn-ghost"}`} style={{fontSize:10.5,padding:"4px 7px"}} onClick={()=>updateItem(it.id,{mode:"margin"})}>Margin%</button>
                          </div>
                          {it.mode==="markup" ? (
                            <MiniField label="Markup %"><input type="number" className="qa-input" style={{fontSize:11.5,padding:"5px 7px"}} value={it.markup} onChange={e=>updateItem(it.id,{markup:e.target.value})} /></MiniField>
                          ) : (
                            <MiniField label="Margin %"><input type="number" className="qa-input" style={{fontSize:11.5,padding:"5px 7px"}} value={it.margin} onChange={e=>updateItem(it.id,{margin:e.target.value})} /></MiniField>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                  <td className="qa-mono" style={{textAlign:"right",fontWeight:600}}>{fmtMoney(itemAmount(it), currency)}</td>
                  <td>
                    <div style={{display:"flex",gap:4}}>
                      <IconBtn onClick={()=>duplicateItem(it.id)}><Copy size={13}/></IconBtn>
                      <IconBtn onClick={()=>removeItem(it.id)} danger><Trash2 size={13}/></IconBtn>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button className="qa-btn qa-btn-dark" style={{marginTop:12}} onClick={addItem}><Plus size={14}/> Add Item</button>

      {canSeeCost && rateLibrary.length>0 && (
        <div style={{marginTop:16,fontSize:12,color:"var(--steel)"}}>
          Tip: open <b>Rate Library</b> from the sidebar to search saved material/labour rates and copy them into items above.
        </div>
      )}
    </div>
  );
}
function MiniField({ label, children }){
  return <div><div style={{fontSize:9.5,color:"var(--steel)",textTransform:"uppercase",fontWeight:700,marginBottom:2}}>{label}</div>{children}</div>;
}
function IconBtn({ children, onClick, danger }){
  return <button onClick={onClick} style={{border:"1px solid var(--line)",background:"#fff",borderRadius:3,padding:5,cursor:"pointer",color:danger?"var(--red)":"var(--steel)",display:"flex"}}>{children}</button>;
}

function StepReview({ draft, onChange, canSeeCost }){
  const t = quoteTotal(draft);
  const currency = draft.currency;
  return (
    <div>
      <div className="qa-disp" style={{fontWeight:700,fontSize:15,marginBottom:14}}>Review</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
        <Field label="Discount">
          <div style={{display:"flex",gap:6}}>
            <input type="number" className="qa-input" value={draft.discount} onChange={e=>onChange({discount:e.target.value})} />
            <select className="qa-select" style={{width:110}} value={draft.discountType} onChange={e=>onChange({discountType:e.target.value})}>
              <option value="amount">{currency}</option>
              <option value="percent">%</option>
            </select>
          </div>
        </Field>
        <Field label="VAT / Tax %"><input type="number" className="qa-input" value={draft.vat} onChange={e=>onChange({vat:e.target.value})} /></Field>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
        <div className="qa-card" style={{background:"var(--paper-2)"}}>
          <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",color:"var(--steel)",marginBottom:10}}>Client-facing summary</div>
          <SummaryRow label="Subtotal" value={fmtMoney(t.subtotal,currency)} />
          <SummaryRow label="Discount" value={`- ${fmtMoney(t.discountAmt,currency)}`} />
          <SummaryRow label={`VAT/Tax (${draft.vat}%)`} value={fmtMoney(t.vatAmt,currency)} />
          <SummaryRow label="Grand Total" value={fmtMoney(t.grandTotal,currency)} bold big />
        </div>
        {canSeeCost && (
          <div className="qa-card" style={{background:"#0B1E33",color:"#fff"}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",color:"var(--steel-2)",marginBottom:10}}>Internal costing — not shown to client</div>
            <SummaryRow label="Total Cost" value={fmtMoney(t.totalCost,currency)} dark />
            <SummaryRow label="Profit Amount" value={fmtMoney(t.profit,currency)} dark />
            <SummaryRow label="Profit Margin" value={`${t.profitMargin.toFixed(1)}%`} bold big dark />
          </div>
        )}
      </div>
    </div>
  );
}
function SummaryRow({ label, value, bold, big, dark }){
  return (
    <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom: bold?"none":`1px solid ${dark?"rgba(255,255,255,.12)":"var(--line)"}`}}>
      <div style={{fontSize:big?13:12.5,fontWeight:bold?700:500,color:dark && !bold?"var(--steel-2)":undefined}}>{label}</div>
      <div className="qa-mono" style={{fontSize:big?16:12.5,fontWeight:bold?700:600}}>{value}</div>
    </div>
  );
}

function StepGenerate({ draft, onSave, onFinish, canSeeCost }){
  const [sent, setSent] = useState(false);
  return (
    <div>
      <div className="qa-disp" style={{fontWeight:700,fontSize:15,marginBottom:6}}>Preview &amp; Generate</div>
      <div style={{fontSize:12.5,color:"var(--steel)",marginBottom:16}}>This is exactly what your client will see.</div>
      <QuotationPreview quotation={draft} canSeeCost={false} />
      <div style={{display:"flex",gap:10,marginTop:20,flexWrap:"wrap"}}>
        <button className="qa-btn qa-btn-dark" onClick={()=>downloadQuotationHTML(draft)}><Download size={14}/> Download Quotation</button>
        <button className="qa-btn qa-btn-ghost" onClick={()=>onSave("Draft")}><Save size={14}/> Save Draft</button>
        <button className="qa-btn qa-btn-primary" onClick={async()=>{ await onSave("Sent"); setSent(true); }}>
          <Send size={14}/> {sent?"Sent":"Send to Client"}
        </button>
      </div>
      {sent && <div style={{fontSize:12,color:"var(--green)",marginTop:8}}>Marked as sent. A shareable client link and email delivery need a connected backend/email service.</div>}
      <div style={{fontSize:11,color:"var(--steel)",marginTop:8}}>Downloads a print-ready file — open it and choose Print → Save as PDF to get a PDF.</div>
    </div>
  );
}

/* ---------------- Quotation preview (the "blueprint sheet") ---------------- */
function QuotationPreview({ quotation, canSeeCost }){
  if(!quotation) return <EmptyState text="Quotation not found." />;
  const q = quotation;
  const t = quoteTotal(q);
  const currency = q.currency;
  const c = STATUS_COLOR[q.status]||STATUS_COLOR.Draft;
  return (
    <div className="qa-sheet" style={{padding:"26px 30px 20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
          {q.company?.logo && (
            <img src={q.company.logo} alt="Logo" style={{width:48,height:48,objectFit:"contain",flexShrink:0}} />
          )}
          <div>
          <div className="qa-disp" style={{fontSize:19,fontWeight:700}}>{q.company?.name || "Your Company"}</div>
          <div style={{fontSize:11,color:"var(--steel)",lineHeight:1.6,marginTop:3,maxWidth:260}}>
            {q.company?.address}{q.company?.address?<br/>:null}
            {q.company?.phone} {q.company?.phone && q.company?.email ? "·" : ""} {q.company?.email}<br/>
            {q.company?.website}{q.company?.vat ? ` · VAT ${q.company.vat}` : ""}
          </div>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div className="qa-disp" style={{fontSize:16,fontWeight:700,color:"var(--blue)"}}>QUOTATION</div>
          <span className="qa-badge" style={{background:c.bg,color:c.fg,marginTop:4,display:"inline-block"}}>{q.status}</span>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginTop:22,paddingTop:16,borderTop:"1px solid var(--line)"}}>
        <div>
          <div className="qa-tb-label">Prepared for</div>
          <div style={{fontWeight:700,fontSize:13.5,marginTop:2}}>{q.client?.name || "—"}</div>
          <div style={{fontSize:11.5,color:"var(--steel)",lineHeight:1.6}}>
            {q.client?.company}{q.client?.company?<br/>:null}
            {q.client?.address}<br/>{q.client?.phone} {q.client?.email}
          </div>
        </div>
        <div>
          <div className="qa-tb-label">Project</div>
          <div style={{fontWeight:700,fontSize:13.5,marginTop:2}}>{q.project?.name || "—"}</div>
          <div style={{fontSize:11.5,color:"var(--steel)",lineHeight:1.6}}>
            {q.project?.type} · {q.project?.location}<br/>
            {q.project?.description}
          </div>
        </div>
      </div>

      {q.project?.description && (
        <div style={{marginTop:16}}>
          <div className="qa-tb-label" style={{marginBottom:4}}>Scope of Work</div>
          <div style={{fontSize:12.5,lineHeight:1.6}}>{q.project.description}</div>
        </div>
      )}

      <table className="qa-table" style={{marginTop:18}}>
        <thead><tr><th>Item</th><th>Description</th><th>Unit</th><th>Qty</th><th>Rate</th><th style={{textAlign:"right"}}>Amount</th></tr></thead>
        <tbody>
          {(q.items||[]).map(it=>(
            <tr key={it.id}>
              <td style={{fontWeight:600}}>{it.item}</td>
              <td style={{color:"var(--steel)"}}>{it.description}</td>
              <td>{it.unit}</td>
              <td className="qa-mono">{it.quantity}</td>
              <td className="qa-mono">{fmtMoney(computeRate(it),currency)}</td>
              <td className="qa-mono" style={{textAlign:"right",fontWeight:600}}>{fmtMoney(itemAmount(it),currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{display:"flex",justifyContent:"flex-end",marginTop:10}}>
        <div style={{width:260}}>
          <SummaryRow label="Subtotal" value={fmtMoney(t.subtotal,currency)} />
          <SummaryRow label="Discount" value={`- ${fmtMoney(t.discountAmt,currency)}`} />
          <SummaryRow label={`VAT/Tax (${q.vat}%)`} value={fmtMoney(t.vatAmt,currency)} />
          <SummaryRow label="Grand Total" value={fmtMoney(t.grandTotal,currency)} bold big />
        </div>
      </div>

      <div style={{marginTop:18,fontSize:11,color:"var(--steel)",lineHeight:1.7}}>
        <b style={{color:"var(--ink)"}}>Terms:</b> {q.company?.paymentTerms}. {q.company?.warranty}. Quotation valid for {q.company?.validity}.
      </div>

      <div className="qa-titleblock">
        <div><div className="qa-tb-label">Quotation No.</div><div className="qa-tb-value">{q.number}</div></div>
        <div><div className="qa-tb-label">Date</div><div className="qa-tb-value">{q.project?.date}</div></div>
        <div><div className="qa-tb-label">Valid Until</div><div className="qa-tb-value">{q.project?.validUntil||"—"}</div></div>
        <div><div className="qa-tb-label">Completion</div><div className="qa-tb-value">{q.project?.completion||"—"}</div></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginTop:26,paddingTop:16,borderTop:"1px dashed var(--line)"}}>
        <div><div className="qa-tb-label">Client Signature</div><div style={{borderBottom:"1px solid var(--line)",height:34}}></div></div>
        <div><div className="qa-tb-label">Date</div><div style={{borderBottom:"1px solid var(--line)",height:34}}></div></div>
      </div>
    </div>
  );
}

/* ---------------- Quotations list ---------------- */
function QuotationsList({ quotations, currency, clients, onEdit, onDuplicate, onRevise, onDelete, onView, onStatusChange }){
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [confirmId, setConfirmId] = useState(null);
  const filtered = quotations.filter(q=>{
    const s = search.toLowerCase();
    const matchesSearch = !s || q.number.toLowerCase().includes(s) || (q.client?.name||"").toLowerCase().includes(s) || (q.project?.name||"").toLowerCase().includes(s);
    const matchesStatus = statusFilter==="All" || q.status===statusFilter;
    return matchesSearch && matchesStatus;
  });
  return (
    <div>
      <div className="qa-disp" style={{fontSize:21,fontWeight:700,marginBottom:16}}>Quotations</div>
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <div style={{position:"relative",flex:1,maxWidth:340}}>
          <Search size={14} style={{position:"absolute",left:10,top:11,color:"var(--steel)"}}/>
          <input className="qa-input" style={{paddingLeft:32}} placeholder="Search number, client, project…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <select className="qa-select" style={{width:170}} value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
          <option>All</option>
          {STATUS_FLOW.map(s=><option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="qa-card">
        {filtered.length===0 ? <EmptyState text="No quotations match." /> : (
          <table className="qa-table">
            <thead><tr><th>Number</th><th>Client</th><th>Project</th><th>Date</th><th>Status</th><th style={{textAlign:"right"}}>Total</th><th></th></tr></thead>
            <tbody>
              {filtered.map(q=>{
                const t = quoteTotal(q); const c = STATUS_COLOR[q.status]||STATUS_COLOR.Draft;
                return (
                  <tr key={q.id}>
                    <td className="qa-mono" style={{cursor:"pointer"}} onClick={()=>onView(q)}>{q.number}</td>
                    <td>{q.client?.name||"—"}</td>
                    <td>{q.project?.name||"—"}</td>
                    <td className="qa-mono" style={{fontSize:11.5}}>{q.project?.date}</td>
                    <td>
                      <select className="qa-select" style={{fontSize:11,padding:"4px 6px", background:c.bg, color:c.fg, border:"none",fontWeight:700}}
                        value={q.status} onChange={e=>onStatusChange(q.id,e.target.value)}>
                        {STATUS_FLOW.map(s=><option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="qa-mono" style={{textAlign:"right"}}>{fmtMoney(t.grandTotal, q.currency||currency)}</td>
                    <td>
                      {confirmId===q.id ? (
                        <div style={{display:"flex",gap:4,alignItems:"center"}}>
                          <span style={{fontSize:11,color:"var(--red)",marginRight:2}}>Delete?</span>
                          <button className="qa-btn" style={{fontSize:11,padding:"5px 8px",background:"var(--red)",color:"#fff"}}
                            onClick={()=>{ onDelete(q.id); setConfirmId(null); }}>Confirm</button>
                          <button className="qa-btn qa-btn-ghost" style={{fontSize:11,padding:"5px 8px"}} onClick={()=>setConfirmId(null)}>Cancel</button>
                        </div>
                      ) : (
                        <div style={{display:"flex",gap:4}}>
                          <button className="qa-btn qa-btn-ghost" style={{fontSize:11,padding:"5px 8px"}} onClick={()=>onEdit(q)}>Edit</button>
                          <IconBtn onClick={()=>onDuplicate(q)}><Copy size={13}/></IconBtn>
                          <button className="qa-btn qa-btn-ghost" style={{fontSize:11,padding:"5px 8px"}} onClick={()=>onRevise(q)}>Revise</button>
                          <IconBtn onClick={()=>setConfirmId(q.id)} danger><Trash2 size={13}/></IconBtn>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ---------------- Clients ---------------- */
function ClientsView({ clients, setClients, quotations, currency }){
  const [editing, setEditing] = useState(null);
  const save = async () => {
    const exists = clients.some(c=>c.id===editing.id);
    await setClients(exists ? clients.map(c=>c.id===editing.id?editing:c) : [...clients, editing]);
    setEditing(null);
  };
  const clientStats = (id) => {
    const qs = quotations.filter(q=>q.client?.id===id);
    const total = qs.reduce((s,q)=>s+quoteTotal(q).grandTotal,0);
    const approved = qs.filter(q=>q.status==="Approved").length;
    return { count: qs.length, total, approved };
  };
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div className="qa-disp" style={{fontSize:21,fontWeight:700}}>Clients</div>
        <button className="qa-btn qa-btn-primary" onClick={()=>setEditing({...emptyClient, id:uid()})}><Plus size={14}/> Add Client</button>
      </div>

      {editing && (
        <div className="qa-card" style={{marginBottom:16}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Field label="Name"><input className="qa-input" value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} /></Field>
            <Field label="Company"><input className="qa-input" value={editing.company} onChange={e=>setEditing({...editing,company:e.target.value})} /></Field>
            <Field label="Phone"><input className="qa-input" value={editing.phone} onChange={e=>setEditing({...editing,phone:e.target.value})} /></Field>
            <Field label="Email"><input className="qa-input" value={editing.email} onChange={e=>setEditing({...editing,email:e.target.value})} /></Field>
          </div>
          <Field label="Address"><input className="qa-input" value={editing.address} onChange={e=>setEditing({...editing,address:e.target.value})} /></Field>
          <div style={{display:"flex",gap:8}}>
            <button className="qa-btn qa-btn-dark" onClick={save}><Check size={14}/> Save</button>
            <button className="qa-btn qa-btn-ghost" onClick={()=>setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="qa-card">
        {clients.length===0 ? <EmptyState text="No clients yet." /> : (
          <table className="qa-table">
            <thead><tr><th>Name</th><th>Company</th><th>Contact</th><th>Quotations</th><th>Approved</th><th style={{textAlign:"right"}}>Total Value</th><th></th></tr></thead>
            <tbody>
              {clients.map(c=>{ const s = clientStats(c.id); return (
                <tr key={c.id}>
                  <td style={{fontWeight:600}}>{c.name}</td>
                  <td>{c.company}</td>
                  <td style={{fontSize:11.5,color:"var(--steel)"}}>{c.phone} {c.email}</td>
                  <td>{s.count}</td>
                  <td>{s.approved}</td>
                  <td className="qa-mono" style={{textAlign:"right"}}>{fmtMoney(s.total,currency)}</td>
                  <td><button className="qa-btn qa-btn-ghost" style={{fontSize:11,padding:"5px 8px"}} onClick={()=>setEditing(c)}>Edit</button></td>
                </tr>
              );})}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ---------------- Rate Library ---------------- */
function RateLibraryView({ rateLibrary, setRateLibrary, currency }){
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const save = async () => {
    const exists = rateLibrary.some(r=>r.id===editing.id);
    await setRateLibrary(exists ? rateLibrary.map(r=>r.id===editing.id?editing:r) : [...rateLibrary, editing]);
    setEditing(null);
  };
  const remove = async (id) => setRateLibrary(rateLibrary.filter(r=>r.id!==id));
  const filtered = rateLibrary.filter(r=>!search || r.item.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div className="qa-disp" style={{fontSize:21,fontWeight:700}}>Rate Library</div>
        <button className="qa-btn qa-btn-primary" onClick={()=>setEditing({ id:uid(), item:"", description:"", unit:"m²", cost:0, sellingRate:0, supplier:"", category:"Material" })}><Plus size={14}/> Add Rate</button>
      </div>

      {editing && (
        <div className="qa-card" style={{marginBottom:16}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
            <Field label="Item"><input className="qa-input" value={editing.item} onChange={e=>setEditing({...editing,item:e.target.value})} /></Field>
            <Field label="Category">
              <select className="qa-select" value={editing.category} onChange={e=>setEditing({...editing,category:e.target.value})}>
                {["Material","Labour","Equipment","Service","Supplier"].map(c=><option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Unit"><input className="qa-input" value={editing.unit} onChange={e=>setEditing({...editing,unit:e.target.value})} /></Field>
            <Field label="Cost"><input type="number" className="qa-input" value={editing.cost} onChange={e=>setEditing({...editing,cost:e.target.value})} /></Field>
            <Field label="Selling Rate"><input type="number" className="qa-input" value={editing.sellingRate} onChange={e=>setEditing({...editing,sellingRate:e.target.value})} /></Field>
            <Field label="Supplier"><input className="qa-input" value={editing.supplier} onChange={e=>setEditing({...editing,supplier:e.target.value})} /></Field>
          </div>
          <Field label="Description"><input className="qa-input" value={editing.description} onChange={e=>setEditing({...editing,description:e.target.value})} /></Field>
          <div style={{display:"flex",gap:8}}>
            <button className="qa-btn qa-btn-dark" onClick={save}><Check size={14}/> Save</button>
            <button className="qa-btn qa-btn-ghost" onClick={()=>setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{position:"relative",maxWidth:320,marginBottom:12}}>
        <Search size={14} style={{position:"absolute",left:10,top:11,color:"var(--steel)"}}/>
        <input className="qa-input" style={{paddingLeft:32}} placeholder="Search rates…" value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      <div className="qa-card">
        {filtered.length===0 ? <EmptyState text="No rates saved yet." /> : (
          <table className="qa-table">
            <thead><tr><th>Item</th><th>Category</th><th>Unit</th><th>Cost</th><th>Selling Rate</th><th>Supplier</th><th></th></tr></thead>
            <tbody>
              {filtered.map(r=>(
                <tr key={r.id}>
                  <td style={{fontWeight:600}}>{r.item}</td>
                  <td>{r.category}</td>
                  <td>{r.unit}</td>
                  <td className="qa-mono">{fmtMoney(Number(r.cost)||0,currency)}</td>
                  <td className="qa-mono">{fmtMoney(Number(r.sellingRate)||0,currency)}</td>
                  <td>{r.supplier}</td>
                  <td>
                    <div style={{display:"flex",gap:4}}>
                      <button className="qa-btn qa-btn-ghost" style={{fontSize:11,padding:"5px 8px"}} onClick={()=>setEditing(r)}>Edit</button>
                      <IconBtn onClick={()=>remove(r.id)} danger><Trash2 size={13}/></IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ---------------- Reports ---------------- */
function ReportsView({ quotations, currency, canSeeCost }){
  const stats = useMemo(()=>{
    const total = quotations.length;
    const approved = quotations.filter(q=>q.status==="Approved");
    const rejected = quotations.filter(q=>q.status==="Rejected").length;
    const totalValue = quotations.reduce((s,q)=>s+quoteTotal(q).grandTotal,0);
    const approvedValue = approved.reduce((s,q)=>s+quoteTotal(q).grandTotal,0);
    const profit = quotations.reduce((s,q)=>s+quoteTotal(q).profit,0);
    const conversion = total>0 ? (approved.length/total*100) : 0;
    const margin = totalValue>0 ? (profit/totalValue*100) : 0;
    return { total, approvedCount:approved.length, rejected, totalValue, approvedValue, profit, conversion, margin };
  },[quotations]);

  return (
    <div>
      <div className="qa-disp" style={{fontSize:21,fontWeight:700,marginBottom:16}}>Reports</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:12}}>
        <Stat label="Total Quotations" value={stats.total} />
        <Stat label="Approved" value={stats.approvedCount} />
        <Stat label="Rejected" value={stats.rejected} />
        <Stat label="Conversion Rate" value={`${stats.conversion.toFixed(1)}%`} />
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:24}}>
        <Stat label="Total Quoted Value" value={fmtMoney(stats.totalValue,currency)} mono wide />
        <Stat label="Approved Value" value={fmtMoney(stats.approvedValue,currency)} mono wide />
        {canSeeCost && <Stat label="Profit / Margin" value={`${fmtMoney(stats.profit,currency)} · ${stats.margin.toFixed(1)}%`} mono wide />}
      </div>

      <div className="qa-card">
        <div className="qa-disp" style={{fontWeight:700,fontSize:14,marginBottom:12}}>By Status</div>
        {STATUS_FLOW.map(s=>{
          const n = quotations.filter(q=>q.status===s).length;
          const pct = stats.total>0 ? (n/stats.total*100) : 0;
          return (
            <div key={s} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <div style={{width:100,fontSize:11.5,color:"var(--steel)"}}>{s}</div>
              <div style={{flex:1,height:8,background:"var(--paper-2)",borderRadius:2,overflow:"hidden"}}>
                <div style={{width:`${pct}%`,height:"100%",background:"var(--blue)"}}></div>
              </div>
              <div className="qa-mono" style={{width:30,fontSize:11.5,textAlign:"right"}}>{n}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Settings ---------------- */
function SettingsView({ company, setCompany, user }){
  const [local, setLocal] = useState(company);
  useEffect(()=>setLocal(company),[company]);
  const set = (k,v) => setLocal({ ...local, [k]:v });
  return (
    <div>
      <div className="qa-disp" style={{fontSize:21,fontWeight:700,marginBottom:16}}>Settings</div>
      <div className="qa-card" style={{maxWidth:640}}>
        <div className="qa-disp" style={{fontWeight:700,fontSize:14,marginBottom:14}}>Company Profile</div>
        <LogoField logo={local.logo} onChange={dataUrl=>set("logo",dataUrl)} />
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14, marginTop:14}}>
          <Field label="Company Name"><input className="qa-input" value={local.name} onChange={e=>set("name",e.target.value)} /></Field>
          <Field label="VAT / Tax Number"><input className="qa-input" value={local.vat} onChange={e=>set("vat",e.target.value)} /></Field>
          <Field label="Phone"><input className="qa-input" value={local.phone} onChange={e=>set("phone",e.target.value)} /></Field>
          <Field label="Email"><input className="qa-input" value={local.email} onChange={e=>set("email",e.target.value)} /></Field>
          <Field label="Website"><input className="qa-input" value={local.website} onChange={e=>set("website",e.target.value)} /></Field>
          <Field label="Default Currency">
            <select className="qa-select" value={local.currency} onChange={e=>set("currency",e.target.value)}>{CURRENCIES.map(c=><option key={c}>{c}</option>)}</select>
          </Field>
          <Field label="Default VAT %"><input type="number" className="qa-input" value={local.defaultVat} onChange={e=>set("defaultVat",e.target.value)} /></Field>
          <Field label="Validity"><input className="qa-input" value={local.validity} onChange={e=>set("validity",e.target.value)} /></Field>
        </div>
        <Field label="Address"><textarea className="qa-textarea" rows={2} value={local.address} onChange={e=>set("address",e.target.value)} /></Field>
        <Field label="Payment Terms"><textarea className="qa-textarea" rows={2} value={local.paymentTerms} onChange={e=>set("paymentTerms",e.target.value)} /></Field>
        <Field label="Warranty"><textarea className="qa-textarea" rows={2} value={local.warranty} onChange={e=>set("warranty",e.target.value)} /></Field>
        <button className="qa-btn qa-btn-primary" onClick={()=>setCompany(local)}><Save size={14}/> Save Changes</button>
      </div>

      <div className="qa-card" style={{maxWidth:640,marginTop:16}}>
        <div className="qa-disp" style={{fontWeight:700,fontSize:14,marginBottom:8}}>Signed in as</div>
        <div style={{fontSize:13}}>{user.name} · {user.role}</div>
        <div style={{fontSize:11.5,color:"var(--steel)"}}>{user.email}</div>
        <div style={{fontSize:11.5,color:"var(--steel)",marginTop:6}}>
          Cost and profit figures are visible to Admin, Estimator and Accountant roles; Sales, Project Manager and Viewer see client-facing totals only.
        </div>
      </div>
    </div>
  );
}

/* ---------------- shared field ---------------- */
function Field({ label, children }){
  return <div className="qa-field"><label className="qa-label">{label}</label>{children}</div>;
}
