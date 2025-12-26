import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginWithPhone, loginWithEmail, resetPassword } from "@/firebase/auth"; 
import { Shield, Phone, Mail, Hash, ArrowRight, Loader2, Lock, CheckCircle2, X } from "lucide-react"; // Added CheckCircle2, X
import { Button } from "@/components/ui/button";
import { ConfirmationResult } from "firebase/auth";

export default function Login() {
  const [method, setMethod] = useState<"phone" | "email">("phone");
  const [contact, setContact] = useState(""); 
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false); // Modal state
  
  const navigate = useNavigate();

  const handleForgotPassword = async () => {
    if (!contact || !contact.includes("@")) {
      alert("Please enter your email address in the input field first.");
      return;
    }
    try {
      setIsLoading(true);
      await resetPassword(contact);
      setShowResetModal(true); // Show custom modal on success
    } catch (err: any) {
      alert(err.message || "Failed to send reset email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (method === "phone") {
        const result = await loginWithPhone(contact, "recaptcha-container");
        setConfirmationResult(result);
      } else {
        await loginWithEmail(contact, password);
        navigate("/dashboard");
      }
    } catch (err: any) {
      alert(err.message || "Login failed.");
    } finally { setIsLoading(false); }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setIsLoading(true);
    try {
      await confirmationResult.confirm(otp);
      navigate("/dashboard");
    } catch (err) { alert("Invalid OTP."); } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0B1221] relative overflow-hidden p-4">
      {/* --- SUCCESS MODAL OVERLAY --- */}
      {showResetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl" />
            <button onClick={() => setShowResetModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
              <X className="h-6 w-6" />
            </button>
            <div className="text-center space-y-6 relative z-10">
              <div className="bg-blue-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto ring-1 ring-blue-500/20">
                <CheckCircle2 className="text-blue-500 h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-bold text-white">Email Sent</h4>
                <p className="text-slate-400 leading-relaxed">A reset link has been sent to <br /><span className="text-blue-400 font-medium">{contact}</span></p>
              </div>
              <Button onClick={() => setShowResetModal(false)} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-bold shadow-lg shadow-blue-900/40">
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      <div id="recaptcha-container"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />

      <div className="w-full max-w-[1000px] grid md:grid-cols-2 bg-slate-900/50 rounded-3xl border border-slate-800 backdrop-blur-xl overflow-hidden shadow-2xl relative">
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600 to-blue-800 text-white relative">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/30"><Shield className="h-8 w-8 text-white" /></div>
              <h1 className="text-2xl font-bold tracking-tight">DisasterAid</h1>
            </div>
            <h2 className="text-4xl font-extrabold leading-[1.1] mb-6">Command Center <br /> Secure Login.</h2>
          </div>
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        </div>

        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Welcome Back</h3>
            <button onClick={() => { setMethod(method === "phone" ? "email" : "phone"); setConfirmationResult(null); setContact(""); setPassword(""); }} className="text-blue-400 text-sm font-bold hover:text-blue-300 transition-colors">
              Use {method === "phone" ? "Email/Password" : "Phone Number"} instead
            </button>
          </div>

          {!confirmationResult ? (
            <form onSubmit={handleInitialSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 ml-1">{method === "phone" ? "Phone Number" : "Email Address"}</label>
                <div className="relative group">
                  {method === "phone" ? <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" /> : <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />}
                  <input type={method === "phone" ? "tel" : "email"} placeholder={method === "phone" ? "+91..." : "name@gmail.com"} value={contact} onChange={e => setContact(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-10 pr-4 text-white outline-none focus:ring-2 focus:ring-blue-500/40" required />
                </div>
              </div>

              {method === "email" && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-sm font-semibold text-slate-300">Password</label>
                    <button type="button" onClick={handleForgotPassword} className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-10 pr-4 text-white outline-none focus:ring-2 focus:ring-blue-500/40" required />
                  </div>
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-bold shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 mt-4">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>{method === "phone" ? "Request OTP" : "Sign In"} <ArrowRight className="h-5 w-5" /></>}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-5 animate-in slide-in-from-right-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 ml-1 text-center block">Security Code</label>
                <div className="relative group">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <input type="text" maxLength={6} placeholder="000000" value={otp} onChange={e => setOtp(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-10 pr-4 text-white text-center tracking-[0.5em] text-xl font-bold focus:ring-2 focus:ring-blue-500/40 outline-none" required />
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-bold shadow-lg">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Access"}
              </Button>
            </form>
          )}

          <div className="mt-10 text-center">
            <p className="text-slate-400 text-sm font-medium">New responder? <Link to="/register" className="text-blue-400 font-bold hover:text-blue-300">Register Profile</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}