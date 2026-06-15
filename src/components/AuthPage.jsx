import React, { useState } from "react";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Database, 
  LogIn,
  RefreshCw,
  Globe,
  ExternalLink
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { auth, googleProvider, signInWithPopup } from "../lib/firebase";
import { PurplexityLogo } from "./PurplexityLogo";

export function AuthPage({ onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState(null);
  const [successText, setSuccessText] = useState(null);
  const [dbConfigured, setDbConfigured] = useState(null);
  const [checkingDb, setCheckingDb] = useState(false);
  const [googleConfigError, setGoogleConfigError] = useState(false);
  const [googleDomainError, setGoogleDomainError] = useState(false);

  const checkDbStatus = async () => {
    setCheckingDb(true);
    try {
      const res = await fetch("/api/auth/config-status");
      if (res.ok) {
        const data = await res.json();
        setDbConfigured(!!data.isDatabaseConfigured);
      } else {
        setDbConfigured(false);
      }
    } catch (e) {
      setDbConfigured(false);
    } finally {
      setCheckingDb(false);
    }
  };

  React.useEffect(() => {
    checkDbStatus();
  }, []);

  // Native credentials submission
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorText(null);
    setSuccessText(null);

    const endpoint = activeTab === "signup" ? "/api/auth/signup" : "/api/auth/login";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed. Please verify your credentials.");
      }

      if (activeTab === "signup") {
        setSuccessText("Account registered successfully! Logging you in...");
        setTimeout(() => {
          onAuthSuccess(data.user, { access_token: data.token });
        }, 1200);
      } else {
        onAuthSuccess(data.user, { access_token: data.token });
      }
    } catch (err) {
      setErrorText(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth utilizing Client SDK Firebase
  const handleGoogleAuth = async () => {
    setErrorText(null);
    setSuccessText(null);
    setGoogleConfigError(false);
    setGoogleDomainError(false);
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Get the ID Token to secure communication with our backend
      const idToken = await user.getIdToken();

      const response = await fetch("/api/auth/firebase-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication with Google failed.");
      }

      setSuccessText("Successfully authenticated with Google! Logging in...");
      setTimeout(() => {
        onAuthSuccess(data.user, { access_token: data.token });
      }, 1000);
    } catch (err) {
      console.error("Google Auth Error:", err);
      // Friendly, clean error messaging
      const errMsg = err.message || "";
      if (errMsg.includes("auth/configuration-not-found") || errMsg.includes("configuration-not-found")) {
        setGoogleConfigError(true);
        setErrorText("Google provider has not been configured/enabled in your Firebase Console yet.");
      } else if (errMsg.includes("auth/unauthorized-domain") || errMsg.includes("unauthorized-domain")) {
        setGoogleDomainError(true);
        setErrorText("This workspace domain is not yet authorized in your Firebase Project.");
      } else {
        setErrorText(errMsg || "Failed to sign in with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05040a] flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans text-white select-none">
      {/* Decorative ambiance glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-900/10 blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-900/10 blur-[130px] pointer-events-none"></div>

      {/* Main Container Wrapper */}
      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        
        {/* Brand identity */}
        <div className="flex flex-col items-center mb-6">
          <PurplexityLogo size={44} className="mb-3 filter drop-shadow-[0_4px_12px_rgba(124,58,237,0.3)]" />
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Purplexity AI
          </h1>
        </div>

        {/* Real Interactive Credentials Card */}
        <div className="w-full rounded-2xl bg-[#0d0c15] border border-white/5 shadow-2xl overflow-hidden p-6 relative">
          
          {/* Tabs switch */}
          <div className="flex border-b border-white/5 pb-4 mb-5">
            <button
              onClick={() => {
                setActiveTab("login");
                setErrorText(null);
              }}
              className={`flex-1 pb-2 text-xs font-semibold cursor-pointer border-b-2 transition-all mr-2 ${activeTab === "login" ? "text-purple-400 border-purple-500 font-bold" : "text-zinc-500 border-transparent hover:text-zinc-300"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab("signup");
                setErrorText(null);
              }}
              className={`flex-1 pb-2 text-xs font-semibold cursor-pointer border-b-2 transition-all ml-2 ${activeTab === "signup" ? "text-purple-400 border-purple-500 font-bold" : "text-zinc-500 border-transparent hover:text-zinc-300"}`}
            >
              Create Account
            </button>
          </div>

          {/* Database Configuration Alert */}
          {dbConfigured === false && (
            <div className="mb-5 bg-amber-950/20 border border-amber-500/30 text-amber-300 rounded-xl p-4 text-xs space-y-3">
              <div className="flex gap-2 items-center font-bold text-amber-400">
                <Database className="w-4 h-4 text-amber-400 shrink-0" />
                <span>🔌 DATABASE_URL Config Needed</span>
              </div>
              <p className="text-zinc-300 leading-relaxed">
                Purplexity requires a valid PostgreSQL database link (starting with <code className="text-amber-400 bg-black/30 px-1 py-0.5 rounded font-mono">postgresql://</code> or <code className="text-amber-400 bg-black/30 px-1 py-0.5 rounded font-mono">postgres://</code>) to securely store your searches, session histories, and bookmarks.
              </p>
              <div className="pt-2 border-t border-amber-500/10 space-y-2 text-[11px] text-zinc-400">
                <p><strong>To connect your database:</strong></p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Open the AI Studio editor interface.</li>
                  <li>Click <strong>Settings &gt; Secrets</strong> in the top panel.</li>
                  <li>Add <strong className="text-zinc-200">DATABASE_URL</strong> with your connection string.</li>
                </ol>
              </div>
              <button
                type="button"
                onClick={checkDbStatus}
                disabled={checkingDb}
                className="w-full mt-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[10px] font-mono py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${checkingDb ? "animate-spin" : ""}`} />
                <span>{checkingDb ? "Verifying..." : "Verify Connection"}</span>
              </button>
            </div>
          )}

          {/* Feedback alerts */}
          <AnimatePresence mode="wait">
            {errorText && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 bg-red-900/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl flex items-start gap-2 text-left"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorText}</span>
              </motion.div>
            )}

            {successText && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 bg-emerald-950/25 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-xl flex items-start gap-2 text-left"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successText}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core Credentials Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1 text-left">
              <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 font-mono">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-purple-500/50 transition-all font-sans"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1 text-left">
              <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 font-mono">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-purple-500/50 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-350 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold py-2.5 rounded-xl transition-all transform active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-white" />
                  <span>{activeTab === "login" ? "Sign In with Credentials" : "Create Account"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Custom Sep Line */}
          <div className="flex items-center my-4 select-none text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
            <div className="flex-1 h-px bg-white/5"></div>
            <span className="px-3">or continue with</span>
            <div className="flex-1 h-px bg-white/5"></div>
          </div>

          {/* Google Auth Trigger */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleAuth}
            className="w-full px-4 py-2.5 bg-white/5 hover:bg-white/10 active:scale-98 border border-white/5 hover:border-purple-500/20 rounded-xl text-xs font-semibold text-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Globe className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Continue with Google</span>
          </button>

          {/* Google Configuration Guidance */}
          {googleConfigError && (
            <div className="mt-4 bg-purple-950/20 border border-purple-500/30 text-purple-300 rounded-xl p-4 text-xs space-y-3">
              <div className="flex gap-2 items-center font-bold text-purple-400">
                <Globe className="w-4 h-4 text-purple-450 shrink-0" />
                <span>⚙️ Firebase Setup Help</span>
              </div>
              <p className="text-zinc-350 leading-relaxed text-[11px] text-left">
                Google Sign-In has not been enabled for <code className="text-purple-400 bg-black/40 px-1 py-0.5 rounded font-mono">purplexity-4eef7</code>. Enable it in your console to login:
              </p>
              <div className="pt-2 border-t border-purple-500/10 space-y-2 text-[11px] text-zinc-400 text-left">
                <p><strong>Remediation Steps:</strong></p>
                <ol className="list-decimal pl-4 space-y-1.5 text-zinc-350">
                  <li>Visit your <a href="https://console.firebase.google.com/project/purplexity-4eef7/authentication/providers" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline hover:text-purple-300 inline-flex items-center gap-0.5">Firebase Authentication console <ExternalLink className="w-3.5 h-3.5 inline shrink-0" /></a>.</li>
                  <li>Click <strong>Add new provider</strong> and choose <strong>Google</strong>.</li>
                  <li>Toggle <strong>Enable</strong>, select your support email, and save.</li>
                  <li>Ensure your domain is in the <strong>Authorized Domains</strong> setting tab to prevent redirect errors.</li>
                </ol>
              </div>
            </div>
          )}

          {/* Google Domain Authorization Guidance */}
          {googleDomainError && (
            <div className="mt-4 bg-amber-950/20 border border-amber-550/30 text-amber-300 rounded-xl p-4 text-xs space-y-3">
              <div className="flex gap-2 items-center font-bold text-amber-400">
                <Globe className="w-4 h-4 text-amber-450 shrink-0" />
                <span>🌐 Add Authorized Domain to Firebase</span>
              </div>
              <p className="text-zinc-355 leading-relaxed text-[11px] text-left">
                Firebase limits sign-in traffic to authorized URLs. Please whitelist this preview domain in your project console:
              </p>
              <div className="bg-black/40 rounded p-2 text-[11px] space-y-1 text-left font-mono border border-amber-500/10">
                <div className="text-zinc-400">Domain to add:</div>
                <div className="text-amber-400 select-all font-bold">{window.location.hostname}</div>
              </div>
              <div className="pt-2 border-t border-amber-500/10 space-y-2 text-[11px] text-zinc-400 text-left">
                <p><strong>Remediation Steps:</strong></p>
                <ol className="list-decimal pl-4 space-y-1.5 text-zinc-350">
                  <li>Go to your <a href="https://console.firebase.google.com/project/purplexity-4eef7/authentication/settings" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline hover:text-amber-300 inline-flex items-center gap-0.5">Firebase Auth Settings Tab <ExternalLink className="w-3.5 h-3.5 inline shrink-0" /></a>.</li>
                  <li>Locate the <strong>Authorized Domains</strong> section.</li>
                  <li>Click <strong>Add domain</strong>.</li>
                  <li>Paste <code className="text-amber-405 bg-black/60 px-1 py-0.5 rounded font-mono">{window.location.hostname}</code> and click **Add**.</li>
                  <li>Close this popup and try logging in again!</li>
                </ol>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
