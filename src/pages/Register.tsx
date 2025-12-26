import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { sendOTP, registerWithEmail, syncUserProfile } from "@/firebase/auth";
import { ShieldCheck, Phone, Mail, Hash, User, UserPlus, Loader2, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Register() {
  const [method, setMethod] = useState<"phone" | "email">("phone");
  const [name, setName] = useState("");
  const [contact, setContact] = useState(""); 
  const [password, setPassword] = useState(""); // Added password
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (method === "phone") {
        const result = await sendOTP(contact, "recaptcha-container");
        setConfirmationResult(result);
      } else {
        const res = await registerWithEmail(contact, password);
        await syncUserProfile(res.user, name);
        navigate("/dashboard");
      }
    } catch (err: any) { alert(err.message || "Error"); } finally { setIsLoading(false); }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await confirmationResult.confirm(otp);
      await syncUserProfile(res.user, name);
      navigate("/dashboard");
    } catch (err) { alert("Invalid OTP."); } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0B1221] relative overflow-hidden p-4">
      <div id="recaptcha-container"></div>
      <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse" />

      <div className="w-full max-w-[1000px] grid md:grid-cols-2 bg-slate-900/50 rounded-3xl border border-slate-800 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white relative order-2 md:order-1">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10"><ShieldCheck className="h-10 w-10 text-white" /><h1 className="text-2xl font-bold tracking-tight">Verified Access</h1></div>
            <h2 className="text-4xl font-extrabold leading-tight mb-8">Join the Global <br /> Support Network.</h2>
          </div>
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        </div>

        <div className="p-8 md:p-12 flex flex-col justify-center order-1 md:order-2">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Create Account</h3>
            <button type="button" onClick={() => { setMethod(method === "phone" ? "email" : "phone"); setConfirmationResult(null); setContact(""); setPassword(""); }} className="text-emerald-400 text-sm font-bold hover:text-emerald-300">
              Switch to {method === "phone" ? "Email/Password" : "Phone Number"}
            </button>
          </div>

          {!confirmationResult ? (
            <form onSubmit={handleInitialSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-300 ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <input type="text" placeholder="Official Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-10 text-white outline-none focus:ring-2 focus:ring-emerald-500/40" required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-300 ml-1">{method === "phone" ? "Phone Number" : "Email Address"}</label>
                <div className="relative group">
                  {method === "phone" ? <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" /> : <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />}
                  <input type={method === "phone" ? "tel" : "email"} placeholder={method === "phone" ? "+91..." : "name@gmail.com"} value={contact} onChange={e => setContact(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-10 pr-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/40" required />
                </div>
              </div>

              {method === "email" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-300 ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-10 pr-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/40" required />
                  </div>
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 rounded-xl font-bold shadow-lg mt-4">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Register <UserPlus className="h-5 w-5" /></>}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4 animate-in slide-in-from-right-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-300 text-center block">Enter 6-Digit OTP</label>
                <div className="relative group">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <input type="text" maxLength={6} placeholder="000000" value={otp} onChange={e => setOtp(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-10 pr-4 text-white text-center tracking-[0.5em] text-xl font-bold focus:ring-2 focus:ring-emerald-500/40 outline-none" required />
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 rounded-xl font-bold shadow-lg">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Register"}
              </Button>
            </form>
          )}

          <div className="mt-10 text-center">
            <p className="text-slate-400 text-sm font-medium">Already have an account? <Link to="/login" className="text-emerald-400 font-bold hover:text-emerald-300">Sign In</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}