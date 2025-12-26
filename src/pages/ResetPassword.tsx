import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { auth } from "@/firebase/firebase";
import { confirmPasswordReset } from "firebase/auth";
import { Shield, Lock, Check, X, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get("oobCode");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Requirements logic
  const requirements = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "At least one number", test: (p: string) => /\d/.test(p) },
    { label: "Passwords match", test: (p: string) => p === confirmPassword && p !== "" },
  ];

  const strength = requirements.filter(r => r.test(newPassword)).length;

  useEffect(() => {
    if (!oobCode) {
      alert("Invalid or expired reset link.");
      navigate("/login");
    }
  }, [oobCode, navigate]);

  useEffect(() => {
    if (isSuccess && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isSuccess && countdown === 0) {
      navigate("/login");
    }
  }, [isSuccess, countdown, navigate]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (strength < 3) return;
    
    setIsLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode!, newPassword);
      setIsSuccess(true);
    } catch (err: any) {
      alert(err.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0B1221] relative overflow-hidden p-4">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-[500px] bg-slate-900/50 rounded-3xl border border-slate-800 backdrop-blur-xl p-8 md:p-12 shadow-2xl relative">
        
        {!isSuccess ? (
          <>
            <div className="mb-8 text-center">
              <div className="bg-blue-600/20 p-3 rounded-2xl w-fit mx-auto mb-4 border border-blue-500/30 transition-colors duration-500">
                <Shield className={`h-8 w-8 ${strength === 3 ? 'text-emerald-400' : 'text-blue-400'}`} />
              </div>
              <h1 className="text-2xl font-bold text-white">Create New Password</h1>
              <p className="text-slate-400 text-sm mt-2">Secure your Command Center access.</p>
            </div>

            <form onSubmit={handleReset} className="space-y-6">
              {/* New Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 ml-1">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-10 pr-12 text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" 
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 ml-1">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-10 pr-12 text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" 
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Strength Meter */}
              <div className="flex gap-2 h-1.5 w-full">
                {[1, 2, 3].map((step) => (
                  <div 
                    key={step} 
                    className={`h-full flex-1 rounded-full transition-all duration-500 ${
                      strength >= step 
                        ? (strength === 1 ? 'bg-red-500' : strength === 2 ? 'bg-yellow-500' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]') 
                        : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              {/* Requirements Checklist */}
              <ul className="space-y-2.5">
                {requirements.map((req, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs font-medium">
                    {req.test(newPassword) ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <X className="h-4 w-4 text-slate-600" />
                    )}
                    <span className={req.test(newPassword) ? "text-slate-200" : "text-slate-500 transition-colors"}>
                      {req.label}
                    </span>
                  </li>
                ))}
              </ul>

              <Button 
                type="submit" 
                disabled={isLoading || strength < 3} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-bold shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Update Password <ArrowRight className="h-5 w-5" /></>}
              </Button>
            </form>

            {/* Back to Login */}
            <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-slate-500 text-sm font-medium hover:text-blue-400 transition-all"
              >
                <ArrowRight className="h-4 w-4 rotate-180" /> 
                Back to Secure Login
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-8 animate-in zoom-in-95 duration-500">
            <div className="bg-emerald-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-emerald-500/30">
              <Check className="text-emerald-500 h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Password Updated</h2>
            <p className="text-slate-400">Your security credentials have been synced.</p>
            <div className="mt-8 text-sm text-blue-400 font-bold tracking-widest">
              REDIRECTING IN {countdown}...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}