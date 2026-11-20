import { useState, type FormEvent } from "react";
import { ArrowRight, Building2, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Chrome, Download, Smartphone } from "lucide-react";
import { supabase } from "../lib/supabase";

type Mode = "signin" | "signup" | "reset";
export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const sendReset = async () => {
    if (!supabase) { setMessage({ type: "error", text: "Supabase is not configured." }); return; }
    if (!email.trim()) { setMessage({ type: "error", text: "Enter your account email first." }); return; }
    setBusy(true); setMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/` });
    setBusy(false);
    setMessage(error ? { type: "error", text: error.message } : { type: "success", text: "Password reset email sent. Open the link in your email to choose a new password." });
  };

  const googleSignIn = async () => {
    if (!supabase) { setMessage({ type: "error", text: "Supabase is not configured." }); return; }
    setBusy(true); setMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
    if (error) { setMessage({ type: "error", text: error.message }); setBusy(false); }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) { setMessage({ type: "error", text: "Supabase is not configured. Check your .env.local file and restart Vite." }); return; }
    setBusy(true); setMessage(null);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { data: { full_name: fullName.trim() } },
        });
        if (error) throw error;
        if (data.session) setMessage({ type: "success", text: "Account created successfully. Your session is active." });
        else setMessage({ type: "success", text: "Account created. Check your email for the confirmation link, then return here to sign in." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Authentication failed. Please try again." });
    } finally { setBusy(false); }
  };

  return <main className="auth-screen">
    <section className="auth-visual">
      <div className="auth-brand"><div className="brand-mark"><Building2 size={22}/></div><strong>HMS<span>Pro</span></strong></div>
      <div className="auth-visual-copy"><span className="auth-eyebrow">HOSTEL MANAGEMENT, SIMPLIFIED</span><h1>One workspace.<br/><em>Better hostel living.</em></h1><p>Manage residents, rooms, meals and finances with clarity and confidence.</p></div>
      <div className="auth-visual-foot"><ShieldCheck size={16}/> Secure access powered by Supabase</div>
    </section>
    <section className="auth-panel-wrap"><div className="auth-panel">
      <div className="auth-mobile-brand"><div className="brand-mark"><Building2 size={20}/></div><strong>HMS<span>Pro</span></strong></div>
      <div className="auth-heading"><span className="auth-eyebrow">WELCOME TO HMS PRO</span><h2>{mode === "signin" ? "Sign in to your account" : mode === "signup" ? "Create your account" : "Reset your password"}</h2><p>{mode === "signin" ? "Enter your details to access your hostel workspace." : mode === "signup" ? "Get started by creating your personal account." : "We will email you a secure password reset link."}</p></div>
      <div className="auth-tabs"><button className={mode === "signin" ? "selected" : ""} onClick={() => { setMode("signin"); setMessage(null); }}>Sign in</button><button className={mode === "signup" ? "selected" : ""} onClick={() => { setMode("signup"); setMessage(null); }}>Create account</button></div>
      {mode !== "reset" && <button type="button" className="google-button" onClick={googleSignIn} disabled={busy}><Chrome size={17}/> Continue with Google</button>}
      {mode !== "reset" && <div className="auth-divider"><span>or continue with email</span></div>}
      <form className="auth-form" onSubmit={submit}>
        {mode === "signup" && <label>Full name<div className="auth-input"><input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" autoComplete="name" required minLength={2}/></div></label>}
        <label>Email address<div className="auth-input"><Mail size={17}/><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required/></div></label>
        {mode !== "reset" && <label>Password<div className="auth-input"><LockKeyhole size={17}/><input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete={mode === "signin" ? "current-password" : "new-password"} required minLength={8}/><button type="button" className="password-toggle" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(v => !v)}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label>}
        {message && <div className={`auth-message ${message.type}`} role="status">{message.text}</div>}
        <button className="auth-submit" type={mode === "reset" ? "button" : "submit"} onClick={mode === "reset" ? sendReset : undefined} disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}<ArrowRight size={17}/></button>
        {mode === "signin" && <button type="button" className="text-action" onClick={() => { setMode("reset"); setMessage(null); }}>Forgot password?</button>}
        {mode === "reset" && <button type="button" className="text-action" onClick={() => { setMode("signin"); setMessage(null); }}>Back to sign in</button>}
      </form>
      
<div className="app-download-card">
  <Smartphone size={25} />
  <h3>Get HMS Pro on Android</h3>
  <p>Manage your hostel meals and expenses from your phone.</p>
  <a
    href="/downloads/HMS-Pro.apk"
    download="HMS-Pro.apk"
    className="app-download-button"
  >
    <Download size={18} />
    Download Android APK
  </a>
  <small>Android application · APK format</small>
</div>

      <p className="auth-legal">© {new Date().getFullYear()} HMS Pro. All rights reserved by Shahriar Zaman · <a href="https://shahriarzaman.net" target="_blank" rel="noopener noreferrer">shahriarzaman.net</a></p>
    </div></section>
  </main>;
}
